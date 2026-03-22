"use client";

import { useState, useMemo } from "react";
import { fragrances } from "@/data/fragrances";
import { useUser } from "@/context/UserContext";
import { FragranceCard } from "@/components/ui/FragranceCard";
import { computeMatchScore } from "@/utils/matchEngine";
import { Occasion, Mood, ScentFamily } from "@/types/fragrance";
import styles from "./page.module.css";

type SortOption = "match" | "longevity" | "sillage" | "price-low" | "price-high";

const moods: Mood[] = ["confident", "romantic", "relaxed", "energized", "mysterious", "playful"];
const occasions: Occasion[] = ["romantic", "professional", "casual", "evening", "daytime", "outdoor"];
const families: ScentFamily[] = ["floral", "woody", "oriental", "fresh", "citrus", "gourmand", "aquatic"];

export default function DiscoverPage() {
  const { profile } = useUser();
  const [activeMood, setActiveMood] = useState<Mood | null>(null);
  const [activeOccasion, setActiveOccasion] = useState<Occasion | null>(null);
  const [activeFamily, setActiveFamily] = useState<ScentFamily | null>(null);
  const [sort, setSort] = useState<SortOption>("match");

  const filtered = useMemo(() => {
    let list = fragrances.map((f) => ({
      ...f,
      matchScore: computeMatchScore(f, profile.scentDNA),
    }));

    if (activeMood) list = list.filter((f) => f.moods.includes(activeMood));
    if (activeOccasion) list = list.filter((f) => f.occasions.includes(activeOccasion));
    if (activeFamily) list = list.filter((f) => f.scentFamily.includes(activeFamily));

    list.sort((a, b) => {
      if (sort === "match") return b.matchScore - a.matchScore;
      if (sort === "longevity") return b.longevity - a.longevity;
      if (sort === "sillage") return b.sillage - a.sillage;
      if (sort === "price-low") return parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, ""));
      if (sort === "price-high") return parseInt(b.price.replace(/\D/g, "")) - parseInt(a.price.replace(/\D/g, ""));
      return 0;
    });

    return list;
  }, [activeMood, activeOccasion, activeFamily, sort, profile.scentDNA]);

  const goodMatches = filtered.filter((f) => f.matchScore >= 70).length;

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <section className={styles.hero}>
        <div className="container">
          <div className="section-label">
            <span className="label-eyebrow">AI Recommendations</span>
          </div>
          <h1>
            Your <span className="text-gradient">Matches</span>
          </h1>
          <p className={styles.subtitle}>
            Fragrances ranked by compatibility with your Scent DNA. Filter by mood, occasion,
            or scent family to refine your discovery.
          </p>
          <div className={styles.headerStats}>
            <div className={styles.headerStat}>
              <span className={styles.statNum}>{filtered.length}</span>
              <span className={styles.statLbl}>Fragrances</span>
            </div>
            <div className={styles.headerStat}>
              <span className={styles.statNum}>{goodMatches}</span>
              <span className={styles.statLbl}>Good Matches</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Filters */}
        <div className={styles.filtersWrapper}>
          {/* Mood */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Mood</span>
            <div className={styles.filterChips}>
              {moods.map((m) => (
                <button
                  key={m}
                  className={`btn btn-sm ${activeMood === m ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setActiveMood(activeMood === m ? null : m)}
                  style={{ textTransform: "capitalize" }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Occasion</span>
            <div className={styles.filterChips}>
              {occasions.map((o) => (
                <button
                  key={o}
                  className={`btn btn-sm ${activeOccasion === o ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setActiveOccasion(activeOccasion === o ? null : o)}
                  style={{ textTransform: "capitalize" }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Family */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Scent Family</span>
            <div className={styles.filterChips}>
              {families.map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${activeFamily === f ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setActiveFamily(activeFamily === f ? null : f)}
                  style={{ textTransform: "capitalize" }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Sort By</span>
            <div className={styles.filterChips}>
              {(["match", "longevity", "sillage", "price-low", "price-high"] as SortOption[]).map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${sort === s ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setSort(s)}
                >
                  {s === "match" ? "Best Match" : s === "price-low" ? "Price ↑" : s === "price-high" ? "Price ↓" : s === "longevity" ? "Longevity" : "Sillage"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>◇</span>
            <p>No fragrances match your current filters. Try removing a filter.</p>
          </div>
        ) : (
          <div className="card-grid">
            {filtered.map((frag) => (
              <FragranceCard key={frag.id} fragrance={frag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
