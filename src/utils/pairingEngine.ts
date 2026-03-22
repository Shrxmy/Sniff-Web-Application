import { fragrances } from "@/data/fragrances";
import type { DatasetSearchEntry, PairingSuggestion } from "@/types/datasetSearch";

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function toTokens(input: string): Set<string> {
  return new Set(
    normalize(input)
      .split(" ")
      .filter((token) => token.length >= 3)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  for (const value of a) {
    if (b.has(value)) overlap += 1;
  }
  const union = a.size + b.size - overlap;
  return union === 0 ? 0 : overlap / union;
}

function scorePairing(entry: DatasetSearchEntry, fragranceId: string): { score: number; reason: string } {
  const fragrance = fragrances.find((item) => item.id === fragranceId);
  if (!fragrance) {
    return { score: 0, reason: "No profile data available" };
  }

  const entryAccords = new Set(entry.mainAccords.map((item) => normalize(item)).filter(Boolean));
  const fragranceAccords = new Set((fragrance.sourceMainAccords || []).map((item) => normalize(item)).filter(Boolean));

  const entryContext = toTokens(`${entry.category || ""} ${entry.targetAudience || ""} ${entry.name}`);
  const fragranceContext = toTokens(
    `${fragrance.scentFamily.join(" ")} ${fragrance.marketCategory || ""} ${fragrance.marketTargetAudience || ""} ${
      fragrance.name
    }`
  );

  const accordSimilarity = jaccard(entryAccords, fragranceAccords);
  const contextSimilarity = jaccard(entryContext, fragranceContext);
  const ratingSignal = Math.min((fragrance.sourceRatingValue || 0) / 5, 1);

  const weighted = accordSimilarity * 0.55 + contextSimilarity * 0.3 + ratingSignal * 0.15;
  const score = Math.round(weighted * 100);

  let reason = "Balanced complement profile";
  if (accordSimilarity >= 0.35) {
    reason = "Strong accord overlap";
  } else if (contextSimilarity >= 0.3) {
    reason = "Similar market and scent direction";
  }

  return { score, reason };
}

export function recommendCatalogPairings(entry: DatasetSearchEntry, limit = 3): PairingSuggestion[] {
  const scored = fragrances
    .map((fragrance) => {
      const pairing = scorePairing(entry, fragrance.id);
      return {
        id: fragrance.id,
        name: fragrance.name,
        brand: fragrance.brand,
        score: pairing.score,
        reason: pairing.reason,
      };
    })
    .filter((item) => item.score >= 25)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return scored.slice(0, limit);
}
