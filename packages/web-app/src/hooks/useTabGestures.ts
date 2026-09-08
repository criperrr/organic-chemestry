import { useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore.js';
import type { ActiveTab } from '../stores/useGameStore.js';

/** Tab order, left to right — the same order the bars display. */
export const TAB_ORDER: ActiveTab[] = ['arcade', 'cacar', 'theory', 'sandbox'];

/**
 * Lets the four tabs be reached by gesture instead of by aiming at a control:
 * a horizontal swipe on a touchscreen, and a two-finger horizontal swipe on a
 * laptop trackpad.
 *
 * Both express the same intent, and browsers report them differently: a
 * touchscreen sends touch events, while a trackpad two-finger swipe arrives as
 * a `wheel` event carrying `deltaX`. The trackpad has no "gesture ended"
 * signal, so a gesture closes on a quiet gap and latches until then — without
 * that, one flick pages through every tab at once.
 */
export function useTabGestures(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const step = (direction: 1 | -1) => {
      const { activeTab, setActiveTab } = useGameStore.getState();
      const index = TAB_ORDER.indexOf(activeTab);
      const next = index + direction;
      if (next < 0 || next >= TAB_ORDER.length) return;
      setActiveTab(TAB_ORDER[next]);
    };

    /**
     * True when the gesture started inside something that scrolls sideways, or
     * inside an opt-out. The molecule canvas pans and zooms with the same
     * gestures and must keep them.
     */
    const insideHorizontalScroller = (target: EventTarget | null): boolean => {
      let node = target instanceof Element ? target : null;
      while (node && node !== document.body) {
        if (node.hasAttribute('data-no-tab-swipe')) return true;
        const style = window.getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth + 1) {
          return true;
        }
        node = node.parentElement;
      }
      return false;
    };

    // --- touchscreen ---------------------------------------------------------
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || insideHorizontalScroller(e.target)) {
        tracking = false;
        return;
      }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      // Clearly horizontal, and long enough not to be a stray finger movement
      // or the start of a vertical scroll.
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
      step(dx < 0 ? 1 : -1);
    };

    // --- trackpad ------------------------------------------------------------
    let accumulated = 0;
    let latched = false;
    let quietTimer: number | undefined;

    const onWheel = (e: WheelEvent) => {
      // A trackpad pinch arrives as a wheel event with ctrlKey forced; that is
      // zoom, not navigation, and the canvas owns it.
      if (e.ctrlKey || e.metaKey) return;
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (insideHorizontalScroller(e.target)) return;

      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(() => {
        accumulated = 0;
        latched = false;
      }, 220);

      if (latched) return;
      accumulated += e.deltaX;
      if (Math.abs(accumulated) < 120) return;
      latched = true;
      step(accumulated > 0 ? 1 : -1);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    // Passive: the gesture only switches tabs, it never needs preventDefault.
    window.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.clearTimeout(quietTimer);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('wheel', onWheel);
    };
  }, [enabled]);
}
