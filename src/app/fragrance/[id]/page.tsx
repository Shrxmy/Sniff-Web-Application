"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { getFragranceById, fragrances } from "@/data/fragrances";
import { useUser } from "@/context/UserContext";
import { StarRating } from "@/components/ui/StarRating";
import { MatchBadge } from "@/components/ui/MatchBadge";
import { FragranceCard } from "@/components/ui/FragranceCard";
import { computeMatchScore, getMatchReasons } from "@/utils/matchEngine";
import { capitalize } from "@/utils/scentDNA";
import { ScentIcon, ScentIconSm } from "@/components/ui/ScentIcon";
import { formatPhp, toPhpAmount } from "@/utils/currency";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ id: string }>;
}




function NoteCategory({ category, notes }: { category: string; notes: string[] }) {
  if (notes.length === 0) return null;
  return (
    <div className={styles.noteCategory}>
      <span className={styles.noteCatLabel}>{capitalize(category)}</span>
      <div className={styles.notePills}>
        {notes.map((n) => (
          <span key={n} className={styles.notePill}>{n}</span>
        ))}
      </div>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.ratingBar}>
      <span className={styles.ratingBarLabel}>{label}</span>
      <div className="progress-track" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${value * 10}%` }} />
      </div>
      <span className={styles.ratingBarValue}>{value}/10</span>
    </div>
  );
}

function computeBlindBuyRisk(fragrance: NonNullable<ReturnType<typeof getFragranceById>>, matchScore: number) {
  let risk = 55;

  risk -= (matchScore - 50) * 0.55;

  if (!fragrance.sourceRatingCount || fragrance.sourceRatingCount < 500) risk += 10;
  if (fragrance.sourceRatingValue && fragrance.sourceRatingValue < 3.8) risk += 8;
  if (fragrance.onlineRetailers.length < 2) risk += 6;
  if (!fragrance.researchInsights || fragrance.researchInsights.length === 0) risk += 5;

  const bounded = Math.max(5, Math.min(95, Math.round(risk)));
  if (bounded <= 35) {
    return {
      score: bounded,
      label: "Low",
      hint: "High profile fit and stronger supporting data.",
    };
  }
  if (bounded <= 65) {
    return {
      score: bounded,
      label: "Medium",
      hint: "Some fit signals are good, but test in-store if possible.",
    };
  }
  return {
    score: bounded,
    label: "High",
    hint: "Bigger chance of mismatch. Try a decant or physical test first.",
  };
}

export default function FragranceDetailPage({ params }: Props) {
  const { id } = use(params);
  const fragrance = getFragranceById(id);

  if (!fragrance) notFound();

  const { profile, rateFragrance, getRating } = useUser();
  const userRating = getRating(fragrance.id);
  const matchScore = computeMatchScore(fragrance, profile.scentDNA);
  const matchReasons = getMatchReasons(fragrance, profile.scentDNA);
  const blindBuyRisk = computeBlindBuyRisk(fragrance, matchScore);

  const topNotes = fragrance.notes.filter((n) => n.category === "top").map((n) => n.name);
  const midNotes = fragrance.notes.filter((n) => n.category === "middle").map((n) => n.name);
  const baseNotes = fragrance.notes.filter((n) => n.category === "base").map((n) => n.name);

  const layeredFrags = fragrance.layeredWith
    .map((lid) => fragrances.find((f) => f.id === lid))
    .filter(Boolean);

  const sortedRetailers = [...fragrance.onlineRetailers].sort((a, b) => {
    const priceA = toPhpAmount(a.price, a.currency).amount ?? Number.POSITIVE_INFINITY;
    const priceB = toPhpAmount(b.price, b.currency).amount ?? Number.POSITIVE_INFINITY;
    return priceA - priceB;
  });

  const buySavings = (() => {
    if (sortedRetailers.length < 2) return null;
    const lowest = toPhpAmount(sortedRetailers[0].price, sortedRetailers[0].currency).amount;
    const highest = toPhpAmount(
      sortedRetailers[sortedRetailers.length - 1].price,
      sortedRetailers[sortedRetailers.length - 1].currency
    ).amount;
    if (!lowest || !highest || highest <= lowest) return null;
    const diff = highest - lowest;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(diff);
  })();

  const primaryFamily = fragrance.scentFamily[0];

  return (
    <div className={styles.wrapper}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBlob} />
        <div className={`container ${styles.heroInner}`}>
          {/* Fragrance visual */}
          <div className={styles.heroVisual}>
            <div className={styles.fragranceImageBox}>
              <ScentIcon family={primaryFamily} size={140} />
              <div className={styles.imageGlow} />
            </div>
            <div className={styles.concTag}>{fragrance.concentration} · {fragrance.volume}</div>
          </div>

          {/* Info */}
          <div className={styles.heroInfo}>
            <div className="section-label">
              <span className="label-eyebrow">{fragrance.brand}</span>
            </div>
            <h1 className={styles.fragName}>{fragrance.name}</h1>

            {/* Match score */}
            <div className={styles.matchRow}>
              <MatchBadge score={matchScore} />
              <span className={styles.matchSub}>
                {matchScore >= 70 ? "Great fit for your Scent DNA" : "Outside your usual preferences"}
              </span>
            </div>

            <div className={styles.riskRow}>
              <span className={styles.riskLabel}>Blind Buy Risk</span>
              <span
                className={`${styles.riskPill} ${
                  blindBuyRisk.label === "Low"
                    ? styles.riskLow
                    : blindBuyRisk.label === "Medium"
                    ? styles.riskMedium
                    : styles.riskHigh
                }`}
              >
                {blindBuyRisk.label} ({blindBuyRisk.score}%)
              </span>
              <span className={styles.riskHint}>{blindBuyRisk.hint}</span>
            </div>

            <p className={styles.description}>{fragrance.description}</p>

            {/* Families */}
            <div className={styles.families}>
              {fragrance.scentFamily.map((f) => (
                <span key={f} className="badge-family">{capitalize(f)}</span>
              ))}
            </div>

            {/* Your rating */}
            <div className={styles.yourRating}>
              <span className={styles.ratingLabel}>Your Rating</span>
              <StarRating value={userRating} onChange={(r) => rateFragrance(fragrance.id, r)} size="lg" />
              {userRating > 0 && (
                <span className={styles.ratedNote}>Saved to your Scent DNA</span>
              )}
            </div>

            {/* Price + CTA */}
            <div className={styles.priceRow}>
              <span className={styles.price}>{formatPhp(fragrance.price)}</span>
              <span className={styles.volume}>{fragrance.volume}</span>
              <a
                href={fragrance.onlineRetailers[0]?.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Shop Now
              </a>
              <a
                href={`https://www.tiktok.com/search?q=${encodeURIComponent(fragrance.tiktokSearchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                TikTok Reviews
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.bodyLayout}>
          {/* Main content */}
          <div className={styles.mainCol}>
            {/* Match reasons */}
            {matchReasons.length > 0 && (
              <div className={`glass-card ${styles.section}`}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>◈</span> Why This Match?
                </h2>
                <ul className={styles.reasons}>
                  {matchReasons.map((r) => (
                    <li key={r} className={styles.reason}>
                      <span className={styles.reasonDot}>✦</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(fragrance.researchInsights?.length || fragrance.majorCompounds?.length) && (
              <div className={`glass-card ${styles.section}`}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>✧</span> Real-World Applications
                </h2>
                {(fragrance.sourceRatingValue || fragrance.sourceRatingCount) && (
                  <p className={styles.description} style={{ marginBottom: "0.85rem" }}>
                    Community score: {fragrance.sourceRatingValue?.toFixed(2) ?? "N/A"}/5
                    {fragrance.sourceRatingCount
                      ? ` from ${fragrance.sourceRatingCount.toLocaleString()} ratings.`
                      : "."}
                  </p>
                )}
                {fragrance.researchInsights && fragrance.researchInsights.length > 0 && (
                  <ul className={styles.reasons}>
                    {fragrance.researchInsights.map((insight) => (
                      <li key={insight} className={styles.reason}>
                        <span className={styles.reasonDot}>✦</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                )}
                {fragrance.majorCompounds && fragrance.majorCompounds.length > 0 && (
                  <div className={styles.perfTags} style={{ marginTop: "0.85rem" }}>
                    <div>
                      <span className={styles.perfTagLabel}>Major Aroma Compounds</span>
                      <div className={styles.perfTagRow}>
                        {fragrance.majorCompounds.map((compound) => (
                          <span key={compound} className="badge badge-amber">{compound}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {fragrance.sourceUrl && (
                  <a
                    href={fragrance.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ marginTop: "1rem", display: "inline-flex" }}
                  >
                    Open Source Profile
                  </a>
                )}
              </div>
            )}

            {/* Scent notes */}
            <div className={`glass-card ${styles.section}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>◎</span> Scent Profile
              </h2>
              <div className={styles.notesLayout}>
                <NoteCategory category="Top Notes" notes={topNotes} />
                <NoteCategory category="Heart Notes" notes={midNotes} />
                <NoteCategory category="Base Notes" notes={baseNotes} />
              </div>
              {fragrance.sourceMainAccords && fragrance.sourceMainAccords.length > 0 && (
                <div className={styles.perfTags} style={{ marginTop: "1rem" }}>
                  <div>
                    <span className={styles.perfTagLabel}>Community Main Accords</span>
                    <div className={styles.perfTagRow}>
                      {fragrance.sourceMainAccords.map((accord) => (
                        <span key={accord} className="badge badge-amber">{capitalize(accord)}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Performance */}
            <div className={`glass-card ${styles.section}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>◇</span> Performance
              </h2>
              <div className={styles.perfRows}>
                <RatingBar label="Longevity" value={fragrance.longevity} />
                <RatingBar label="Sillage" value={fragrance.sillage} />
              </div>
              <div className={styles.perfTags}>
                <div>
                  <span className={styles.perfTagLabel}>Best Seasons</span>
                  <div className={styles.perfTagRow}>
                    {fragrance.seasons.map((s) => (
                      <span key={s} className="badge badge-amber">{capitalize(s)}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className={styles.perfTagLabel}>Best Occasions</span>
                  <div className={styles.perfTagRow}>
                    {fragrance.occasions.map((o) => (
                      <span key={o} className="badge badge-amber">{capitalize(o)}</span>
                    ))}
                  </div>
                </div>
                {(fragrance.marketCategory || fragrance.marketTargetAudience || fragrance.marketLongevity) && (
                  <div>
                    <span className={styles.perfTagLabel}>Market Profile</span>
                    <div className={styles.perfTagRow}>
                      {fragrance.marketCategory && (
                        <span className="badge badge-amber">{fragrance.marketCategory}</span>
                      )}
                      {fragrance.marketTargetAudience && (
                        <span className="badge badge-amber">{fragrance.marketTargetAudience}</span>
                      )}
                      {fragrance.marketLongevity && (
                        <span className="badge badge-amber">{fragrance.marketLongevity}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className={`glass-card ${styles.section}`}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>◉</span> Community Reviews
              </h2>
              <div className={styles.reviews}>
                {fragrance.reviews.map((r) => (
                  <div key={r.id} className={styles.review}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.avatar}>{r.avatar}</div>
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewAuthor}>{r.author}</span>
                        <div className={styles.reviewTags}>
                          {r.scentDNASimilarity !== undefined && (
                            <span className={styles.dnaTag}>
                              {r.scentDNASimilarity}% DNA Match
                            </span>
                          )}
                          {r.weather && <span className={styles.weatherTag}>{r.weather}</span>}
                          {r.occasion && <span className={styles.weatherTag}>{r.occasion}</span>}
                        </div>
                      </div>
                      <div className={styles.reviewRating}>
                        <StarRating value={r.rating} readonly size="sm" />
                        <span className={styles.reviewDate}>{r.date}</span>
                      </div>
                    </div>
                    <p className={styles.reviewText}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* As seen on */}
            {fragrance.asSeenOn.length > 0 && (
              <div className={`glass-card ${styles.sideCard}`}>
                <h4 className={styles.sideTitle}>◈ As Seen On</h4>
                <ul className={styles.celebList}>
                  {fragrance.asSeenOn.map((c) => (
                    <li key={c} className={styles.celebItem}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Where to buy — online */}
            {sortedRetailers.length > 0 && (
              <div className={`glass-card ${styles.sideCard}`}>
                <h4 className={styles.sideTitle}>◇ Buy Online</h4>
                <p className={styles.buyHint}>Sorted by best price in PHP. Tap to open official listing.</p>
                {buySavings && <p className={styles.buySavings}>Potential savings: {buySavings}</p>}
                <div className={styles.retailers}>
                  {sortedRetailers.map((r, index) => (
                    <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.retailer}>
                      <div className={styles.retailerLeft}>
                        <span className={styles.retailerName}>{r.name}</span>
                        {index === 0 && <span className={styles.bestDeal}>Best Deal</span>}
                      </div>
                      <div className={styles.retailerRight}>
                        <span className={styles.retailerPrice}>{formatPhp(r.price, r.currency)}</span>
                        <span className={styles.retailerCta}>Visit Shop</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Where to buy — stores */}
            {fragrance.storeLocations.length > 0 && (
              <div className={`glass-card ${styles.sideCard}`}>
                <h4 className={styles.sideTitle}>◉ Nearest Stores</h4>
                <div className={styles.stores}>
                  {fragrance.storeLocations.map((s) => (
                    <a
                      key={s.name}
                      href={s.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.store}
                    >
                      <div className={styles.storeInfo}>
                        <span className={styles.storeName}>{s.name}</span>
                        <span className={styles.storeAddress}>{s.address}</span>
                      </div>
                      <span className={styles.storeDist}>{s.distance}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Best layered with */}
            {layeredFrags.length > 0 && (
              <div className={`glass-card ${styles.sideCard}`}>
                <h4 className={styles.sideTitle}>◎ Best Layered With</h4>
                <div className={styles.layeredList}>
                  {layeredFrags.map((lf) =>
                    lf ? (
                      <Link key={lf.id} href={`/fragrance/${lf.id}`} className={styles.layeredItem}>
                        <div className={styles.layeredIcon}>
                          <ScentIconSm family={lf.scentFamily[0]} />
                        </div>
                        <div>
                          <span className={styles.layeredBrand}>{lf.brand}</span>
                          <span className={styles.layeredName}>{lf.name}</span>
                        </div>
                      </Link>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* You May Also Like */}
        <div className={styles.related}>
          <div className={styles.relatedHeader}>
            <h2>You May Also Like</h2>
          </div>
          <div className="card-grid">
            {fragrances
              .filter(
                (f) =>
                  f.id !== fragrance.id &&
                  f.scentFamily.some((sf) => fragrance.scentFamily.includes(sf))
              )
              .slice(0, 4)
              .map((f) => (
                <FragranceCard key={f.id} fragrance={f} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
