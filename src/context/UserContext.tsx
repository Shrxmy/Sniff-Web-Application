"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { UserProfile, UserRating, ScentDNA } from "@/types/fragrance";
import { defaultUserProfile } from "@/data/userData";
import { computeScentDNA } from "@/utils/scentDNA";

interface UserContextType {
  profile: UserProfile;
  rateFragrance: (fragranceId: string, rating: number) => void;
  getRating: (fragranceId: string) => number;
  clearRatings: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);

  const rateFragrance = useCallback((fragranceId: string, rating: number) => {
    setProfile((prev) => {
      const existingIdx = prev.ratings.findIndex(
        (r) => r.fragranceId === fragranceId
      );
      let newRatings: UserRating[];
      if (existingIdx >= 0) {
        newRatings = prev.ratings.map((r, i) =>
          i === existingIdx
            ? { ...r, rating, ratedAt: new Date().toISOString() }
            : r
        );
      } else {
        newRatings = [
          ...prev.ratings,
          {
            fragranceId,
            rating,
            ratedAt: new Date().toISOString(),
          },
        ];
      }
      const newDNA: ScentDNA = computeScentDNA(newRatings);
      return { ...prev, ratings: newRatings, scentDNA: newDNA };
    });
  }, []);

  const getRating = useCallback(
    (fragranceId: string): number => {
      return (
        profile.ratings.find((r) => r.fragranceId === fragranceId)?.rating ?? 0
      );
    },
    [profile.ratings]
  );

  const clearRatings = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      ratings: [],
      scentDNA: {
        floral: 0,
        woody: 0,
        oriental: 0,
        fresh: 0,
        citrus: 0,
        gourmand: 0,
        aquatic: 0,
        chypre: 0,
        fougere: 0,
      },
    }));
  }, []);

  return (
    <UserContext.Provider
      value={{ profile, rateFragrance, getRating, clearRatings }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
