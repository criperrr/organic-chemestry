import type { ViewTransform, CanvasTool } from './types.js';

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

export interface TouchSample {
  x: number;
  y: number;
  time: number;
}

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4.0;
export const GOOGLE_EARTH_FRICTION = 0.935; // Friction per 16.67ms frame
export const MIN_INERTIA_SPEED = 0.08; // px/ms threshold to trigger glide (80px/s)
export const MAX_INERTIA_SPEED = 3.5; // px/ms clamp to prevent runaway fling
export const STOP_SPEED_THRESHOLD = 0.012; // px/ms cutoff to finish inertia

/**
 * Ensures transform coordinates and zoom are always finite and within bounds.
 * Prevents invalid SVG matrix transformations that cause black screen artifacts.
 */
export function sanitizeTransform(
  candidate: Partial<ViewTransform>,
  fallback: ViewTransform
): ViewTransform {
  const safeFallbackZoom = Number.isFinite(fallback?.zoom) ? fallback.zoom : 1.0;
  const safeFallbackPanX = Number.isFinite(fallback?.panX) ? fallback.panX : 0;
  const safeFallbackPanY = Number.isFinite(fallback?.panY) ? fallback.panY : 0;

  const rawZoom = Number.isFinite(candidate?.zoom) ? candidate.zoom! : safeFallbackZoom;
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, rawZoom));

  const rawPanX = Number.isFinite(candidate?.panX) ? candidate.panX! : safeFallbackPanX;
  const rawPanY = Number.isFinite(candidate?.panY) ? candidate.panY! : safeFallbackPanY;

  // Clamp pan coordinates within a safe ±8000px range to prevent SVG GPU layer overflow / black screen
  const panX = Math.min(8000, Math.max(-8000, rawPanX));
  const panY = Math.min(8000, Math.max(-8000, rawPanY));

  return { zoom, panX, panY };
}

/**
 * Calculates exit velocity from recent touch samples within the velocity window.
 */
export function calculateVelocity(
  history: TouchSample[],
  now: number,
  windowMs = 100
): { vx: number; vy: number; speed: number } {
  const recent = history.filter(sample => now - sample.time <= windowMs);
  if (recent.length < 2) {
    return { vx: 0, vy: 0, speed: 0 };
  }

  const first = recent[0]!;
  const last = recent[recent.length - 1]!;
  const dt = last.time - first.time;

  if (dt < 10 || dt > 150) {
    return { vx: 0, vy: 0, speed: 0 };
  }

  const vx = (last.x - first.x) / dt;
  const vy = (last.y - first.y) / dt;
  const speed = Math.hypot(vx, vy);

  return { vx, vy, speed };
}

/**
 * Computes one step of physics momentum (Google Earth kinetic deceleration).
 * Invariant to frame rate (60Hz, 90Hz, 120Hz).
 */
export function stepInertia(
  vx: number,
  vy: number,
  frameDtMs: number,
  friction = GOOGLE_EARTH_FRICTION
): { nextVx: number; nextVy: number; dx: number; dy: number; isMoving: boolean } {
  const dt = Math.max(1, Math.min(40, frameDtMs));
  const decay = Math.pow(friction, dt / 16.67);
  const nextVx = vx * decay;
  const nextVy = vy * decay;
  const dx = nextVx * dt;
  const dy = nextVy * dt;
  const currentSpeed = Math.hypot(nextVx, nextVy);
  const isMoving = currentSpeed >= STOP_SPEED_THRESHOLD;

  return { nextVx, nextVy, dx, dy, isMoving };
}

/**
 * Calculates simultaneous two-finger pinch-zoom and pan anchored at the gesture midpoint.
 */
export function computePinchZoomAndPan(params: {
  initialPinchDist: number;
  currentDist: number;
  initialZoom: number;
  initialMidpoint: { x: number; y: number };
  currentMidpoint: { x: number; y: number };
  initialPan: { x: number; y: number };
  rect: { left: number; top: number };
  minZoom?: number;
  maxZoom?: number;
}): ViewTransform {
  const {
    initialPinchDist,
    currentDist,
    initialZoom,
    initialMidpoint,
    currentMidpoint,
    initialPan,
    rect,
    minZoom = MIN_ZOOM,
    maxZoom = MAX_ZOOM,
  } = params;

  if (initialPinchDist <= 5 || currentDist <= 5) {
    return { zoom: initialZoom, panX: initialPan.x, panY: initialPan.y };
  }

  const scale = currentDist / initialPinchDist;
  const nextZoom = Math.min(maxZoom, Math.max(minZoom, initialZoom * scale));
  const zoomRatio = nextZoom / initialZoom;

  const anchorX = initialMidpoint.x - rect.left;
  const anchorY = initialMidpoint.y - rect.top;

  const basePanX = anchorX - (anchorX - initialPan.x) * zoomRatio;
  const basePanY = anchorY - (anchorY - initialPan.y) * zoomRatio;

  const midDeltaX = currentMidpoint.x - initialMidpoint.x;
  const midDeltaY = currentMidpoint.y - initialMidpoint.y;

  return {
    zoom: nextZoom,
    panX: basePanX + midDeltaX,
    panY: basePanY + midDeltaY,
  };
}

export interface TouchControllerOptions {
  svg: SVGSVGElement;
  getActiveTool: () => CanvasTool;
  getTransform: () => ViewTransform;
  onTransformChange: (next: ViewTransform) => void;
  onDoubleTap?: (clientX: number, clientY: number) => void;
  onCancelActiveDraw?: () => void;
}

/**
 * Attaches native mobile multi-touch gestures & inertia to the canvas SVG.
 * Completely eliminates black-screen crashes from Chrome/Firefox overscroll/gestures.
 */
export function createTouchGestureController(options: TouchControllerOptions): () => void {
  const {
    svg,
    getActiveTool,
    getTransform,
    onTransformChange,
    onDoubleTap,
    onCancelActiveDraw,
  } = options;

  let initialPinchDist = 0;
  let initialZoom = 1;
  let initialMidpoint = { x: 0, y: 0 };
  let initialPan = { x: 0, y: 0 };

  let singleTouchStart = { x: 0, y: 0 };
  let singleTouchPanStart = { x: 0, y: 0 };
  let isTouchPanning = false;

  let moveHistory: TouchSample[] = [];
  let inertiaRaf: number | null = null;
  let lastTapTime = 0;
  let lastTapPos = { x: 0, y: 0 };

  const stopInertia = () => {
    if (inertiaRaf !== null) {
      cancelAnimationFrame(inertiaRaf);
      inertiaRaf = null;
    }
  };

  const startInertia = (vx: number, vy: number) => {
    stopInertia();
    const { speed } = calculateVelocity(
      [{ x: 0, y: 0, time: 0 }, { x: vx * 10, y: vy * 10, time: 10 }],
      10
    );

    if (speed < MIN_INERTIA_SPEED) return;

    let currentVx = vx;
    let currentVy = vy;

    if (speed > MAX_INERTIA_SPEED) {
      currentVx = (vx / speed) * MAX_INERTIA_SPEED;
      currentVy = (vy / speed) * MAX_INERTIA_SPEED;
    }

    let lastTime = performance.now();

    const frame = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      const step = stepInertia(currentVx, currentVy, dt);
      currentVx = step.nextVx;
      currentVy = step.nextVy;

      const current = getTransform();
      const nextPanX = current.panX + step.dx;
      const nextPanY = current.panY + step.dy;

      const safe = sanitizeTransform(
        { panX: nextPanX, panY: nextPanY, zoom: current.zoom },
        current
      );
      onTransformChange(safe);

      if (step.isMoving) {
        inertiaRaf = requestAnimationFrame(frame);
      } else {
        inertiaRaf = null;
      }
    };

    inertiaRaf = requestAnimationFrame(frame);
  };

  const onTouchStart = (e: TouchEvent) => {
    stopInertia();

    if (e.touches.length === 1) {
      const touch = e.touches[0]!;
      const now = performance.now();

      const distFromLast = Math.hypot(
        touch.clientX - lastTapPos.x,
        touch.clientY - lastTapPos.y
      );

      if (now - lastTapTime < 280 && distFromLast < 25) {
        e.preventDefault();
        lastTapTime = 0;
        onDoubleTap?.(touch.clientX, touch.clientY);
        return;
      }
      lastTapTime = now;
      lastTapPos = { x: touch.clientX, y: touch.clientY };

      const tool = getActiveTool();
      if (tool === 'pan') {
        e.preventDefault();
        isTouchPanning = true;
        singleTouchStart = { x: touch.clientX, y: touch.clientY };
        const current = getTransform();
        singleTouchPanStart = { x: current.panX, y: current.panY };
        moveHistory = [{ x: touch.clientX, y: touch.clientY, time: now }];
      }
    } else if (e.touches.length >= 2) {
      // Multi-touch: 2-finger pan & pinch-to-zoom
      e.preventDefault();
      isTouchPanning = true;
      onCancelActiveDraw?.();

      const t1 = e.touches[0]!;
      const t2 = e.touches[1]!;
      initialPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const current = getTransform();
      initialZoom = current.zoom;
      initialMidpoint = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      initialPan = { x: current.panX, y: current.panY };
      moveHistory = [
        { x: initialMidpoint.x, y: initialMidpoint.y, time: performance.now() },
      ];
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    const now = performance.now();

    if (e.touches.length === 1 && isTouchPanning && getActiveTool() === 'pan') {
      e.preventDefault();
      const touch = e.touches[0]!;
      const dx = touch.clientX - singleTouchStart.x;
      const dy = touch.clientY - singleTouchStart.y;

      const current = getTransform();
      const safe = sanitizeTransform(
        {
          panX: singleTouchPanStart.x + dx,
          panY: singleTouchPanStart.y + dy,
          zoom: current.zoom,
        },
        current
      );
      onTransformChange(safe);

      moveHistory.push({ x: touch.clientX, y: touch.clientY, time: now });
      if (moveHistory.length > 8) moveHistory.shift();
    } else if (e.touches.length >= 2) {
      e.preventDefault();
      const t1 = e.touches[0]!;
      const t2 = e.touches[1]!;
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const currentMidpoint = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      const rect = svg.getBoundingClientRect();
      const nextTransform = computePinchZoomAndPan({
        initialPinchDist,
        currentDist,
        initialZoom,
        initialMidpoint,
        currentMidpoint,
        initialPan,
        rect,
      });

      const current = getTransform();
      const safe = sanitizeTransform(nextTransform, current);
      onTransformChange(safe);

      moveHistory.push({ x: currentMidpoint.x, y: currentMidpoint.y, time: now });
      if (moveHistory.length > 8) moveHistory.shift();
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    const now = performance.now();

    if (e.touches.length === 0) {
      if (isTouchPanning) {
        isTouchPanning = false;
        const vel = calculateVelocity(moveHistory, now, 110);
        if (vel.speed >= MIN_INERTIA_SPEED) {
          startInertia(vel.vx, vel.vy);
        }
      }
      moveHistory = [];
    } else if (e.touches.length === 1) {
      // Gracefully transition from two fingers down to one finger remaining
      const touch = e.touches[0]!;
      if (getActiveTool() === 'pan') {
        isTouchPanning = true;
        singleTouchStart = { x: touch.clientX, y: touch.clientY };
        const current = getTransform();
        singleTouchPanStart = { x: current.panX, y: current.panY };
        moveHistory = [{ x: touch.clientX, y: touch.clientY, time: now }];
      } else {
        isTouchPanning = false;
      }
    }
  };

  svg.addEventListener('touchstart', onTouchStart, { passive: false });
  svg.addEventListener('touchmove', onTouchMove, { passive: false });
  svg.addEventListener('touchend', onTouchEnd, { passive: false });
  svg.addEventListener('touchcancel', onTouchEnd, { passive: false });

  return () => {
    stopInertia();
    svg.removeEventListener('touchstart', onTouchStart);
    svg.removeEventListener('touchmove', onTouchMove);
    svg.removeEventListener('touchend', onTouchEnd);
    svg.removeEventListener('touchcancel', onTouchEnd);
  };
}
