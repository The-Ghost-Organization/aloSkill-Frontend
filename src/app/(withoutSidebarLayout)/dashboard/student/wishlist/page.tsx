"use client";

import { Heart, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const WishListPage = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      title: "The Ultimate Drawing Course - Beginner to Advanced",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&h=200&fit=crop",
      rating: 4.8,
      reviews: "451,444 Review",
      instructors: "Harry Potter • John Wick",
      price: 37.0,
      originalPrice: 49.0,
    },
    {
      id: 2,
      title: "Digital Marketing Masterclass - 23 Courses in 1",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
      rating: 4.8,
      reviews: "451,444 Review",
      instructors: "Nobody",
      price: 24.0,
      originalPrice: null,
    },
    {
      id: 3,
      title: "Angular - The Complete Guide (2021 Edition)",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop",
      rating: 4.7,
      reviews: "451,444 Review",
      instructors: "Kevin Gilbert",
      price: 13.0,
      originalPrice: null,
    },
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  return (
    <div className='w-full rounded shadow-lg overflow-hidden'>
      {/* Header */}
      <div className='bg-gradient-to-r from-purple-100 to-pink-100 px-8 py-6 border-b border-gray-200'>
        <h3 className=''>
          Wishlist <span className='text-purple-600'>({wishlistItems.length})</span>
        </h3>
      </div>

      {/* Table Header */}
      <div className='px-8 py-4 bg-gray-50 border-b border-gray-200'>
        <div className='grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 uppercase tracking-wider'>
          <div className='col-span-6'>Course</div>
          <div className='col-span-2 text-start'>Prices</div>
          <div className='col-span-4 text-center'>Action</div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className='divide-y divide-gray-100'>
        {wishlistItems.map(item => (
          <div
            key={item.id}
            className='px-6 py-4 hover:bg-gray-50 transition-colors'
          >
            <div className='grid grid-cols-12 gap-6 items-center'>
              {/* Course Info */}
              <div className='col-span-6 flex gap-4 items-center'>
                <Image
                  width={80}
                  height={80}
                  src={item.image}
                  alt={item.title}
                  className='w-24 h-16 object-cover rounded-lg shadow-sm'
                />
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <Star className='w-4 h-4 fill-orange-400 text-orange-400' />
                    <span className='text-sm font-semibold text-gray-900'>{item.rating}</span>
                    <span className='text-xs text-gray-500'>({item.reviews})</span>
                  </div>
                  <h4 className='text-base font-semibold text-gray-900 mb-2 leading-snug'>
                    {item.title}
                  </h4>
                  <p className='text-xs text-gray-600'>
                    Course by: <span className='text-gray-700 font-medium'>{item.instructors}</span>
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className='col-span-2 text-center'>
                <div className='flex items-center justify-start gap-2'>
                  <span className='text-md font-bold text-orange-500'>
                    ${item.price.toFixed(2)}
                  </span>
                  {item.originalPrice && (
                    <span className='text-sm text-gray-400 line-through'>
                      ${item.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className='col-span-4 flex items-center justify-center gap-3'>
                <button className='px-4 py-1 bg-white border-1 border-gray-300 text-gray-700 rounded font-medium hover:border-gray-400 hover:bg-gray-200 transition-all'>
                  Buy Now
                </button>
                <button className='px-4 py-1 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 transition-all shadow-sm'>
                  Add To Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className='p-2 bg-pink-50 text-red-400 rounded-lg hover:bg-pink-100 transition-all'
                >
                  <Heart className='w-4 h-4 fill-current' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {wishlistItems.length === 0 && (
        <div className='px-8 py-16 text-center'>
          <Heart className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>Your wishlist is empty</h3>
          <p className='text-gray-500'>Add courses you &apos;re interested in to your wishlist</p>
        </div>
      )}
    </div>
  );
};

export default WishListPage;
