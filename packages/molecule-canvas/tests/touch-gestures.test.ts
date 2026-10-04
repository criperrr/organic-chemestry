import { describe, it, expect } from 'vitest';
import {
  sanitizeTransform,
  calculateVelocity,
  stepInertia,
  computePinchZoomAndPan,
  MIN_ZOOM,
  MAX_ZOOM,
  GOOGLE_EARTH_FRICTION,
  MIN_INERTIA_SPEED,
} from '../src/touch-gestures.js';

describe('sanitizeTransform', () => {
  const fallback = { zoom: 1, panX: 100, panY: 200 };

  it('keeps valid finite values within bounds', () => {
    const result = sanitizeTransform({ zoom: 1.5, panX: 50, panY: 60 }, fallback);
    expect(result).toEqual({ zoom: 1.5, panX: 50, panY: 60 });
  });

  it('clamps zoom to [MIN_ZOOM, MAX_ZOOM]', () => {
    const tooSmall = sanitizeTransform({ zoom: 0.05 }, fallback);
    expect(tooSmall.zoom).toBe(MIN_ZOOM);

    const tooBig = sanitizeTransform({ zoom: 10.0 }, fallback);
    expect(tooBig.zoom).toBe(MAX_ZOOM);
  });

  it('safely recovers from NaN or Infinity preventing black screens', () => {
    const nanZoom = sanitizeTransform({ zoom: NaN, panX: NaN, panY: Infinity }, fallback);
    expect(nanZoom).toEqual(fallback);
  });
});

describe('calculateVelocity (Google Earth inertia tracker)', () => {
  it('returns zero velocity when not enough samples exist', () => {
    const vel = calculateVelocity([{ x: 10, y: 10, time: 100 }], 100);
    expect(vel.speed).toBe(0);
  });

  it('accurately computes velocity vector and speed', () => {
    const samples = [
      { x: 100, y: 100, time: 0 },
      { x: 150, y: 200, time: 50 },
    ];
    // dx = 50, dy = 100, dt = 50ms => vx = 1.0, vy = 2.0
    const vel = calculateVelocity(samples, 50);
    expect(vel.vx).toBeCloseTo(1.0, 3);
    expect(vel.vy).toBeCloseTo(2.0, 3);
    expect(vel.speed).toBeCloseTo(Math.hypot(1.0, 2.0), 3);
  });

  it('discards stale samples outside the velocity window', () => {
    const samples = [
      { x: 0, y: 0, time: 0 },
      { x: 100, y: 0, time: 100 },
      { x: 100, y: 0, time: 300 }, // stopped moving for 200ms
    ];
    const vel = calculateVelocity(samples, 300, 100);
    expect(vel.speed).toBe(0);
  });
});

describe('stepInertia (Physics deceleration)', () => {
  it('decays velocity smoothly over frame time dt', () => {
    const initialVx = 1.5;
    const initialVy = 0.5;
    const step1 = stepInertia(initialVx, initialVy, 16.67, GOOGLE_EARTH_FRICTION);

    expect(step1.nextVx).toBeLessThan(initialVx);
    expect(step1.nextVy).toBeLessThan(initialVy);
    expect(step1.nextVx / initialVx).toBeCloseTo(GOOGLE_EARTH_FRICTION, 3);
    expect(step1.isMoving).toBe(true);
    expect(step1.dx).toBeGreaterThan(0);
  });

  it('reports isMoving false when velocity drops below cutoff', () => {
    const step = stepInertia(0.005, 0.005, 16.67, GOOGLE_EARTH_FRICTION);
    expect(step.isMoving).toBe(false);
  });
});

describe('computePinchZoomAndPan (Multi-touch)', () => {
  const rect = { left: 0, top: 0 };

  it('scales zoom proportionally to finger distance', () => {
    const result = computePinchZoomAndPan({
      initialPinchDist: 100,
      currentDist: 150,
      initialZoom: 1.0,
      initialMidpoint: { x: 200, y: 200 },
      currentMidpoint: { x: 200, y: 200 },
      initialPan: { x: 0, y: 0 },
      rect,
    });

    expect(result.zoom).toBeCloseTo(1.5, 3);
  });

  it('applies midpoint translation alongside zoom (pan while pinching)', () => {
    const result = computePinchZoomAndPan({
      initialPinchDist: 100,
      currentDist: 100,
      initialZoom: 1.0,
      initialMidpoint: { x: 100, y: 100 },
      currentMidpoint: { x: 150, y: 180 }, // dragged midpoint by (50, 80)
      initialPan: { x: 20, y: 30 },
      rect,
    });

    expect(result.zoom).toBe(1.0);
    expect(result.panX).toBeCloseTo(20 + 50, 3);
    expect(result.panY).toBeCloseTo(30 + 80, 3);
  });

  it('anchors zoom around the pinch center', () => {
    const result = computePinchZoomAndPan({
      initialPinchDist: 100,
      currentDist: 200, // 2x zoom
      initialZoom: 1.0,
      initialMidpoint: { x: 300, y: 300 },
      currentMidpoint: { x: 300, y: 300 },
      initialPan: { x: 0, y: 0 },
      rect,
    });

    expect(result.zoom).toBe(2.0);
    // At anchorX = 300, panX was 0.
    // basePanX = 300 - (300 - 0) * 2 = 300 - 600 = -300
    expect(result.panX).toBeCloseTo(-300, 3);
    expect(result.panY).toBeCloseTo(-300, 3);
  });
});
