import { Fragrance } from "@/types/fragrance";
import { datasetSearchIndex } from "@/data/generated/datasetSearchIndex";

const MAX_DATASET_CATALOG_ADDITIONS = 220;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function sanitizeBrand(input: string): string {
  const cleaned = input.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned ? toTitleCase(cleaned) : "Unknown Brand";
}

function sanitizeName(input: string, brand: string): string {
  let cleaned = input
    .replace(/for\s+women|for\s+men|for\s+unisex/gi, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  cleaned = cleaned
    .replace(new RegExp(`\\b${escapedBrand}\\b`, "ig"), "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned ? toTitleCase(cleaned) : "Untitled Fragrance";
}

function mapAccordsToFamilies(accords: string[]): Fragrance["scentFamily"] {
  const families = new Set<Fragrance["scentFamily"][number]>();
  const joined = accords.join(" ").toLowerCase();

  if (/(floral|rose|jasmine|white floral|yellow floral|violet|iris|tuberose)/.test(joined)) families.add("floral");
  if (/(woody|cedar|sandal|vetiver|mossy)/.test(joined)) families.add("woody");
  if (/(amber|oriental|warm spicy|resin|incense|balsamic|oud)/.test(joined)) families.add("oriental");
  if (/(fresh|green|aromatic|clean|aldehydic)/.test(joined)) families.add("fresh");
  if (/(citrus|bergamot|lemon|orange|grapefruit|mandarin)/.test(joined)) families.add("citrus");
  if (/(sweet|vanilla|caramel|chocolate|tonka|cacao|gourmand)/.test(joined)) families.add("gourmand");
  if (/(aquatic|marine|ozonic|watery|sea)/.test(joined)) families.add("aquatic");
  if (/(chypre|oakmoss)/.test(joined)) families.add("chypre");
  if (/(fougere|lavender|coumarin)/.test(joined)) families.add("fougere");

  if (families.size === 0) {
    families.add("fresh");
  }

  return Array.from(families).slice(0, 3);
}

function inferLongevity(entry: (typeof datasetSearchIndex)[number]): number {
  const raw = (entry.marketLongevity || "").toLowerCase();
  if (raw.includes("strong") || raw.includes("long")) return 8;
  if (raw.includes("moderate") || raw.includes("medium")) return 6;
  if (raw.includes("soft") || raw.includes("light")) return 5;
  if ((entry.ratingCount || 0) > 3000) return 7;
  return 6;
}

function inferSillage(entry: (typeof datasetSearchIndex)[number], families: Fragrance["scentFamily"]): number {
  let score = families.includes("oriental") || families.includes("gourmand") ? 7 : 6;
  if ((entry.ratingCount || 0) > 6000) score += 1;
  return Math.max(4, Math.min(9, score));
}

function inferPricePhp(entry: (typeof datasetSearchIndex)[number], year?: number): string {
  const base = 6400;
  const popularity = Math.min(
    ((entry.ratingValue || 3.6) - 3.4) * 1700 + Math.log10((entry.ratingCount || 1) + 1) * 950,
    6200
  );
  const ageBump = year && year >= 2021 ? 500 : 0;
  const value = Math.max(2800, Math.round(base + popularity + ageBump));
  return `PHP ${value.toLocaleString("en-PH")}`;
}

function inferOccasions(families: Fragrance["scentFamily"]): Fragrance["occasions"] {
  const occasions = new Set<Fragrance["occasions"][number]>(["casual", "daytime"]);
  if (families.includes("oriental") || families.includes("gourmand") || families.includes("woody")) occasions.add("evening");
  if (families.includes("floral") || families.includes("fougere")) occasions.add("professional");
  if (families.includes("citrus") || families.includes("fresh") || families.includes("aquatic")) occasions.add("outdoor");
  if (families.includes("oriental") || families.includes("floral")) occasions.add("romantic");
  return Array.from(occasions).slice(0, 4);
}

function inferMoods(families: Fragrance["scentFamily"]): Fragrance["moods"] {
  const moods = new Set<Fragrance["moods"][number]>(["confident"]);
  if (families.includes("floral")) moods.add("romantic");
  if (families.includes("fresh") || families.includes("citrus") || families.includes("aquatic")) moods.add("energized");
  if (families.includes("woody") || families.includes("oriental")) moods.add("mysterious");
  if (families.includes("gourmand")) moods.add("playful");
  if (families.includes("fougere")) moods.add("relaxed");
  return Array.from(moods).slice(0, 3);
}

function inferSeasons(families: Fragrance["scentFamily"]): Fragrance["seasons"] {
  const seasons = new Set<Fragrance["seasons"][number]>(["spring", "autumn"]);
  if (families.includes("citrus") || families.includes("fresh") || families.includes("aquatic")) seasons.add("summer");
  if (families.includes("oriental") || families.includes("gourmand") || families.includes("woody")) seasons.add("winter");
  return Array.from(seasons).slice(0, 3);
}

function inferGender(raw?: string): Fragrance["gender"] {
  const normalized = (raw || "").toLowerCase();
  if (normalized.includes("women") || normalized.includes("female")) return "feminine";
  if (normalized.includes("men") || normalized.includes("male")) return "masculine";
  return "unisex";
}

function inferConcentration(name: string): Fragrance["concentration"] {
  const lower = name.toLowerCase();
  if (lower.includes("parfum")) return "Parfum";
  if (lower.includes("edp")) return "EDP";
  if (lower.includes("edt")) return "EDT";
  if (lower.includes("edc")) return "EDC";
  if (lower.includes("extract") || lower.includes("extrait")) return "EXP";
  return "EDP";
}

function buildNotesFromAccords(accords: string[]): Fragrance["notes"] {
  const pick = accords.slice(0, 6).map((accord) => toTitleCase(accord));
  const notes: Fragrance["notes"] = [];

  pick.slice(0, 2).forEach((name) => notes.push({ name, category: "top" }));
  pick.slice(2, 4).forEach((name) => notes.push({ name, category: "middle" }));
  pick.slice(4, 6).forEach((name) => notes.push({ name, category: "base" }));

  if (notes.length === 0) {
    notes.push({ name: "Fresh Notes", category: "top" });
    notes.push({ name: "Aromatic Notes", category: "middle" });
    notes.push({ name: "Warm Woods", category: "base" });
  }

  return notes;
}

function createDatasetFragrance(entry: (typeof datasetSearchIndex)[number]): Fragrance {
  const brand = sanitizeBrand(entry.brand);
  const name = sanitizeName(entry.name, brand);
  const year = entry.year && entry.year > 1850 && entry.year < 2100 ? entry.year : 2022;
  const accords = (entry.mainAccords || []).map((x) => x.toLowerCase()).filter(Boolean);
  const scentFamily = mapAccordsToFamilies(accords);
  const id = `${slugify(name)}-${slugify(brand)}-${year}`;

  return {
    id,
    name,
    brand,
    image: "/images/placeholder-fragrance.jpg",
    description:
      `Community-sourced fragrance profile for ${name} by ${brand}. ` +
      "Includes accord mapping and popularity signals from merged datasets.",
    price: inferPricePhp(entry, year),
    volume: "100ml",
    scentFamily,
    notes: buildNotesFromAccords(accords),
    longevity: inferLongevity(entry),
    sillage: inferSillage(entry, scentFamily),
    occasions: inferOccasions(scentFamily),
    moods: inferMoods(scentFamily),
    seasons: inferSeasons(scentFamily),
    reviews: [],
    storeLocations: [],
    onlineRetailers: [
      {
        name: "Source Profile",
        url: entry.url,
        price: inferPricePhp(entry, year).replace("PHP ", ""),
        currency: "PHP",
      },
    ],
    layeredWith: [],
    asSeenOn: [],
    tiktokSearchQuery: `${brand} ${name} review`,
    concentration: inferConcentration(name),
    gender: inferGender(entry.gender),
    year,
    sourceUrl: entry.url,
    sourceRatingValue: entry.ratingValue,
    sourceRatingCount: entry.ratingCount,
    sourceMainAccords: accords.slice(0, 8),
    marketCategory: entry.category,
    marketTargetAudience: entry.targetAudience,
    marketLongevity: entry.marketLongevity,
  };
}

export function buildDatasetCatalog(baseCatalog: Fragrance[]): Fragrance[] {
  const existingKeys = new Set(baseCatalog.map((item) => `${slugify(item.brand)}|${slugify(item.name)}`));

  const sorted = [...datasetSearchIndex]
    .filter((entry) => entry.brand && entry.name && entry.mainAccords && entry.mainAccords.length > 0)
    .sort((a, b) => {
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      if (yearA !== yearB) return yearB - yearA;
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    });

  const additions: Fragrance[] = [];
  for (const entry of sorted) {
    const brand = sanitizeBrand(entry.brand);
    const name = sanitizeName(entry.name, brand);
    const key = `${slugify(brand)}|${slugify(name)}`;

    if (existingKeys.has(key)) continue;

    existingKeys.add(key);
    additions.push(createDatasetFragrance(entry));

    if (additions.length >= MAX_DATASET_CATALOG_ADDITIONS) {
      break;
    }
  }

  return additions;
}
