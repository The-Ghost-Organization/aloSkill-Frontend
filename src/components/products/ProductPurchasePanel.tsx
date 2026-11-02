"use client";

import { useSessionContext } from "@/app/contexts/SessionContext";
import { CheckCircle2, Loader2, Minus, Plus, ShoppingBag, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type Product, productMoney } from "./product.types";
import {
  addProductToCart,
  cartQuantityFor,
  isPurchasable,
  maxPerCart,
  stockStatus,
} from "./product.utils";

type Feedback = { type: "success" | "error"; message: string } | null;

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { setCartUpdate } = useSessionContext();
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [buying, setBuying] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const purchasable = isPurchasable(product);
  const status = stockStatus(product.stock);
  const remaining = Math.max(0, maxPerCart(product) - inCart);
  const cartFull = purchasable && remaining === 0;

  // localStorage is client-only — read after mount to avoid hydration mismatch.
  useEffect(() => {
    setInCart(cartQuantityFor(product.id));
  }, [product.id]);

  // Keep the selected quantity inside what can still be added.
  useEffect(() => {
    setQuantity(q => Math.min(Math.max(1, q), Math.max(1, remaining)));
  }, [remaining]);

  // Mobile sticky bar appears once the main buttons scroll out of view.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-dismiss success messages.
  useEffect(() => {
    if (feedback?.type !== "success") return;
    const t = window.setTimeout(() => setFeedback(null), 6000);
    return () => window.clearTimeout(t);
  }, [feedback]);

  const setClampedQuantity = (value: number) => {
    if (!Number.isFinite(value)) return;
    setQuantity(Math.min(Math.max(1, Math.trunc(value)), Math.max(1, remaining)));
  };

  const add = (): boolean => {
    const result = addProductToCart(product, quantity);
    if (!result.ok) {
      setFeedback({ type: "error", message: result.error });
      return false;
    }
    setInCart(result.inCart);
    setCartUpdate?.(v => !v);
    setFeedback({
      type: "success",
      message: `${quantity} × ${product.title} added to your cart.`,
    });
    return true;
  };

  const buyNow = () => {
    // Already at the cart limit → just go to the cart.
    if (cartFull || add()) {
      setBuying(true);
      router.push("/cart");
    }
  };

  const statusPill = {
    "in-stock": { cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", label: "In stock" },
    "low-stock": {
      cls: "bg-orange-50 text-orange-dark ring-orange/30",
      label: `Only ${product.stock} left`,
    },
    "out-of-stock": { cls: "bg-gray-100 text-gray-600 ring-gray-500/20", label: "Out of stock" },
  }[status];

  return (
    <>
      <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6'>
        {/* Price + stock */}
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <p className='text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400'>Price</p>
            <p className='mt-1 text-3xl font-black tracking-tight text-orange-dark sm:text-4xl'>
              {productMoney(product.approvedPrice)}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusPill.cls}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "in-stock"
                  ? "bg-emerald-500"
                  : status === "low-stock"
                    ? "bg-orange"
                    : "bg-gray-400"
              }`}
              aria-hidden='true'
            />
            {statusPill.label}
          </span>
        </div>
        {status === "in-stock" && (
          <p className='mt-2 text-xs text-gray-500'>
            {product.stock.toLocaleString("en-BD")} available at Aloskill
          </p>
        )}

        <div className='my-5 h-px bg-gray-100' />

        {/* Quantity */}
        {purchasable && (
          <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
            <label
              htmlFor='product-qty'
              className='text-sm font-semibold text-navy-deep'
            >
              Quantity
            </label>
            <div className='flex items-center rounded-xl border border-gray-200 bg-gray-50'>
              <button
                type='button'
                onClick={() => setClampedQuantity(quantity - 1)}
                disabled={quantity <= 1 || cartFull}
                aria-label='Decrease quantity'
                className='flex h-11 w-11 items-center justify-center rounded-l-xl text-navy transition hover:bg-white hover:text-orange-dark disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Minus className='h-4 w-4' />
              </button>
              <input
                id='product-qty'
                type='number'
                inputMode='numeric'
                min={1}
                max={Math.max(1, remaining)}
                step={1}
                value={quantity}
                disabled={cartFull}
                onChange={e => setClampedQuantity(Number(e.target.value))}
                className='h-11 w-14 border-x border-gray-200 bg-white text-center text-sm font-semibold text-navy-deep [appearance:textfield] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-light disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
              />
              <button
                type='button'
                onClick={() => setClampedQuantity(quantity + 1)}
                disabled={quantity >= remaining || cartFull}
                aria-label='Increase quantity'
                className='flex h-11 w-11 items-center justify-center rounded-r-xl text-navy transition hover:bg-white hover:text-orange-dark disabled:cursor-not-allowed disabled:opacity-40'
              >
                <Plus className='h-4 w-4' />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          ref={actionsRef}
          className='grid gap-3 sm:grid-cols-2'
        >
          <button
            type='button'
            onClick={add}
            disabled={!purchasable || cartFull}
            className='inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange px-5 text-sm font-bold text-white shadow-sm shadow-orange/30 transition hover:bg-orange-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none'
          >
            <ShoppingCart
              className='h-4 w-4'
              aria-hidden='true'
            />
            {product.stock < 1 ? "Out of stock" : "Add to cart"}
          </button>
          <button
            type='button'
            onClick={buyNow}
            disabled={!purchasable || buying}
            className='inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-navy px-5 text-sm font-bold text-white transition hover:bg-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400'
          >
            {buying ? (
              <Loader2
                className='h-4 w-4 animate-spin'
                aria-hidden='true'
              />
            ) : (
              <Zap
                className='h-4 w-4'
                aria-hidden='true'
              />
            )}
            Buy now
          </button>
        </div>

        {/* Status / feedback */}
        <div
          aria-live='polite'
          className='empty:hidden'
        >
          {feedback && (
            <div
              role={feedback.type === "error" ? "alert" : "status"}
              className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : "border border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {feedback.type === "success" && (
                <CheckCircle2
                  className='mt-0.5 h-4 w-4 shrink-0'
                  aria-hidden='true'
                />
              )}
              <span className='flex-1'>
                {feedback.message}{" "}
                {feedback.type === "success" && (
                  <Link
                    href='/cart'
                    className='font-semibold underline underline-offset-2'
                  >
                    View cart
                  </Link>
                )}
              </span>
            </div>
          )}
        </div>

        {inCart > 0 && (
          <p className='mt-4 flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-600'>
            <span className='flex items-center gap-1.5'>
              <ShoppingBag
                className='h-3.5 w-3.5 text-orange'
                aria-hidden='true'
              />
              {inCart} in your cart
              {cartFull && " · maximum reached"}
            </span>
            <Link
              href='/cart'
              className='font-semibold text-orange-dark hover:underline'
            >
              View cart →
            </Link>
          </p>
        )}
        {product.approvedPrice === null && (
          <p className='mt-4 text-xs text-gray-500'>
            This product is awaiting price approval and can&apos;t be purchased yet.
          </p>
        )}
      </div>

      {/* ── Mobile / tablet sticky buy bar ── */}
      <div
        aria-hidden={!showStickyBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(7,15,30,0.08)] backdrop-blur-md transition-[translate,visibility] duration-300 lg:hidden ${
          showStickyBar ? "visible translate-y-0" : "pointer-events-none invisible translate-y-full"
        }`}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className='mx-auto flex max-w-3xl items-center gap-3'>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-xs text-gray-500'>{product.title}</p>
            <p className='text-lg font-black text-orange-dark'>
              {productMoney(product.approvedPrice)}
            </p>
          </div>
          <button
            type='button'
            tabIndex={showStickyBar ? 0 : -1}
            onClick={add}
            disabled={!purchasable || cartFull}
            className='inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-bold text-white transition hover:bg-orange-dark disabled:bg-gray-300'
          >
            <ShoppingCart
              className='h-4 w-4'
              aria-hidden='true'
            />
            {product.stock < 1 ? "Out of stock" : cartFull ? "In cart" : "Add to cart"}
          </button>
        </div>
      </div>
    </>
  );
}
