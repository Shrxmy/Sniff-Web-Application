import { ScentDNA, UserRating } from "@/types/fragrance";
import { fragrances } from "@/data/fragrances";

export function computeScentDNA(ratings: UserRating[]): ScentDNA {
  const dna: ScentDNA = {
    floral: 0,
    woody: 0,
    oriental: 0,
    fresh: 0,
    citrus: 0,
    gourmand: 0,
    aquatic: 0,
    chypre: 0,
    fougere: 0,
  };

  if (ratings.length === 0) return dna;

  ratings.forEach(({ fragranceId, rating }) => {
    const frag = fragrances.find((f) => f.id === fragranceId);
    if (!frag) return;
    const weight = rating / 5;
    frag.scentFamily.forEach((family) => {
      if (family in dna) {
        dna[family as keyof ScentDNA] += weight;
      }
    });
  });

  // Normalize to percentage
  const total = Object.values(dna).reduce((sum, v) => sum + v, 0);
  if (total > 0) {
    (Object.keys(dna) as (keyof ScentDNA)[]).forEach((key) => {
      dna[key] = Math.round((dna[key] / total) * 100);
    });
  }

  return dna;
}

export function getDNALabel(dna: ScentDNA): string {
  const sorted = (Object.entries(dna) as [keyof ScentDNA, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  if (sorted.length === 0) return "Uncalibrated";
  if (sorted.length === 1)
    return `Pure ${capitalize(sorted[0][0])}`;
  return `${capitalize(sorted[0][0])} ${capitalize(sorted[1][0])}`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getDNAColor(family: keyof ScentDNA): string {
  const colors: Record<keyof ScentDNA, string> = {
    floral: "#f472b6",
    woody: "#92400e",
    oriental: "#d97706",
    fresh: "#34d399",
    citrus: "#fbbf24",
    gourmand: "#b45309",
    aquatic: "#38bdf8",
    chypre: "#a78bfa",
    fougere: "#6ee7b7",
  };
  return colors[family];
}
