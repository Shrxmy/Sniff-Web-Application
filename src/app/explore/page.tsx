"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fragrances, searchFragrances } from "@/data/fragrances";
import { useUser } from "@/context/UserContext";
import { FragranceCard } from "@/components/ui/FragranceCard";
import { ScentIcon } from "@/components/ui/ScentIcon";
import { computeMatchScore } from "@/utils/matchEngine";
import { capitalize } from "@/utils/scentDNA";
import { formatPhp } from "@/utils/currency";
import type { DatasetSearchEntryWithPairings } from "@/types/datasetSearch";
import styles from "./page.module.css";

export default function ExplorePage() {  const router = useRouter();  const { profile } = useUser();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [externalResults, setExternalResults] = useState<DatasetSearchEntryWithPairings[]>([]);
  const [isExternalLoading, setIsExternalLoading] = useState(false);

  const results = useMemo(() => {
    const base = query.trim().length > 0 ? searchFragrances(query) : fragrances;
    return base.map((f) => ({
      ...f,
      matchScore: computeMatchScore(f, profile.scentDNA),
    }));
  }, [query, profile.scentDNA]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setExternalResults([]);
      setIsExternalLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsExternalLoading(true);
      try {
        const response = await fetch(`/api/dataset-search?q=${encodeURIComponent(trimmed)}&limit=12`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setExternalResults([]);
          return;
        }
        const data = (await response.json()) as { results?: DatasetSearchEntryWithPairings[] };
        setExternalResults(data.results || []);
      } catch {
        if (!controller.signal.aborted) {
          setExternalResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsExternalLoading(false);
        }
      }
    }, 260);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className={styles.wrapper}>
      <section className={styles.hero}>
        <div className="container">
          <div className="section-label">
            <span className="label-eyebrow">Fragrance Catalog</span>
          </div>
          <h1>
            Explore <span className="text-gradient">Fragrances</span>
          </h1>
          <p className={styles.subtitle}>
            Search our full catalog of luxury fragrances. Every profile includes scent notes,
            match percentage, reviews, and where to buy.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Search + view controls */}
        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="#D39858" strokeWidth="1.4" strokeOpacity="0.6" />
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#D39858" strokeWidth="1.4" strokeOpacity="0.6" strokeLinecap="round" />
            </svg>
            <input
              id="fragrance-search"
              type="search"
              className={`input ${styles.searchInput}`}
              placeholder="Search by name, brand, or note…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className={styles.viewToggle}>
            <button
              className={`btn btn-sm ${view === "grid" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              Grid
            </button>
            <button
              className={`btn btn-sm ${view === "list" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setView("list")}
              aria-label="List view"
            >
              List
            </button>
          </div>
        </div>

        <p className={styles.resultCount}>
          {results.length} fragrance{results.length !== 1 ? "s" : ""} found
          {query && ` for "${query}"`}
        </p>

        {results.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="21" cy="21" r="14" stroke="#85431E" strokeWidth="1.5" strokeOpacity="0.5" />
              <line x1="31" y1="31" x2="42" y2="42" stroke="#85431E" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
            </svg>
            <p>No fragrances found for &quot;{query}&quot;. Try a different search.</p>
          </div>
        ) : view === "grid" ? (
          <div className="card-grid">
            {results.map((frag) => (
              <FragranceCard key={frag.id} fragrance={frag} />
            ))}
          </div>
        ) : (
          <div className={styles.listView}>
            {results.map((frag) => (
              <Link key={frag.id} href={`/fragrance/${frag.id}`} className={styles.listItem}>
                <div className={styles.listIcon}>
                  <ScentIcon family={frag.scentFamily[0]} size={36} />
                </div>
                <div className={styles.listInfo}>
                  <span className={styles.listBrand}>{frag.brand}</span>
                  <h3 className={styles.listName}>{frag.name}</h3>
                  <div className={styles.listFamilies}>
                    {frag.scentFamily.slice(0, 3).map((f) => (
                      <span key={f} className="badge-family">{capitalize(f)}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.listMeta}>
                  <span
                    className={styles.listMatch}
                    style={{ color: frag.matchScore >= 70 ? "var(--match-good)" : "var(--match-poor)" }}
                  >
                    {frag.matchScore}% Match
                  </span>
                  <span className={styles.listPrice}>{formatPhp(frag.price)}</span>
                  <span className={styles.listConc}>{frag.concentration}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {query.trim().length >= 2 && (
          <section className={styles.externalSection}>
            <div className={styles.externalHeader}>
              <h2>Expanded Dataset Matches</h2>
              <p>
                Additional records from merged CSV datasets. Opens source links in a new tab.
              </p>
            </div>

            {isExternalLoading ? (
              <p className={styles.externalState}>Searching the full dataset...</p>
            ) : externalResults.length === 0 ? (
              <p className={styles.externalState}>No additional dataset matches for this query yet.</p>
            ) : (
              <div className={styles.externalGrid}>
                {externalResults.map((item) => (
                  <a
                    key={`${item.source}-${item.brand}-${item.name}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.externalCard}
                  >
                    <div className={styles.externalTop}>
                      <span className={styles.externalBrand}>{item.brand}</span>
                      <span className={styles.externalSource}>{item.source.replace("_", " ")}</span>
                    </div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.category || "Independent listing"}
                      {item.targetAudience ? ` • ${item.targetAudience}` : ""}
                    </p>
                    <div className={styles.externalMeta}>
                      {item.ratingValue ? <span>{item.ratingValue.toFixed(2)} / 5</span> : <span>No rating</span>}
                      {item.ratingCount ? <span>{item.ratingCount.toLocaleString()} reviews</span> : <span>New data row</span>}
                    </div>
                    {item.pairings.length > 0 && (
                      <div className={styles.pairingsWrap}>
                        <p>Pairs Well With</p>
                        <div className={styles.pairingsList}>
                          {item.pairings.map((pairing) => (
                            <div
                              key={`${item.name}-${pairing.id}`}
                              className={styles.pairingLink}
                              onClick={(event) => {
                                event.stopPropagation();
                                router.push(`/fragrance/${pairing.id}`);
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  router.push(`/fragrance/${pairing.id}`);
                                }
                              }}
                            >
                              {pairing.name} ({pairing.score}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
