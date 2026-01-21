"use client";
import CourseGrid from "@/components/grids/CourseGrid";
import { PageHeading } from "@/components/shared/PageHeading.tsx";
import { apiClient } from "@/lib/api/client.ts";
import { courseAddToCartHandler } from "@/lib/course/utils.tsx";
import { ChevronRight, Filter, Grid, LayoutList, Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

export default function AllCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuery, setFilteredQuery] = useState({
    category: "",
    level: "",
    language: "",
    rating: "",
    priceRange: [0, 10000],
  });
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [cartItems, setCartItems] = useState<{ courseId: string; quantity: number }[]>([]);
  const [updateCart, setUpdateCart] = useState<boolean>(false);
  const [wishlistItems, setWishlistItems] = useState<Set<string | number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["category", "rating", "level"])
  );

  const { setCartUpdate } = useSessionContext();

  useEffect(() => {
    const storedCartItems =
      courseDraftStorage.get<{ courseId: string; quantity: number }[]>() || [];
    setCartItems(storedCartItems);
  }, [updateCart]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleFilterChange = (fieldName: string, value: string) => {
    setFilteredQuery(prev => ({ ...prev, [fieldName]: value }));
  };
  // Filter and sort logic
  // const filteredAndSortedCourses = useMemo(() => {
  //   // let filtered = [...ALL_COURSES];

  //   // Search filter
  //   if (searchQuery) {
  //     filtered = filtered.filter(course =>
  //       course.title.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   }

  //   // Category filter
  //   if (selectedCategory !== "all") {
  //     filtered = filtered.filter(
  //       course =>
  //         course.category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") === selectedCategory
  //     );
  //   }

  //   // Level filter
  //   if (selectedLevel !== "all") {
  //     filtered = filtered.filter(course => course.level?.toLowerCase() === selectedLevel);
  //   }

  //   // Language filter
  //   if (selectedLanguage !== "all") {
  //     filtered = filtered.filter(course => course.language?.toLowerCase() === selectedLanguage);
  //   }

  //   // Rating filter
  //   if (selectedRating !== "all") {
  //     const minRating = parseFloat(selectedRating);
  //     filtered = filtered.filter(course => course.rating >= minRating);
  //   }

  //

  //   // Price range filter
  //   filtered = filtered.filter(
  //     course => course.price >= (priceRange?.[0] ?? 0) && course.price <= (priceRange?.[1] ?? 100)
  //   );

  //   // Sort
  //   switch (sortBy) {
  //     case "rating":
  //       filtered.sort((a, b) => b.rating - a.rating);
  //       break;
  //     case "price-low":
  //       filtered.sort((a, b) => a.price - b.price);
  //       break;
  //     case "price-high":
  //       filtered.sort((a, b) => b.price - a.price);
  //       break;
  //     case "newest":
  //       filtered.sort((a, b) => Number(b.id) - Number(a.id));
  //       break;
  //     default:
  //       // Popular - by review count
  //       break;
  //   }

  //   return filtered;
  // }, [
  //   searchQuery,
  //   selectedCategory,
  //   selectedLevel,
  //   selectedLanguage,
  //   selectedRating,
  //   priceRange,
  //   sortBy,
  // ]);

  // Handlers

  const handleAddToCart = useCallback(
    (courseId: string) => {
      courseAddToCartHandler(courseId);
      setUpdateCart(prev => !prev);
      setCartUpdate?.(prev => !prev);
    },
    [setCartUpdate]
  );

  const handleAddToWishlist = useCallback(async (courseId: string | number) => {
    setWishlistItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
    await new Promise(resolve => setTimeout(resolve, 300));
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<CourseType[]>(
          `/course/public/allCourses?category=${filteredQuery.category}&level=${filteredQuery.level}&language=${filteredQuery.language}&rating=${filteredQuery.rating}&priceMin=${filteredQuery.priceRange[0]}&priceMax=${filteredQuery.priceRange[1]}`
        );
        // console.log(response);
        setCourses(response.data ?? []);
      } catch (_error) {
        // console.error("Failed to fetch popular courses", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [filteredQuery]);
  const clearAllFilters = () => {
    setSearchQuery("");
    setSortBy("popular");
    setFilteredQuery({
      category: "",
      level: "",
      language: "",
      rating: "",
      priceRange: [0, 10000],
    });
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    filteredQuery.category !== "all" ||
    filteredQuery.level !== "all" ||
    filteredQuery.language !== "all" ||
    filteredQuery.rating !== "all" ||
    filteredQuery.priceRange[0] !== 0 ||
    filteredQuery.priceRange[1] !== 10000;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30'>
      <div className='mx-auto max-w-[1920px] '>
        <PageHeading />

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className='lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 transition-all duration-200'
        >
          <SlidersHorizontal className='w-5 h-5' />
        </button>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div className='lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'>
            <div className='absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto'>
              <div className='sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between z-10'>
                <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                  <Filter className='w-5 h-5 text-orange-600' />
                  Filters
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className='p-2 hover:bg-gray-100 rounded-xl transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
              <FilterSidebar
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
        )}

        <div className='flex '>
          {/* Left Sidebar - Desktop */}
          <aside className='hidden lg:block w-72 xl:w-80 shrink-0 bg-white/80 backdrop-blur-sm border-r border-gray-100 h-screen sticky top-0 overflow-y-auto shadow-sm pl-4  '>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-100'>
                <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                  <div className='p-2 bg-orange-50 rounded-lg'>
                    <Filter className='w-5 h-5 text-orange-600' />
                  </div>
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className='text-sm text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-all'
                  >
                    Clear All
                  </button>
                )}
              </div>

              <FilterSidebar
                filteredQuery={filteredQuery}
                setFilteredQuery={setFilteredQuery}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                hasActiveFilters={hasActiveFilters}
                clearAllFilters={clearAllFilters}
                handleFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className='flex-1 min-w-0'>
            {/* Top Bar */}
            <div className='sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'>
              <div className='px-4 sm:px-6 lg:px-8 py-5'>
                {/* Search Bar */}
                <div className='mb-5'>
                  <div className='relative max-w-2xl'>
                    <div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'>
                      <Search className='w-5 h-5' />
                    </div>
                    <input
                      type='text'
                      placeholder='Search for courses...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='w-full pl-12 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 text-gray-900 placeholder-gray-400 transition-all shadow-sm hover:shadow-md'
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl border border-orange-100'>
                      {/* <span className='text-sm font-semibold text-orange-600'>
                        {filteredAndSortedCourses.length}
                      </span>
                      <span className='text-sm text-gray-600'>
                        {filteredAndSortedCourses.length === 1 ? "course" : "courses"} found
                      </span> */}
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    {/* Sort */}
                    <div className='relative'>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className='appearance-none px-5 py-2 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-sm bg-white font-medium text-gray-700 cursor-pointer transition-all shadow-sm hover:shadow-md'
                      >
                        {SORT_OPTIONS.map(option => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none' />
                    </div>

                    {/* View Mode */}
                    <div className='flex items-center gap-1 bg-gray-100 rounded-lg p-1 shadow-sm'>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === "grid"
                            ? "bg-white text-orange-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        aria-label='Grid view'
                      >
                        <Grid className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === "list"
                            ? "bg-white text-orange-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        aria-label='List view'
                      >
                        <LayoutList className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className='p-4'>
              <CourseGrid
                courses={courses}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                cartItems={cartItems}
                wishlistItems={wishlistItems}
                emptyStateMessage='No courses found. Try adjusting your filters.'
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Filter Sidebar Component

// Filter Section Component
