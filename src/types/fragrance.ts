export type ScentFamily =
  | "floral"
  | "woody"
  | "oriental"
  | "fresh"
  | "citrus"
  | "gourmand"
  | "aquatic"
  | "chypre"
  | "fougere";

export type Occasion =
  | "romantic"
  | "professional"
  | "casual"
  | "evening"
  | "daytime"
  | "outdoor";

export type Mood =
  | "confident"
  | "romantic"
  | "relaxed"
  | "energized"
  | "mysterious"
  | "playful";

export type Season = "spring" | "summer" | "autumn" | "winter";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface ScentNote {
  name: string;
  category: "top" | "middle" | "base";
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  scentDNASimilarity?: number; // % similar to current user
  weather?: string;
  occasion?: string;
}

export interface StoreLocation {
  name: string;
  address: string;
  distance: string;
  mapUrl?: string;
}

export interface OnlineRetailer {
  name: string;
  url: string;
  price: string;
  currency: string;
}

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  image: string;
  description: string;
  price: string;
  volume: string;
  scentFamily: ScentFamily[];
  notes: ScentNote[];
  longevity: number; // 1-10
  sillage: number; // 1-10
  occasions: Occasion[];
  moods: Mood[];
  seasons: Season[];
  reviews: Review[];
  storeLocations: StoreLocation[];
  onlineRetailers: OnlineRetailer[];
  layeredWith: string[]; // fragrance IDs
  asSeenOn: string[]; // influencer/celebrity names
  tiktokSearchQuery: string;
  concentration: "EDP" | "EDT" | "EXP" | "EDC" | "Parfum";
  gender: "unisex" | "feminine" | "masculine";
  year: number;
  sourceUrl?: string;
  sourceRatingValue?: number;
  sourceRatingCount?: number;
  sourceMainAccords?: string[];
  marketCategory?: string;
  marketTargetAudience?: string;
  marketLongevity?: string;
  researchInsights?: string[];
  majorCompounds?: string[];
}

export interface UserRating {
  fragranceId: string;
  rating: number; // 1-5
  ratedAt: string;
}

export interface ScentDNA {
  floral: number;
  woody: number;
  oriental: number;
  fresh: number;
  citrus: number;
  gourmand: number;
  aquatic: number;
  chypre: number;
  fougere: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  ratings: UserRating[];
  scentDNA: ScentDNA;
  preferredOccasions: Occasion[];
  preferredMoods: Mood[];
  location: string;
  weather: string;
}

export interface MatchResult {
  fragranceId: string;
  score: number; // 0-100
  isGoodMatch: boolean;
  reasons: string[];
}
