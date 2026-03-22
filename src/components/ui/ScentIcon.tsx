/**
 * ScentIcon — Elegant SVG-based fragrance bottle icon.
 * Replaces emoji placeholders throughout the app.
 */

import styles from "./ScentIcon.module.css";

/** Map scent families to a subtle accent hue */
const familyToHue: Record<string, [string, string]> = {
  floral:   ["#c9879a", "#8a4561"],
  woody:    ["#D39858", "#85431E"],
  oriental: ["#c4a05a", "#7a5c20"],
  fresh:    ["#7fbfa8", "#3d7a63"],
  citrus:   ["#d4a84b", "#8c6615"],
  gourmand: ["#b5804a", "#6b401a"],
  aquatic:  ["#6ba0c4", "#2a5c7a"],
  chypre:   ["#9a78c4", "#5a3880"],
  fougere:  ["#7ab58a", "#3a6b48"],
};

interface ScentIconProps {
  family?: string;
  size?: number;
  className?: string;
}

export function ScentIcon({ family = "woody", size = 96, className }: ScentIconProps) {
  const [light, dark] = familyToHue[family] ?? familyToHue.woody;
  const id = `sg-${family}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${styles.icon} ${className ?? ""}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="30" y1="10" x2="70" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={light} stopOpacity="0.9" />
          <stop offset="100%" stopColor={dark} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Bottle body */}
      <rect x="29" y="40" width="38" height="46"
        rx="5" fill={`url(#${id}-grad)`} />

      {/* Shoulder curve */}
      <path d="M29 44 C29 40 35 34 42 32 L54 32 C61 34 67 40 67 44"
        fill={`url(#${id}-grad)`} />

      {/* Neck */}
      <rect x="40" y="22" width="16" height="12" rx="3"
        fill={`url(#${id}-grad)`} />

      {/* Cap */}
      <rect x="37" y="14" width="22" height="11" rx="3"
        fill={dark} />
      <rect x="40" y="14" width="16" height="4" rx="2"
        fill={light} fillOpacity="0.45" />

      {/* Shine overlay on body */}
      <rect x="29" y="40" width="38" height="46" rx="5"
        fill={`url(#${id}-shine)`} />

      {/* Subtle horizontal line detail */}
      <line x1="29" y1="62" x2="67" y2="62"
        stroke="#fff" strokeWidth="0.6" strokeOpacity="0.10" />
    </svg>
  );
}

/** Compact badge-sized bottle — used in list views */
export function ScentIconSm({ family = "woody" }: { family?: string }) {
  return <ScentIcon family={family} size={40} />;
}
