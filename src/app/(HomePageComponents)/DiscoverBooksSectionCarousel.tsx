// components/sections/DiscoverBooksSectionCarousel.tsx
"use client";

import { BookCard } from "@/components/cards/BookCard";
import SectionHeader from "@/components/sections/SectionHeader";
import { mockBooks } from "@/data/books";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Discover Books Section with Auto-scrolling Carousel
 *
 * Features:
 * - Auto-scroll with smooth animation
 * - Manual navigation with arrow buttons
 * - Pause on hover
 * - Responsive design
 * - Wishlist and cart integration
 *
 * @example
 * ```tsx
 * <DiscoverBooksSectionCarousel />
 * ```
 */
export function DiscoverBooksSectionCarousel() {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  /* ------------------ AUTO SCROLL HELPERS ------------------ */

  /**
   * Stops the auto-scroll interval
   */
  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  /**
   * Starts the auto-scroll interval
   * Scrolls 1px every 16ms (~60fps)
   */
  const startAutoScroll = useCallback(() => {
    stopAutoScroll();

    autoScrollRef.current = setInterval(() => {
      if (!scrollContainerRef.current || isPaused) return;

      const container = scrollContainerRef.current;
      container.scrollLeft += 1;

      // Loop when reaching end
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
        container.scrollLeft = 0;
      }
    }, 16); // ~60fps
  }, [isPaused]);

  /**
   * Restarts the auto-scroll after manual navigation
   */
  const restartAutoScroll = () => {
    stopAutoScroll();
    startAutoScroll();
  };

  // Initialize auto-scroll on mount
  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll]);

  /* ------------------ MANUAL NAVIGATION ------------------ */

  /**
   * Handles manual scroll navigation
   * @param direction - Direction to scroll ('left' or 'right')
   */
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const amount = 420; // Width of one card + gap

    stopAutoScroll(); // Stop auto-scroll during manual navigation

    container.scrollTo({
      left: direction === "left" ? container.scrollLeft - amount : container.scrollLeft + amount,
      behavior: "smooth",
    });

    // Resume auto-scroll after animation completes
    setTimeout(restartAutoScroll, 500);
  };

  /* ------------------ ACTIONS ------------------ */

  /**
   * Toggles a book in/out of the wishlist
   * @param bookId - The ID of the book to toggle
   */
  const toggleWishlist = (bookId: number) => {
    setWishlist(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  /**
   * Handles adding a book to the cart
   * TODO: Integrate with cart state management (Context/Redux/Zustand)
   * @param bookId - The ID of the book to add
   */
  // const handleAddToCart = (bookId: number) => {
  //   console.log("Added to cart:", bookId);
  //   // TODO: Implement cart functionality
  //   // Example: addToCart(mockBooks.find(b => b.id === bookId));
  // };

  /* ------------------ RENDER ------------------ */

  return (
    <section className='py-20 bg-gradient-to-br from-orange-50 via-white to-blue-50 overflow-hidden'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Section Header */}
        <SectionHeader
          title='Discover New Books Every Day'
          subtitle='Explore handpicked books from top authors and bestselling titles.'
          showButton
          buttonText='Browse All Books'
        />

        {/* Carousel Container */}
        <div
          className='relative'
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Scrollable Books Container */}
          <div
            ref={scrollContainerRef}
            className='flex gap-6 overflow-x-auto scrollbar-hide pb-4'
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseDown={stopAutoScroll}
            onMouseUp={restartAutoScroll}
          >
            {mockBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                isInWishlist={wishlist.includes(book.id)}
                onToggleWishlist={toggleWishlist}
                // onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Gradient Edges for Visual Effect */}
          <div className='absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-orange-50 to-transparent pointer-events-none' />
          <div className='absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-orange-50 to-transparent pointer-events-none' />
        </div>

        {/* Navigation Buttons */}
        <div className='flex justify-center gap-4 mt-8'>
          <button
            onClick={() => scroll("left")}
            className='p-3 bg-white border-2 border-gray-200 rounded-full hover:border-[var(--color-orange)] hover:bg-orange-50 transition-all shadow-md hover:scale-110'
            aria-label='Previous books'
          >
            <ChevronLeft className='w-6 h-6 text-[var(--color-text-dark)]' />
          </button>

          <button
            onClick={() => scroll("right")}
            className='p-3 bg-white border-2 border-gray-200 rounded-full hover:border-[var(--color-orange)] hover:bg-orange-50 transition-all shadow-md hover:scale-110'
            aria-label='Next books'
          >
            <ChevronRight className='w-6 h-6 text-[var(--color-text-dark)]' />
          </button>
        </div>

        {/* Pause Indicator */}
        {isPaused && (
          <div className='text-center mt-4'>
            <span className='text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200'>
              Auto-scroll paused
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
