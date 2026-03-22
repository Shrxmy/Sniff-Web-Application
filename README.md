# SNIFF - AI-Powered Fragrance Discovery

> Eliminate blind buying. Discover luxury fragrances matched to your unique Scent DNA.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-amber)

---

## Overview

**SNIFF** is an AI-driven fragrance discovery platform built for L'Oreal Luxe. It profiles users through a Scent DNA system - turning fragrance ratings into a personalized compatibility engine - so every recommendation is earned, not random.

**Design language:** Champagne, Whiskey Sour, Honey Garlic, Burnt Coffee, Balsamico - a warm, earthy palette with Cormorant Garamond serif headings and Inter body text.

---

## Features

| Feature | Description |
|---|---|
| **Scent DNA** | Rate fragrances -> the system computes your family affinities in real time |
| **AI Match Score** | Every fragrance receives a 0-100% personal compatibility score |
| **Discover** | Filter by mood, occasion, scent family, and sort by match / longevity / sillage |
| **Explore** | Full-text search across 250+ fragrances with grid/list toggle + expanded dataset matches |
| **Fragrance Detail** | Notes pyramid, performance bars, community insights, blind-buy risk indicator, retailers |
| **Expanded Catalog** | 33 handcrafted profiles + 220 auto-generated entries from merged CSV datasets |
| **Pairing Engine** | Dataset-driven accord pairing with recommendation explanations |
| **Psychology Insights** | Aroma-psychology research annotations on qualifying fragrances |
| **SVG Icons** | Custom SVG perfume bottle icons by scent family (no emoji dependencies) |

---

## Pages

```txt
/                   -> Landing page, featured shelf, how-it-works
/my-dna             -> Scent DNA builder + realistic quiz + recommendation confidence
/discover           -> AI-ranked matches with filters
/explore            -> Full search catalog + external dataset results
/fragrance/[id]     -> Detailed fragrance profile + blind-buy risk
/api/dataset-search -> Server-side dataset search endpoint
```

---

## Tech Stack

- **Framework** - Next.js 16 (App Router) + TypeScript 5
- **Styling** - Vanilla CSS Modules
- **State** - React Context API + localStorage persistence
- **Server** - Next.js API routes for dataset search
- **Icons** - Custom inline SVGs
- **Fonts** - Cormorant Garamond + Inter (Google Fonts)

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# -> http://localhost:3000

# Lint
npm run lint

# Production build
npm run build

# Regenerate dataset artifacts (after CSV updates)
npm run generate:data
```

---

## Project Structure

```txt
src/
|- app/                     # Next.js App Router pages + CSS modules
|  |- page.tsx              # Home
|  |- my-dna/               # Scent DNA builder + quiz + recommendations
|  |- discover/             # AI matches + filters
|  |- explore/              # Search catalog + dataset expansion results
|  |- fragrance/[id]/       # Fragrance detail + blind-buy risk scoring
|  \- api/dataset-search/   # Server-side dataset search endpoint
|- components/
|  |- layout/               # Navbar, Footer
|  \- ui/                   # FragranceCard, MatchBadge, StarRating, ScentIcon, LogoMark
|- context/                 # UserContext (ratings + DNA state)
|- data/
|  |- fragrances.ts         # Handcrafted + generated catalog export
|  |- datasetCatalog.ts     # Dataset-to-catalog generation logic
|  |- generated/            # csvKnowledge.ts, datasetSearchIndex.ts
|  \- csv/                  # Source CSV datasets
|- types/                   # fragrance.ts, datasetSearch.ts
\- utils/                   # scentDNA.ts, matchEngine.ts, currency.ts, pairingEngine.ts
```

---

## Data and Catalog

### Handcrafted Base
- 33 curated luxury fragrance profiles

### Auto-Generated Expansion
- 220 dataset-backed entries synthesized from merged CSV sources:
  - `fra_cleaned.csv` (24,063 rows)
  - `fra_perfumes.csv` (70,103 rows)
  - psychology/brain-function/compound datasets

### Current Total
- 253+ fragrances searchable and browsable in-app

### Pipeline
```bash
npm run generate:data
# Updates src/data/generated/csvKnowledge.ts and src/data/generated/datasetSearchIndex.ts
```

All data is precomputed at build time; no runtime external API is required.

---

## Deployment

This app is ready for Vercel with zero additional runtime configuration.

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel
```

Or connect the repository in the [Vercel dashboard](https://vercel.com/new) and it auto-detects Next.js.

> **Note:** No environment variables are required for the current build.
