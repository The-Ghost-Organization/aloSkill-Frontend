"use client";

import { ShoppingBag, ShoppingCart } from "lucide-react";

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

  const handleBuyNow = (e: React.MouseEvent) => {
    stop(e);
    // TODO: dispatch to wishlist context / call server action
  };

  return (
    <div className='flex items-center gap-2.5'>
      <button
        onClick={handleCart}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-700 shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95 ${isInCart ? "bg-orange hover:bg-amber-500 text-white" : "bg-white hover:bg-gray-50 text-gray-700"}`}
        aria-label={`Add ${bookTitle} to cart`}
      >
        <ShoppingCart className='w-4 h-4' />
      </button>

      <button
        onClick={handleBuyNow}
        className='w-10 h-10 rounded-full bg-white hover:bg-gray-100 hover:text-orange  flex items-center justify-center text-gray-700 shadow-xl transition-transform duration-150 hover:scale-110 active:scale-95'
        aria-label={`Buy ${bookTitle} now`}
      >
        <ShoppingBag className='w-4 h-4' />
      </button>
    </div>
  );
}
