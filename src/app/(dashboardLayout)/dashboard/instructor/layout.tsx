"use client";

import {
  BarChart3,
  Bell,
  BookIcon,
  BookOpen,
  DollarSign,
  LibraryBig,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const InstructorsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const navItems = [
    { icon: BarChart3, label: "Dashboard", path: "/dashboard/instructor" },
    { icon: BookIcon, label: "Create Course", path: "/dashboard/instructor/create-course" },
    { icon: BookOpen, label: "My Courses", path: "/dashboard/instructor/course", badge: 3 },
    { icon: LibraryBig, label: "My Books", path: "/dashboard/instructor/books" },
    { icon: DollarSign, label: "Earnings", path: "/dashboard/instructor/earning" },
    { icon: MessageSquare, label: "Messages", path: "/dashboard/instructor/message", badge: 2 },
    { icon: Settings, label: "Settings", path: "/dashboard/instructor/settings" },
    { icon: LogOut, label: "Sign Out", path: "/dashboard" },
  ];

  const isActive = (path: string) =>
    path === "/dashboard/instructor"
      ? pathname === path
      : pathname === path || pathname.startsWith(`${path}/`);

  const currentPage =
    navItems.find(item => item.path !== "/dashboard" && isActive(item.path))?.label ?? "Instructor";

  return (
    <div className='min-h-screen w-full bg-[#F7F8FC] text-slate-900 lg:flex'>
      {/* Desktop Sidebar */}
      <aside className='hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col border-r border-white/10 bg-[#111827] text-white'>
        <div className='px-5 pt-6 pb-5'>
          <Link href='/' className='flex items-center gap-3 rounded-2xl px-2 py-1'>
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-950/20'>
              <Sparkles className='h-5 w-5' />
            </span>
            <div>
              <p className='text-lg font-bold tracking-tight'>AloSkill</p>
              <p className='text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400'>Instructor Studio</p>
            </div>
          </Link>
        </div>

        <div className='px-5 pb-3'>
          <p className='px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500'>Workspace</p>
        </div>

        <nav className='flex-1 space-y-1.5 overflow-y-auto px-4 pb-4'>
          {navItems.slice(0, -1).map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-950/20"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <div className='flex items-center gap-3'>
                  <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-white/[0.08] text-slate-400"}`}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className='m-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-sm font-bold text-orange-300'>VS</div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold text-white'>Instructor Account</p>
              <p className='truncate text-xs text-slate-500'>Manage your workspace</p>
            </div>
          </div>
          <Link href='/dashboard' className='mt-3 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white'>
            <LogOut className='h-4 w-4' /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className='min-w-0 flex-1 lg:ml-72'>
        <header className='sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8'>
          <div className='mx-auto flex max-w-[1600px] items-center justify-between gap-4'>
            <div className='min-w-0'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-500'>Instructor</p>
              <h1 className='truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl'>{currentPage}</h1>
            </div>

            <div className='flex items-center gap-2 sm:gap-3'>
              <div className='relative hidden md:block'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <input
                  type='text'
                  placeholder='Search workspace'
                  className='h-10 w-60 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-500/10'
                />
              </div>

              <button className='relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'>
                <Bell className='h-[18px] w-[18px]' />
                <span className='absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-orange-500' />
              </button>

              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm'>VS</div>
            </div>
          </div>
        </header>

        <div className='mx-auto max-w-[1600px] p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8'>
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className='fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl lg:hidden'>
        {navItems.slice(0, 6).map(item => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-label={item.label}
              className={`relative flex h-11 min-w-11 items-center justify-center rounded-xl transition ${active ? "bg-orange-500 text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
            >
              <item.icon className='h-[19px] w-[19px]' />
              {item.badge ? <span className={`absolute right-1.5 top-1 min-w-4 rounded-full px-1 text-center text-[9px] font-bold ${active ? "bg-white text-orange-600" : "bg-orange-500 text-white"}`}>{item.badge}</span> : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  function LoadingFallback() {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='animate-pulse space-y-4'>
          <div className='h-4 w-1/3 rounded bg-slate-200' />
          <div className='h-24 rounded-xl bg-slate-100' />
          <div className='h-24 rounded-xl bg-slate-100' />
        </div>
      </div>
    );
  }
};

export default InstructorsLayout;
