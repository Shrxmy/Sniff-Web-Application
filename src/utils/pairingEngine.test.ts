import test from "node:test";
import assert from "node:assert/strict";

import { recommendCatalogPairings } from "./pairingEngine";
import type { DatasetSearchEntry } from "@/types/datasetSearch";

test("pairing engine returns ranked suggestions", () => {
  const sample: DatasetSearchEntry = {
    source: "fra_cleaned",
    brand: "Yves Saint Laurent",
    name: "Black Opium",
    url: "https://example.com",
    ratingValue: 4.2,
    ratingCount: 23000,
    mainAccords: ["vanilla", "coffee", "sweet", "white floral"],
    category: "Ambery Gourmand",
    targetAudience: "Female",
    marketLongevity: "Strong",
    gender: "women",
    year: 2014,
  };

  const pairings = recommendCatalogPairings(sample, 3);

  assert.equal(pairings.length, 3);
  assert.ok(pairings[0].score >= pairings[1].score);
  assert.ok(pairings[1].score >= pairings[2].score);
  assert.ok(pairings.some((entry) => entry.score >= 40));
});
