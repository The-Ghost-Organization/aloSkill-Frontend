import { productDraftStorage } from "@/lib/storage/courseDraftStorage";
import type { Product } from "./product.types";

/**
 * Shared product helpers — the single source for stock, price, image and
 * cart logic used by the catalog, product cards and the product details page.
 */

/** Same per-product ceiling the cart has always enforced. */
export const MAX_PER_ORDER = 100;
export const LOW_STOCK_THRESHOLD = 5;

// ─── Stock ───────────────────────────────────────────────────────────────────

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}

export const isInStock = (product: Product) => product.stock > 0;

/** Max units a shopper may hold in their cart for this product. */
export const maxPerCart = (product: Product) => Math.max(0, Math.min(product.stock, MAX_PER_ORDER));

// ─── Price ───────────────────────────────────────────────────────────────────

/** Numeric price, or null when the product has no approved price yet. */
export function productPrice(product: Product): number | null {
  if (product.approvedPrice === null || product.approvedPrice === undefined) return null;
  const value = Number(product.approvedPrice);
  return Number.isFinite(value) ? value : null;
}

export const isPurchasable = (product: Product) =>
  isInStock(product) && productPrice(product) !== null;

// ─── Display ─────────────────────────────────────────────────────────────────

/** Images with empty / duplicate URLs removed. */
export function productImages(product: Product): string[] {
  return [
    ...new Set((product.imageUrls ?? []).filter(url => typeof url === "string" && url.trim())),
  ];
}

export function formatWeight(grams: number): string {
  if (!Number.isFinite(grams) || grams <= 0) return "—";
  return grams >= 1000
    ? `${(grams / 1000).toLocaleString("en-BD", { maximumFractionDigits: 2 })} kg`
    : `${grams.toLocaleString("en-BD")} g`;
}

// ─── Cart (localStorage via productDraftStorage — storage format unchanged) ───

type CartRow = { productId: string; quantity: number };

function readCart(): CartRow[] {
  return productDraftStorage.get<CartRow[]>() || [];
}

export function cartQuantityFor(productId: string): number {
  return readCart().find(row => row.productId === productId)?.quantity ?? 0;
}

export type AddToCartResult = { ok: true; inCart: number } | { ok: false; error: string };

/**
 * Adds `quantity` units, merging with any existing cart row.
 * Rules: whole number ≥ 1 and total in cart ≤ min(stock, 100).
 */
export function addProductToCart(product: Product, quantity: number): AddToCartResult {
  if (!isPurchasable(product)) {
    return { ok: false, error: "This product is not available to buy right now." };
  }
  const rows = readCart();
  const current = rows.find(row => row.productId === product.id);
  const next = (current?.quantity || 0) + quantity;
  if (!Number.isInteger(quantity) || quantity < 1 || next > maxPerCart(product)) {
    return {
      ok: false,
      error: `Choose a quantity within available stock (maximum ${MAX_PER_ORDER}).`,
    };
  }
  productDraftStorage.save(
    current
      ? rows.map(row => (row.productId === product.id ? { ...row, quantity: next } : row))
      : [...rows, { productId: product.id, quantity }]
  );
  return { ok: true, inCart: next };
}
