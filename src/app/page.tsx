import Link from "next/link";
import { fragrances } from "@/data/fragrances";
import { FragranceCard } from "@/components/ui/FragranceCard";
import styles from "./page.module.css";

const features = [
  {
    icon: "◈",
    title: "Scent DNA",
    description:
      "Rate fragrances from your shelf to calibrate your unique Scent DNA profile. Our AI learns exactly what makes you love a scent.",
  },
  {
    icon: "◉",
    title: "AI Matching",
    description:
      "Get personalized match scores for every fragrance. See at a glance whether a scent is a great fit — or a miss — before you buy.",
  },
  {
    icon: "◎",
    title: "Scent Simulation",
    description:
      "Understand how a fragrance performs for people just like you — same climate, same DNA, same lifestyle.",
  },
  {
    icon: "◇",
    title: "Smart Discovery",
    description:
      "Filter by mood, occasion, season, and notes. Never blind-buy again — every recommendation is data-driven and personal.",
  },
];

const steps = [
  { num: "01", title: "Rate Your Shelf", desc: "Add fragrances you've tried and rate them 1–5 stars." },
  { num: "02", title: "Build Your DNA", desc: "Our AI analyzes your ratings to map your Scent DNA." },
  { num: "03", title: "Discover Matches", desc: "Receive personalized recommendations ranked by compatibility." },
  { num: "04", title: "Buy with Confidence", desc: "Find where to shop, compare prices, and explore similar scents." },
];

export default function HomePage() {
  const featured = fragrances.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBlobs}>
          <div className={`glow-blob glow-amber ${styles.blob1}`} />
          <div className={`glow-blob glow-wood ${styles.blob2}`} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={`${styles.eyebrow} animate-fade-in-up`}>
            <span className="label-eyebrow">Powered by AI Scent Intelligence</span>
          </div>
          <h1 className={`${styles.heroTitle} animate-fade-in-up delay-100`}>
            Discover Your<br />
            <span className="text-gradient">Perfect Scent</span>
          </h1>
          <p className={`${styles.heroSubtitle} animate-fade-in-up delay-200`}>
            SNIFF eliminates the guesswork of buying fragrance online. Build your Scent DNA,
            get AI-powered match scores, and discover fragrances tailored to your unique profile.
          </p>
          <div className={`${styles.heroActions} animate-fade-in-up delay-300`}>
            <Link href="/my-dna" className="btn btn-primary btn-lg">
              Build My Scent DNA
            </Link>
            <Link href="/explore" className="btn btn-secondary btn-lg">
              Explore Fragrances
            </Link>
          </div>

          {/* Stats */}
          <div className={`${styles.heroStats} animate-fade-in-up delay-400`}>
            {[
              { value: "500+", label: "Fragrances" },
              { value: "AI", label: "Powered Matching" },
              { value: "Zero", label: "Blind Buys" },
            ].map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollCue}>
          <span />
        </div>
      </section>

      {/* FEATURES */}
      <section className={`${styles.featuresSection} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className="section-label">
              <span className="label-eyebrow">Why SNIFF</span>
            </div>
            <h2>Fragrance Discovery,<br /><em>Reimagined</em></h2>
            <p className={styles.sectionSubtitle}>
              We bridge the gap between digital influence and real-life scent experience.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`${styles.featureCard} glass-card animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED FRAGRANCES */}
      <section className={`${styles.fragrancesSection} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className="section-label">
              <span className="label-eyebrow">Rate & Discover</span>
            </div>
            <h2>Featured Fragrances</h2>
            <p className={styles.sectionSubtitle}>
              Rate these to start calibrating your Scent DNA.
            </p>
          </div>
          <div className="card-grid">
            {featured.map((frag) => (
              <FragranceCard key={frag.id} fragrance={frag} />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link href="/explore" className="btn btn-secondary btn-lg">
              View All Fragrances →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`${styles.howSection} section`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className="section-label">
              <span className="label-eyebrow">The Process</span>
            </div>
            <h2>How It Works</h2>
          </div>
          <div className={styles.steps}>
            {steps.map((step) => (
              <div key={step.num} className={styles.step}>
                <span className={styles.stepNum}>{step.num}</span>
                <div className={styles.stepLine} />
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className={styles.howCta}>
            <Link href="/my-dna" className="btn btn-primary btn-lg">
              Start Now — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* MARKET GAP */}
      <section className={`${styles.gapSection} section`}>
        <div className="container">
          <div className={styles.gapInner}>
            <div className={styles.gapText}>
              <div className="section-label">
                <span className="label-eyebrow">The Problem We Solve</span>
              </div>
              <h2>Stop Blind Buying.<br /><span className="text-gradient">Start Sniffing Smart.</span></h2>
              <p>
                Social media drives billions in fragrance purchases — yet most buyers never smell
                the scent before they buy. Viral trends create expectations that real-life scents
                can&apos;t always meet. SNIFF closes that gap with science, AI, and community insights.
              </p>
              <ul className={styles.gapList}>
                <li>✦ Scent DNA compatibility scoring</li>
                <li>✦ Reviews from people with your exact profile</li>
                <li>✦ Environmental simulation (weather, occasion, time)</li>
                <li>✦ Price comparison across all retailers</li>
              </ul>
              <Link href="/discover" className="btn btn-primary">
                Discover My Matches
              </Link>
            </div>
            <div className={styles.gapVisual}>
              <div className={styles.gapCard}>
                <span className={styles.gapCardIcon}>◈</span>
                <span className={styles.gapCardLabel}>Scent DNA Match</span>
                <span className={styles.gapCardValue}>94%</span>
                <span className={styles.gapCardSub}>Perfect for your profile</span>
              </div>
              <div className={`${styles.gapCard} ${styles.gapCardAlt}`}>
                <span className={styles.gapCardIcon}>◎</span>
                <span className={styles.gapCardLabel}>Community Insight</span>
                <span className={styles.gapCardValue}>127</span>
                <span className={styles.gapCardSub}>Similar DNA profiles love this</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
