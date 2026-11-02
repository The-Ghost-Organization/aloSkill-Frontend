"use client";

import { apiClient } from "@/lib/api/client";
import { useCallback, useEffect, useState } from "react";
import type { Product, ProductPage } from "./product.types";

/** Page size already used by the public product endpoint elsewhere in the app. */
const FETCH_PAGE_SIZE = 20;
/** Safety cap: 50 × 20 = 1,000 products. Beyond this, move filtering to the API. */
const MAX_PAGES = 50;
/** Parallel requests per batch — keeps the API from being burst-flooded. */
const CONCURRENCY = 4;

type CatalogState = {
  products: Product[];
  loading: boolean;
  error: string;
  /** True when the catalog exceeded MAX_PAGES and was truncated. */
  truncated: boolean;
};

async function fetchPage(page: number) {
  return apiClient.get<ProductPage>(`/product/public?page=${page}&pageSize=${FETCH_PAGE_SIZE}`);
}

/**
 * Loads the ENTIRE public product catalog (all API pages) so client-side filters
 * and sorting operate on every product, not only the first page.
 */
export function useProductCatalog() {
  const [state, setState] = useState<CatalogState>({
    products: [],
    loading: true,
    error: "",
    truncated: false,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey(key => key + 1), []);

  useEffect(() => {
    let active = true;
    setState(prev => ({ ...prev, loading: true, error: "" }));

    (async () => {
      const first = await fetchPage(1);
      if (!active) return;
      if (!first.success || !first.data) {
        setState({
          products: [],
          loading: false,
          error: first.message || "Products could not be loaded.",
          truncated: false,
        });
        return;
      }

      const { items, total } = first.data;
      const pageSize = first.data.pageSize || FETCH_PAGE_SIZE;
      const totalPages = Math.max(1, Math.ceil((total || items.length) / pageSize));
      const lastPage = Math.min(totalPages, MAX_PAGES);

      const collected: Product[] = [...items];
      const remaining = Array.from({ length: Math.max(0, lastPage - 1) }, (_, i) => i + 2);

      for (let i = 0; i < remaining.length; i += CONCURRENCY) {
        const batch = remaining.slice(i, i + CONCURRENCY);
        const responses = await Promise.all(batch.map(fetchPage));
        if (!active) return;
        const failed = responses.find(r => !r.success || !r.data);
        if (failed) {
          setState({
            products: dedupe(collected),
            loading: false,
            error: failed.message || "Some products could not be loaded. Please retry.",
            truncated: false,
          });
          return;
        }
        for (const r of responses) collected.push(...(r.data as ProductPage).items);
      }

      setState({
        products: dedupe(collected),
        loading: false,
        error: "",
        truncated: totalPages > MAX_PAGES,
      });
    })().catch(() => {
      if (active) {
        setState({
          products: [],
          loading: false,
          error: "Products could not be loaded. Check your connection and retry.",
          truncated: false,
        });
      }
    });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return { ...state, reload };
}

/** Offset pagination can shift if products change between requests — drop duplicates. */
function dedupe(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter(p => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}
