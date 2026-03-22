import { Fragrance, ScentDNA } from "@/types/fragrance";

/** Deterministic hash from a string → integer, safe for SSR */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function computeMatchScore(
  fragrance: Fragrance,
  userDNA: ScentDNA
): number {
  const total = Object.values(userDNA).reduce((sum, v) => sum + v, 0);
  if (total === 0) {
    // Deterministic fallback — varies per fragrance but identical SSR/CSR
    return 40 + (hashString(fragrance.id) % 41);
  }

  let matchScore = 0;
  fragrance.scentFamily.forEach((family) => {
    const dnaValue = userDNA[family as keyof ScentDNA] ?? 0;
    matchScore += dnaValue;
  });

  // Normalize and cap at 100
  const normalized = Math.min(Math.round((matchScore / 100) * 120), 100);
  return Math.max(normalized, 20);
}

export function getMatchReasons(
  fragrance: Fragrance,
  userDNA: ScentDNA
): string[] {
  const reasons: string[] = [];
  const total = Object.values(userDNA).reduce((sum, v) => sum + v, 0);

  if (total === 0) {
    reasons.push("Rate more fragrances to get personalized reasons");
    return reasons;
  }

  const topFamilies = (Object.entries(userDNA) as [keyof ScentDNA, number][])
    .filter(([, v]) => v > 15)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k);

  if (
    fragrance.scentFamily.some((sf) => topFamilies.includes(sf as keyof ScentDNA))
  ) {
    reasons.push(`Aligns with your ${topFamilies[0]} DNA profile`);
  }

  if (fragrance.longevity >= 8) {
    reasons.push("Exceptional longevity — lasts all day");
  }

  if (fragrance.sillage >= 8) {
    reasons.push("Strong sillage — commands attention");
  }

  if (reasons.length === 0) {
    reasons.push("An interesting contrast to your usual preferences");
  }

  return reasons;
}

export function isGoodMatch(score: number): boolean {
  return score >= 70;
}
