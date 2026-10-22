/**
 * Jaipur City Sights Slider Normalization & Transform Math
 */

export interface SliderMetrics {
  originalCount: number;
  activeIndex: number;
  cardWidth: number;
  gap: number;
  containerWidth: number;
}

export function normalizeSliderIndex(activeIndex: number, originalCount: number): number {
  if (activeIndex >= originalCount * 2) {
    return activeIndex - originalCount;
  }
  if (activeIndex < originalCount) {
    return activeIndex + originalCount;
  }
  return activeIndex;
}

export function computeCenteredOffset(
  containerWidth: number,
  cardWidth: number,
  activeIndex: number,
  gap: number
): number {
  const centerOffset = (containerWidth - cardWidth) / 2;
  return centerOffset - activeIndex * (cardWidth + gap);
}
