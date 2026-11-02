"use client";

import { apiClient } from "@/lib/api/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PRODUCTS_CATALOG_HREF } from "./catalog";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import type { Product, ProductPage } from "./product.types";

const LIMIT = 4;

/** Same category first, then other products to fill the row. */
function pickRelated(all: Product[], current: Product): Product[] {
  const others = all.filter(p => p.id !== current.id);
  const same = others.filter(p => p.category === current.category);
  const rest = others.filter(p => p.category !== current.category);
  return [...same, ...rest].slice(0, LIMIT);
}

export default function RelatedProducts({ product }: { product: Product }) {
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    let active = true;
    void apiClient
      .get<ProductPage>("/product/public?page=1&pageSize=20")
      .then(res => {
        if (!active) return;
        setItems(res.success && res.data ? pickRelated(res.data.items, product) : []);
      })
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [product]);

  // Non-critical section: render nothing on failure / no results.
  if (items !== null && items.length === 0) return null;

  return (
    <section
      aria-labelledby='related-heading'
      className='mt-16 sm:mt-20'
    >
      <div className='mb-6 flex items-end justify-between gap-4'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.22em] text-orange'>
            Keep exploring
          </p>
          <h2
            id='related-heading'
            className='mt-1 text-2xl font-black text-navy-deep sm:text-3xl'
          >
            You may also like
          </h2>
        </div>
        <Link
          href={PRODUCTS_CATALOG_HREF}
          className='hidden shrink-0 items-center gap-1 text-sm font-semibold text-orange-dark hover:underline sm:inline-flex'
        >
          View all{" "}
          <ArrowRight
            className='h-4 w-4'
            aria-hidden='true'
          />
        </Link>
      </div>

      <div
        className='grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4'
        aria-busy={items === null}
      >
        {items === null
          ? Array.from({ length: LIMIT }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
              />
            ))}
      </div>
    </section>
  );
}
