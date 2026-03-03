import { SUB_CATEGORIES } from './subCategories';
import { Rating, Shelter } from '../types';

const SCALE_KEYS = SUB_CATEGORIES
  .flatMap((c) => c.questions)
  .filter((q) => q.type === 'scale')
  .map((q) => q.key);

/**
 * Computes a cumulative score (1–5) for a shelter from:
 * - The 4 main category averages (friendly, safe, clean, happy)
 * - All scale sub-question answers across all ratings
 * Boolean questions are excluded (direction is ambiguous).
 */
export function computeCumulativeScore(
  shelter: Shelter,
  ratings: Rating[]
): number | null {
  const values: number[] = [];

  // Main categories
  for (const val of [shelter.avg_friendly, shelter.avg_safe, shelter.avg_clean, shelter.avg_happy]) {
    if (val != null) values.push(Number(val));
  }

  // Sub-category scale questions — collect all answers across all ratings
  const subTotals: Record<string, number[]> = {};
  for (const r of ratings) {
    if (!r.sub_ratings) continue;
    for (const key of SCALE_KEYS) {
      const v = r.sub_ratings[key];
      if (typeof v === 'number' && v > 0) {
        if (!subTotals[key]) subTotals[key] = [];
        subTotals[key].push(v);
      }
    }
  }

  // Average each sub-question, then add to values
  for (const arr of Object.values(subTotals)) {
    values.push(arr.reduce((a, b) => a + b, 0) / arr.length);
  }

  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}
