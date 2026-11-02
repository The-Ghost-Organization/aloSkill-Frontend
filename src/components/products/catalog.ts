/**
 * Single source of truth for the "Books & Resources" catalog routes.
 * Used by the catalog page tabs, the left sidebar, product detail breadcrumbs,
 * and the legacy /products redirect so every entry point stays in sync.
 */

export const CATALOG_PATH = "/books";
export const CATALOG_TAB_PARAM = "tab";

export const CATALOG_TABS = ["books", "products"] as const;
export type CatalogTab = (typeof CATALOG_TABS)[number];

export const DEFAULT_CATALOG_TAB: CatalogTab = "books";

/** Narrow any incoming query value to a valid tab (unknown values fall back to books). */
export function parseCatalogTab(value: string | string[] | null | undefined): CatalogTab {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "products" ? "products" : DEFAULT_CATALOG_TAB;
}

/** Canonical URL for a tab. The default tab has no query string (`/books`). */
export function catalogHref(tab: CatalogTab): string {
  return tab === DEFAULT_CATALOG_TAB ? CATALOG_PATH : `${CATALOG_PATH}?${CATALOG_TAB_PARAM}=${tab}`;
}

export const PRODUCTS_CATALOG_HREF = catalogHref("products");
export const BOOKS_CATALOG_HREF = catalogHref("books");
