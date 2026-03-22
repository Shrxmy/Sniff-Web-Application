"use client";

import { fragrances } from "@/data/fragrances";
import { useUser } from "@/context/UserContext";
import { FragranceCard } from "@/components/ui/FragranceCard";
import { StarRating } from "@/components/ui/StarRating";
import { getDNALabel, getDNAColor, capitalize } from "@/utils/scentDNA";
import { ScentDNA } from "@/types/fragrance";
import styles from "./page.module.css";

export default function MyDNAPage() {
  const { profile, getRating, clearRatings } = useUser();
  const ratedCount = profile.ratings.length;
  const dnaEntries = (Object.entries(profile.scentDNA) as [keyof ScentDNA, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className={styles.wrapper}>
      {/* Page Header */}
      <section className={styles.hero}>
        <div className="container">
          <div className="section-label">
            <span className="label-eyebrow">Personalization</span>
          </div>
          <h1>
            My Scent <span className="text-gradient">DNA</span>
          </h1>
          <p className={styles.subtitle}>
            Rate fragrances you&apos;ve tried to calibrate your unique Scent DNA. The more you
            rate, the smarter your recommendations become.
          </p>
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          {/* LEFT — DNA Profile */}
          <aside className={styles.sidebar}>
            <div className={`glass-card ${styles.dnaCard}`}>
              <div className={styles.dnaHeader}>
                <span className={styles.dnaIcon}>◈</span>
                <div>
                  <h3>Scent DNA</h3>
                  <p className="text-muted" style={{ fontSize: "0.8rem", margin: 0 }}>
                    {ratedCount === 0
                      ? "Not calibrated yet"
                      : `Based on ${ratedCount} rating${ratedCount > 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>

              {/* Profile label */}
              <div className={styles.dnaLabel}>
                {getDNALabel(profile.scentDNA)}
              </div>

              {/* DNA bars */}
              {ratedCount === 0 ? (
                <div className={styles.emptyDna}>
                  <span className={styles.emptyIcon}>◇</span>
                  <p>Start rating fragrances below to reveal your Scent DNA.</p>
                </div>
              ) : (
                <div className={styles.dnaBars}>
                  {dnaEntries.map(([family, value]) => (
                    <div key={family} className={styles.dnaRow}>
                      <div className={styles.dnaRowLabel}>
                        <span>{capitalize(family)}</span>
                        <span className={styles.dnaPercent}>{value}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${value}%`,
                            background: `linear-gradient(90deg, ${getDNAColor(family)}aa, ${getDNAColor(family)})`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {ratedCount > 0 && (
                <button className={`btn btn-ghost btn-sm ${styles.clearBtn}`} onClick={clearRatings}>
                  Reset Ratings
                </button>
              )}
            </div>

            {/* Tips */}
            <div className={`glass-card ${styles.tipsCard}`}>
              <h4 className={styles.tipsTitle}>◎ Tips</h4>
              <ul className={styles.tips}>
                <li>Rate at least 5 fragrances for accurate DNA</li>
                <li>Be honest — rate what you&apos;ve actually tried</li>
                <li>Revisit ratings as your taste evolves</li>
                <li>Mix families for a rich, complex DNA</li>
              </ul>
            </div>
          </aside>

          {/* RIGHT — Fragrance Shelf */}
          <div className={styles.shelf}>
            <div className={styles.shelfHeader}>
              <h2 className={styles.shelfTitle}>Your Fragrance Shelf</h2>
              <p className="text-secondary" style={{ fontSize: "0.9rem" }}>
                Click a star rating on any card to add it to your DNA profile.
              </p>
            </div>

            <div className="card-grid">
              {fragrances.map((frag) => {
                const rating = getRating(frag.id);
                return (
                  <div key={frag.id} className={styles.shelfItem}>
                    <FragranceCard fragrance={frag} showRating={true} />
                    {rating > 0 && (
                      <div className={styles.ratedBadge}>
                        <StarRating value={rating} readonly size="sm" />
                        <span>You rated this</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
