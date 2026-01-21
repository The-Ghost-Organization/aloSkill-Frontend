"use client";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/dashboard/student" },
    { name: "Courses", path: "/dashboard/student/courses" },
    { name: "Teachers", path: "/dashboard/student/teachers" },
    { name: "Message", path: "/dashboard/student/message" },
    { name: "Wishlist", path: "/dashboard/student/wishlist" },
    { name: "Purchase History", path: "/dashboard/student/purchase" },
    { name: "Settings", path: "/dashboard/student/settings" },
  ];

  return (
    <div className='min-h-screen bg-linear-to-br from-pink-100 via-purple-100 to-pink-100'>
      <div className='w-full px-4 pt-4'>
        <Link
          href='/'
          className='hover:text-orange-dark'
        >
          <p className='flex gap-2 items-center'>
            {" "}
            <ChevronLeft /> Back to the Home
          </p>
        </Link>
      </div>
      <div className='w-full px-4 py-4'>
        {/* Header Card - Shared across all pages */}
        <div className='bg-white rounded shadow-sm px-6 pt-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-full bg-gray-300 overflow-hidden'>
                <Image
                  width={80}
                  height={80}
                  src='/api/placeholder/80/80'
                  alt='Kevin Gilbert'
                  className='w-full h-full object-cover'
                />
              </div>
              <div>
                <h2 className='font-semibold text-gray-900'>Kevin Gilbert</h2>
                <p className='text-gray-500 text-sm'>Web Designer & Best-Selling Instructor</p>
              </div>
            </div>
            <Link
              href={"/auth/instructor-signup"}
              className='px-4 py-2 bg-orange-50 text-orange-500 rounded font-medium hover:bg-orange-100 transition-colors flex items-center gap-2'
            >
              Become Instructor
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </Link>
          </div>

          {/* Navigation - Works with browser back/forward */}
          <nav className='flex justify-between border-t pt-4'>
            {navItems.map(item => (
              <Link
                key={item.path}
                href={item.path}
                className={`pb-2 font-medium transition-colors relative ${
                  pathname === item.path ? "text-orange-500" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
                {pathname === item.path && (
                  <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500'></span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Page Content with Suspense for loading states */}
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className='bg-white rounded-lg shadow-sm p-8'>
      <div className='animate-pulse space-y-4'>
        <div className='h-4 bg-gray-200 rounded w-3/4'></div>
        <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        <div className='h-4 bg-gray-200 rounded w-5/6'></div>
      </div>
    </div>
  );
}
