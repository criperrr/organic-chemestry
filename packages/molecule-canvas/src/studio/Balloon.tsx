import React, { useCallback, useRef, useState } from 'react';
import { GripHorizontal, X, ChevronDown } from 'lucide-react';

export interface BalloonProps {
  title: string;
  icon?: React.ReactNode;
  /** Where the balloon sits until the student drags it somewhere better. */
  initialPosition: { top: number; left?: number; right?: number };
  width?: number;
  onHide: () => void;
  /** Shortcut letter shown in the close button's tooltip. */
  hideKey?: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

/**
 * A floating panel over the drawing surface.
 *
 * Every panel in the Studio is one of these: draggable by its header so it
 * never sits on top of the bond you are drawing, collapsible to its title bar,
 * and dismissible entirely. Nothing in the Studio is allowed to permanently
 * occupy the canvas.
 */
export const Balloon: React.FC<BalloonProps> = ({
  title,
  icon,
  initialPosition,
  width = 340,
  onHide,
  hideKey,
  defaultCollapsed = false,
  children,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const handleDragStart = useCallback((event: React.PointerEvent) => {
    const node = nodeRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
    };
    (event.target as Element).setPointerCapture?.(event.pointerId);
  }, []);

  const handleDragMove = useCallback((event: React.PointerEvent) => {
    const drag = dragRef.current;
    const node = nodeRef.current;
    if (!drag || !node) return;
    // Keep the balloon on screen whatever the window size.
    const nextX = Math.min(
      Math.max(8, drag.originX + (event.clientX - drag.startX)),
      window.innerWidth - node.offsetWidth - 8
    );
    const nextY = Math.min(
      Math.max(8, drag.originY + (event.clientY - drag.startY)),
      window.innerHeight - 48
    );
    setPosition({ x: nextX, y: nextY });
  }, []);

  const handleDragEnd = useCallback((event: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (event.target as Element).releasePointerCapture?.(event.pointerId);
    } catch {
      /* pointer already released */
    }
  }, []);

  const placement = position
    ? { left: position.x, top: position.y }
    : initialPosition;

  return (
    <div
      ref={nodeRef}
      style={{
        position: 'fixed',
        width: `min(${width}px, calc(100vw - 24px))`,
        ...placement,
        pointerEvents: 'auto',
      }}
      className="studio-floating rounded-3xl overflow-hidden pointer-events-auto z-40 shadow-xl"
    >
      <div
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        className="flex items-center justify-between gap-2 px-3 py-2 cursor-grab active:cursor-grabbing touch-none border-b border-[var(--md-sys-color-outline-variant)] select-none"
      >
        <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] select-none">
          {icon ?? <GripHorizontal className="w-4 h-4" />}
          {title}
        </span>
        <span className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setCollapsed(value => !value)}
            title={collapsed ? 'Expandir' : 'Recolher'}
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={onHide}
            title={hideKey ? `Ocultar painel [${hideKey}]` : 'Ocultar painel'}
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </span>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 flex flex-col gap-2.5 max-h-[70vh] overflow-y-auto">{children}</div>
      )}
    </div>
  );
};
