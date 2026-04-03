// ═══════════════════════════════════════════════════════════════
// SITA OS — Store Metadata Package
// ═══════════════════════════════════════════════════════════════

export interface StoreEntry {
  id: string;
  packId: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  installCount: number;
  price: number;
  featured: boolean;
  screenshots: string[];
  changelog: ChangelogEntry[];
  reviews: StoreReview[];
  publishedAt: number;
  updatedAt: number;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface StoreReview {
  userId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface StoreFilter {
  category?: string;
  search?: string;
  minRating?: number;
  priceRange?: { min: number; max: number };
  featured?: boolean;
  sortBy?: "popular" | "newest" | "rating" | "name";
}

export const filterEntries = (entries: StoreEntry[], filter: StoreFilter): StoreEntry[] => {
  let result = [...entries];
  if (filter.category) result = result.filter(e => e.category === filter.category);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(e => e.name.toLowerCase().includes(q) || e.tagline.toLowerCase().includes(q));
  }
  if (filter.minRating) result = result.filter(e => e.rating >= filter.minRating!);
  if (filter.featured !== undefined) result = result.filter(e => e.featured === filter.featured);
  if (filter.sortBy === "popular") result.sort((a, b) => b.installCount - a.installCount);
  if (filter.sortBy === "newest") result.sort((a, b) => b.publishedAt - a.publishedAt);
  if (filter.sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
  if (filter.sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
};
