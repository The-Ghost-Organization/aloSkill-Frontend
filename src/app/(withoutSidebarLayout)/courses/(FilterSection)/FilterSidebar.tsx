import { useDebounce } from "@/hooks/useDebounce.ts";
import { Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourseType } from "../allCourses.types.ts";
import FilterSection from "./FilterSection.tsx";

interface FilterSidebarProps {
  courses: CourseType[];
  maxCoursePrice: number;
  expandedSections: Set<string>;
  toggleSection: (section: string) => void;
  filteredQuery: {
    category: string;
    level: string;
    language: string;
    rating: string;
    priceRange: number[];
  };
  setFilteredQuery: React.Dispatch<
    React.SetStateAction<{
      category: string;
      level: string;
      language: string;
      rating: string;
      priceRange: number[];
    }>
  >;
  hasActiveFilters?: boolean;
  clearAllFilters?: () => void;
  handleFilterChange: (
    fieldName: "category" | "level" | "language" | "rating" | "priceRange",
    value: string | number[]
  ) => void;
}

const RATINGS = [
  { value: "", label: "All Ratings" },
  { value: "4.5", label: "4.5 & up" },
  { value: "4.0", label: "4.0 & up" },
  { value: "3.5", label: "3.5 & up" },
  { value: "3.0", label: "3.0 & up" },
];

const humanize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase());

function FilterSidebar({
  courses,
  maxCoursePrice,
  expandedSections,
  toggleSection,
  filteredQuery,
  setFilteredQuery,
}: FilterSidebarProps) {
  const handleFilterChange = useCallback(
    (field: keyof typeof filteredQuery, value: string | number[]) => {
      setFilteredQuery(prev => ({ ...prev, [field]: value }));
    },
    [setFilteredQuery]
  );

  const [minPrice, setMinPrice] = useState<number>(filteredQuery.priceRange[0] ?? 0);
  const [maxPrice, setMaxPrice] = useState<number>(
    filteredQuery.priceRange[1] ?? maxCoursePrice
  );
  const debouncedMin = useDebounce(minPrice, 350);
  const debouncedMax = useDebounce(maxPrice, 350);

  useEffect(() => {
    setMinPrice(filteredQuery.priceRange[0] ?? 0);
    setMaxPrice(filteredQuery.priceRange[1] ?? maxCoursePrice);
  }, [filteredQuery.priceRange, maxCoursePrice]);

  useEffect(() => {
    const safeMin = Math.max(0, Math.min(Number(debouncedMin) || 0, maxCoursePrice));
    const safeMax = Math.max(safeMin, Math.min(Number(debouncedMax) || 0, maxCoursePrice));

    if (
      safeMin !== filteredQuery.priceRange[0] ||
      safeMax !== filteredQuery.priceRange[1]
    ) {
      handleFilterChange("priceRange", [safeMin, safeMax]);
    }
  }, [debouncedMax, debouncedMin, filteredQuery.priceRange, handleFilterChange, maxCoursePrice]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach(course => {
      if (!course.category?.name) return;
      counts.set(course.category.name, (counts.get(course.category.name) ?? 0) + 1);
    });

    return [...counts.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [courses]);

  const levels = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach(course => {
      if (!course.level) return;
      counts.set(course.level, (counts.get(course.level) ?? 0) + 1);
    });

    return [...counts.entries()]
      .map(([value, count]) => ({ value, label: humanize(value), count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [courses]);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach(course => {
      if (!course.language) return;
      counts.set(course.language, (counts.get(course.language) ?? 0) + 1);
    });

    return [...counts.entries()]
      .map(([value, count]) => ({ value, label: humanize(value), count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [courses]);

  const optionClass =
    "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-orange-50";

  return (
    <div className='space-y-1 pt-4'>
      <FilterSection
        title='Category'
        isExpanded={expandedSections.has("category")}
        onToggle={() => toggleSection("category")}
      >
        <div className='space-y-1 py-2'>
          <label className={optionClass}>
            <div className='flex min-w-0 items-center gap-3'>
              <input
                type='radio'
                name='category'
                value=''
                checked={filteredQuery.category === ""}
                onChange={event => handleFilterChange("category", event.target.value)}
                className='h-4 w-4 shrink-0 accent-orange-600'
              />
              <span className='truncate text-sm font-medium text-slate-700'>All Categories</span>
            </div>
            <span className='rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'>
              {courses.length}
            </span>
          </label>

          {categories.map(category => (
            <label key={category.value} className={optionClass}>
              <div className='flex min-w-0 items-center gap-3'>
                <input
                  type='radio'
                  name='category'
                  value={category.value}
                  checked={filteredQuery.category === category.value}
                  onChange={event => handleFilterChange("category", event.target.value)}
                  className='h-4 w-4 shrink-0 accent-orange-600'
                />
                <span className='truncate text-sm font-medium text-slate-700'>{category.label}</span>
              </div>
              <span className='rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'>
                {category.count}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title='Rating'
        isExpanded={expandedSections.has("rating")}
        onToggle={() => toggleSection("rating")}
      >
        <div className='space-y-1 py-2'>
          {RATINGS.map(rating => {
            const ratingCount = rating.value
              ? courses.filter(course => Number(course.ratingAverage ?? 0) >= Number(rating.value)).length
              : courses.length;

            return (
              <label key={rating.value} className={optionClass}>
                <div className='flex items-center gap-3'>
                  <input
                    type='radio'
                    name='rating'
                    value={rating.value}
                    checked={filteredQuery.rating === rating.value}
                    onChange={event => handleFilterChange("rating", event.target.value)}
                    className='h-4 w-4 shrink-0 accent-orange-600'
                  />
                  <div className='flex items-center gap-2'>
                    {rating.value && (
                      <div className='flex items-center gap-0.5'>
                        {[0, 1, 2, 3, 4].map(star => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star < Math.floor(Number(rating.value))
                                ? "fill-orange-400 text-orange-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <span className='text-sm font-medium text-slate-700'>{rating.label}</span>
                  </div>
                </div>
                <span className='rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'>
                  {ratingCount}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection
        title='Level'
        isExpanded={expandedSections.has("level")}
        onToggle={() => toggleSection("level")}
      >
        <div className='space-y-1 py-2'>
          <label className={optionClass}>
            <div className='flex items-center gap-3'>
              <input
                type='radio'
                name='level'
                value=''
                checked={filteredQuery.level === ""}
                onChange={event => handleFilterChange("level", event.target.value)}
                className='h-4 w-4 accent-orange-600'
              />
              <span className='text-sm font-medium text-slate-700'>All Levels</span>
            </div>
            <span className='rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'>
              {courses.length}
            </span>
          </label>

          {levels.map(level => (
            <label key={level.value} className={optionClass}>
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  name='level'
                  value={level.value}
                  checked={filteredQuery.level === level.value}
                  onChange={event => handleFilterChange("level", event.target.value)}
                  className='h-4 w-4 accent-orange-600'
                />
                <span className='text-sm font-medium text-slate-700'>{level.label}</span>
              </div>
              <span className='rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'>
                {level.count}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title='Language'
        isExpanded={expandedSections.has("language")}
        onToggle={() => toggleSection("language")}
      >
        <div className='space-y-1 py-2'>
          <label className={optionClass}>
            <div className='flex items-center gap-3'>
              <input
                type='radio'
                name='language'
                value=''
                checked={filteredQuery.language === ""}
                onChange={event => handleFilterChange("language", event.target.value)}
                className='h-4 w-4 accent-orange-600'
              />
              <span className='text-sm font-medium text-slate-700'>All Languages</span>
            </div>
            <span className='rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'>
              {courses.length}
            </span>
          </label>

          {languages.map(language => (
            <label key={language.value} className={optionClass}>
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  name='language'
                  value={language.value}
                  checked={filteredQuery.language === language.value}
                  onChange={event => handleFilterChange("language", event.target.value)}
                  className='h-4 w-4 accent-orange-600'
                />
                <span className='text-sm font-medium text-slate-700'>{language.label}</span>
              </div>
              <span className='rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500'>
                {language.count}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title='Price'
        isExpanded={expandedSections.has("price")}
        onToggle={() => toggleSection("price")}
      >
        <div className='space-y-4 px-2 py-3'>
          <div className='flex items-center justify-between text-xs font-semibold text-slate-500'>
            <span>৳0</span>
            <span>৳{maxCoursePrice.toLocaleString()}</span>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <label>
              <span className='mb-1.5 block text-xs font-semibold text-slate-500'>Minimum</span>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400'>
                  ৳
                </span>
                <input
                  type='number'
                  value={minPrice}
                  min={0}
                  max={maxCoursePrice}
                  onChange={event => setMinPrice(Number(event.target.value))}
                  className='h-11 w-full rounded-xl border border-slate-200 bg-white pl-7 pr-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
                />
              </div>
            </label>

            <label>
              <span className='mb-1.5 block text-xs font-semibold text-slate-500'>Maximum</span>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400'>
                  ৳
                </span>
                <input
                  type='number'
                  value={maxPrice}
                  min={0}
                  max={maxCoursePrice}
                  onChange={event => setMaxPrice(Number(event.target.value))}
                  className='h-11 w-full rounded-xl border border-slate-200 bg-white pl-7 pr-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
                />
              </div>
            </label>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}

export default FilterSidebar;
