import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logoRow}>
            <LogoMark size={20} />
            <span className={styles.logoText}>SNIFF</span>
          </div>
          <p className={styles.tagline}>
            Redefining fragrance discovery through AI-driven scent intelligence.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.column}>
            <h5 className={styles.colTitle}>Discover</h5>
            <Link href="/my-dna">My Scent DNA</Link>
            <Link href="/discover">Match &amp; Discover</Link>
            <Link href="/explore">Explore Fragrances</Link>
          </div>
          <div className={styles.column}>
            <h5 className={styles.colTitle}>About</h5>
            <Link href="/">Our Vision</Link>
            <Link href="/">How It Works</Link>
            <Link href="/">L&apos;Oréal Luxe</Link>
          </div>
          <div className={styles.column}>
            <h5 className={styles.colTitle}>Follow</h5>
            <a href="#" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Pinterest</a>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span className={styles.copy}>
          © {new Date().getFullYear()} SNIFF by L&apos;Oréal Luxe. All rights reserved.
        </span>
        <span className={styles.copy}>Powered by AI Scent Intelligence</span>
      </div>
    </footer>
  );
}
