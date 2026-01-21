"use client";

import {
  Home,
  BookOpen,
  GraduationCap,
  Users,
  Library,
  CalendarDays,
  Trophy,
  MessageCircle,
  Route,
  HandCoins,
  Star,
  LifeBuoy,
  Twitter,
  Facebook,
  Instagram,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LeftSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// ✅ CLEANED: Removed duplicate items
const navItems = [
  {
    icon: Home,
    label: "Home",
    href: "/",
    color: "text-orange-700",
  },
  {
    icon: BookOpen,
    label: "Courses",
    href: "/courses",
    color: "text-orange-500",
  },
  {
    icon: GraduationCap,
    label: "Instructors",
    href: "/instructors",
    color: "text-blue-500",
  },
  {
    icon: Users,
    label: "Students Hub",
    href: "/students",
    color: "text-green-500",
  },
  {
    icon: Library,
    label: "Books & Resources",
    href: "/books",
    color: "text-purple-500",
  },
  {
    icon: CalendarDays,
    label: "Events & Workshops",
    href: "/events",
    color: "text-pink-500",
  },
  {
    icon: Trophy,
    label: "Challenges",
    href: "/challenges",
    color: "text-yellow-500",
  },
  {
    icon: MessageCircle,
    label: "Community",
    href: "/community",
    color: "text-indigo-500",
  },
  {
    icon: Route,
    label: "Career & Skill Path",
    href: "/career",
    color: "text-sky-500",
  },
  {
    icon: HandCoins,
    label: "Earn with AloSkill",
    href: "/earn",
    color: "text-emerald-500",
  },
  {
    icon: Star,
    label: "Success Stories",
    href: "/success",
    color: "text-amber-500",
  },
  {
    icon: LifeBuoy,
    label: "Help & Support",
    href: "/help",
    color: "text-rose-500",
  },
];
export default function LeftSidebar({ isOpen = false, onClose }: LeftSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:sticky
          top-12 lg:top-28
          left-0
          h-[calc(100vh-3rem)] lg:h-[calc(100vh-6rem)]
          w-50 lg:w-48
          bg-white
          border-r border-gray-200
          shadow-lg lg:shadow-none
          transition-transform duration-300 ease-in-out
          z-50 lg:z-10
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Close Button */}
        <div className='lg:hidden flex justify-end p-4 border-b border-gray-100'>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label='Close sidebar'
          >
            <X className='w-5 h-5 text-gray-700' />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className='flex-1 overflow-y-auto px-2 py-6 space-y-1'>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-2 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-orange-50 text-orange-600 font-semibold shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-orange-500" : item.color}`} />
                <span className='text-sm truncate'>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Social Footer - Sticky at bottom */}
        <div className='border-t border-gray-200 bg-white px-4 py-4'>
          <p className='text-xs text-gray-500 mb-3 font-medium'>Follow Us</p>
          <div className='flex gap-3'>
            <a
              href='https://twitter.com'
              target='_blank'
              rel='noopener noreferrer'
              className='w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:border-sky-500 hover:text-sky-500 transition-all duration-200 hover:shadow-md'
              aria-label='Twitter'
            >
              <Twitter className='w-4 h-4' />
            </a>
            <a
              href='https://facebook.com'
              target='_blank'
              rel='noopener noreferrer'
              className='w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200 hover:shadow-md'
              aria-label='Facebook'
            >
              <Facebook className='w-4 h-4' />
            </a>
            <a
              href='https://instagram.com'
              target='_blank'
              rel='noopener noreferrer'
              className='w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:border-pink-500 hover:text-pink-500 transition-all duration-200 hover:shadow-md'
              aria-label='Instagram'
            >
              <Instagram className='w-4 h-4' />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
