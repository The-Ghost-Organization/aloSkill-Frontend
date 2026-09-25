"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "../../../lib/api/client";
import { courseAddToCartHandler } from "../../../lib/course/courseHelper.ts";
import { courseDraftStorage } from "../../../lib/storage/courseDraftStorage.ts";
import { useSessionContext } from "../../contexts/SessionContext.tsx";
import FilterSidebar, { type CourseFilterState } from "./(FilterSection)/FilterSidebar.tsx";
import type { CourseType } from "./allCourses.types.ts";
import CourseListingCard from "./CourseListingCard.tsx";

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

function Chip({
  label,
  amber = false,
  onRemove,
}: {
  label: string;
  amber?: boolean;
  onRemove: () => void;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
        amber
          ? "border-amber-200 bg-amber-50 text-amber-600"
          : "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {label}
      <button
        type='button'
        onClick={onRemove}
        className='transition-colors hover:text-gray-900'
        aria-label={`Remove ${label} filter`}
      >
        <X className='h-2.5 w-2.5' />
      </button>
    </span>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50'>
        <svg
          className='h-9 w-9 text-gray-300'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={1.5}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V5a2 2 0 00-2-2H6.5A2.5 2.5 0 004 5.5v14z'
          />
        </svg>
      </div>
      <h3 className='mb-2 text-xl font-bold text-gray-900'>No courses found</h3>
      <p className='mb-5 max-w-xs text-sm text-gray-500'>
        Your filters returned no results. Try broadening your search or removing some filters.
      </p>
      <button
        type='button'
        onClick={onReset}
        className='rounded-full border border-amber-200 px-5 py-2 text-sm font-semibold text-amber-500 transition-colors duration-200 hover:bg-amber-50'
      >
        Reset all filters
      </button>
    </div>
  );
}

export default function AllCoursesClientPage({ initialCourses }: ClientPageProps) {
  const maxCoursePrice = useMemo(() => {
    const highest = Math.max(0, ...initialCourses.map(getCoursePrice));
    if (highest <= 0) return 10000;
    return Math.ceil(highest / 500) * 500;
  }, [initialCourses]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuery, setFilteredQuery] = useState<CourseFilterState>({
    category: "",
    level: "",
    language: "",
    rating: "",
    priceRange: [0, maxCoursePrice],
  });
  const [sortBy, setSortBy] = useState("popular");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ courseId: string; quantity: number }[]>([]);
  const [updateCart, setUpdateCart] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Set<string | number>>(new Set());

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
    setFilteredQuery(prev => ({
      ...prev,
      priceRange: [
        Math.min(prev.priceRange[0], maxCoursePrice),
        prev.priceRange[1] === 10000 || prev.priceRange[1] > maxCoursePrice
          ? maxCoursePrice
          : prev.priceRange[1],
      ],
    }));
  }, [maxCoursePrice]);

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

    if (filteredQuery.category) {
      result = result.filter(course => course.category?.name === filteredQuery.category);
    }
    if (filteredQuery.level) {
      result = result.filter(course => course.level === filteredQuery.level);
    }
    if (filteredQuery.language) {
      result = result.filter(course => course.language === filteredQuery.language);
    }
    if (filteredQuery.rating) {
      const minimumRating = Number(filteredQuery.rating);
      result = result.filter(course => Number(course.ratingAverage ?? 0) >= minimumRating);
    }

    const minPrice = Number(filteredQuery.priceRange[0] ?? 0);
    const maxPrice = Number(filteredQuery.priceRange[1] ?? maxCoursePrice);
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

  const handleAddToCart = useCallback(
    (courseId: string) => {
      courseAddToCartHandler(courseId);
      setUpdateCart(prev => !prev);
      setCartUpdate?.(prev => !prev);
    },
    [setCartUpdate]
  );

  const handleAddToWishlist = useCallback(
    async (courseId: string) => {
      if (!user?.id) return;

      const response = await apiClient.post<{ wishlisted: boolean }>(
        "/user/student/me/wishlist",
        { courseId }
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
    setFilteredQuery({
      category: "",
      level: "",
      language: "",
      rating: "",
      priceRange: [0, maxCoursePrice],
    });
  }, [maxCoursePrice]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(filteredQuery.category) ||
    Boolean(filteredQuery.level) ||
    Boolean(filteredQuery.language) ||
    Boolean(filteredQuery.rating) ||
    filteredQuery.priceRange[0] > 0 ||
    filteredQuery.priceRange[1] < maxCoursePrice;

  return (
    <>
      <div className='border-b border-gray-100 bg-white'>
        <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8'>
          <p className='text-xs text-gray-500'>
            <span className='font-semibold text-gray-900'>{filteredAndSortedCourses.length}</span>{" "}
            {filteredAndSortedCourses.length === 1 ? "course" : "courses"} found
          </p>

          <div className='flex shrink-0 items-center gap-2'>
            <div className='relative hidden sm:block'>
              <select
                value={sortBy}
                onChange={event => setSortBy(event.target.value)}
                className='appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-gray-700 outline-none transition-colors hover:border-amber-300 focus:border-amber-300 focus:ring-2 focus:ring-amber-100'
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className='pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400' />
            </div>

            <button
              type='button'
              onClick={() => setMobileFilterOpen(value => !value)}
              className='flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors duration-200 hover:border-amber-300 lg:hidden'
            >
              <SlidersHorizontal className='h-3.5 w-3.5 text-amber-500' />
              Filters
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className='border-b border-gray-100'>
          <div className='mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8'>
            <span className='text-[10px] font-bold uppercase tracking-widest text-gray-400'>
              Active:
            </span>

            {searchQuery.trim() && <Chip label={`"${searchQuery.trim()}"`} onRemove={() => setSearchQuery("")} />}
            {filteredQuery.category && (
              <Chip
                label={filteredQuery.category}
                amber
                onRemove={() => setFilteredQuery(prev => ({ ...prev, category: "" }))}
              />
            )}
            {filteredQuery.level && (
              <Chip
                label={filteredQuery.level.charAt(0) + filteredQuery.level.slice(1).toLowerCase()}
                amber
                onRemove={() => setFilteredQuery(prev => ({ ...prev, level: "" }))}
              />
            )}
            {filteredQuery.language && (
              <Chip
                label={filteredQuery.language.charAt(0) + filteredQuery.language.slice(1).toLowerCase()}
                onRemove={() => setFilteredQuery(prev => ({ ...prev, language: "" }))}
              />
            )}
            {filteredQuery.rating && (
              <Chip
                label={`★ ${filteredQuery.rating}+`}
                amber
                onRemove={() => setFilteredQuery(prev => ({ ...prev, rating: "" }))}
              />
            )}
            {(filteredQuery.priceRange[0] > 0 || filteredQuery.priceRange[1] < maxCoursePrice) && (
              <Chip
                label={`৳${filteredQuery.priceRange[0].toLocaleString("en-BD")} – ৳${filteredQuery.priceRange[1].toLocaleString("en-BD")}`}
                amber
                onRemove={() =>
                  setFilteredQuery(prev => ({ ...prev, priceRange: [0, maxCoursePrice] }))
                }
              />
            )}

            <button
              type='button'
              onClick={clearAllFilters}
              className='ml-1 text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-amber-500'
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-start gap-8 lg:flex-row'>
          <div
            className={`w-full shrink-0 lg:sticky lg:top-36 lg:block lg:w-70 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto ${
              mobileFilterOpen ? "block" : "hidden"
            }`}
          >
            <FilterSidebar
              courses={initialCourses}
              maxCoursePrice={maxCoursePrice}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredQuery={filteredQuery}
              setFilteredQuery={setFilteredQuery}
              resultCount={filteredAndSortedCourses.length}
              totalCount={initialCourses.length}
              clearAllFilters={clearAllFilters}
            />

            <div className='mt-3 sm:hidden'>
              <div className='relative'>
                <select
                  value={sortBy}
                  onChange={event => setSortBy(event.target.value)}
                  className='w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-xs font-medium text-gray-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100'
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      Sort: {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400' />
              </div>
            </div>
          </div>

          <div className='min-w-0 flex-1'>
            {filteredAndSortedCourses.length === 0 ? (
              <EmptyState onReset={clearAllFilters} />
            ) : (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3'>
                {filteredAndSortedCourses.map((course, index) => {
                  const isEnrolled = Boolean(
                    user?.id && course.enrollments?.some(enrollment => enrollment.userId === user.id)
                  );

                  return (
                    <CourseListingCard
                      key={course.id}
                      course={course}
                      index={index}
                      isInCart={cartItems.some(item => item.courseId === course.id)}
                      isInWishlist={wishlistItems.has(course.id)}
                      isEnrolled={isEnrolled}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={user?.id ? handleAddToWishlist : undefined}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
