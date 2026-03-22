# SNIFF — AI-Powered Fragrance Discovery

> Eliminate blind buying. Discover luxury fragrances matched to your unique Scent DNA.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-amber)

---

## Overview

**SNIFF** is an AI-driven fragrance discovery platform built for L'Oréal Luxe. It profiles users through a Scent DNA system — turning fragrance ratings into a personalised compatibility engine — so every recommendation is earned, not random.

**Design language:** Champagne · Whiskey Sour · Honey Garlic · Burnt Coffee · Balsamico — a warm, earthy palette with Cormorant Garamond serif headings and Inter body text.

---

## Features

| Feature | Description |
|---|---|
| **Scent DNA** | Rate fragrances → the system computes your family affinities in real time |
| **AI Match Score** | Every fragrance receives a 0–100% personal compatibility score |
| **Discover** | Filter by mood, occasion, scent family, and sort by match / longevity / sillage |
| **Explore** | Full-text search across the catalog with grid / list toggle |
| **Fragrance Detail** | Notes pyramid, performance bars, community reviews, retailers, layering suggestions |
| **SVG Icons** | No emojis — custom SVG perfume bottle icons per scent family |

---

## Pages

```
/             → Landing page, featured shelf, how-it-works
/my-dna       → Scent DNA builder with live profile sidebar
/discover     → AI-ranked matches with filters
/explore      → Full search catalog
/fragrance/[id] → Detailed fragrance profile (SSR)
```

---

## Tech Stack

- **Framework** — Next.js 16 (App Router) + TypeScript
- **Styling** — Vanilla CSS Modules (zero runtime CSS-in-JS)
- **State** — React Context API
- **Icons** — Custom inline SVGs
- **Fonts** — Cormorant Garamond + Inter (Google Fonts)

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → http://localhost:3000

# Lint
npm run lint

# Production build
npm run build
```

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages + CSS modules
│   ├── page.tsx          # Home
│   ├── my-dna/           # Scent DNA builder
│   ├── discover/         # AI matches + filters
│   ├── explore/          # Search catalog
│   └── fragrance/[id]/   # Fragrance detail (dynamic)
├── components/
│   ├── layout/           # Navbar, Footer
│   └── ui/               # FragranceCard, MatchBadge, StarRating, ScentIcon, LogoMark
├── context/              # UserContext (ratings + DNA state)
├── data/                 # fragrances.ts, userData.ts
├── types/                # fragrance.ts TypeScript interfaces
└── utils/                # scentDNA.ts, matchEngine.ts
```

---

## Deployment

This app is ready for Vercel out of the box — no additional configuration needed.

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel
```

Or connect the repository directly in the [Vercel dashboard](https://vercel.com/new) and it will auto-detect Next.js.

> **Note:** No environment variables are required for the current build (all data is static).

---

## Data

15 curated luxury fragrances are included as static TypeScript data covering YSL, Tom Ford, Dior, Chanel, Maison Margiela, Armani, Prada, Viktor & Rolf, Byredo, and Maison Francis Kurkdjian.

A full [CSV dataset](https://www.kaggle.com/datasets/olgagmiufana1/fragrantica-com-fragrance-dataset/data?select=fra_perfumes.csv) (`fra_cleaned.csv`) is available in `src/data/` for future data pipeline work.
