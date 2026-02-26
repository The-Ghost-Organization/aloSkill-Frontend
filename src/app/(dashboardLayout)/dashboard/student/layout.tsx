"use client";

import { useSessionContext } from "@/app/contexts/SessionContext.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSessionContext();

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
    <section className='w-full'>
      {/* Gradient Background */}
      <div className='h-32 sm:h-40 md:h-48 w-full bg-linear-to-r from-orange-100 via-purple-100 to-orange-100' />

      <div className='relative -mt-20 sm:-mt-24 md:-mt-32 min-h-screen w-full max-w-7xl mx-auto px-3 sm:px-6'>
        {/* Back Home */}
        <div className='w-full pt-4'>
          <Link
            href='/'
            className='hover:text-orange-dark'
          >
            <p className='flex gap-2 items-center text-sm sm:text-base'>
              <ChevronLeft /> Back to the Home
            </p>
          </Link>
        </div>

        <div className='w-full py-4'>
          {/* Header Card */}
          <div className='bg-white rounded shadow-sm pt-4 sm:pt-6 mb-6'>
            {/* Top Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-8 md:px-12 mb-4'>
              {/* Profile Section */}
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-orange rounded-full bg-gray-300 overflow-hidden'>
                  <Image
                    width={80}
                    height={80}
                    src={user?.profilePicture || "/image/avater.png"}
                    alt='User Avatar'
                    className='w-full h-full object-cover'
                  />
                </div>

                <div>
                  <h2 className='text-base sm:text-lg font-semibold text-gray-900'>{user?.name}</h2>
                </div>
              </div>

              {/* Become Instructor Button */}
              <Link
                href={"/auth/instructor-signup"}
                className='w-full sm:w-auto text-center px-3 sm:px-4 py-2 bg-orange-50 text-orange-500 rounded font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base'
              >
                Become Instructor
                <ChevronRight />
              </Link>
            </div>

            {/* Navigation */}
            <nav className='border-t pt-2 sm:pt-4'>
              <div className='flex gap-4 sm:gap-6 overflow-x-auto px-2 sm:px-6 md:px-10 scrollbar-hide'>
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`whitespace-nowrap pb-2 font-medium text-sm sm:text-base transition-colors relative ${
                      pathname === item.path
                        ? "text-orange-500"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.name}
                    {pathname === item.path && (
                      <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500'></span>
                    )}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          {/* Page Content */}
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </div>
      </div>
    </section>
  );
}

function LoadingFallback() {
  return (
    <div className='bg-white rounded-lg shadow-sm p-6 sm:p-8'>
      <div className='animate-pulse space-y-4'>
        <div className='h-4 bg-gray-200 rounded w-3/4'></div>
        <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        <div className='h-4 bg-gray-200 rounded w-5/6'></div>
      </div>
    </div>
  );
}
