"use client";

import SectionHeader from "@/components/sections/SectionHeader";
import { apiClient } from "@/lib/api/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { bookDraftStorage } from "@/lib/storage/courseDraftStorage.ts";
import type { BookResponse } from "../(withoutSidebarLayout)/books/Books.type";
import BookCard from "../(withoutSidebarLayout)/books/components/BookCard";
import { useSessionContext } from "../contexts/SessionContext.tsx";

const AUTO_PLAY_DELAY = 4500;
const INTERACTION_PAUSE_DELAY = 5000;
const CARD_GAP = 24;
type CartStorageItem = {
  bookId: string;
  format: "PHYSICAL" | "EBOOK";
  quantity: number;
};
type FormatKey = "PHYSICAL" | "EBOOK";
export function DiscoverBooksSectionCarousel() {
  const { setCartUpdate } = useSessionContext();
  const [books, setBooks] = useState<BookResponse>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [cartItems, setCartItems] = useState<CartStorageItem[]>([]);
  const [updateCart, setUpdateCart] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const storedCart = bookDraftStorage.get<CartStorageItem[]>() || [];

    setCartItems(storedCart);
  }, [updateCart]);
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

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const setPausedState = useCallback((paused: boolean) => {
    isPausedRef.current = paused;
    setIsPaused(paused);
  }, []);

  const pauseCarousel = useCallback(() => {
    clearResumeTimeout();
    setPausedState(true);
  }, [clearResumeTimeout, setPausedState]);

  const resumeCarousel = useCallback(
    (delay = 0) => {
      clearResumeTimeout();

      if (delay === 0) {
        setPausedState(false);
        return;
      }

      resumeTimeoutRef.current = setTimeout(() => {
        setPausedState(false);
      }, delay);
    },
    [clearResumeTimeout, setPausedState]
  );

  const updateScrollControls = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const threshold = 4;

    setCanScrollLeft(container.scrollLeft > threshold);
    setCanScrollRight(
      maxScrollLeft > threshold && container.scrollLeft < maxScrollLeft - threshold
    );
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) return;

    scrollFrameRef.current = requestAnimationFrame(() => {
      updateScrollControls();
      scrollFrameRef.current = null;
    });
  }, [updateScrollControls]);

  const getCardScrollDistance = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return 0;

    const firstCard = container.querySelector<HTMLElement>("[data-book-card]");

    return firstCard
      ? firstCard.getBoundingClientRect().width + CARD_GAP
      : container.clientWidth * 0.8;
  }, []);

  const scrollToDirection = useCallback(
    (direction: "left" | "right", triggeredByUser = true) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      if (triggeredByUser) {
        pauseCarousel();
      }

      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const distance = getCardScrollDistance();

      let nextPosition = container.scrollLeft + (direction === "right" ? distance : -distance);

      if (direction === "right" && nextPosition >= maxScrollLeft - 4) {
        nextPosition = maxScrollLeft;
      }

      if (direction === "left" && nextPosition <= 4) {
        nextPosition = 0;
      }

      container.scrollTo({
        left: nextPosition,
        behavior: "smooth",
      });

      if (triggeredByUser) {
        resumeCarousel(INTERACTION_PAUSE_DELAY);
      }
    },
    [getCardScrollDistance, pauseCarousel, resumeCarousel]
  );

  useEffect(() => {
    let mounted = true;

    async function fetchBooks() {
      try {
        const session = await getSession();
        const headers: Record<string, string> = {};

        if (session?.accessToken) {
          headers["Authorization"] = `Bearer ${session.accessToken}`;
        }

        const response = await apiClient.get<BookResponse>("/book/public/all-books", headers);

        if (!mounted) return;

        if (response.success) {
          setBooks(response.data ?? []);
        } else {
          console.error("Failed to fetch books:", response);
          setBooks([]);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch books:", error);
          setBooks([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchBooks();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollControls();

    const resizeObserver = new ResizeObserver(updateScrollControls);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [books.length, isLoading, updateScrollControls]);

  useEffect(() => {
    if (books.length <= 1) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) return;

    const autoplayInterval = setInterval(() => {
      const container = scrollContainerRef.current;

      if (!container || isPausedRef.current || document.hidden) {
        return;
      }

      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (maxScrollLeft <= 4) return;

      if (container.scrollLeft >= maxScrollLeft - 4) {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        scrollToDirection("right", false);
      }
    }, AUTO_PLAY_DELAY);

    return () => {
      clearInterval(autoplayInterval);
    };
  }, [books.length, scrollToDirection]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseCarousel();
      } else {
        resumeCarousel(1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      clearResumeTimeout();

      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [clearResumeTimeout, pauseCarousel, resumeCarousel]);

  return (
    <section
      className='overflow-hidden bg-white py-14 sm:py-20'
      aria-labelledby='discover-books-heading'
    >
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <SectionHeader
          title='Discover New Books Every Day'
          subtitle='Explore handpicked books from top authors and bestselling titles.'
          showButton
          buttonText='Browse All Books'
        />

        <div
          className='group/carousel relative mt-8'
          role='region'
          aria-roledescription='carousel'
          aria-label='Discover new books'
          onMouseEnter={pauseCarousel}
          onMouseLeave={() => resumeCarousel()}
          onFocusCapture={pauseCarousel}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              resumeCarousel();
            }
          }}
        >
          <div
            ref={scrollContainerRef}
            className='
              flex snap-x snap-mandatory gap-6 overflow-x-auto
              scroll-smooth pb-5 overscroll-x-contain
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            '
            onScroll={handleScroll}
            onPointerDown={pauseCarousel}
            onPointerUp={() => resumeCarousel(INTERACTION_PAUSE_DELAY)}
            onPointerCancel={() => resumeCarousel(INTERACTION_PAUSE_DELAY)}
            aria-label='Book list'
            role='list'
          >
            {isLoading &&
              Array.from({ length: 5 }, (_, index) => (
                <BookCardSkeleton key={`book-skeleton-${index}`} />
              ))}

            {!isLoading &&
              books.map((book, index) => (
                <div
                  key={book.id}
                  data-book-card
                  role='listitem'
                  className='
                    w-[76vw] max-w-[260px] shrink-0 snap-start
                    sm:w-[220px]
                    lg:w-[calc((100%_-_6rem)/5)]
                  '
                >
                  <BookCard
                    book={book}
                    index={index}
                    cartItems={cartItems}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}

            {!isLoading && books.length === 0 && (
              <div
                className='w-full rounded-xl border border-gray-100 bg-gray-50 py-16 text-center'
                role='status'
              >
                <p className='text-sm font-medium text-gray-600'>
                  No books available at the moment.
                </p>
                <p className='mt-1 text-xs text-gray-400'>Please check again later.</p>
              </div>
            )}
          </div>

          {!isLoading && books.length > 1 && (
            <>
              <div
                className='
                  pointer-events-none absolute inset-y-0 left-0
                  hidden w-16 bg-gradient-to-r
                  from-white via-white/70 to-transparent sm:block
                '
              />

              <div
                className='
                  pointer-events-none absolute inset-y-0 right-0
                  hidden w-16 bg-gradient-to-l
                  from-white via-white/70 to-transparent sm:block
                '
              />

              <CarouselButton
                direction='left'
                disabled={!canScrollLeft}
                onClick={() => scrollToDirection("left")}
              />

              <CarouselButton
                direction='right'
                disabled={!canScrollRight}
                onClick={() => scrollToDirection("right")}
              />
            </>
          )}

          <span
            className='sr-only'
            aria-live='polite'
          >
            {isPaused && books.length > 0 ? "Book carousel paused" : ""}
          </span>
        </div>
      </div>
    </section>
  );
}

function CarouselButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const isLeft = direction === "left";
  const Icon = isLeft ? ChevronLeft : ChevronRight;

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? "Show previous books" : "Show next books"}
      className={`
        absolute top-1/2 z-10 hidden -translate-y-1/2
        rounded-full border border-gray-200 bg-white/95 p-3
        shadow-lg backdrop-blur-sm transition-all
        hover:scale-105 hover:border-orange-300 hover:bg-orange-50
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-orange-400 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:scale-90
        disabled:opacity-0 sm:flex
        ${isLeft ? "left-2" : "right-2"}
      `}
    >
      <Icon
        className='h-5 w-5 text-gray-800'
        aria-hidden='true'
      />
    </button>
  );
}

function BookCardSkeleton() {
  return (
    <div
      className='
        w-[76vw] max-w-[260px] shrink-0 snap-start
        sm:w-[220px]
        lg:w-[calc((100%_-_6rem)/5)]
      '
      aria-hidden='true'
    >
      <div className='aspect-[3/4] animate-pulse rounded-xl bg-gray-200' />

      <div className='mt-4 h-4 animate-pulse rounded bg-gray-200' />
      <div className='mt-2 h-3 w-2/3 animate-pulse rounded bg-gray-200' />

      <div className='mt-4 flex items-center justify-between'>
        <div className='h-4 w-16 animate-pulse rounded bg-gray-200' />
        <div className='h-8 w-8 animate-pulse rounded-full bg-gray-200' />
      </div>
    </div>
  );
}
