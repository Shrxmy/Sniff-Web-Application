import { NextRequest, NextResponse } from "next/server";
import { datasetSearchIndex } from "@/data/generated/datasetSearchIndex";
import { recommendCatalogPairings } from "@/utils/pairingEngine";
import type { DatasetSearchEntryWithPairings } from "@/types/datasetSearch";

type ScoredResult = {
  score: number;
  entry: (typeof datasetSearchIndex)[number];
};

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreEntry(entry: (typeof datasetSearchIndex)[number], terms: string[]): number {
  const name = normalize(entry.name);
  const brand = normalize(entry.brand);
  const accords = normalize(entry.mainAccords.join(" "));
  const category = normalize(entry.category || "");
  const audience = normalize(entry.targetAudience || "");
  const haystack = `${brand} ${name} ${accords} ${category} ${audience}`;

  let score = 0;
  for (const term of terms) {
    if (name === term) score += 60;
    else if (name.startsWith(term)) score += 35;
    else if (name.includes(term)) score += 20;

    if (brand === term) score += 40;
    else if (brand.startsWith(term)) score += 24;
    else if (brand.includes(term)) score += 14;

    if (accords.includes(term)) score += 7;
    if (category.includes(term)) score += 5;
    if (audience.includes(term)) score += 4;
    if (haystack.includes(term)) score += 2;
  }

  if (entry.ratingValue && entry.ratingValue > 4) score += 5;
  if (entry.ratingCount && entry.ratingCount > 1000) score += 4;
  if (entry.ratingCount && entry.ratingCount > 3000) score += 3;

  return score;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") || "").trim();
  const limitRaw = Number(params.get("limit") || "12");
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 12, 1), 50);

  if (query.length < 2) {
    return NextResponse.json({
      query,
      count: 0,
      results: [],
    });
  }

  const terms = normalize(query).split(" ").filter(Boolean);
  const scored: ScoredResult[] = [];

  for (const entry of datasetSearchIndex) {
    const score = scoreEntry(entry, terms);
    if (score > 0) {
      scored.push({ score, entry });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const countA = a.entry.ratingCount || 0;
    const countB = b.entry.ratingCount || 0;
    if (countB !== countA) return countB - countA;
    return a.entry.name.localeCompare(b.entry.name);
  });

  const results: DatasetSearchEntryWithPairings[] = scored
    .slice(0, limit)
    .map((item) => ({
      ...item.entry,
      pairings: recommendCatalogPairings(item.entry, 3),
    }));

  return NextResponse.json({
    query,
    count: results.length,
    results,
  });
}
