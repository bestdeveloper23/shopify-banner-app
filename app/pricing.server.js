/** Square feet covered by one price increment (bill by 3.5 sq ft). */
const SQFT_PER_PRICE_UNIT = 3.5;

/**
 * Draft-order line price: ceil(area_sqft / 3.5) × rate.
 * Set `BANNER_PRICE_PER_3_5_SQFT` (USD) on the app host.
 */
export function calculateBannerDraftPrice(widthInches, heightInches) {
  const w = Math.max(0.5, Number(widthInches) || 36);
  const h = Math.max(0.5, Number(heightInches) || 72);
  const areaSqFt = (w * h) / 144;
  const increments = Math.max(1, Math.ceil(areaSqFt / SQFT_PER_PRICE_UNIT));
  const usdPerIncrement = Number(process.env.BANNER_PRICE_PER_3_5_SQFT);
  const rate =
    Number.isFinite(usdPerIncrement) && usdPerIncrement > 0 ? usdPerIncrement : 28;
  return Math.round(increments * rate * 100) / 100;
}
