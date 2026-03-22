"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fragrances } from "@/data/fragrances";
import { useUser } from "@/context/UserContext";
import { FragranceCard } from "@/components/ui/FragranceCard";
import { StarRating } from "@/components/ui/StarRating";
import { getDNALabel, getDNAColor, capitalize } from "@/utils/scentDNA";
import { ScentDNA } from "@/types/fragrance";
import { computeMatchScore } from "@/utils/matchEngine";
import { formatPhp, toPhpAmount } from "@/utils/currency";
import styles from "./page.module.css";

type QuizOption = {
  label: string;
  weights: Partial<ScentDNA>;
  desiredLongevity?: number;
  desiredSillage?: number;
  budgetTier?: BudgetTier;
};

type WearMood = "balanced" | "focus" | "romantic" | "party";
type WearTime = "any" | "day" | "night";
type WearWeather = "all" | "warm" | "cool";
type BudgetTier = "value" | "mid" | "lux";

type QuizProfile = {
  dna: ScentDNA;
  desiredLongevity: number;
  desiredSillage: number;
  budgetTier: BudgetTier;
};

const QUIZ = [
  {
    question: "Pick your ideal night-out vibe",
    options: [
      { label: "Smoky and mysterious", weights: { woody: 24, oriental: 22 } },
      { label: "Sweet and sensual", weights: { gourmand: 26, floral: 16 } },
      { label: "Crisp and clean", weights: { fresh: 24, citrus: 22 } },
    ] as QuizOption[],
  },
  {
    question: "What note family attracts you most?",
    options: [
      { label: "Rose, jasmine, white flowers", weights: { floral: 26 } },
      { label: "Spice, amber, resins", weights: { oriental: 24, woody: 14 } },
      { label: "Bergamot, citrus peel, herbs", weights: { citrus: 22, fresh: 18 } },
    ] as QuizOption[],
  },
  {
    question: "Your ideal daily signature",
    options: [
      { label: "Polished and professional", weights: { fougere: 22, chypre: 16, woody: 14 } },
      { label: "Effortless and light", weights: { fresh: 22, aquatic: 20 } },
      { label: "Warm and addictive", weights: { gourmand: 20, oriental: 20 } },
    ] as QuizOption[],
  },
  {
    question: "What weather do you dress your scent for?",
    options: [
      { label: "Cool nights", weights: { woody: 18, gourmand: 18, oriental: 18 } },
      { label: "Warm tropical days", weights: { citrus: 20, aquatic: 20, fresh: 16 } },
      { label: "Any season all-rounder", weights: { floral: 14, fresh: 14, woody: 14, citrus: 14 } },
    ] as QuizOption[],
  },
  {
    question: "How long should your scent last on skin?",
    options: [
      { label: "4 to 6 hours", weights: { fresh: 8, citrus: 8 }, desiredLongevity: 5 },
      { label: "6 to 8 hours", weights: { floral: 8, woody: 8 }, desiredLongevity: 7 },
      { label: "8+ hours", weights: { oriental: 10, gourmand: 10 }, desiredLongevity: 9 },
    ] as QuizOption[],
  },
  {
    question: "How noticeable should your scent trail be?",
    options: [
      { label: "Soft and close-to-skin", weights: { fresh: 8, aquatic: 6 }, desiredSillage: 4 },
      { label: "Balanced and noticeable", weights: { floral: 8, woody: 8 }, desiredSillage: 6 },
      { label: "Statement and room-filling", weights: { oriental: 8, gourmand: 8 }, desiredSillage: 8 },
    ] as QuizOption[],
  },
  {
    question: "Your comfort budget for a full bottle?",
    options: [
      { label: "Below ₱7,000", weights: { fresh: 6 }, budgetTier: "value" },
      { label: "₱7,000 to ₱12,000", weights: { floral: 6, woody: 6 }, budgetTier: "mid" },
      { label: "₱12,000 and above", weights: { oriental: 8, gourmand: 8 }, budgetTier: "lux" },
    ] as QuizOption[],
  },
];

const DNA_KEYS: (keyof ScentDNA)[] = [
  "floral",
  "woody",
  "oriental",
  "fresh",
  "citrus",
  "gourmand",
  "aquatic",
  "chypre",
  "fougere",
];

function normalizeDNA(raw: ScentDNA): ScentDNA {
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
  if (total === 0) return raw;

  const normalized = { ...raw };
  for (const key of DNA_KEYS) {
    normalized[key] = Math.round((raw[key] / total) * 100);
  }
  return normalized;
}

function pickBudgetTier(votes: Record<BudgetTier, number>): BudgetTier {
  const entries = Object.entries(votes) as [BudgetTier, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][1] > 0 ? entries[0][0] : "mid";
}

function buildQuizProfile(answers: number[]): QuizProfile {
  const base: ScentDNA = {
    floral: 0,
    woody: 0,
    oriental: 0,
    fresh: 0,
    citrus: 0,
    gourmand: 0,
    aquatic: 0,
    chypre: 0,
    fougere: 0,
  };

  const longevityVotes: number[] = [];
  const sillageVotes: number[] = [];
  const budgetVotes: Record<BudgetTier, number> = { value: 0, mid: 0, lux: 0 };

  answers.forEach((answerIndex, questionIndex) => {
    const option = QUIZ[questionIndex]?.options[answerIndex];
    if (!option) return;
    for (const key of DNA_KEYS) {
      base[key] += option.weights[key] || 0;
    }

    if (option.desiredLongevity) longevityVotes.push(option.desiredLongevity);
    if (option.desiredSillage) sillageVotes.push(option.desiredSillage);
    if (option.budgetTier) budgetVotes[option.budgetTier] += 1;
  });

  const averageLongevity =
    longevityVotes.length > 0
      ? Math.round(longevityVotes.reduce((sum, value) => sum + value, 0) / longevityVotes.length)
      : 7;

  const averageSillage =
    sillageVotes.length > 0
      ? Math.round(sillageVotes.reduce((sum, value) => sum + value, 0) / sillageVotes.length)
      : 6;

  return {
    dna: normalizeDNA(base),
    desiredLongevity: averageLongevity,
    desiredSillage: averageSillage,
    budgetTier: pickBudgetTier(budgetVotes),
  };
}

function getBudgetBoost(price: number | null, tier: BudgetTier): number {
  if (!price) return 0;

  if (tier === "value") {
    if (price <= 7000) return 8;
    if (price <= 10000) return 3;
    return -6;
  }

  if (tier === "mid") {
    if (price >= 7000 && price <= 15000) return 6;
    if (price < 7000) return 2;
    return 1;
  }

  if (price >= 12000) return 6;
  return 2;
}

function buildPsychologyForecast(insights: string[]): { label: string; confidence: number; summary: string }[] {
  const lower = insights.join(" ").toLowerCase();

  const themes = [
    {
      label: "Relaxation Support",
      summary: "Likely to help create a calmer and less stressful scent experience.",
      keywords: ["relax", "calm", "anxiety", "sleep", "reduce stress", "reduced mental stress"],
    },
    {
      label: "Focus and Clarity",
      summary: "May support attention, memory, and productive daytime wear.",
      keywords: ["attention", "concentration", "memory", "productivity", "alertness", "working memory"],
    },
    {
      label: "Mood Lift",
      summary: "Shows signals linked with positive mood and emotional uplift.",
      keywords: ["positive mood", "well-being", "romantic", "refreshment", "pleasant", "favorable"],
    },
    {
      label: "Energy Boost",
      summary: "Can feel more stimulating and active, especially for evening/social contexts.",
      keywords: ["arousal", "stimulating", "active", "excitatory", "energ"],
    },
  ];

  const scored = themes
    .map((theme) => {
      const matches = theme.keywords.filter((keyword) => lower.includes(keyword)).length;
      return {
        label: theme.label,
        summary: theme.summary,
        confidence: Math.min(95, 35 + matches * 18),
        matches,
      };
    })
    .filter((theme) => theme.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 3)
    .map(({ label, summary, confidence }) => ({ label, summary, confidence }));

  return scored;
}

export default function MyDNAPage() {
  const { profile, getRating, clearRatings } = useUser();
  const ratedCount = profile.ratings.length;
  const [quizAnswers, setQuizAnswers] = useState<number[]>(Array(QUIZ.length).fill(-1));
  const [wearMood, setWearMood] = useState<WearMood>("balanced");
  const [wearTime, setWearTime] = useState<WearTime>("any");
  const [wearWeather, setWearWeather] = useState<WearWeather>("all");

  const dnaEntries = (Object.entries(profile.scentDNA) as [keyof ScentDNA, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const quizDone = quizAnswers.every((answer) => answer >= 0);

  const quizProfile = useMemo(() => {
    if (!quizDone) return null;
    return buildQuizProfile(quizAnswers);
  }, [quizAnswers, quizDone]);

  const quizRecommendations = useMemo(() => {
    if (!quizProfile) return [];

    const contextBoost = (fragrance: (typeof fragrances)[number]): number => {
      let boost = 0;

      if (wearMood === "focus" && (fragrance.occasions.includes("professional") || fragrance.moods.includes("confident"))) {
        boost += 6;
      }
      if (wearMood === "romantic" && (fragrance.occasions.includes("romantic") || fragrance.moods.includes("romantic"))) {
        boost += 6;
      }
      if (wearMood === "party" && (fragrance.occasions.includes("evening") || fragrance.moods.includes("playful"))) {
        boost += 6;
      }

      if (wearTime === "day" && fragrance.occasions.includes("daytime")) {
        boost += 4;
      }
      if (wearTime === "night" && fragrance.occasions.includes("evening")) {
        boost += 4;
      }

      if (wearWeather === "warm" && (fragrance.seasons.includes("summer") || fragrance.seasons.includes("spring"))) {
        boost += 4;
      }
      if (wearWeather === "cool" && (fragrance.seasons.includes("autumn") || fragrance.seasons.includes("winter"))) {
        boost += 4;
      }

      return boost;
    };

    const topFamilies = Object.entries(quizProfile.dna)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);

    const performanceBoost = (fragrance: (typeof fragrances)[number]) => {
      const longevityFit = Math.max(0, 10 - Math.abs(fragrance.longevity - quizProfile.desiredLongevity) * 2);
      const sillageFit = Math.max(0, 10 - Math.abs(fragrance.sillage - quizProfile.desiredSillage) * 2);
      return Math.round((longevityFit + sillageFit) / 2);
    };

    const explain = (fragrance: (typeof fragrances)[number], score: number): string => {
      const shared = fragrance.scentFamily.filter((family) => topFamilies.includes(family));
      const byFamily =
        shared.length > 0
          ? `Matches your ${shared.slice(0, 2).map((family) => capitalize(family)).join(" + ")} preference`
          : "Complements your profile with balanced contrast";

      const hasResearch = (fragrance.researchInsights || []).length > 0;
      const withResearch = hasResearch ? `${byFamily} and has psychology-backed insights` : byFamily;

      const longevityHint = Math.abs(fragrance.longevity - quizProfile.desiredLongevity) <= 1 ? "Matches your longevity target" : "Close to your longevity preference";

      return score >= 80 ? `${withResearch}. ${longevityHint}.` : `${withResearch}. ${longevityHint}.`;
    };

    const unrated = fragrances.filter((fragrance) => getRating(fragrance.id) === 0);
    const pool = unrated.length >= 3 ? unrated : fragrances;

    return pool
      .map((fragrance) => ({
        fragrance,
        score: Math.min(
          100,
          computeMatchScore(fragrance, quizProfile.dna) +
            contextBoost(fragrance) +
            performanceBoost(fragrance) +
            getBudgetBoost(toPhpAmount(fragrance.price).amount, quizProfile.budgetTier)
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => ({
        ...item,
        reason: explain(item.fragrance, item.score),
      }));
  }, [quizProfile, getRating, wearMood, wearTime, wearWeather]);

  const quizConfidence = useMemo(() => {
    if (!quizDone) return 0;
    const questionConfidence = Math.min(QUIZ.length * 5, 30);
    const ratingConfidence = Math.min(ratedCount * 2, 20);
    return Math.min(95, 50 + questionConfidence + ratingConfidence);
  }, [quizDone, ratedCount]);

  const quizPsychology = useMemo(() => {
    const insights = quizRecommendations.flatMap((item) => item.fragrance.researchInsights || []);
    return buildPsychologyForecast(insights);
  }, [quizRecommendations]);

  const quizAveragePrice = useMemo(() => {
    if (quizRecommendations.length === 0) return null;
    const values = quizRecommendations
      .map((item) => toPhpAmount(item.fragrance.price).amount)
      .filter((value): value is number => value !== null && Number.isFinite(value) && value > 0);
    if (values.length === 0) return null;
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return formatPhp(String(Math.round(average)));
  }, [quizRecommendations]);

  const updateQuizAnswer = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers((prev) => prev.map((value, idx) => (idx === questionIndex ? optionIndex : value)));
  };

  const resetQuiz = () => {
    setQuizAnswers(Array(QUIZ.length).fill(-1));
  };

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

            <div className={`glass-card ${styles.quizCard}`}>
              <div className={styles.quizHeader}>
                <h3>Mini Scent Quiz</h3>
                <span className={styles.quizTag}>ML Match</span>
              </div>
              <p className={styles.quizLead}>
                Answer 4 quick questions. We transform your choices into a Scent DNA vector and rank perfumes with the same model used in recommendations.
              </p>

              <div className={styles.contextPanel}>
                <div>
                  <span className={styles.contextLabel}>Mood</span>
                  <div className={styles.contextOptions}>
                    <button type="button" className={wearMood === "balanced" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearMood("balanced")}>Balanced</button>
                    <button type="button" className={wearMood === "focus" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearMood("focus")}>Focus</button>
                    <button type="button" className={wearMood === "romantic" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearMood("romantic")}>Romantic</button>
                    <button type="button" className={wearMood === "party" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearMood("party")}>Party</button>
                  </div>
                </div>
                <div>
                  <span className={styles.contextLabel}>Time</span>
                  <div className={styles.contextOptions}>
                    <button type="button" className={wearTime === "any" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearTime("any")}>Any</button>
                    <button type="button" className={wearTime === "day" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearTime("day")}>Day</button>
                    <button type="button" className={wearTime === "night" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearTime("night")}>Night</button>
                  </div>
                </div>
                <div>
                  <span className={styles.contextLabel}>Weather</span>
                  <div className={styles.contextOptions}>
                    <button type="button" className={wearWeather === "all" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearWeather("all")}>All</button>
                    <button type="button" className={wearWeather === "warm" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearWeather("warm")}>Warm</button>
                    <button type="button" className={wearWeather === "cool" ? styles.contextOptionActive : styles.contextOption} onClick={() => setWearWeather("cool")}>Cool</button>
                  </div>
                </div>
              </div>

              <div className={styles.quizQuestions}>
                {QUIZ.map((item, qIdx) => (
                  <div key={item.question} className={styles.quizQuestion}>
                    <p>{item.question}</p>
                    <div className={styles.quizOptions}>
                      {item.options.map((option, oIdx) => (
                        <button
                          key={option.label}
                          type="button"
                          className={quizAnswers[qIdx] === oIdx ? styles.quizOptionActive : styles.quizOption}
                          onClick={() => updateQuizAnswer(qIdx, oIdx)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.quizActions}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={resetQuiz}>Reset Quiz</button>
                {!quizDone && <span className={styles.quizProgress}>Complete all questions to unlock results</span>}
              </div>

              {quizDone && quizProfile && (
                <div className={styles.quizResults}>
                  <div className={styles.quizDnaRow}>
                    <span>Profile: {getDNALabel(quizProfile.dna)}</span>
                    <Link href="/explore" className={styles.quizExploreLink}>Explore All</Link>
                  </div>
                  <p className={styles.quizConfidence}>Match confidence: {quizConfidence}%</p>
                  <div className={styles.quizPicks}>
                    {quizRecommendations.map((item) => (
                      <div key={item.fragrance.id} className={styles.quizPickCard}>
                        <FragranceCard fragrance={item.fragrance} showRating={false} variant="compact" />
                        <div className={styles.quizScore}>Quiz Match: {item.score}%</div>
                        <p className={styles.quizReason}>{item.reason}</p>
                      </div>
                    ))}
                  </div>
                  {quizAveragePrice && (
                    <p className={styles.quizBudget}>Average of your top picks: {quizAveragePrice}</p>
                  )}
                  {quizPsychology.length > 0 && (
                    <div className={styles.quizPsychology}>
                      <h4>Psychology Forecast (Dataset-Backed)</h4>
                      <div className={styles.quizPsychologyList}>
                        {quizPsychology.map((theme) => (
                          <div key={theme.label} className={styles.quizPsychologyItem}>
                            <div className={styles.quizPsychologyTop}>
                              <span>{theme.label}</span>
                              <span>{theme.confidence}% confidence</span>
                            </div>
                            <p>{theme.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
