"use client";

import {
  BarChart3,
  Bell,
  BookIcon,
  BookOpen,
  DollarSign,
  LogOut,
  MessageSquare,
  Search,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const InstructorsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const navItems = [
    { icon: BarChart3, label: "Dashboard", path: "/dashboard/instructor" },
    { icon: BookIcon, label: "Create New Course", path: "/dashboard/instructor/create-course" },
    { icon: BookOpen, label: "My Courses", path: "/dashboard/instructor/course", badge: 3 },
    { icon: DollarSign, label: "Earning", path: "/dashboard/instructor/earning" },
    { icon: MessageSquare, label: "Message", path: "/dashboard/instructor/message", badge: 2 },
    { icon: Settings, label: "Settings", path: "/dashboard/instructor/settings" },
    { icon: LogOut, label: "SignOut", path: "/dashboard" },
  ];

  return (
    <div className='min-h-screen w-full bg-linear-to-br from-pink-100 via-purple-100 to-pink-100 flex flex-col lg:flex-row overflow-hidden'>
      {/* Sidebar */}
      <aside className='hidden lg:flex lg:w-65 xl:w-75 h-screen bg-linear-to-t from-[#0F172A] to-[#0B1120] text-white flex-col'>
        <Link
          href='/'
          className='hover:text-orange p-5 text-2xl font-semibold'
        >
          AloSkill
        </Link>

        <nav className='flex-1 px-4 flex flex-col gap-2 overflow-y-auto'>
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`w-full flex items-center justify-between px-4 py-3 rounded transition-colors cursor-pointer ${
                pathname === item.path
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
            >
              <div className='flex items-center gap-3'>
                <item.icon className='w-5 h-5 shrink-0' />
                <span className='text-sm font-medium'>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-semibold ${
                    pathname === item.path ? "bg-white text-orange-500" : "bg-orange-500 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className='flex-1 flex flex-col w-full overflow-hidden'>
        {/* Header */}
        <header className='bg-white border-b border-gray-200 px-3 sm:px-6 py-2 w-full'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
            <h3 className='font-semibold text-sm sm:text-base'>Dashboard</h3>

            <div className='flex items-center gap-2 sm:gap-4 w-full sm:w-auto'>
              {/* Search */}
              <div className='relative flex-1 sm:flex-none'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search...'
                  className='w-full sm:w-50 pl-9 pr-3 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light text-sm'
                />
              </div>

              {/* Notification */}
              <button className='relative p-2 hover:bg-gray-100 rounded'>
                <Bell className='w-4 sm:w-5 h-4 sm:h-5 text-gray-500' />
                <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
              </button>

              {/* Avatar */}
              <div className='w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs sm:text-sm font-semibold text-white'>
                VS
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-3 sm:p-6'>
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );

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
};

export default InstructorsLayout;
