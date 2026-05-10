/**
 * components/books/BookCardActions.tsx  ←  CLIENT COMPONENT
 *
 * The only client-side piece inside BookCard.
 * Kept as a tiny island so BookCard itself can remain a Server Component.
 *
 * Extend handleCart / handleWishlist with your cart context or server
 * actions when you wire up the real backend.
 */

"use client";

import { BookOpen, Heart, ShoppingCart } from "lucide-react";

interface Props {
  bookId: string;
  bookTitle: string;
}

export default function BookCardActions({ bookId, bookTitle }: Props) {
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCart = (e: React.MouseEvent) => {
    stop(e);
    // TODO: dispatch to cart context / call server action
    console.log("Add to cart:", bookId);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    stop(e);
    // TODO: dispatch to wishlist context / call server action
    console.log("Add to wishlist:", bookId);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    stop(e);
    // TODO: open quick-view modal
    console.log("Quick view:", bookTitle);
  };

  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={handleCart}
        className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-500 flex items-center justify-center text-white shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95"
        aria-label={`Add ${bookTitle} to cart`}
      >
        <ShoppingCart className="w-4 h-4" />
      </button>

      <button
        onClick={handleWishlist}
        className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95"
        aria-label={`Add ${bookTitle} to wishlist`}
      >
        <Heart className="w-4 h-4" />
      </button>

      <button
        onClick={handleQuickView}
        className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95"
        aria-label={`Quick view ${bookTitle}`}
      >
        <BookOpen className="w-4 h-4" />
      </button>
    </div>
  );
}
