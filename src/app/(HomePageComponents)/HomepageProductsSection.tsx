"use client";

import SectionHeader from "@/components/sections/SectionHeader";
import { PRODUCTS_CATALOG_HREF } from "@/components/products/catalog";
import ProductCard, { ProductCardSkeleton } from "@/components/products/ProductCard";
import type { Product, ProductPage } from "@/components/products/product.types";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomepageProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void apiClient.get<ProductPage>("/product/public?page=1&pageSize=8").then(response => {
      if (!active) return;
      if (response.success && response.data) setProducts(response.data.items.slice(0, 8));
      else
        setError(response.message || "Products are unavailable right now. Please try again later.");
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!loading && !error && !products.length) return null;

  return (
    <section
      className='bg-white py-14 sm:py-20'
      aria-label='Learning products'
    >
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
          <div className='min-w-0 flex-1'>
            <SectionHeader
              title='Tools for your'
              color_title='next lesson'
              subtitle='Discover instructor-created stationery, course kits and learning tools. Sold and shipped by Aloskill.'
            />
          </div>
          <Link
            href={PRODUCTS_CATALOG_HREF}
            className='mb-6 shrink-0 self-start rounded-lg border border-orange-500 px-4 py-2.5 text-sm font-semibold text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500'
          >
            View all products →
          </Link>
        </div>
        {error ? (
          <p
            role='alert'
            className='rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'
          >
            {error}
          </p>
        ) : (
          <div
            className='grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4'
            aria-busy={loading}
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                  />
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
