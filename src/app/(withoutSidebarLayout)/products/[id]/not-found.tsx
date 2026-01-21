// app/products/[id]/not-found.tsx
import { BookOpen, Home, Search } from "lucide-react";
import Link from "next/link";

/**
 * Custom 404 page for product not found
 * Provides helpful navigation options to users
 */
export default function ProductNotFound() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center px-4'>
      <div className='max-w-2xl w-full text-center space-y-8'>
        {/* Icon */}
        <div className='flex justify-center'>
          <div className='w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center'>
            <BookOpen className='w-16 h-16 text-[var(--color-orange)]' />
          </div>
        </div>

        {/* Error Message */}
        <div className='space-y-4'>
          <h1 className='text-6xl font-bold text-[var(--color-text-dark)]'>404</h1>
          <h2 className='text-3xl font-bold text-[var(--color-text-dark)]'>Product Not Found</h2>
          <p className='text-gray-600 text-lg'>
            We couldn&apos;t find the book you&apos;re looking for. It might have been removed, or the link
            might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/'
            className='inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-orange)] hover:bg-[var(--color-orange-dark)] text-white rounded-lg font-semibold transition-colors shadow-lg'
          >
            <Home className='w-5 h-5' />
            Go to Homepage
          </Link>

          <Link
            href='/shop'
            className='inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--color-orange)] text-[var(--color-orange)] hover:bg-[var(--color-orange)] hover:text-white rounded-lg font-semibold transition-all'
          >
            <Search className='w-5 h-5' />
            Browse All Books
          </Link>
        </div>

        {/* Help Text */}
        <p className='text-sm text-gray-500 pt-8'>
          Need help?{" "}
          <Link
            href='/contact'
            className='text-[var(--color-orange)] hover:underline font-semibold'
          >
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
