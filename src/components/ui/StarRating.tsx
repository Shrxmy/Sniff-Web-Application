"use client";

import { useState } from "react";
import styles from "./StarRating.module.css";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div
      className={`${styles.wrapper} ${styles[size]} ${readonly ? styles.readonly : ""}`}
      role={readonly ? "img" : "radiogroup"}
      aria-label={`Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${active ? styles.active : ""}`}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            disabled={readonly}
            aria-label={`${star} star`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
