import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSliderIndex, computeCenteredOffset } from './slider.js';

test('normalizeSliderIndex wraps forward when index reaches 2 * originalCount', () => {
  const originalCount = 5;
  // Set 0: 0..4, Set 1: 5..9, Set 2: 10..14
  assert.equal(normalizeSliderIndex(10, originalCount), 5);
  assert.equal(normalizeSliderIndex(11, originalCount), 6);
  assert.equal(normalizeSliderIndex(14, originalCount), 9);
});

test('normalizeSliderIndex wraps backward when index is below originalCount', () => {
  const originalCount = 5;
  assert.equal(normalizeSliderIndex(4, originalCount), 9);
  assert.equal(normalizeSliderIndex(0, originalCount), 5);
});

test('normalizeSliderIndex leaves indices in middle set unchanged', () => {
  const originalCount = 5;
  assert.equal(normalizeSliderIndex(5, originalCount), 5);
  assert.equal(normalizeSliderIndex(7, originalCount), 7);
  assert.equal(normalizeSliderIndex(9, originalCount), 9);
});

test('computeCenteredOffset centers active card horizontally', () => {
  const containerWidth = 1200;
  const cardWidth = 320;
  const gap = 24;
  const centerForZero = (1200 - 320) / 2; // 440

  assert.equal(computeCenteredOffset(containerWidth, cardWidth, 0, gap), 440);
  assert.equal(computeCenteredOffset(containerWidth, cardWidth, 1, gap), 440 - (320 + 24));
  assert.equal(computeCenteredOffset(containerWidth, cardWidth, 5, gap), 440 - 5 * 344);
});
