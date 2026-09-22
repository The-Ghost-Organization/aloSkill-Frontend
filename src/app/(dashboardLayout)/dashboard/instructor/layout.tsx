"use client";

import {
  BarChart3,
  BookIcon,
  BookOpen,
  ChevronRight,
  DollarSign,
  LibraryBig,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { apiClient } from "../../../../lib/api/client";

type InstructorShellProfile = {
  displayName: string;
  email: string;
  avatarUrl: string;
  expertise?: string | null;
};

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard/instructor" },
  { icon: BookIcon, label: "Create Course", path: "/dashboard/instructor/create-course" },
  { icon: BookOpen, label: "My Courses", path: "/dashboard/instructor/course" },
  { icon: LibraryBig, label: "My Books", path: "/dashboard/instructor/books" },
  { icon: DollarSign, label: "Earnings", path: "/dashboard/instructor/earning" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/instructor/message" },
  { icon: Settings, label: "Settings", path: "/dashboard/instructor/settings" },
] as const;

const InstructorsLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<InstructorShellProfile | null>(null);

  const isActive = (path: string) =>
    path === "/dashboard/instructor"
      ? pathname === path
      : pathname === path || pathname.startsWith(`${path}/`);

  const currentPage = navItems.find(item => isActive(item.path))?.label ?? "Instructor";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const response = await apiClient.get<InstructorShellProfile>("/user/instructor/me/settings");
      if (!mounted || !response.success || !response.data) return;
      setProfile(response.data);
    };

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const displayName =
    profile?.displayName ||
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Instructor";
  const email = profile?.email || session?.user?.email || "";
  const avatarUrl =
    profile?.avatarUrl || session?.user?.profilePicture || session?.user?.image || "";
  const subtitle = profile?.expertise?.trim() || "Instructor Account";

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "IN";
    return parts
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join("");
  }, [displayName]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const Navigation = () => (
    <nav className='flex-1 space-y-1.5 overflow-y-auto px-4 pb-4'>
      {navItems.map(item => {
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
              <item.icon
                className={`h-[18px] w-[18px] shrink-0 ${
                  active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span>{item.label}</span>
            </div>
            {active ? <ChevronRight className='h-4 w-4 text-white/75' /> : null}
          </Link>
        );
      })}
    </nav>
  );

  const ProfileBlock = () => (
    <div className='m-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3'>
      <Link
        href={
          session?.user?.id ? `/instructors/${session.user.id}` : "/dashboard/instructor/settings"
        }
        className='group flex items-center gap-3 rounded-xl p-1 transition hover:bg-white/[0.04]'
      >
        <div className='relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-500/15 text-sm font-bold text-orange-300 ring-1 ring-white/10'>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              sizes='44px'
              className='object-cover'
              unoptimized={avatarUrl.startsWith("http")}
            />
          ) : (
            initials
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-white'>{displayName}</p>
          <p className='truncate text-xs text-slate-500'>{subtitle}</p>
        </div>
        <UserRound className='h-4 w-4 shrink-0 text-slate-600 transition group-hover:text-slate-400' />
      </Link>

      {email ? <p className='mt-2 truncate px-1 text-[11px] text-slate-600'>{email}</p> : null}

      <button
        type='button'
        onClick={handleSignOut}
        className='mt-3 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white'
      >
        <LogOut className='h-4 w-4' />
        Sign Out
      </button>
    </div>
  );

  return (
    <div className='min-h-screen w-full bg-[#F7F8FC] text-slate-900 lg:flex'>
      {/* Desktop Sidebar */}
      <aside className='hidden border-r border-white/10 bg-[#111827] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col'>
        <div className='px-5 pb-5 pt-6'>
          <Link
            href='/'
            className='flex items-center gap-3 rounded-2xl px-2 py-1'
          >
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-950/20'>
              <Sparkles className='h-5 w-5' />
            </span>
            <div>
              <p className='text-lg font-bold tracking-tight'>AloSkill</p>
              <p className='text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400'>
                Instructor Studio
              </p>
            </div>
          </Link>
        </div>

        <div className='px-5 pb-3'>
          <p className='px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
            Workspace
          </p>
        </div>

        <Navigation />
        <ProfileBlock />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen ? (
        <>
          <button
            type='button'
            aria-label='Close navigation overlay'
            className='fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden'
            onClick={() => setMobileOpen(false)}
          />
          <aside className='fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-80 flex-col bg-[#111827] text-white shadow-2xl lg:hidden'>
            <div className='flex items-center justify-between px-5 pb-5 pt-5'>
              <Link
                href='/'
                className='flex items-center gap-3'
              >
                <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500'>
                  <Sparkles className='h-5 w-5' />
                </span>
                <div>
                  <p className='text-lg font-bold tracking-tight'>AloSkill</p>
                  <p className='text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500'>
                    Instructor Studio
                  </p>
                </div>
              </Link>
              <button
                type='button'
                onClick={() => setMobileOpen(false)}
                className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300 transition hover:bg-white/10 hover:text-white'
                aria-label='Close navigation'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='px-5 pb-3'>
              <p className='px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                Workspace
              </p>
            </div>

            <Navigation />
            <ProfileBlock />
          </aside>
        </>
      ) : null}

      {/* Main Content */}
      <main className='min-w-0 flex-1 lg:ml-72'>
        <header className='sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8'>
          <div className='mx-auto flex max-w-[1600px] items-center justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <button
                type='button'
                onClick={() => setMobileOpen(true)}
                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden'
                aria-label='Open navigation'
              >
                <Menu className='h-5 w-5' />
              </button>

              <div className='min-w-0'>
                <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-500 sm:text-[11px]'>
                  Instructor Workspace
                </p>
                <h1 className='truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl'>
                  {currentPage}
                </h1>
              </div>
            </div>

            <div className='flex items-center gap-2 sm:gap-3'>
              <Link
                href={
                  session?.user?.id
                    ? `/instructors/${session.user.id}`
                    : "/dashboard/instructor/settings"
                }
                className='hidden rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex'
              >
                View Profile
              </Link>

              <Link
                href='/dashboard/instructor/settings'
                aria-label='Instructor settings'
                className='relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm ring-1 ring-slate-900/5'
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    sizes='40px'
                    className='object-cover'
                    unoptimized={avatarUrl.startsWith("http")}
                  />
                ) : (
                  initials
                )}
              </Link>
            </div>
          </div>
        </header>

        <div className='mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8'>
          <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
};

const LoadingFallback = () => (
  <div className='space-y-4'>
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {[0, 1, 2, 3].map(item => (
        <div
          key={item}
          className='h-28 animate-pulse rounded-2xl border border-slate-200 bg-white'
        />
      ))}
    </div>
    <div className='h-72 animate-pulse rounded-2xl border border-slate-200 bg-white' />
  </div>
);

export default InstructorsLayout;
