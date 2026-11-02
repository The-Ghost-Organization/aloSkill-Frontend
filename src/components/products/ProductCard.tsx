"use client";

import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { type Product, productMoney } from "./product.types";
import { productImages, stockStatus } from "./product.utils";

/**
 * The one product card used everywhere products are listed:
 * catalog grid, "You may also like", and the homepage section.
 */
export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const status = stockStatus(product.stock);
  const inStock = status !== "out-of-stock";
  const image = productImages(product)[0];

  return (
    <Link
      href={`/products/${product.id}`}
      className='group block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange'
    >
      <article className='flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/70'>
        <div className='relative aspect-square w-full overflow-hidden bg-slate-50'>
          {image && !imageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote instructor uploads
            <img
              src={image}
              alt={product.title}
              width={320}
              height={320}
              loading={index < 4 ? "eager" : "lazy"}
              decoding='async'
              onError={() => setImageFailed(true)}
              className={`h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105 ${
                inStock ? "" : "opacity-60 grayscale"
              }`}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-slate-300'>
              <PackageOpen
                className='h-10 w-10'
                aria-hidden='true'
              />
            </div>
          )}

          <div className='pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5'>
            {status === "out-of-stock" && (
              <span className='rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold text-white shadow-sm'>
                Out of stock
              </span>
            )}
            {status === "low-stock" && (
              <span className='rounded-full bg-orange-dark px-2 py-0.5 text-[10px] font-bold text-white shadow-sm'>
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        <div className='flex flex-1 flex-col gap-1 p-3 sm:p-4'>
          <p className='truncate text-[11px] font-semibold uppercase tracking-wide text-orange'>
            {product.category}
          </p>
          <h3 className='line-clamp-2 text-sm font-semibold leading-snug text-navy-deep sm:text-[15px]'>
            {product.title}
          </h3>
          <div className='mt-auto pt-2'>
            <p className='text-base font-bold text-orange-dark'>
              {productMoney(product.approvedPrice)}
            </p>
            <p className={`mt-0.5 text-xs ${inStock ? "text-emerald-700" : "text-slate-500"}`}>
              {inStock ? "In stock · Ships from Aloskill" : "Out of stock"}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}

/** Loading placeholder matching ProductCard's shape. */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden='true'
      className='overflow-hidden rounded-lg border border-gray-100 bg-white'
    >
      <div className='aspect-square animate-pulse bg-slate-100' />
      <div className='space-y-2 p-4'>
        <div className='h-2.5 w-1/3 animate-pulse rounded bg-slate-100' />
        <div className='h-3.5 w-4/5 animate-pulse rounded bg-slate-100' />
        <div className='h-3.5 w-1/2 animate-pulse rounded bg-slate-100' />
      </div>
    </div>
  );
}
