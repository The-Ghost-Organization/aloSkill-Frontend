"use client";

import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
  Hash,
  Heart,
  Languages,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { bookDraftStorage } from "../../../../lib/storage/courseDraftStorage";
import { useSessionContext } from "../../../contexts/SessionContext";

import type { BookDetailsResponse, BookResponse } from "../Books.type";

import BookCard from "../components/BookCard";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type CartStorageItem = {
  bookId: string;
  format: "PHYSICAL" | "EBOOK";
  quantity: number;
  isComplimentary?: boolean;
};

type TabKey = "description" | "details" | "author";

type FormatKey = "PHYSICAL" | "EBOOK";

interface BookDetailsClientProps {
  book: BookDetailsResponse;
  relatedBooks: BookResponse;
}

// ─────────────────────────────────────────────────────────────────────────────
// Animations
// ─────────────────────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes book-fade-up {
    from {
      opacity: 0;
      transform: translateY(12px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes book-fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes blob-float {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scale(1);
    }

    50% {
      transform: translate3d(0, 12px, 0) scale(1.03);
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatName(format: FormatKey) {
  return format === "PHYSICAL" ? "Hardcover" : "E-book";
}

function normalizePrice(price: number | string | null | undefined): number | null {
  if (price === null || price === undefined || price === "") {
    return null;
  }

  const numericPrice = Number(price);

  return Number.isFinite(numericPrice) ? numericPrice : null;
}

function calculateDiscount(regularPrice: number | null, salePrice: number | null) {
  if (regularPrice === null || salePrice === null || regularPrice <= salePrice) {
    return null;
  }

  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

function formatDate(date: Date | string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(price: number | null) {
  if (price === null) {
    return null;
  }

  return `৳${price.toLocaleString("en-BD")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Availability
// ─────────────────────────────────────────────────────────────────────────────

function getAvailabilityTier(stock: number): "in-stock" | "limited" | "out-of-stock" {
  if (stock <= 0) {
    return "out-of-stock";
  }

  if (stock <= 5) {
    return "limited";
  }

  return "in-stock";
}

function AvailabilityPill({ stock }: { stock: number }) {
  const tier = getAvailabilityTier(stock);

  const styles = {
    "in-stock": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    limited: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    "out-of-stock": "bg-red-50 text-red-700 ring-1 ring-red-200",
  } as const;

  const labels = {
    "in-stock": "In Stock",
    limited: "Limited Stock",
    "out-of-stock": "Out of Stock",
  } as const;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tier]}`}>
      {labels[tier]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Chip
// ─────────────────────────────────────────────────────────────────────────────

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className='flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 shadow-sm backdrop-blur-sm'>
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50'>
        <Icon className='h-3.5 w-3.5 text-orange-500' />
      </div>

      <div className='min-w-0'>
        <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>{label}</p>

        <p className='truncate text-sm font-semibold text-slate-800'>{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Format Option
//
// Radio-style card. Only one purchase option can be selected.
// ─────────────────────────────────────────────────────────────────────────────

function FormatOption({
  title,
  description,
  salePrice,
  regularPrice,
  selected,
  disabled,
  disabledMessage,
  highlight,
  onToggle,
}: {
  title: string;
  description: string;
  salePrice: number | null;
  regularPrice: number | null;
  selected: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  highlight?: string;
  onToggle: () => void;
}) {
  const normalizedSalePrice = normalizePrice(salePrice);
  const normalizedRegularPrice = normalizePrice(regularPrice);
  const discount = calculateDiscount(normalizedRegularPrice, normalizedSalePrice);
  const currentPrice = normalizedSalePrice ?? normalizedRegularPrice;

  if (currentPrice === null) {
    return null;
  }

  return (
    <button
      type='button'
      role='radio'
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onToggle}
      className={`relative w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
          : selected
            ? "border-orange-400 bg-orange-50/70 shadow-sm ring-2 ring-orange-100"
            : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/30"
      }`}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <p className={`text-sm font-bold ${selected ? "text-slate-900" : "text-slate-800"}`}>
            {title}
          </p>

          {highlight && (
            <span className='mt-1.5 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200'>
              {highlight}
            </span>
          )}

          <p className='mt-1 text-xs leading-relaxed text-slate-500'>
            {disabled && disabledMessage ? disabledMessage : description}
          </p>
        </div>

        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
            selected ? "border-orange-500 bg-orange-500" : "border-slate-300 bg-white"
          }`}
        >
          {selected && (
            <Check
              className='h-3 w-3 text-white'
              strokeWidth={3}
            />
          )}
        </span>
      </div>

      <div className='mt-4 flex flex-wrap items-baseline gap-2'>
        <span className='text-xl font-black text-slate-900'>{formatPrice(currentPrice)}</span>

        {normalizedRegularPrice !== null &&
          normalizedSalePrice !== null &&
          normalizedRegularPrice !== normalizedSalePrice && (
            <span className='text-sm text-slate-400 line-through'>
              {formatPrice(normalizedRegularPrice)}
            </span>
          )}
      </div>

      {discount !== null && (
        <p className='mt-1.5 text-xs font-bold text-red-500'>Save {discount}%</p>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BookDetailsClient({ book, relatedBooks }: BookDetailsClientProps) {
  const { setCartUpdate } = useSessionContext();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartStorageItem[]>([]);
  const [updateCart, setUpdateCart] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("description");

  const [selectedFormat, setSelectedFormat] = useState<FormatKey | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // Tab underline
  // ───────────────────────────────────────────────────────────────────────────

  const tabRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});

  const [underline, setUnderline] = useState({
    left: 0,
    width: 0,
  });

  const measureUnderline = useCallback((key: TabKey) => {
    const element = tabRefs.current[key];

    if (element) {
      setUnderline({
        left: element.offsetLeft,
        width: element.offsetWidth,
      });
    }
  }, []);

  useLayoutEffect(() => {
    measureUnderline(activeTab);
  }, [activeTab, measureUnderline]);

  // ───────────────────────────────────────────────────────────────────────────
  // Load cart
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const storedCart = bookDraftStorage.get<CartStorageItem[]>() || [];

    setCartItems(storedCart);
  }, [updateCart]);

  // ───────────────────────────────────────────────────────────────────────────
  // Cart
  //
  // IMPORTANT FIX:
  //
  // Previously the cart was keyed only by bookId.
  //
  // That meant:
  //
  // Hardcover -> add
  // E-book    -> replaces Hardcover
  //
  // Now the unique combination is:
  //
  // bookId + format
  //
  // So the same book can have:
  //
  // bookId / PHYSICAL
  // bookId / EBOOK
  //
  // simultaneously.
  // ───────────────────────────────────────────────────────────────────────────

  // const bookAddToCartHandler = useCallback((bookId: string, format: FormatKey) => {
  //   const storageData = bookDraftStorage.get<CartStorageItem[]>() || [];

  //   const existingIndex = storageData.findIndex(
  //     item => item.bookId === bookId && item.format === format
  //   );

  //   // Already exists — do not duplicate it.
  //   if (existingIndex !== -1) {
  //     return;
  //   }

  //   storageData.push({
  //     bookId,
  //     format,
  //     quantity: 1,
  //   });

  //   bookDraftStorage.save(storageData);
  // }, []);

  const bookAddToCartHandler = useCallback(
    (bookId: string, allFormats: string[], format: "PHYSICAL" | "EBOOK") => {
      let cartData =
        bookDraftStorage.get<
          { bookId: string; format: "PHYSICAL" | "EBOOK"; quantity: number }[]
        >() || [];

      const hasPhysical = allFormats.includes("HARDCOVER");
      const hasEbook = allFormats.includes("E_BOOK");
      // CASE 1: User selects PHYSICAL and book supports BOTH formats
      // -> Ensure BOTH PHYSICAL and EBOOK are in the cart
      if (format === "PHYSICAL" && hasPhysical && hasEbook) {
        const hasPhysicalInCart = cartData.some(
          item => item.bookId === bookId && item.format === "PHYSICAL"
        );
        const hasEbookInCart = cartData.some(
          item => item.bookId === bookId && item.format === "EBOOK"
        );
        // If both are already present, do nothing
        if (hasPhysicalInCart && hasEbookInCart) return;
        if (!hasPhysicalInCart) {
          cartData.push({ bookId, format: "PHYSICAL", quantity: 1 });
        }
        if (!hasEbookInCart) {
          cartData.push({ bookId, format: "EBOOK", quantity: 1 });
        }
      }
      // CASE 2: User selects EBOOK only
      else if (format === "EBOOK") {
        const hasPhysicalInCart = cartData.some(
          item => item.bookId === bookId && item.format === "PHYSICAL"
        );
        // If physical book exists from previous selection, filter it out
        if (hasPhysicalInCart) {
          cartData = cartData.filter(
            item => !(item.bookId === bookId && item.format === "PHYSICAL")
          );
        }
        // Ensure EBOOK is present
        const hasEbookInCart = cartData.some(
          item => item.bookId === bookId && item.format === "EBOOK"
        );
        if (hasEbookInCart && !hasPhysicalInCart) return;
        if (!hasEbookInCart) {
          cartData.push({ bookId, format: "EBOOK", quantity: 1 });
        }
      }
      // CASE 3: Single-format physical book
      else {
        const existsInCart = cartData.some(
          item => item.bookId === bookId && item.format === format
        );
        if (existsInCart) return;
        cartData.push({ bookId, format, quantity: 1 });
      }
      bookDraftStorage.save(cartData);
    },
    []
  );

  const replaceBookCartSelection = useCallback(
    (bookId: string, format: FormatKey, includeComplimentaryEbook: boolean) => {
      const storageData = bookDraftStorage.get<CartStorageItem[]>() || [];
      const otherBooks = storageData.filter(item => item.bookId !== bookId);

      if (format === "PHYSICAL") {
        otherBooks.push({ bookId, format: "PHYSICAL", quantity: 1 });

        if (includeComplimentaryEbook) {
          otherBooks.push({ bookId, format: "EBOOK", quantity: 1 });
        }
      } else {
        otherBooks.push({ bookId, format: "EBOOK", quantity: 1 });
      }

      bookDraftStorage.save(otherBooks);
    },
    []
  );

  const handleAddToCart = useCallback(
    (bookId: string, allFormats: string[], format?: FormatKey) => {
      if (!format) {
        return;
      }
      bookAddToCartHandler(bookId, allFormats, format);
      setUpdateCart(previous => !previous);
      setCartUpdate?.(previous => !previous);
    },
    [bookAddToCartHandler, setCartUpdate]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Cart state
  // ───────────────────────────────────────────────────────────────────────────

  const isInCart = useMemo(() => {
    return cartItems.some(item => item.bookId === book.id);
  }, [cartItems, book.id]);

  const isPhysicalInCart = useMemo(() => {
    return cartItems.some(item => item.bookId === book.id && item.format === "PHYSICAL");
  }, [cartItems, book.id]);

  const isDigitalInCart = useMemo(() => {
    return cartItems.some(item => item.bookId === book.id && item.format === "EBOOK");
  }, [cartItems, book.id]);

  // ───────────────────────────────────────────────────────────────────────────
  // Prices
  // ───────────────────────────────────────────────────────────────────────────

  const physicalRegularPrice = normalizePrice(book.physicalRegularPrice);

  const physicalSalePrice = normalizePrice(book.physicalSalePrice);

  const digitalRegularPrice = normalizePrice(book.digitalRegularPrice);

  const digitalSalePrice = normalizePrice(book.digitalSalePrice);

  const physicalDiscount = calculateDiscount(physicalRegularPrice, physicalSalePrice);

  const digitalDiscount = calculateDiscount(digitalRegularPrice, digitalSalePrice);

  const activeDiscount = Math.max(physicalDiscount ?? 0, digitalDiscount ?? 0);

  const physicalDisplayPrice = physicalSalePrice ?? physicalRegularPrice;

  const digitalDisplayPrice = digitalSalePrice ?? digitalRegularPrice;

  // ───────────────────────────────────────────────────────────────────────────
  // Available formats
  // ───────────────────────────────────────────────────────────────────────────

  const availableFormats = useMemo(
    () =>
      new Set(
        (book.formats ?? []).map(format =>
          format
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
        )
      ),
    [book.formats]
  );

  const hasPhysical = ["PHYSICAL", "HARDCOVER", "HARDCOPY", "PRINT", "PRINTED"].some(format =>
    availableFormats.has(format)
  );

  const hasDigital = ["EBOOK", "DIGITAL", "DIGITALBOOK"].some(format =>
    availableFormats.has(format)
  );

  useEffect(() => {
    setSelectedFormat(previous => {
      if (previous === "PHYSICAL" && hasPhysical) return previous;
      if (previous === "EBOOK" && hasDigital) return previous;

      return hasPhysical ? "PHYSICAL" : hasDigital ? "EBOOK" : null;
    });
  }, [hasPhysical, hasDigital]);

  // ───────────────────────────────────────────────────────────────────────────
  // Format selection
  // ───────────────────────────────────────────────────────────────────────────

  const selectFormat = useCallback((key: FormatKey) => {
    setSelectedFormat(key);
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Total
  // ───────────────────────────────────────────────────────────────────────────

  const totalPrice =
    selectedFormat === "PHYSICAL"
      ? (physicalDisplayPrice ?? 0)
      : selectedFormat === "EBOOK"
        ? (digitalDisplayPrice ?? 0)
        : 0;

  // ───────────────────────────────────────────────────────────────────────────
  // Tabs
  // ───────────────────────────────────────────────────────────────────────────

  const tabs = useMemo(() => {
    const items: {
      key: TabKey;
      label: string;
    }[] = [
      {
        key: "description",
        label: "Description",
      },
      {
        key: "details",
        label: "Details",
      },
    ];

    items.push({
      key: "author",
      label: "About the Author",
    });

    return items;
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Purchase validation
  // ───────────────────────────────────────────────────────────────────────────

  const hasSelectedPhysical = selectedFormat === "PHYSICAL";

  const physicalUnavailable = hasSelectedPhysical && book.stock <= 0;

  /*
   * E-book does NOT depend on physical stock.
   */
  const canPurchase = selectedFormat !== null && !physicalUnavailable;

  // ───────────────────────────────────────────────────────────────────────────
  // Actions
  // ───────────────────────────────────────────────────────────────────────────

  const handleAddSelectedToCart = useCallback(() => {
    if (!canPurchase) {
      return;
    }

    if (!selectedFormat) return;

    replaceBookCartSelection(book.id, selectedFormat, hasDigital);

    setUpdateCart(previous => !previous);
    setCartUpdate?.(previous => !previous);
  }, [canPurchase, selectedFormat, book.id, hasDigital, replaceBookCartSelection, setCartUpdate]);

  const handleBuyNow = useCallback(() => {
    if (!canPurchase) {
      return;
    }

    handleAddSelectedToCart();

    router.push("/cart");
  }, [canPurchase, handleAddSelectedToCart, router]);

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <main className='relative min-h-screen overflow-hidden bg-white pb-24 text-slate-900 lg:pb-0'>
      <style>{KEYFRAMES}</style>

      {/* ═══════════════════════════════════════════════════════════════════════
          Background Gradient Blobs
      ═══════════════════════════════════════════════════════════════════════ */}

      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 overflow-hidden'
      >
        <div className='absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-orange-200/30 blur-3xl [animation:blob-float_12s_ease-in-out_infinite]' />

        <div className='absolute right-[-180px] top-20 h-[520px] w-[520px] rounded-full bg-sky-200/30 blur-3xl [animation:blob-float_15s_ease-in-out_infinite]' />

        <div className='absolute bottom-[20%] left-[35%] h-[400px] w-[400px] rounded-full bg-violet-100/30 blur-3xl' />
      </div>

      {/* Keep content above background blobs */}
      <div className='relative z-10'>
        {/* ═════════════════════════════════════════════════════════════════════
            Breadcrumb
        ═════════════════════════════════════════════════════════════════════ */}

        <div className='border-b border-slate-200/80 bg-white/70 backdrop-blur-md'>
          <div className='mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8'>
            <nav
              className='flex items-center gap-1.5 text-xs text-slate-500'
              aria-label='Breadcrumb'
            >
              <Link
                href='/'
                className='transition-colors hover:text-orange-500'
              >
                Home
              </Link>

              <ChevronRight className='h-3 w-3 text-slate-300' />

              <Link
                href='/books'
                className='transition-colors hover:text-orange-500'
              >
                Books
              </Link>

              {book.category && (
                <>
                  <ChevronRight className='h-3 w-3 text-slate-300' />

                  <Link
                    href={`/books?genre=${encodeURIComponent(book.category.name)}`}
                    className='transition-colors hover:text-orange-500'
                  >
                    {book.category.name}
                  </Link>
                </>
              )}

              <ChevronRight className='h-3 w-3 text-slate-300' />

              <span className='max-w-[180px] truncate text-slate-800 sm:max-w-xs'>
                {book.title}
              </span>
            </nav>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            Main Hero
        ═════════════════════════════════════════════════════════════════════ */}

        <section className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
          <Link
            href='/books'
            className='group mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-orange-500'
          >
            <ArrowLeft className='h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5' />
            Back to all books
          </Link>

          <div className='grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] lg:gap-10 xl:grid-cols-[300px_1fr_340px] xl:gap-8'>
            {/* ═══════════════════════════════════════════════════════════════
                COLUMN 1 — COVER
            ═══════════════════════════════════════════════════════════════ */}

            <div className='flex flex-col items-center gap-4 [animation:book-fade-up_0.4s_ease-out_both] lg:sticky lg:top-8 lg:h-fit lg:items-stretch'>
              <div className='relative mx-auto aspect-[3/4] object-contain overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:w-64 lg:w-full'>
                <Image
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  fill
                  priority
                  className='object-cover'
                  sizes='(max-width: 1024px) 256px, 300px'
                />

                {activeDiscount > 0 && (
                  <div className='absolute left-3 top-3'>
                    <span className='rounded-full bg-red-500 px-2.5 py-1 text-xs font-black text-white shadow-sm'>
                      -{activeDiscount}% Off
                    </span>
                  </div>
                )}
              </div>

              <div className='flex items-center justify-center gap-3 lg:justify-between'>
                <AvailabilityPill stock={book.stock} />

                {book.stock > 0 && <p className='text-sm text-slate-500'>{book.stock} available</p>}
              </div>

              <div className='hidden flex-col gap-2 rounded-xl border border-slate-200 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm sm:flex'>
                <div className='flex items-center gap-2.5 text-sm text-slate-500'>
                  <ShieldCheck className='h-3.5 w-3.5 shrink-0 text-orange-500' />
                  Secure checkout, every order
                </div>

                <div className='flex items-center gap-2.5 text-sm text-slate-500'>
                  <Truck className='h-3.5 w-3.5 shrink-0 text-orange-500' />
                  Fast dispatch on in-stock titles
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                COLUMN 2 — INFORMATION
            ═══════════════════════════════════════════════════════════════ */}

            <div
              className='flex flex-col [animation:book-fade-up_0.4s_ease-out_both]'
              style={{ animationDelay: "60ms" }}
            >
              {/* Category + Formats */}

              <div className='mb-4 flex flex-wrap items-center gap-2'>
                {book.category && (
                  <>
                    <span className='text-sm font-bold uppercase tracking-[0.2em] text-orange-500'>
                      {book.category.name}
                    </span>

                    <span className='h-1 w-1 rounded-full bg-slate-300' />
                  </>
                )}

                {book.formats.map((format, index) => (
                  <span
                    key={`${format}-${index}`}
                    className='rounded-lg border border-slate-200 bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-slate-500'
                  >
                    {format}
                  </span>
                ))}
              </div>

              {/* Title */}

              <h1 className='mb-3 text-3xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl'>
                {book.title}
              </h1>

              {/* Author */}

              <p className='mb-6 text-base leading-relaxed text-slate-500'>
                by <span className='font-semibold text-slate-800'>{book.author}</span>
                {book.translator && (
                  <>
                    {" "}
                    · Translated by{" "}
                    <span className='font-medium text-slate-800'>{book.translator}</span>
                  </>
                )}
                {book.editor && (
                  <>
                    {" "}
                    · Edited by <span className='font-medium text-slate-800'>{book.editor}</span>
                  </>
                )}
                {book.publisher && (
                  <>
                    {" "}
                    · Published by{" "}
                    <span className='font-medium text-slate-800'>{book.publisher}</span>
                  </>
                )}
              </p>

              {/* Quick stats */}

              <div className='mb-7 grid gap-2.5 sm:grid-cols-2'>
                <StatChip
                  icon={BookOpen}
                  label='Pages'
                  value={book.pages !== null ? book.pages.toLocaleString() : "N/A"}
                />

                <StatChip
                  icon={Calendar}
                  label='Added'
                  value={formatDate(book.createdAt)}
                />

                <StatChip
                  icon={Languages}
                  label='Language'
                  value={book.language || "N/A"}
                />

                <StatChip
                  icon={BookMarked}
                  label='Edition'
                  value={book.edition || "N/A"}
                />
              </div>

              {/* Mobile / Tablet Buy Box */}

              <div className='mb-8 xl:hidden'>
                <BuyBox
                  book={book}
                  hasPhysical={hasPhysical}
                  hasDigital={hasDigital}
                  selectedFormat={selectedFormat}
                  onSelectFormat={selectFormat}
                  totalPrice={totalPrice}
                  canPurchase={canPurchase}
                  physicalUnavailable={physicalUnavailable}
                  onAddToCart={handleAddSelectedToCart}
                  onBuyNow={handleBuyNow}
                />
              </div>

              {/* Tabs */}

              <div className='relative mb-2 flex items-center gap-1 border-b border-slate-200'>
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    ref={element => {
                      tabRefs.current[tab.key] = element;
                    }}
                    type='button'
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative px-3 py-3 text-sm font-semibold transition-colors ${
                      activeTab === tab.key
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

                <span
                  aria-hidden
                  className='absolute -bottom-px h-[2px] rounded-full bg-orange-500 transition-all duration-300 ease-out'
                  style={{
                    left: underline.left,
                    width: underline.width,
                  }}
                />
              </div>

              <div
                key={activeTab}
                className='py-6 [animation:book-fade-in_0.2s_ease-out_both]'
              >
                {/* Description */}

                {activeTab === "description" && (
                  <div className='flex items-start gap-2'>
                    <BookOpen className='mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500' />

                    <p className='whitespace-pre-line text-sm leading-relaxed text-slate-500'>
                      {book.description || "No description is available for this book."}
                    </p>
                  </div>
                )}

                {/* Details */}

                {activeTab === "details" && (
                  <div className='rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm'>
                    <div className='mb-4 flex items-center gap-2'>
                      <FileText className='h-3.5 w-3.5 text-orange-500' />

                      <h2 className='text-xs font-bold uppercase tracking-wider text-slate-500'>
                        Book Information
                      </h2>
                    </div>

                    <div className='grid gap-x-8 gap-y-3 sm:grid-cols-2'>
                      <InfoRow
                        label='Author'
                        value={book.author}
                      />

                      <InfoRow
                        label='Publisher'
                        value={book.publisher}
                      />

                      {book.translator && (
                        <InfoRow
                          label='Translator'
                          value={book.translator}
                        />
                      )}

                      {book.editor && (
                        <InfoRow
                          label='Editor'
                          value={book.editor}
                        />
                      )}

                      {book.edition && (
                        <InfoRow
                          label='Edition'
                          value={book.edition}
                        />
                      )}

                      {book.pages !== null && (
                        <InfoRow
                          label='Pages'
                          value={book.pages.toLocaleString()}
                        />
                      )}

                      {book.language && (
                        <InfoRow
                          label='Language'
                          value={book.language}
                        />
                      )}

                      {book.isbn && (
                        <InfoRow
                          label='ISBN'
                          value={book.isbn}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Author */}

                {activeTab === "author" && (
                  <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm'>
                    <div className='border-b border-slate-100 bg-linear-to-r from-orange-50/80 via-white to-sky-50/70 px-5 py-4'>
                      <div className='flex items-center gap-2'>
                        <User className='h-3.5 w-3.5 text-orange-500' />
                        <h2 className='text-xs font-bold uppercase tracking-wider text-slate-500'>
                          Author Profile
                        </h2>
                      </div>
                    </div>

                    <div className='p-5 sm:p-6'>
                      <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
                        <div className='flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-orange-50 shadow-md ring-1 ring-orange-100'>
                          {book.owner?.avatarUrl ? (
                            <Image
                              src={book.owner.avatarUrl}
                              alt={book.owner.instructorProfile?.displayName || book.author}
                              width={80}
                              height={80}
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <User
                              className='h-8 w-8 text-orange-500'
                              aria-hidden='true'
                            />
                          )}
                        </div>

                        <div className='min-w-0 flex-1'>
                          <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500'>
                            Written by
                          </p>

                          <h3 className='mt-1 text-xl font-black text-slate-900'>
                            {book.owner?.instructorProfile?.displayName || book.author}
                          </h3>

                          {book.owner?.instructorProfile?.qualifications && (
                            <p className='mt-1 text-sm font-medium text-slate-500'>
                              {book.owner.instructorProfile.qualifications}
                            </p>
                          )}

                          <div className='mt-4 border-t border-slate-100 pt-4'>
                            {book.owner?.instructorProfile?.expertise ? (
                              <>
                                <p className='mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                                  Expertise
                                </p>
                                <p className='whitespace-pre-line text-sm leading-relaxed text-slate-600'>
                                  {book.owner.instructorProfile.expertise}
                                </p>
                              </>
                            ) : (
                              <p className='text-sm leading-relaxed text-slate-500'>
                                Author of{" "}
                                <span className='font-semibold text-slate-700'>{book.title}</span>.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ISBN / Book ID */}

              <div className='mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400'>
                {book.isbn && (
                  <div className='flex items-center gap-1.5'>
                    <Hash className='h-3 w-3' />
                    <span>ISBN: {book.isbn}</span>
                  </div>
                )}

                <div className='flex items-center gap-1.5'>
                  <Hash className='h-3 w-3' />
                  <span>Book ID: {book.id}</span>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                COLUMN 3 — BUY BOX
            ═══════════════════════════════════════════════════════════════ */}

            <div
              className='hidden [animation:book-fade-up_0.4s_ease-out_both] xl:sticky xl:top-8 xl:block xl:h-fit'
              style={{ animationDelay: "100ms" }}
            >
              <BuyBox
                book={book}
                hasPhysical={hasPhysical}
                hasDigital={hasDigital}
                selectedFormat={selectedFormat}
                onSelectFormat={selectFormat}
                totalPrice={totalPrice}
                canPurchase={canPurchase}
                physicalUnavailable={physicalUnavailable}
                onAddToCart={handleAddSelectedToCart}
                onBuyNow={handleBuyNow}
              />
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════
            Related Books
        ═════════════════════════════════════════════════════════════════════ */}

        {relatedBooks.length > 0 && (
          <section className='border-t border-slate-200/80 bg-white/60'>
            <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
              <div className='mb-8 flex items-end justify-between'>
                <div>
                  <p className='mb-1.5 text-sm font-bold uppercase tracking-[0.2em] text-orange-500'>
                    More Like This
                  </p>

                  <h2 className='text-2xl font-black tracking-tight text-slate-900'>
                    Related Books
                  </h2>
                </div>

                {book.category && (
                  <Link
                    href={`/books?genre=${encodeURIComponent(book.category.name)}`}
                    className='flex items-center gap-1 text-sm font-semibold text-orange-500 transition-colors hover:underline hover:underline-offset-2'
                  >
                    All {book.category.name}
                    <ChevronRight className='h-3 w-3' />
                  </Link>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5'>
                {relatedBooks.map((related, index) => (
                  <BookCard
                    key={related.id}
                    book={related}
                    index={index}
                    cartItems={cartItems}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            Mobile Sticky Purchase Bar
        ═════════════════════════════════════════════════════════════════════ */}

        <div className='fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden'>
          <div className='flex items-center justify-between gap-4'>
            <div className='min-w-0'>
              <p className='truncate text-xs text-slate-500'>
                {selectedFormat
                  ? selectedFormat === "PHYSICAL"
                    ? hasDigital
                      ? "Hardcover + free E-book"
                      : "Hardcover"
                    : formatName(selectedFormat)
                  : "No format selected"}
              </p>

              <p className='text-lg font-black text-slate-900'>
                {selectedFormat ? formatPrice(totalPrice) : "—"}
              </p>
            </div>

            <a
              href='#buy-box'
              className='shrink-0 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-95'
            >
              View Options
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Buy Box
// ─────────────────────────────────────────────────────────────────────────────

function BuyBox({
  book,
  hasPhysical,
  hasDigital,
  selectedFormat,
  onSelectFormat,
  totalPrice,
  canPurchase,
  physicalUnavailable,
  onAddToCart,
  onBuyNow,
}: {
  book: BookDetailsResponse;
  hasPhysical: boolean;
  hasDigital: boolean;
  selectedFormat: FormatKey | null;
  onSelectFormat: (key: FormatKey) => void;
  totalPrice: number;
  canPurchase: boolean;
  physicalUnavailable: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}) {
  return (
    <div
      id='buy-box'
      className='scroll-mt-24 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-md'
    >
      {/* Header */}

      {/* ═══════════════════════════════════════════════════════════════════════
    Format Selection
═══════════════════════════════════════════════════════════════════════ */}

      <div className='mb-5'>
        <div className='mb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Tag className='h-3.5 w-3.5 text-orange-500' />

              <h2 className='text-xs font-bold uppercase tracking-wider text-slate-600'>
                Choose Your Format
              </h2>
            </div>

            <AvailabilityPill stock={book.stock} />
          </div>

          <p className='mt-1.5 text-xs text-slate-400'>Choose one purchase option</p>
        </div>

        <div
          className='flex flex-col gap-3'
          role='radiogroup'
          aria-label='Book format'
        >
          {/* Hardcover */}

          {hasPhysical && (
            <FormatOption
              title='Hardcover'
              description={
                hasDigital
                  ? "Get the hardcover delivered and receive the E-book at no extra cost."
                  : "Physical book delivered to your address."
              }
              highlight={hasDigital ? "E-book included free" : undefined}
              salePrice={book.physicalSalePrice}
              regularPrice={book.physicalRegularPrice}
              selected={selectedFormat === "PHYSICAL"}
              disabled={book.stock <= 0}
              disabledMessage='Currently out of stock.'
              onToggle={() => onSelectFormat("PHYSICAL")}
            />
          )}

          {/* E-book */}

          {hasDigital && (
            <FormatOption
              title='E-book'
              description='Digital edition available after purchase.'
              salePrice={book.digitalSalePrice}
              regularPrice={book.digitalRegularPrice}
              selected={selectedFormat === "EBOOK"}
              onToggle={() => onSelectFormat("EBOOK")}
            />
          )}
        </div>
      </div>

      {/* Selection summary */}

      <div className='mb-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>
            Selected
          </span>

          <span className='text-xs font-semibold text-slate-700'>
            {selectedFormat ? "1 option" : "None"}
          </span>
        </div>

        {selectedFormat && (
          <div className='mt-2 flex flex-wrap gap-1.5'>
            {selectedFormat === "PHYSICAL" && (
              <>
                <span className='rounded-full bg-orange-100 px-2 py-1 text-[10px] font-semibold text-orange-700'>
                  Hardcover
                </span>
                {hasDigital && (
                  <span className='rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700'>
                    + Free E-book
                  </span>
                )}
              </>
            )}

            {selectedFormat === "EBOOK" && (
              <span className='rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700'>
                E-book
              </span>
            )}
          </div>
        )}
      </div>

      {/* Total */}

      <div className='mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-3'>
        <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>Total</span>

        <span className='text-xl font-black text-slate-950'>
          {selectedFormat ? formatPrice(totalPrice) : "—"}
        </span>
      </div>

      {/* Validation messages */}

      {!selectedFormat && (
        <p className='mb-3 text-xs text-slate-400'>Select a format to continue.</p>
      )}

      {physicalUnavailable && selectedFormat === "PHYSICAL" && (
        <p className='mb-3 text-xs font-medium text-red-500'>
          Hardcover is currently out of stock. Choose the E-book to continue.
        </p>
      )}

      {/* Actions */}

      <div className='flex flex-col gap-2.5'>
        <button
          type='button'
          disabled={!canPurchase}
          onClick={onAddToCart}
          className='flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-orange-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400'
        >
          <ShoppingCart className='h-4 w-4' />
          Add to Cart
        </button>

        <button
          type='button'
          disabled={!canPurchase}
          onClick={onBuyNow}
          className='flex w-full items-center justify-center gap-2 rounded-xl border-2 border-orange-500 py-3 text-sm font-bold text-orange-600 transition-all duration-200 hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400'
        >
          <CreditCard className='h-4 w-4' />
          Buy Now
        </button>

        <button
          type='button'
          className='flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50/50'
        >
          <Heart className='h-4 w-4 text-slate-400' />
          Add to Wishlist
        </button>
      </div>

      {/* Trust message */}

      <div className='mt-5 flex items-center justify-center gap-2 border-t border-slate-100 pt-4'>
        <ShieldCheck className='h-3.5 w-3.5 text-emerald-500' />

        <span className='text-[11px] text-slate-400'>Secure checkout</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Information Row
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-4 border-b border-slate-100 pb-2.5 last:border-0'>
      <span className='text-xs text-slate-400'>{label}</span>

      <span className='text-right text-xs font-medium text-slate-600'>{value}</span>
    </div>
  );
}
