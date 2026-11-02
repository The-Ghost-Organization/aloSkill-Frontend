import type { Product } from "./product.types";
import { isInStock, productPrice } from "./product.utils";

export type ProductAvailability = "all" | "in-stock" | "out-of-stock";
export type ProductSort = "featured" | "price-asc" | "price-desc" | "title-asc";

export interface ProductFilterState {
  search: string;
  categories: string[];
  /** `null` bound = unbounded on that side. */
  minPrice: number | null;
  maxPrice: number | null;
  availability: ProductAvailability;
  sort: ProductSort;
}

export const initialProductFilters: ProductFilterState = {
  search: "",
  categories: [],
  minPrice: null,
  maxPrice: null,
  availability: "all",
  sort: "featured",
};

export const PRODUCT_SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "title-asc", label: "Name: A to Z" },
];

export const AVAILABILITY_OPTIONS: { value: ProductAvailability; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in-stock", label: "In stock" },
  { value: "out-of-stock", label: "Out of stock" },
];

export function hasActiveProductFilters(filters: ProductFilterState): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.categories.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.availability !== "all"
  );
}

export function countActiveProductFilters(filters: ProductFilterState): number {
  return (
    (filters.search.trim() ? 1 : 0) +
    filters.categories.length +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.availability !== "all" ? 1 : 0)
  );
}

/**
 * Pure filter + sort over the FULL catalog. Pagination is applied afterwards by
 * the caller, so filters always cover every product — not just the current page.
 */
export function applyProductFilters(products: Product[], filters: ProductFilterState): Product[] {
  const query = filters.search.trim().toLowerCase();
  const categorySet = new Set(filters.categories);
  const priceFilterActive = filters.minPrice !== null || filters.maxPrice !== null;

  const result = products.filter(product => {
    if (query) {
      const haystack = `${product.title} ${product.category}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (categorySet.size > 0 && !categorySet.has(product.category)) return false;

    if (priceFilterActive) {
      const price = productPrice(product);
      // Unpriced products can't satisfy a price constraint.
      if (price === null) return false;
      if (filters.minPrice !== null && price < filters.minPrice) return false;
      if (filters.maxPrice !== null && price > filters.maxPrice) return false;
    }

    if (filters.availability === "in-stock" && !isInStock(product)) return false;
    if (filters.availability === "out-of-stock" && isInStock(product)) return false;
    return true;
  });

  if (filters.sort === "featured") return result; // keep API order

  const priceOr = (p: Product, fallback: number) => productPrice(p) ?? fallback;
  return [...result].sort((a, b) => {
    switch (filters.sort) {
      case "price-asc":
        return priceOr(a, Number.POSITIVE_INFINITY) - priceOr(b, Number.POSITIVE_INFINITY);
      case "price-desc":
        return priceOr(b, Number.NEGATIVE_INFINITY) - priceOr(a, Number.NEGATIVE_INFINITY);
      case "title-asc":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}

/** Sorted, de-duplicated category names with counts, derived from the full catalog. */
export function productCategories(products: Product[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const name = product.category?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Highest approved price in the catalog, rounded up — used as the range slider ceiling. */
export function productPriceCeiling(products: Product[]): number {
  let max = 0;
  for (const product of products) {
    const price = productPrice(product);
    if (price !== null && price > max) max = price;
  }
  return Math.max(1, Math.ceil(max));
}
