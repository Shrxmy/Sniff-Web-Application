import { isGoodMatch } from "@/utils/matchEngine";
import styles from "./MatchBadge.module.css";

interface MatchBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function MatchBadge({ score, showLabel = true, size = "md" }: MatchBadgeProps) {
  const good = isGoodMatch(score);

  return (
    <div className={`${styles.badge} ${good ? styles.good : styles.poor} ${styles[size]}`}>
      <span className={styles.icon}>{good ? "✦" : "◇"}</span>
      <span className={styles.score}>{score}%</span>
      {showLabel && (
        <span className={styles.label}>{good ? "Match" : "Miss"}</span>
      )}
    </div>
  );
}
