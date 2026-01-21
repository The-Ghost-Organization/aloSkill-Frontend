// components/cards/BookCard.tsx
"use client";

import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BookCardProps {
  book: {
    id: number;
    title: string;
    author: string;
    price: number;
    image: string;
    rating: number;
    reviews: number;
  };
  isInWishlist: boolean;
  onToggleWishlist: (bookId: number) => void;
  onAddToCart?: (bookId: number) => void;
}

export function BookCard({ book, isInWishlist, onToggleWishlist, onAddToCart }: BookCardProps) {
  // Prevent event bubbling for interactive elements inside the link
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(book.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(book.id);
  };

  return (
    <Link
      href={`/products/${book.id}`}
      className='block flex-none w-80'
    >
      <div className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer'>
        {/* Image Container */}
        <div className='relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-4 p-6 h-56 flex items-center justify-center overflow-hidden'>
          <Image
            width={200}
            height={300}
            src={book.image}
            alt={book.title}
            className='h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110'
          />

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className='absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 z-10'
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                isInWishlist ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-400"
              }`}
            />
          </button>
        </div>

        {/* Book Details */}
        <div className='space-y-3'>
          <div className='h-[96px] sm:h-[104px] md:h-[110px] flex flex-col justify-between'>
            <div className='flex justify-between items-start gap-2'>
              <h3 className='text-lg font-bold text-gray-900 line-clamp-2 flex-1 group-hover:text-orange-600 transition-colors duration-300'>
                {book.title}
              </h3>

              <span className='text-md font-bold text-orange-600 whitespace-nowrap'>
                ৳{book.price.toFixed(2)}
              </span>
            </div>

            <p className='text-gray-600 text-sm truncate'>{book.author}</p>

            {/* Rating */}
            <div className='flex items-center gap-2'>
              <div className='flex'>
                {[...Array(5)].map((_, i) => {
                  const isActive = i < book.rating;
                  return (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        isActive ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  );
                })}
              </div>

              <span className='text-sm text-gray-600'>({book.reviews})</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCartClick}
            className='w-full py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300 font-semibold'
          >
            Add to cart
          </button>
        </div>
      </div>
    </Link>
  );
}
