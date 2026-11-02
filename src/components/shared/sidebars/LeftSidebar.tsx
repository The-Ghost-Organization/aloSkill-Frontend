"use client";

import {
  BOOKS_CATALOG_HREF,
  CATALOG_PATH,
  CATALOG_TAB_PARAM,
  PRODUCTS_CATALOG_HREF,
  parseCatalogTab,
} from "@/components/products/catalog";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Facebook,
  GraduationCap,
  HandCoins,
  Home,
  Instagram,
  Library,
  LifeBuoy,
  type LucideIcon,
  MessageCircle,
  Route,
  ShoppingBag,
  Star,
  Trophy,
  Twitter,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useState } from "react";

interface LeftSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type NavLinkItem = { icon: LucideIcon; label: string; href: string; color: string };
type NavGroupItem = {
  icon: LucideIcon;
  label: string;
  color: string;
  group: "books-resources";
};
type NavItem = NavLinkItem | NavGroupItem;

const navItems: NavItem[] = [
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
    href: "/studentHub",
    color: "text-green-500",
  },
  {
    icon: Library,
    label: "Books & Resources",
    color: "text-purple-500",
    group: "books-resources",
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
    href: "/successStories",
    color: "text-amber-500",
  },
  {
    icon: LifeBuoy,
    label: "Help & Support",
    href: "/help",
    color: "text-rose-500",
  },
];
const linkBase = "flex items-center gap-3 px-2 py-3 rounded-lg transition-all duration-200";
const linkActive = "bg-orange-50 text-orange-600 font-semibold shadow-sm";
const linkIdle = "text-gray-700 hover:bg-gray-50 hover:text-gray-900";

/** Which catalog entry (if any) the current URL represents. */
function activeCatalogEntry(pathname: string, tab: string | null): "books" | "products" | null {
  if (pathname.startsWith("/products")) return "products"; // product detail pages
  if (pathname === CATALOG_PATH) return parseCatalogTab(tab);
  if (pathname.startsWith(`${CATALOG_PATH}/`)) return "books"; // book detail pages
  return null;
}

const catalogChildren = [
  { key: "books", label: "All Books", href: BOOKS_CATALOG_HREF, icon: BookOpen },
  { key: "products", label: "Products", href: PRODUCTS_CATALOG_HREF, icon: ShoppingBag },
] as const;

function BooksResourcesGroup({
  item,
  pathname,
  tab,
  onNavigate,
}: {
  item: NavGroupItem;
  pathname: string;
  tab: string | null;
  onNavigate?: () => void;
}) {
  const active = activeCatalogEntry(pathname, tab);
  const [expanded, setExpanded] = useState(active !== null);
  const panelId = useId();
  const Icon = item.icon;

  // Auto-expand when the user lands on any catalog route.
  useEffect(() => {
    if (active !== null) setExpanded(true);
  }, [active]);

  return (
    <div>
      <button
        type='button'
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className={`w-full ${linkBase} ${active ? "text-orange-600 font-semibold" : linkIdle}`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${active ? "text-orange-500" : item.color}`} />
        <span className='text-sm leading-snug flex-1 text-left'>{item.label}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden='true'
        />
      </button>

      <div
        id={panelId}
        hidden={!expanded}
        className='mt-1 ml-4 pl-3 border-l border-gray-200 space-y-1'
      >
        {catalogChildren.map(child => {
          const ChildIcon = child.icon;
          const isActive = active === child.key;
          return (
            <Link
              key={child.key}
              href={child.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive ? linkActive : linkIdle
              }`}
            >
              <ChildIcon
                className={`w-4 h-4 shrink-0 ${isActive ? "text-orange-500" : "text-gray-400"}`}
              />
              <span className='truncate'>{child.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Isolates useSearchParams so the rest of the sidebar never bails out of static rendering. */
function BooksResourcesGroupWithParams(props: {
  item: NavGroupItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const searchParams = useSearchParams();
  return <BooksResourcesGroup {...props} tab={searchParams.get(CATALOG_TAB_PARAM)} />;
}

export default function LeftSidebar({ isOpen = false, onClose }: LeftSidebarProps) {
  const pathname = usePathname();

  // Mobile/tablet drawer: close on Escape and lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const prevOverflow = document.body.style.overflow;
    if (!mq.matches) document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile/Tablet Overlay — above the fixed header */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-55 lg:hidden'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      {/* Sidebar Container: full-height drawer below lg, sticky rail on desktop */}
      <aside
        aria-label='Main navigation'
        className={`
          fixed lg:sticky
          top-0 lg:top-28
          left-0
          h-dvh lg:h-[calc(100vh-7rem)]
          w-72 max-w-[85vw] lg:w-48
          bg-white
          border-r border-gray-200
          shadow-lg lg:shadow-none
          transition-transform duration-300 ease-in-out
          z-60 lg:z-10
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Mobile Header */}
        <div className='lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100'>
          <span className='text-sm font-bold text-navy-deep'>Menu</span>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            aria-label='Close sidebar'
          >
            <X className='w-5 h-5 text-gray-700' />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className='flex-1 overflow-y-auto overscroll-contain px-2 py-6 space-y-1'>
          {navItems.map(item => {
            if ("group" in item) {
              return (
                <Suspense
                  key={item.group}
                  fallback={
                    <BooksResourcesGroup item={item} pathname={pathname} tab={null} onNavigate={onClose} />
                  }
                >
                  <BooksResourcesGroupWithParams item={item} pathname={pathname} onNavigate={onClose} />
                </Suspense>
              );
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`${linkBase} ${isActive ? linkActive : linkIdle}`}
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
