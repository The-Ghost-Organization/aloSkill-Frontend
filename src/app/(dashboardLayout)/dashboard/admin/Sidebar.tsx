"use client";

import {
  Award,
  BarChart2,
  Bell,
  BookOpen,
  CheckCircle,
  DollarSign,
  Gamepad2,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Tag,
  Users,
  Zap,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "./Components";
import { NAV_ITEMS } from "./Data";

const NAV_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={17} />,
  students: <Users size={17} />,
  instructors: <GraduationCap size={17} />,
  courses: <BookOpen size={17} />,
  books: <ShoppingBag size={17} />,
  finance: <DollarSign size={17} />,
  reviews: <Star size={17} />,
  badges: <Award size={17} />,
  coupons: <Tag size={17} />,
  approvals: <CheckCircle size={17} />,
  cms: <Globe size={17} />,
  analytics: <BarChart2 size={17} />,
  notifications: <Bell size={17} />,
  security: <Shield size={17} />,
  settings: <Settings size={17} />,
  gamification: <Gamepad2 size={17} />,
};

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeId = pathname === "/" ? "dashboard" : pathname.replace("/", "");

  const handleNav = (id: string) => {
    router.push(id === "dashboard" ? "/dashboard/admin" : `/dashboard/admin/${id}`);
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen?.(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // On desktop: show logo text only when NOT collapsed
  // On mobile:  show logo text always (sidebar is full-width when open)
  const showLogoText = !collapsed || mobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen?.(false)}
          className='fixed inset-0 z-40 bg-[rgba(5,13,26,0.8)] backdrop-blur-sm'
        />
      )}

      <aside
        className={[
          "flex flex-col shrink-0 overflow-hidden h-screen",
          "bg-[linear-gradient(180deg,#070f1e_0%,#050d1a_100%)] border-r border-[#1a3158]",
          "lg:sticky lg:top-0",
          "lg:transition-[width] lg:duration-300 lg:ease-[cubic-bezier(0.4,0,0.2,1)]",
          collapsed && !mobileOpen ? "lg:w-[68px]" : "lg:w-[260px]",
          "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:z-50 max-lg:w-[260px]",
          "max-lg:transition-[transform,width] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.4,0,0.2,1)]",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* ── Logo row ─────────────────────────────────────────
            Layout strategy:
            - Expanded:  [ZapIcon] [AloSkill text — flex-1] [MenuBtn]
            - Collapsed: [ZapIcon + MenuBtn centered in a column]
              We switch to flex-col + items-center when collapsed so
              both the logo mark and the toggle are always visible and
              never overflow the 68px width.
        ──────────────────────────────────────────────────────── */}
        <div
          className={[
            "border-b border-[#1a3158] min-h-[68px]",
            // Expanded: single row
            showLogoText
              ? "flex flex-row items-center gap-2.5 px-3.5 py-4"
              : // Collapsed desktop: stack icon + toggle vertically, centered
                "flex flex-col items-center justify-center gap-2 py-3 px-0",
          ].join(" ")}
        >
          {/* Logo mark */}
          <div className='w-[38px] h-[38px] rounded-[10px] bg-[linear-gradient(135deg,#da7c36,#d15100)] flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(218,124,54,0.4)]'>
            <Zap
              size={18}
              color='white'
            />
          </div>

          {/* Brand text — only when expanded */}
          {showLogoText && (
            <div className='flex-1 overflow-hidden'>
              <div className='font-extrabold text-[16px] text-[#e8f0fe] tracking-[-0.3px]'>
                AloSkill
              </div>
              <div className='text-[10px] text-[#3d5a80] uppercase tracking-[1.5px]'>
                Admin Panel
              </div>
            </div>
          )}

          {/* Toggle button — always rendered, never hidden */}
          <button
            onClick={handleToggle}
            className={[
              "flex items-center justify-center flex-shrink-0",
              "bg-transparent border-none cursor-pointer",
              "w-7 h-7 rounded-lg",
              "text-[#3d5a80] hover:text-[#8aa4c8]",
              "hover:bg-[rgba(255,255,255,0.06)]",
              "transition-colors duration-150",
            ].join(" ")}
          >
            <Menu
              size={16}
              color='currentColor'
            />
          </button>
        </div>

        {/* Nav */}
        <nav className='flex-1 overflow-y-auto py-2.5 px-2'>
          {NAV_ITEMS.map(item => {
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={[
                  "relative flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer mb-0.5",
                  "text-[13.5px] font-medium transition-all duration-150 select-none",
                  collapsed && !mobileOpen ? "justify-center" : "justify-start",
                  isActive
                    ? "bg-[linear-gradient(135deg,rgba(218,124,54,0.18),rgba(218,124,54,0.08))] text-white border border-[rgba(218,124,54,0.25)]"
                    : "text-[#3d5a80] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#8aa4c8]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className='flex flex-shrink-0'
                  style={{
                    color: isActive ? "#da7c36" : "#3d5a80",
                    filter: isActive ? "drop-shadow(0 0 6px rgba(218,124,54,0.6))" : "none",
                  }}
                >
                  {NAV_ICONS[item.id]}
                </span>

                {(!collapsed || mobileOpen) && (
                  <>
                    <span className='flex-1'>{item.label}</span>
                    {item.badge && (
                      <span className='bg-[#da7c36] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none'>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {collapsed && !mobileOpen && item.badge && (
                  <div className='absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#da7c36] text-[9px] flex items-center justify-center text-white font-bold'>
                    {item.badge}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Profile */}
        <div className='px-2 py-3 border-t border-[#1a3158]'>
          <div className='flex items-center gap-2.5 p-2.5 rounded-[10px] bg-[#0d1f3c] border border-[#1a3158]'>
            <Avatar
              name='Super Admin'
              size={34}
              gradient='135deg, #da7c36, #d15100'
            />

            {showLogoText && (
              <>
                <div className='flex-1 min-w-0'>
                  <div className='text-[13px] font-semibold text-[#e8f0fe] truncate'>
                    Super Admin
                  </div>
                  <div className='text-[10px] text-[#3d5a80] uppercase tracking-[1.5px]'>
                    FULL ACCESS
                  </div>
                </div>
                <LogOut
                  size={15}
                  color='#3d5a80'
                  className='cursor-pointer flex-shrink-0'
                />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
