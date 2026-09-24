"use client";

import CourseGrid from "@/components/grids/CourseGrid";
import {
  BookOpen,
  ChevronDown,
  Filter,
  Grid,
  LayoutList,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "../../../lib/api/client";
import { courseAddToCartHandler } from "../../../lib/course/courseHelper.ts";
import { courseDraftStorage } from "../../../lib/storage/courseDraftStorage.ts";
import { useSessionContext } from "../../contexts/SessionContext.tsx";
import FilterSidebar from "./(FilterSection)/FilterSidebar.tsx";
import type { CourseType } from "./allCourses.types.ts";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

interface ClientPageProps {
  initialCourses: CourseType[];
}

const getCoursePrice = (course: CourseType) =>
  course.discountPrice !== null ? Number(course.discountPrice) : Number(course.originalPrice ?? 0);

export default function AllCoursesClientPage({ initialCourses }: ClientPageProps) {
  const maxCoursePrice = useMemo(() => {
    const highest = Math.max(0, ...initialCourses.map(getCoursePrice));
    if (highest <= 0) return 10000;
    return Math.ceil(highest / 500) * 500;
  }, [initialCourses]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuery, setFilteredQuery] = useState({
    category: "",
    level: "",
    language: "",
    rating: "",
    priceRange: [0, maxCoursePrice],
  });
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [cartItems, setCartItems] = useState<{ courseId: string; quantity: number }[]>([]);
  const [updateCart, setUpdateCart] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Set<string | number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["category", "rating", "level", "language", "price"])
  );

  const { setCartUpdate, user } = useSessionContext();

  useEffect(() => {
    const storedCartItems =
      courseDraftStorage.get<{ courseId: string; quantity: number }[]>() || [];
    setCartItems(storedCartItems);
  }, [updateCart]);

  useEffect(() => {
    if (!user?.id) {
      setWishlistItems(new Set());
      return;
    }

    void apiClient
      .get<Array<{ course: { id: string } | null }>>("/user/student/me/wishlist")
      .then(response => {
        if (!response.success) return;
        setWishlistItems(
          new Set((response.data ?? []).flatMap(item => (item.course ? [item.course.id] : [])))
        );
      })
      .catch(() => undefined);
  }, [user?.id]);

  useEffect(() => {
    if (!showMobileFilters) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showMobileFilters]);

  const filteredAndSortedCourses = useMemo(() => {
    let result = [...initialCourses];
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter(course => {
        const searchableText = [
          course.title,
          course.category?.name,
          course.createdBy?.displayName,
          course.level,
          course.language,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      });
    }

    if (filteredQuery.category && filteredQuery.category !== "all") {
      result = result.filter(course => course.category?.name === filteredQuery.category);
    }

    if (filteredQuery.level && filteredQuery.level !== "all") {
      result = result.filter(course => course.level === filteredQuery.level);
    }

    if (filteredQuery.language && filteredQuery.language !== "all") {
      result = result.filter(course => course.language === filteredQuery.language);
    }

    if (filteredQuery.rating && filteredQuery.rating !== "all") {
      const minimumRating = Number(filteredQuery.rating);
      result = result.filter(course => Number(course.ratingAverage ?? 0) >= minimumRating);
    }

    const minPrice = Number(filteredQuery.priceRange?.[0] ?? 0);
    const maxPrice = Number(filteredQuery.priceRange?.[1] ?? maxCoursePrice);
    result = result.filter(course => {
      const price = getCoursePrice(course);
      return price >= minPrice && price <= maxPrice;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return Number(b.ratingAverage ?? 0) - Number(a.ratingAverage ?? 0);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price-low":
          return getCoursePrice(a) - getCoursePrice(b);
        case "price-high":
          return getCoursePrice(b) - getCoursePrice(a);
        case "popular":
        default:
          return Number(b._count?.enrollments ?? 0) - Number(a._count?.enrollments ?? 0);
      }
    });

    return result;
  }, [filteredQuery, initialCourses, maxCoursePrice, searchQuery, sortBy]);

  const pageStats = useMemo(() => {
    const totalEnrollments = initialCourses.reduce(
      (sum, course) => sum + Number(course._count?.enrollments ?? 0),
      0
    );
    const totalReviews = initialCourses.reduce(
      (sum, course) => sum + Number(course._count?.reviews ?? 0),
      0
    );
    const categories = new Set(
      initialCourses.map(course => course.category?.name).filter((name): name is string => Boolean(name))
    );

    return {
      courses: initialCourses.length,
      students: totalEnrollments,
      reviews: totalReviews,
      categories: categories.size,
    };
  }, [initialCourses]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleFilterChange = useCallback(
    (
      fieldName: "category" | "level" | "language" | "rating" | "priceRange",
      value: string | number[]
    ) => {
      setFilteredQuery(prev => ({ ...prev, [fieldName]: value }));
    },
    []
  );

  const handleAddToCart = useCallback(
    (courseId: string) => {
      courseAddToCartHandler(courseId);
      setUpdateCart(prev => !prev);
      setCartUpdate?.(prev => !prev);
    },
    [setCartUpdate]
  );

  const handleAddToWishlist = useCallback(
    async (courseId: string | number) => {
      if (!user?.id) return;

      const response = await apiClient.post<{ wishlisted: boolean }>(
        "/user/student/me/wishlist",
        { courseId: String(courseId) }
      );

      if (!response.success || !response.data) return;

      setWishlistItems(prev => {
        const next = new Set(prev);
        if (response.data?.wishlisted) next.add(courseId);
        else next.delete(courseId);
        return next;
      });
    },
    [user?.id]
  );

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSortBy("popular");
    setFilteredQuery({
      category: "",
      level: "",
      language: "",
      rating: "",
      priceRange: [0, maxCoursePrice],
    });
  }, [maxCoursePrice]);

  const removeFilter = (field: "category" | "level" | "language" | "rating") => {
    setFilteredQuery(prev => ({ ...prev, [field]: "" }));
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filteredQuery.category !== "" ||
    filteredQuery.level !== "" ||
    filteredQuery.language !== "" ||
    filteredQuery.rating !== "" ||
    filteredQuery.priceRange[0] !== 0 ||
    filteredQuery.priceRange[1] !== maxCoursePrice;

  const activeFilterChips = [
    filteredQuery.category
      ? { key: "category" as const, label: filteredQuery.category }
      : null,
    filteredQuery.level
      ? {
          key: "level" as const,
          label: filteredQuery.level.charAt(0) + filteredQuery.level.slice(1).toLowerCase(),
        }
      : null,
    filteredQuery.language
      ? {
          key: "language" as const,
          label: filteredQuery.language.charAt(0) + filteredQuery.language.slice(1).toLowerCase(),
        }
      : null,
    filteredQuery.rating
      ? { key: "rating" as const, label: `${filteredQuery.rating}+ rating` }
      : null,
  ].filter(Boolean) as Array<{
    key: "category" | "level" | "language" | "rating";
    label: string;
  }>;

  return (
    <div className='min-h-screen bg-[#f6f8fb]'>
      <section className='relative overflow-hidden bg-[#073b70] text-white'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_32%)]' />
        <div className='relative mx-auto max-w-[1480px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20'>
          <div className='grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end'>
            <div className='max-w-3xl'>
              <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-orange-100 backdrop-blur-sm'>
                <Sparkles className='h-4 w-4 text-orange-400' />
                Learn from practical, instructor-led courses
              </div>
              <h1 className='text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl'>
                Explore courses built to move your skills forward
              </h1>
              <p className='mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base'>
                Search, compare and enroll in courses across AloSkill. Filter by category, level,
                language, rating and price to find the right course for your next goal.
              </p>

              <div className='mt-7 max-w-2xl'>
                <div className='relative'>
                  <Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400' />
                  <input
                    type='search'
                    placeholder='Search by course, category, instructor, level...'
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    className='h-14 w-full rounded-2xl border border-white/20 bg-white pl-12 pr-12 text-sm font-medium text-slate-900 shadow-xl shadow-slate-950/10 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 sm:text-base'
                  />
                  {searchQuery && (
                    <button
                      type='button'
                      onClick={() => setSearchQuery("")}
                      className='absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700'
                      aria-label='Clear search'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2'>
              {[
                { icon: BookOpen, value: pageStats.courses, label: "Courses" },
                { icon: Users, value: pageStats.students, label: "Enrollments" },
                { icon: Star, value: pageStats.reviews, label: "Reviews" },
                { icon: Filter, value: pageStats.categories, label: "Categories" },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className='min-w-[130px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm'
                  >
                    <Icon className='mb-3 h-5 w-5 text-orange-400' />
                    <div className='text-2xl font-bold'>{stat.value.toLocaleString()}</div>
                    <div className='mt-1 text-xs font-medium text-blue-100'>{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className='mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10'>
        <div className='grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]'>
          <aside className='hidden lg:block'>
            <div className='sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'>
              <div className='flex items-center justify-between border-b border-slate-100 px-5 py-5'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-orange-600'>
                    Refine results
                  </p>
                  <h2 className='mt-1 text-lg font-bold text-slate-900'>Filters</h2>
                </div>
                {hasActiveFilters && (
                  <button
                    type='button'
                    onClick={clearAllFilters}
                    className='text-xs font-semibold text-orange-600 transition hover:text-orange-700'
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className='max-h-[calc(100vh-150px)] overflow-y-auto px-4 pb-5'>
                <FilterSidebar
                  courses={initialCourses}
                  maxCoursePrice={maxCoursePrice}
                  filteredQuery={filteredQuery}
                  setFilteredQuery={setFilteredQuery}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  hasActiveFilters={hasActiveFilters}
                  clearAllFilters={clearAllFilters}
                  handleFilterChange={handleFilterChange}
                />
              </div>
            </div>
          </aside>

          <main className='min-w-0'>
            <div className='rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'>
              <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
                <div>
                  <p className='text-sm text-slate-500'>
                    Showing <span className='font-bold text-slate-900'>{filteredAndSortedCourses.length}</span>{" "}
                    of <span className='font-bold text-slate-900'>{initialCourses.length}</span> courses
                  </p>
                  <h2 className='mt-1 text-xl font-bold text-slate-900 sm:text-2xl'>All Courses</h2>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => setShowMobileFilters(true)}
                    className='inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 lg:hidden'
                  >
                    <SlidersHorizontal className='h-4 w-4' />
                    Filters
                  </button>

                  <div className='relative'>
                    <select
                      value={sortBy}
                      onChange={event => setSortBy(event.target.value)}
                      className='h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
                    >
                      {SORT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                  </div>

                  <div className='flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 p-1'>
                    <button
                      type='button'
                      onClick={() => setViewMode("grid")}
                      className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                        viewMode === "grid"
                          ? "bg-white text-orange-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      aria-label='Grid view'
                    >
                      <Grid className='h-4 w-4' />
                    </button>
                    <button
                      type='button'
                      onClick={() => setViewMode("list")}
                      className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                        viewMode === "list"
                          ? "bg-white text-orange-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      aria-label='List view'
                    >
                      <LayoutList className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              </div>

              {(activeFilterChips.length > 0 || filteredQuery.priceRange[0] !== 0 || filteredQuery.priceRange[1] !== maxCoursePrice) && (
                <div className='mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4'>
                  <span className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                    Active
                  </span>
                  {activeFilterChips.map(filter => (
                    <button
                      key={filter.key}
                      type='button'
                      onClick={() => removeFilter(filter.key)}
                      className='inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100'
                    >
                      {filter.label}
                      <X className='h-3.5 w-3.5' />
                    </button>
                  ))}
                  {(filteredQuery.priceRange[0] !== 0 || filteredQuery.priceRange[1] !== maxCoursePrice) && (
                    <button
                      type='button'
                      onClick={() =>
                        setFilteredQuery(prev => ({ ...prev, priceRange: [0, maxCoursePrice] }))
                      }
                      className='inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100'
                    >
                      ৳{filteredQuery.priceRange[0].toLocaleString()} – ৳
                      {filteredQuery.priceRange[1].toLocaleString()}
                      <X className='h-3.5 w-3.5' />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className='mt-6'>
              <CourseGrid
                courses={filteredAndSortedCourses}
                isLoading={false}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                cartItems={cartItems}
                wishlistItems={wishlistItems}
                emptyStateMessage='No courses match these filters. Clear a filter or try another search.'
                user={user}
                viewMode={viewMode}
                onClearFilters={hasActiveFilters ? clearAllFilters : undefined}
              />
            </div>
          </main>
        </div>
      </div>

      {showMobileFilters && (
        <div className='fixed inset-0 z-[100] lg:hidden'>
          <button
            type='button'
            aria-label='Close filters'
            onClick={() => setShowMobileFilters(false)}
            className='absolute inset-0 bg-slate-950/55 backdrop-blur-sm'
          />
          <div className='absolute inset-y-0 right-0 w-[min(90vw,380px)] overflow-y-auto bg-white shadow-2xl'>
            <div className='sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.16em] text-orange-600'>
                  Find your course
                </p>
                <h2 className='text-lg font-bold text-slate-900'>Filters</h2>
              </div>
              <button
                type='button'
                onClick={() => setShowMobileFilters(false)}
                className='grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='px-4 pb-24'>
              <FilterSidebar
                courses={initialCourses}
                maxCoursePrice={maxCoursePrice}
                filteredQuery={filteredQuery}
                setFilteredQuery={setFilteredQuery}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                hasActiveFilters={hasActiveFilters}
                clearAllFilters={clearAllFilters}
                handleFilterChange={handleFilterChange}
              />
            </div>

            <div className='fixed bottom-0 right-0 flex w-[min(90vw,380px)] gap-3 border-t border-slate-100 bg-white p-4 shadow-[0_-10px_30px_rgba(15,23,42,0.08)]'>
              {hasActiveFilters && (
                <button
                  type='button'
                  onClick={clearAllFilters}
                  className='h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700'
                >
                  Reset
                </button>
              )}
              <button
                type='button'
                onClick={() => setShowMobileFilters(false)}
                className='h-11 flex-[1.4] rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700'
              >
                Show {filteredAndSortedCourses.length} courses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
