export type DatasetSource = "fra_cleaned" | "fra_perfumes" | "perfumes_dataset";

export interface DatasetSearchEntry {
  source: DatasetSource;
  brand: string;
  name: string;
  url: string;
  ratingValue?: number;
  ratingCount?: number;
  mainAccords: string[];
  category?: string;
  targetAudience?: string;
  marketLongevity?: string;
  gender?: string;
  year?: number;
}

export interface PairingSuggestion {
  id: string;
  name: string;
  brand: string;
  score: number;
  reason: string;
}

export interface DatasetSearchEntryWithPairings extends DatasetSearchEntry {
  pairings: PairingSuggestion[];
}
