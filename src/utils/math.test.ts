import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, smoothstep, lerp, segmentInOut } from './math.ts';

test('clamp restricts values to min and max boundaries', () => {
  assert.equal(clamp(0.5, 0, 1), 0.5);
  assert.equal(clamp(-0.2, 0, 1), 0);
  assert.equal(clamp(1.4, 0, 1), 1);
  assert.equal(clamp(150, 100, 200), 150);
  assert.equal(clamp(80, 100, 200), 100);
});

test('smoothstep performs cubic Hermite interpolation correctly', () => {
  assert.equal(smoothstep(0, 100, -10), 0);
  assert.equal(smoothstep(0, 100, 110), 1);
  assert.equal(smoothstep(0, 100, 50), 0.5);
  // at 25% smoothstep is 0.15625
  assert.ok(Math.abs(smoothstep(0, 100, 25) - 0.15625) < 0.0001);
});

test('lerp computes linear interpolation between bounds', () => {
  assert.equal(lerp(10, 20, 0), 10);
  assert.equal(lerp(10, 20, 1), 20);
  assert.equal(lerp(10, 20, 0.5), 15);
});

test('segmentInOut computes entering, exiting, and active states', () => {
  // Before enter: s = 100 when range is [200, 300, 400, 500]
  const before = segmentInOut(100, 200, 300, 400, 500);
  assert.equal(before.enter, 0);
  assert.equal(before.exit, 0);
  assert.equal(before.active, 0);

  // Fully entered, before exit starts: s = 350
  const activeMid = segmentInOut(350, 200, 300, 400, 500);
  assert.equal(activeMid.enter, 1);
  assert.equal(activeMid.exit, 0);
  assert.equal(activeMid.active, 1);

  // After exit completed: s = 600
  const after = segmentInOut(600, 200, 300, 400, 500);
  assert.equal(after.enter, 1);
  assert.equal(after.exit, 1);
  assert.equal(after.active, 0);
});
