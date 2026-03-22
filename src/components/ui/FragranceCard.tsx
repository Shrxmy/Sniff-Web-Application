"use client";

import Link from "next/link";
import { Fragrance } from "@/types/fragrance";
import { StarRating } from "@/components/ui/StarRating";
import { MatchBadge } from "@/components/ui/MatchBadge";
import { ScentIcon } from "@/components/ui/ScentIcon";
import { useUser } from "@/context/UserContext";
import { computeMatchScore } from "@/utils/matchEngine";
import { capitalize } from "@/utils/scentDNA";
import { formatPhp } from "@/utils/currency";
import styles from "./FragranceCard.module.css";

interface FragranceCardProps {
  fragrance: Fragrance;
  showRating?: boolean;
  variant?: "default" | "compact";
}

export function FragranceCard({ fragrance, showRating = true, variant = "default" }: FragranceCardProps) {
  const { profile, rateFragrance, getRating } = useUser();
  const matchScore = computeMatchScore(fragrance, profile.scentDNA);
  const userRating = getRating(fragrance.id);
  const primaryFamily = fragrance.scentFamily[0];

  return (
    <Link href={`/fragrance/${fragrance.id}`} className={`${styles.card} ${styles[variant]}`}>
      {/* Image area */}
      <div className={styles.imageWrap}>
        <div className={styles.imagePlaceholder}>
          <ScentIcon family={primaryFamily} size={variant === "compact" ? 64 : 88} />
          <div className={styles.imageGlow} />
        </div>
        <div className={styles.matchOverlay}>
          <MatchBadge score={matchScore} size="sm" />
        </div>
        <div className={styles.concentration}>{fragrance.concentration}</div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.brand}>{fragrance.brand}</span>
          <span className={styles.price}>{formatPhp(fragrance.price)}</span>
        </div>
        <h3 className={styles.name}>{fragrance.name}</h3>

        {/* Scent families */}
        <div className={styles.families}>
          {fragrance.scentFamily.slice(0, 3).map((fam) => (
            <span key={fam} className="badge-family">{capitalize(fam)}</span>
          ))}
        </div>

        {/* Notes preview */}
        {variant === "default" && (
          <p className={styles.notes}>
            {fragrance.notes
              .filter((n) => n.category === "top")
              .slice(0, 3)
              .map((n) => n.name)
              .join(" · ")}
          </p>
        )}

        {/* Stats row */}
        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className={styles.statLabel}>Longevity</span>
            <div className="progress-track" style={{ width: 60 }}>
              <div className="progress-fill" style={{ width: `${fragrance.longevity * 10}%` }} />
            </div>
          </span>
          <span className={styles.stat}>
            <span className={styles.statLabel}>Sillage</span>
            <div className="progress-track" style={{ width: 60 }}>
              <div className="progress-fill" style={{ width: `${fragrance.sillage * 10}%` }} />
            </div>
          </span>
        </div>

        {/* Rating */}
        {showRating && (
          <div className={styles.ratingRow} onClick={(e) => e.preventDefault()}>
            <StarRating
              value={userRating}
              onChange={(r) => rateFragrance(fragrance.id, r)}
              size="sm"
            />
            {userRating > 0 && (
              <span className={styles.ratedLabel}>Rated</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
