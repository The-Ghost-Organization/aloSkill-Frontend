"use client";

import {
  CATALOG_TAB_PARAM,
  CATALOG_TABS,
  type CatalogTab,
  DEFAULT_CATALOG_TAB,
  parseCatalogTab,
} from "@/components/products/catalog";
import ProductsCatalog from "@/components/products/ProductsCatalog";
import { BookOpen, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";

const TAB_META: Record<CatalogTab, { label: string; icon: typeof BookOpen }> = {
  books: { label: "All Books", icon: BookOpen },
  products: { label: "Products", icon: ShoppingBag },
};

/**
 * Tab shell for the Books & Resources catalog.
 *
 * - The URL (`?tab=products`) is the source of truth, so sidebar links, the legacy
 *   /products redirect, back/forward and shared links all open the right tab.
 * - Tab clicks use `history.pushState`, which Next.js syncs with `useSearchParams`
 *   — switching is instant and does not refetch the server-rendered books.
 * - The Products panel mounts lazily on first visit and stays mounted afterwards
 *   so its filters/page survive tab switches.
 */
export default function CatalogTabs({
  booksPanel,
  bookCount,
}: {
  booksPanel: ReactNode;
  bookCount: number;
}) {
  const searchParams = useSearchParams();
  const activeTab = parseCatalogTab(searchParams.get(CATALOG_TAB_PARAM));
  const [productsMounted, setProductsMounted] = useState(activeTab === "products");
  const [productCount, setProductCount] = useState<number | null>(null);
  const tabRefs = useRef<Record<CatalogTab, HTMLButtonElement | null>>({ books: null, products: null });

  useEffect(() => {
    if (activeTab === "products") setProductsMounted(true);
  }, [activeTab]);

  const selectTab = useCallback(
    (tab: CatalogTab) => {
      if (tab === activeTab) return;
      const params = new URLSearchParams(searchParams.toString());
      if (tab === DEFAULT_CATALOG_TAB) params.delete(CATALOG_TAB_PARAM);
      else params.set(CATALOG_TAB_PARAM, tab);
      const query = params.toString();
      window.history.pushState(null, "", query ? `?${query}` : window.location.pathname);
    },
    [activeTab, searchParams],
  );

  // WAI-ARIA tabs keyboard pattern: ←/→ cycle, Home/End jump.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = CATALOG_TABS.indexOf(activeTab);
    let next: CatalogTab | undefined;
    if (event.key === "ArrowRight") next = CATALOG_TABS[(index + 1) % CATALOG_TABS.length];
    else if (event.key === "ArrowLeft")
      next = CATALOG_TABS[(index - 1 + CATALOG_TABS.length) % CATALOG_TABS.length];
    else if (event.key === "Home") next = CATALOG_TABS[0];
    else if (event.key === "End") next = CATALOG_TABS[CATALOG_TABS.length - 1];
    if (!next) return;
    event.preventDefault();
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  const counts: Record<CatalogTab, number | null> = { books: bookCount, products: productCount };

  return (
    <>
      {/* ── Tab bar ── */}
      <div className='border-b border-gray-100 bg-white'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div
            role='tablist'
            aria-label='Books and resources catalog'
            onKeyDown={onKeyDown}
            className='-mb-px flex gap-1 overflow-x-auto sm:gap-2'
          >
            {CATALOG_TABS.map((tab) => {
              const { label, icon: Icon } = TAB_META[tab];
              const selected = tab === activeTab;
              const count = counts[tab];
              return (
                <button
                  key={tab}
                  ref={(el) => {
                    tabRefs.current[tab] = el;
                  }}
                  type='button'
                  role='tab'
                  id={`catalog-tab-${tab}`}
                  aria-selected={selected}
                  aria-controls={`catalog-panel-${tab}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectTab(tab)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orange sm:px-4 ${
                    selected
                      ? "border-orange text-orange-dark"
                      : "border-transparent text-gray-500 hover:border-gray-200 hover:text-navy"
                  }`}
                >
                  <Icon className='h-4 w-4' aria-hidden='true' />
                  {label}
                  {count !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        selected ? "bg-orange-50 text-orange-dark" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Panels ── */}
      <div
        role='tabpanel'
        id='catalog-panel-books'
        aria-labelledby='catalog-tab-books'
        hidden={activeTab !== "books"}
      >
        {booksPanel}
      </div>
      <div
        role='tabpanel'
        id='catalog-panel-products'
        aria-labelledby='catalog-tab-products'
        hidden={activeTab !== "products"}
      >
        {productsMounted && <ProductsCatalog onTotalChange={setProductCount} />}
      </div>
    </>
  );
}
