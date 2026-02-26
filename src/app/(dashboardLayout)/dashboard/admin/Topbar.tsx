"use client";

import { Bell, ChevronRight, Menu, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar } from "./Components";

const PAGE_LABELS: Record<string, string> = {
  "": "Dashboard",
  dashboard: "Dashboard",
  students: "Student Management",
  instructors: "Instructor Management",
  courses: "Course Management",
  books: "Books & Products",
  financial: "Financial Management",
  reviews: "Reviews & Ratings",
  badges: "Badges & Ranking",
  coupons: "Coupons & Discounts",
  approvals: "Approval Workflow",
  cms: "CMS / Content",
  analytics: "Analytics & Reports",
  notifications: "Notifications",
  security: "Security & Control",
  settings: "Platform Settings",
  gamification: "Gamification",
};

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const pageId = pathname === "/" ? "" : pathname.replace("/", "");
  const pageLabel = PAGE_LABELS[pageId] || "Dashboard";

  return (
    <header className='h-16 bg-[#070f1e] border-b border-[#1a3158] flex items-center px-6 gap-4 sticky top-0 z-20'>
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className='lg:hidden flex items-center justify-center bg-transparent border-none cursor-pointer text-[#7a9cc4] p-1'
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className='flex items-center gap-2'>
        <span className='text-[#3d5a80] text-[13px]'>AloSkill</span>
        <ChevronRight
          size={14}
          color='#3d5a80'
        />
        <span className='text-[#e8f0fe] text-[13px] font-semibold'>{pageLabel}</span>
      </div>

      {/* Live indicator */}
      <div className='flex items-center gap-2 ml-4'>
        {/* pulseDot — bg + glow shadow + pulse animation via Tailwind */}
        <div className='w-2 h-2 rounded-full bg-[#00e5a0] shadow-[0_0_8px_#00e5a0] animate-pulse' />
        <span className='hidden sm:block text-[11px] text-[#3d5a80] font-mono uppercase tracking-widest'>
          LIVE
        </span>
      </div>

      <div className='flex-1' />

      {/* Actions */}
      <div className='flex gap-2'>
        {/* Bell */}
        <div className='relative w-[38px] h-[38px] rounded-[9px] border border-[#1a3158] bg-[#070f1e] flex items-center justify-center cursor-pointer text-[#3d5a80] flex-shrink-0 transition-all duration-[180ms] hover:border-[#2a4a78] hover:text-[#7a9cc4]'>
          <Bell size={16} />
          {/* notification dot */}
          <div className='absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-[#da7c36] border-2 border-[#070f1e]' />
        </div>

        {/* Settings */}
        <div className='hidden sm:flex w-[38px] h-[38px] rounded-[9px] border border-[#1a3158] bg-[#070f1e] items-center justify-center cursor-pointer text-[#3d5a80] flex-shrink-0 transition-all duration-[180ms] hover:border-[#2a4a78] hover:text-[#7a9cc4]'>
          <Settings size={16} />
        </div>

        {/* Divider */}
        <div className='hidden sm:block w-px bg-[#1a3158] h-7 self-center' />

        {/* Avatar + name */}
        <div className='hidden sm:flex items-center gap-2'>
          <Avatar
            name='Super Admin'
            size={32}
            gradient='135deg, #da7c36, #d15100'
          />
          <div className='hidden md:block'>
            <div className='text-[12px] font-semibold text-[#e8f0fe] leading-tight'>
              Super Admin
            </div>
            <div className='text-[10px] text-[#3d5a80] font-mono uppercase tracking-widest'>
              OWNER
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
