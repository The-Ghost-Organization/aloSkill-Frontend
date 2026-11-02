"use client";

import { apiClient } from "@/lib/api/client";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  CreditCard,
  GraduationCap,
  PackageCheck,
  PackageX,
  RotateCw,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BOOKS_CATALOG_HREF, PRODUCTS_CATALOG_HREF } from "./catalog";
import type { Product } from "./product.types";
import { formatWeight, productImages, stockStatus } from "./product.utils";
import ProductGallery from "./ProductGallery";
import ProductPurchasePanel from "./ProductPurchasePanel";
import RelatedProducts from "./RelatedProducts";

const DESCRIPTION_CLAMP_CHARS = 600;

/**
 * 7/5 two-column layout from lg up. Defined as ONE class (no col-span-* on the
 * children) so that if it's ever missing from the CSS build, the page degrades
 * to a stacked single column rather than 12 collapsed tracks.
 */
const TWO_COLUMN = "grid gap-8 md:grid-cols-2 md:gap-12";

// ─── Small building blocks ───────────────────────────────────────────────────

function Breadcrumb({ title }: { title?: string }) {
  return (
    <div className='border-b border-gray-100 bg-white'>
      <nav
        aria-label='Breadcrumb'
        className='mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-3 text-xs text-gray-500 sm:px-6 sm:text-sm lg:px-8'
      >
        <Link
          href='/'
          className='transition-colors hover:text-orange-dark'
        >
          Home
        </Link>
        <ChevronRight
          className='h-3 w-3 text-gray-300'
          aria-hidden='true'
        />
        <Link
          href={BOOKS_CATALOG_HREF}
          className='transition-colors hover:text-orange-dark'
        >
          Books &amp; Resources
        </Link>
        <ChevronRight
          className='h-3 w-3 text-gray-300'
          aria-hidden='true'
        />
        <Link
          href={PRODUCTS_CATALOG_HREF}
          className='transition-colors hover:text-orange-dark'
        >
          Products
        </Link>
        {title && (
          <>
            <ChevronRight
              className='h-3 w-3 text-gray-300'
              aria-hidden='true'
            />
            <span
              aria-current='page'
              className='max-w-[160px] truncate text-navy-deep sm:max-w-xs'
            >
              {title}
            </span>
          </>
        )}
      </nav>
    </div>
  );
}

const TRUST_POINTS = [
  { icon: PackageCheck, title: "Packed & shipped by Aloskill", text: "Stocked in our warehouse." },
  {
    icon: Truck,
    title: "Delivery calculated at checkout",
    text: "Based on your address and order weight.",
  },
  { icon: CreditCard, title: "Secure checkout", text: "Pay with your preferred method." },
] as const;

function TrustPoints() {
  return (
    <ul className='grid gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 sm:grid-cols-3 lg:grid-cols-1'>
      {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
        <li
          key={title}
          className='flex items-center gap-3 bg-white p-3.5'
        >
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange'>
            <Icon
              className='h-4 w-4'
              aria-hidden='true'
            />
          </span>
          <span>
            <span className='block text-xs font-semibold text-navy-deep'>{title}</span>
            <span className='block text-[11px] leading-snug text-gray-500'>{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function PairsWellWith({ product }: { product: Product }) {
  if (!product.relatedCourseId && !product.relatedBookId) return null;
  const links = [
    product.relatedCourseId && {
      href: `/courses/${product.relatedCourseId}`,
      icon: GraduationCap,
      label: "Related course",
      sub: "Learn with this product",
    },
    product.relatedBookId && {
      href: `/books/${product.relatedBookId}`,
      icon: BookOpen,
      label: "Related book",
      sub: "Read alongside it",
    },
  ].filter(Boolean) as { href: string; icon: typeof BookOpen; label: string; sub: string }[];

  return (
    <div>
      <p className='mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400'>
        Pairs well with
      </p>
      <div className='grid gap-3 sm:grid-cols-2'>
        {links.map(({ href, icon: Icon, label, sub }) => (
          <Link
            key={href}
            href={href}
            className='group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition hover:border-orange-light hover:shadow-sm'
          >
            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-white transition group-hover:bg-orange'>
              <Icon
                className='h-5 w-5'
                aria-hidden='true'
              />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-sm font-semibold text-navy-deep'>{label}</span>
              <span className='block text-xs text-gray-500'>{sub}</span>
            </span>
            <ChevronRight
              className='h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-orange'
              aria-hidden='true'
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > DESCRIPTION_CLAMP_CHARS;
  if (!text.trim()) {
    return <p className='text-sm text-gray-500'>No description has been provided yet.</p>;
  }
  return (
    <div>
      <p
        id='product-description'
        className={`whitespace-pre-line text-[15px] leading-7 text-gray-600 ${
          long && !expanded ? "line-clamp-8" : ""
        }`}
      >
        {text}
      </p>
      {long && (
        <button
          type='button'
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-controls='product-description'
          className='mt-3 text-sm font-semibold text-orange-dark hover:underline'
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

function Specifications({ product }: { product: Product }) {
  const status = stockStatus(product.stock);
  const seller = product.owner?.instructorProfile?.displayName;
  const rows: [string, string][] = [
    ["Category", product.category || "—"],
    ["Weight per unit", formatWeight(product.weight)],
    [
      "Availability",
      status === "out-of-stock"
        ? "Out of stock"
        : `${status === "low-stock" ? "Low stock" : "In stock"} (${product.stock})`,
    ],
    ["Fulfilled by", "Aloskill"],
    ...(seller ? ([["Created by", seller]] as [string, string][]) : []),
  ];
  return (
    <dl className='divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white'>
      {rows.map(([term, value]) => (
        <div
          key={term}
          className='flex items-center justify-between gap-4 px-5 py-3.5'
        >
          <dt className='text-sm text-gray-500'>{term}</dt>
          <dd className='text-right text-sm font-semibold text-navy-deep'>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ─── Loading / error states ──────────────────────────────────────────────────

function DetailsSkeleton() {
  return (
    <div
      role='status'
      aria-label='Loading product'
      className={TWO_COLUMN}
    >
      <div className='aspect-square animate-pulse rounded-2xl bg-slate-100' />
      <div className='space-y-4'>
        <div className='h-4 w-24 animate-pulse rounded bg-slate-100' />
        <div className='h-9 w-4/5 animate-pulse rounded bg-slate-100' />
        <div className='h-4 w-2/3 animate-pulse rounded bg-slate-100' />
        <div className='h-56 animate-pulse rounded-2xl bg-slate-100' />
      </div>
    </div>
  );
}

function Unavailable({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className='mx-auto flex max-w-md flex-col items-center py-20 text-center'>
      <div className='mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50'>
        <PackageX
          className='h-9 w-9 text-gray-300'
          aria-hidden='true'
        />
      </div>
      <h1 className='mb-2 text-xl font-bold text-navy-deep'>Product unavailable</h1>
      <p
        role='alert'
        className='mb-6 text-sm text-gray-500'
      >
        {message}
      </p>
      <div className='flex flex-wrap justify-center gap-3'>
        {onRetry && (
          <button
            type='button'
            onClick={onRetry}
            className='inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-navy hover:border-orange-light'
          >
            <RotateCw
              className='h-4 w-4'
              aria-hidden='true'
            />{" "}
            Try again
          </button>
        )}
        <Link
          href={PRODUCTS_CATALOG_HREF}
          className='rounded-full bg-orange px-5 py-2 text-sm font-semibold text-white hover:bg-orange-dark'
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductDetails({
  id,
  initialProduct,
}: {
  id: string;
  /** Server-fetched product (SSR). When null, the client fetches it. */
  initialProduct: Product | null;
}) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");
    apiClient
      .get<Product>(`/product/public/${encodeURIComponent(id)}`)
      .then(res => {
        if (!active) return;
        if (res.success && res.data) setProduct(res.data);
        else setError(res.message || "This product could not be found or is no longer listed.");
      })
      .catch(() => active && setError("We couldn't load this product. Check your connection."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (initialProduct) return;
    return load();
  }, [initialProduct, load]);

  const images = product ? productImages(product) : [];
  const seller = product?.owner?.instructorProfile?.displayName;

  return (
    <div className='min-h-screen bg-gray-50/60 pb-24 lg:pb-0'>
      <Breadcrumb title={product?.title} />

      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12'>
        <Link
          href={PRODUCTS_CATALOG_HREF}
          className='group mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-orange-dark'
        >
          <ArrowLeft
            className='h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5'
            aria-hidden='true'
          />
          Back to products
        </Link>

        {loading ? (
          <DetailsSkeleton />
        ) : !product ? (
          <Unavailable
            message={error || "This product could not be found."}
            onRetry={load}
          />
        ) : (
          <>
            {/* ── Hero ── */}
            <article className={TWO_COLUMN}>
              <div>
                <div className='lg:sticky lg:top-36'>
                  <ProductGallery
                    images={images}
                    title={product.title}
                    dimmed={product.stock < 1}
                  />
                </div>
              </div>

              <div className='space-y-6'>
                <header className='space-y-3'>
                  {product.category && (
                    <span className='inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-dark'>
                      {product.category}
                    </span>
                  )}
                  <h1 className='text-2xl font-black leading-tight tracking-tight text-navy-deep sm:text-3xl lg:text-4xl'>
                    {product.title}
                  </h1>
                  {seller && (
                    <p className='flex items-center gap-2 text-sm text-gray-500'>
                      <UserRound
                        className='h-4 w-4 text-gray-400'
                        aria-hidden='true'
                      />
                      Created by <span className='font-semibold text-navy'>{seller}</span>
                    </p>
                  )}
                </header>

                <ProductPurchasePanel product={product} />
                <TrustPoints />
                <PairsWellWith product={product} />
              </div>
            </article>

            {/* ── Details ── */}
            <section className={`mt-14 md:mt-30 ${TWO_COLUMN}`}>
              <div>
                <h2 className='mb-4 text-xl font-black text-navy-deep sm:text-2xl'>
                  About this product
                </h2>
                <Description text={product.description ?? ""} />
              </div>
              <div>
                <h2 className='mb-4 text-xl font-black text-navy-deep sm:text-2xl'>
                  Specifications
                </h2>
                <Specifications product={product} />
              </div>
            </section>

            <RelatedProducts product={product} />
          </>
        )}
      </div>
    </div>
  );
}
