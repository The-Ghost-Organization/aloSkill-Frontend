import { MAX_PRICE } from './Books';

export type SortOption =
  | "popular"
  | "rating"
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc";

export interface FilterState {
  search: string;
  genres: string[];
  priceRange: [number, number];
  minRating: number;
  sort: SortOption;
}

export const initialFilters: FilterState = {
  search: "",
  genres: [],
  priceRange: [0, MAX_PRICE],
  minRating: 0,
  sort: "popular",
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export const RATING_OPTIONS: { value: number; label: string }[] = [
  { value: 4.5, label: "4.5+" },
  { value: 4.0, label: "4.0+" },
  { value: 3.0, label: "3.0+" },
  { value: 0, label: "Any" },
];
