/**
 * Pure mathematical functions for cinematic scroll animations
 * Replicating Jaipur City animation engine math verbatim.
 */

export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

export function smoothstep(e0: number, e1: number, v: number): number {
  const x = clamp((v - e0) / (e1 - e0));
  return x * x * (3 - 2 * x);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface SegmentState {
  enter: number;
  exit: number;
  active: number;
}

export function segmentInOut(s: number, a: number, b: number, c: number, d: number): SegmentState {
  const enter = smoothstep(a, b, s);
  const exit = smoothstep(c, d, s);
  return { enter, exit, active: enter * (1 - exit) };
}
