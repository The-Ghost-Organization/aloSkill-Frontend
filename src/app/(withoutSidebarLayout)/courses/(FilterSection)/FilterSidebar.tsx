"use client";

import { ChevronDown, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useMemo } from "react";
import type { CourseType } from "../allCourses.types.ts";

export interface CourseFilterState {
  category: string;
  level: string;
  language: string;
  rating: string;
  priceRange: number[];
}

interface FilterSidebarProps {
  courses: CourseType[];
  maxCoursePrice: number;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredQuery: CourseFilterState;
  setFilteredQuery: React.Dispatch<React.SetStateAction<CourseFilterState>>;
  resultCount: number;
  totalCount: number;
  clearAllFilters: () => void;
}

const humanize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className='mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400'>
      {children}
    </p>
  );
}

function Divider() {
  return <div className='my-5 h-px bg-gray-100' />;
}

export default function FilterSidebar({
  courses,
  maxCoursePrice,
  searchQuery,
  setSearchQuery,
  filteredQuery,
  setFilteredQuery,
  resultCount,
  totalCount,
  clearAllFilters,
}: FilterSidebarProps) {
  const update = (partial: Partial<CourseFilterState>) =>
    setFilteredQuery(prev => ({ ...prev, ...partial }));

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach(course => {
      const value = course.category?.name;
      if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [courses]);

  const levels = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach(course => {
      if (course.level) counts.set(course.level, (counts.get(course.level) ?? 0) + 1);
    });
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [courses]);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach(course => {
      if (course.language) counts.set(course.language, (counts.get(course.language) ?? 0) + 1);
    });
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [courses]);

  const activeCount = [
    searchQuery.trim() ? 1 : 0,
    filteredQuery.category ? 1 : 0,
    filteredQuery.level ? 1 : 0,
    filteredQuery.language ? 1 : 0,
    filteredQuery.rating ? 1 : 0,
    filteredQuery.priceRange[0] > 0 || filteredQuery.priceRange[1] < maxCoursePrice ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  const filterSelectClass =
    "w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-9 text-xs text-gray-900 outline-none transition-all duration-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100";

  return (
    <div className='w-full'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50'>
            <SlidersHorizontal className='h-3.5 w-3.5 text-amber-500' />
          </div>
          <span className='text-sm font-bold text-gray-900'>Filters</span>
          {activeCount > 0 && (
            <span className='flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-white'>
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type='button'
            onClick={clearAllFilters}
            className='flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-amber-500'
          >
            <X className='h-3 w-3' /> Clear all
          </button>
        )}
      </div>

      <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
        <SectionLabel>Search</SectionLabel>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder='Course or instructor...'
            className='w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-8 text-xs text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery("")}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600'
              aria-label='Clear search'
            >
              <X className='h-3 w-3' />
            </button>
          )}
        </div>

        <Divider />

        <SectionLabel>Category</SectionLabel>
        <div className='flex flex-wrap gap-1.5'>
          <button
            type='button'
            onClick={() => update({ category: "" })}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
              filteredQuery.category === ""
                ? "border-amber-400 bg-amber-400 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
            }`}
          >
            All ({courses.length})
          </button>
          {categories.map(([category, count]) => (
            <button
              key={category}
              type='button'
              onClick={() => update({ category })}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
                filteredQuery.category === category
                  ? "border-amber-400 bg-amber-400 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
              }`}
            >
              {category} ({count})
            </button>
          ))}
        </div>

        <Divider />

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1'>
          <div>
            <SectionLabel>Level</SectionLabel>
            <div className='relative'>
              <select
                value={filteredQuery.level}
                onChange={event => update({ level: event.target.value })}
                className={filterSelectClass}
              >
                <option value=''>All Levels</option>
                {levels.map(([level, count]) => (
                  <option key={level} value={level}>
                    {humanize(level)} ({count})
                  </option>
                ))}
              </select>
              <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400' />
            </div>
          </div>

          <div>
            <SectionLabel>Language</SectionLabel>
            <div className='relative'>
              <select
                value={filteredQuery.language}
                onChange={event => update({ language: event.target.value })}
                className={filterSelectClass}
              >
                <option value=''>All Languages</option>
                {languages.map(([language, count]) => (
                  <option key={language} value={language}>
                    {humanize(language)} ({count})
                  </option>
                ))}
              </select>
              <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400' />
            </div>
          </div>
        </div>

        <Divider />

        <SectionLabel>Price Range</SectionLabel>
        <div className='mb-3 flex items-end gap-2'>
          <div className='flex-1'>
            <label className='mb-1 block text-[10px] text-gray-400'>Min</label>
            <div className='relative'>
              <span className='absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400'>৳</span>
              <input
                type='number'
                min={0}
                max={filteredQuery.priceRange[1]}
                value={filteredQuery.priceRange[0]}
                onChange={event => {
                  const value = Math.max(0, Math.min(Number(event.target.value) || 0, filteredQuery.priceRange[1]));
                  update({ priceRange: [value, filteredQuery.priceRange[1]] });
                }}
                className='w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-6 pr-2 text-xs text-gray-900 outline-none transition-all duration-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100'
              />
            </div>
          </div>
          <span className='mb-2 text-sm text-gray-300'>—</span>
          <div className='flex-1'>
            <label className='mb-1 block text-[10px] text-gray-400'>Max</label>
            <div className='relative'>
              <span className='absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400'>৳</span>
              <input
                type='number'
                min={filteredQuery.priceRange[0]}
                max={maxCoursePrice}
                value={filteredQuery.priceRange[1]}
                onChange={event => {
                  const value = Math.min(
                    maxCoursePrice,
                    Math.max(Number(event.target.value) || 0, filteredQuery.priceRange[0])
                  );
                  update({ priceRange: [filteredQuery.priceRange[0], value] });
                }}
                className='w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-6 pr-2 text-xs text-gray-900 outline-none transition-all duration-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100'
              />
            </div>
          </div>
        </div>
        <input
          type='range'
          min={0}
          max={maxCoursePrice}
          step={maxCoursePrice > 1000 ? 100 : 10}
          value={filteredQuery.priceRange[1]}
          onChange={event => {
            const value = Number(event.target.value);
            if (value >= filteredQuery.priceRange[0]) {
              update({ priceRange: [filteredQuery.priceRange[0], value] });
            }
          }}
          className='h-1.5 w-full cursor-pointer appearance-none rounded-full accent-amber-400'
        />
        <div className='mt-1 flex justify-between text-[10px] text-gray-400'>
          <span>৳0</span>
          <span>৳{maxCoursePrice.toLocaleString("en-BD")}</span>
        </div>

        <Divider />

        <SectionLabel>Minimum Rating</SectionLabel>
        <div className='grid grid-cols-4 gap-1.5'>
          {["", "3", "4", "4.5"].map(value => {
            const active = filteredQuery.rating === value;
            return (
              <button
                key={value || "all"}
                type='button'
                onClick={() => update({ rating: value })}
                className={`flex items-center justify-center gap-0.5 rounded-xl border py-2 text-[11px] font-medium transition-all duration-150 ${
                  active
                    ? "border-amber-400 bg-amber-400 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
                }`}
              >
                {value ? <Star className='h-2.5 w-2.5 fill-current' /> : null}
                {value || "All"}{value ? "+" : ""}
              </button>
            );
          })}
        </div>

        <Divider />

        <div className='flex items-center justify-between'>
          <p className='text-xs text-gray-500'>
            Showing <span className='font-bold text-amber-500'>{resultCount}</span> of {totalCount}
          </p>
          {resultCount === 0 && (
            <button
              type='button'
              onClick={clearAllFilters}
              className='text-xs text-amber-500 hover:underline hover:underline-offset-2'
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
