"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { LogoMark } from "@/components/ui/LogoMark";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "/",        label: "Home" },
  { href: "/my-dna",  label: "My DNA" },
  { href: "/discover",label: "Discover" },
  { href: "/explore", label: "Explore" },
];

export function Navbar() {
  const pathname = usePathname();
  const { profile } = useUser();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const ratedCount = profile.ratings.length;

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <LogoMark size={22} />
          <span className={styles.logoText}>SNIFF</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
            >
              {link.label}
              {link.href === "/my-dna" && ratedCount > 0 && (
                <span className={styles.ratingBadge}>{ratedCount}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className={styles.navActions}>
          <Link href="/my-dna" className="btn btn-primary btn-sm hide-mobile">
            Build My DNA
          </Link>
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`${styles.hLine} ${mobileOpen ? styles.hOpen : ""}`} />
            <span className={`${styles.hLine} ${mobileOpen ? styles.hOpen : ""}`} />
            <span className={`${styles.hLine} ${mobileOpen ? styles.hOpen : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${pathname === link.href ? styles.mobileActive : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/my-dna" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
            Build My DNA
          </Link>
        </div>
      )}
    </header>
  );
}
