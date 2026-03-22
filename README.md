# SNIFF - AI Fragrance Discovery Platform

Stop blind buying with personalized fragrance recommendations powered by a Scent DNA profile.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## What It Does

SNIFF helps people discover perfumes that actually fit their taste before purchasing.

Users rate fragrances they know, the system builds a **Scent DNA**, and recommendations are ranked by compatibility.

---

## Why It Stands Out

- Personalized matching with explainable scoring (0-100%)
- Realistic quiz flow with longevity, sillage, and budget preferences
- Blind-buy risk indicator on fragrance detail pages
- Dataset-backed discovery with expanded external catalog matching
- Psychology insight overlays from research datasets
- Retail comparison-ready detail pages for confident buying

---

## Core Product Flows

- **Build DNA:** Rate perfumes -> profile updates instantly
- **Discover:** Filter and sort by match, occasion, mood, and scent family
- **Explore:** Search across in-app catalog and extended dataset results
- **Decide:** Review notes, performance, risk, and market signals on detail pages

---

## Current Data Footprint

- **Handcrafted base catalog:** 33 premium fragrance profiles
- **Auto-generated expansion:** 220+ dataset-backed entries
- **Total searchable catalog:** 253+ fragrances

Datasets used include merged Fragrantica exports and aroma-psychology/compound references.

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript 5
- React Context API (DNA and ratings state)
- CSS Modules
- Next.js API route for server-side dataset search

---

## Local Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Quality checks

```bash
npm run lint
npm run build
```

### Refresh generated data

```bash
npm run generate:data
```

---

## Project Structure

```txt
src/
|- app/
|  |- page.tsx
|  |- my-dna/
|  |- discover/
|  |- explore/
|  |- fragrance/[id]/
|  \- api/dataset-search/
|- components/
|- context/
|- data/
|  |- fragrances.ts
|  |- datasetCatalog.ts
|  |- generated/
|  \- csv/
|- types/
\- utils/
```

---

## Deployment

Vercel-ready with no environment variables required for the current build.

```bash
npm i -g vercel
vercel
```

Or connect the repository in Vercel and deploy automatically.

---

## Status

Production build and lint pass on current main branch.
