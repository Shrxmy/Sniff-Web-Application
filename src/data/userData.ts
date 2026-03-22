import { UserProfile } from "@/types/fragrance";

export const defaultUserProfile: UserProfile = {
  id: "user-1",
  name: "You",
  avatar: "ME",
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
  preferredOccasions: ["romantic", "casual"],
  preferredMoods: ["confident", "romantic"],
  location: "Manila, Philippines",
  weather: "Hot and humid",
};
