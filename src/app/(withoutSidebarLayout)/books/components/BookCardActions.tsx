"use client";

import { Heart, ShoppingCart } from "lucide-react";

interface Props {
  bookId: string;
  bookTitle: string;
  isInCart?: boolean;
  onAddToCart?: (bookId: string) => void;
}

export default function BookCardActions({ bookId, bookTitle, isInCart, onAddToCart }: Props) {

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCart = (e: React.MouseEvent) => {
    stop(e);
    onAddToCart?.(bookId);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    stop(e);
    // TODO: dispatch to wishlist context / call server action
  };

  return (
    <div className='flex items-center gap-2.5'>
      <button
        onClick={handleCart}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-700 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95 ${isInCart ? "bg-amber-400 hover:bg-amber-500 text-white" : "bg-white hover:bg-gray-50 text-gray-700"}`}
        aria-label={`Add ${bookTitle} to cart`}
      >
        <ShoppingCart className='w-4 h-4' />
      </button>

      <button
        onClick={handleWishlist}
        className='w-10 h-10 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95'
        aria-label={`Add ${bookTitle} to wishlist`}
      >
        <Heart className='w-4 h-4' />
      </button>
    </div>
  );
}
