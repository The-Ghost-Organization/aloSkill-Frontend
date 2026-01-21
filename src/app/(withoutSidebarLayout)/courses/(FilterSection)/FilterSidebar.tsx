import { useDebounce } from "@/hooks/useDebounce.ts";
import { Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import FilterSection from "./FilterSection.tsx";

interface FilterSidebarProps {
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
  handleFilterChange: (fieldName: string, value: string) => void;
}

// Filter options
const CATEGORIES = [
  { value: "", label: "All Categories", count: 125 },
  { value: "development", label: "Development", count: 45 },
  { value: "business", label: "Business", count: 32 },
  { value: "finance-accounting", label: "Finance & Accounting", count: 28 },
  { value: "technology", label: "Technology", count: 38 },
  { value: "javascript", label: "Javascript", count: 25 },
  { value: "marketing", label: "Marketing", count: 22 },
  { value: "health-fitness", label: "Health & Fitness", count: 18 },
];

const LEVELS = [
  { value: "", label: "All Levels", count: 125 },
  { value: "beginner", label: "Beginner", count: 55 },
  { value: "intermediate", label: "Intermediate", count: 42 },
  { value: "advanced", label: "Advanced", count: 28 },
];

const LANGUAGES = [
  { value: "", label: "All Languages", count: 125 },
  { value: "english", label: "English", count: 98 },
  { value: "bangla", label: "Bangla", count: 15 },
];

const RATINGS = [
  { value: "", label: "All Ratings" },
  { value: "4.5", label: "4.5 & up" },
  { value: "4.0", label: "4.0 & up" },
  { value: "3.5", label: "3.5 & up" },
  { value: "3.0", label: "3.0 & up" },
];
function FilterSidebar({
  expandedSections,
  toggleSection,
  filteredQuery,
  setFilteredQuery,
}: FilterSidebarProps) {
  const handleFilterChange = useCallback(
    (field: keyof typeof filteredQuery, value: string | number | number[]) => {
      setFilteredQuery(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    [setFilteredQuery]
  );

  const [minPrice, setMinPrice] = useState<number>(filteredQuery.priceRange[0] ?? 0);
  const [maxPrice, setMaxPrice] = useState<number>(filteredQuery.priceRange[1] ?? 100000);
  const debouncedMin = useDebounce(minPrice, 400);
  const debouncedMax = useDebounce(maxPrice, 400);

  useEffect(() => {
    handleFilterChange("priceRange", [debouncedMin, debouncedMax]);
  }, [handleFilterChange, debouncedMin, debouncedMax]);

  return (
    <div className='space-y-3'>
      {/* Category */}
      <FilterSection
        title='CATEGORY'
        isExpanded={expandedSections.has("category")}
        onToggle={() => toggleSection("category")}
      >
        <div className='space-y-1'>
          {CATEGORIES.map(cat => (
            <label
              key={cat.value}
              className='flex items-center justify-between px-3 py-1 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-lg cursor-pointer group transition-all'
            >
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  name='category'
                  value={cat.value}
                  checked={filteredQuery.category === cat.value}
                  onChange={e => handleFilterChange("category", e.target.value)}
                  className='w-4 h-4 accent-orange-600 border-gray-300 focus:ring-orange-500 focus:ring-2'
                />
                <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors'>
                  {cat.label}
                </span>
              </div>
              <span className='text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md'>
                {cat.count}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection
        title='RATING'
        isExpanded={expandedSections.has("rating")}
        onToggle={() => toggleSection("rating")}
      >
        <div className='space-y-1.5'>
          {RATINGS.map(rating => (
            <label
              key={rating.value}
              className='flex items-center gap-3 px-3 py-1  hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-xl cursor-pointer group transition-all'
            >
              <input
                type='radio'
                name='rating'
                value={rating.value}
                checked={filteredQuery.rating === rating.value}
                onChange={e => handleFilterChange("category", e.target.value)}
                className='w-4 h-4 accent-orange-600 focus:ring-orange-500 border-gray-300 focus:ring-2'
              />
              <div className='flex items-center gap-2'>
                {rating.value !== "all" && (
                  <div className='flex items-center gap-0.5'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(rating.value))
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors'>
                  {rating.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Level */}
      <FilterSection
        title='LEVEL'
        isExpanded={expandedSections.has("level")}
        onToggle={() => toggleSection("level")}
      >
        <div className='space-y-1.5'>
          {LEVELS.map(level => (
            <label
              key={level.value}
              className='flex items-center justify-between px-3 py-1  hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-xl cursor-pointer group transition-all'
            >
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  name='level'
                  value={level.value}
                  checked={filteredQuery.level === level.value}
                  onChange={e => handleFilterChange("category", e.target.value)}
                  className='w-4 h-4 accent-orange-600 border-gray-300 focus:ring-orange-500 focus:ring-2'
                />
                <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors'>
                  {level.label}
                </span>
              </div>
              <span className='text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md'>
                {level.count}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Language */}
      <FilterSection
        title='LANGUAGE'
        isExpanded={expandedSections.has("language")}
        onToggle={() => toggleSection("language")}
      >
        <div className='space-y-1.5'>
          {LANGUAGES.map(lang => (
            <label
              key={lang.value}
              className='flex items-center justify-between px-3 py-1  hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 rounded-xl cursor-pointer group transition-all'
            >
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  name='language'
                  value={lang.value}
                  checked={filteredQuery.language === lang.value}
                  onChange={e => handleFilterChange("category", e.target.value)}
                  className='w-4 h-4 accent-orange-600 focus:ring-orange-500 border-gray-300 focus:ring-2'
                />
                <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors'>
                  {lang.label}
                </span>
              </div>
              <span className='text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md'>
                {lang.count}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title='PRICE'
        isExpanded={expandedSections.has("price")}
        onToggle={() => toggleSection("price")}
      >
        <div className='space-y-5'>
          <div className='flex items-center justify-between px-1'>
            <div className='flex flex-col'>
              <span className='text-xs text-gray-500 font-medium'>Min</span>
              <span className='text-lg font-bold text-gray-900'>${minPrice}</span>
            </div>
            <div className='h-px w-8 bg-gray-300'></div>
            <div className='flex flex-col items-end'>
              <span className='text-xs text-gray-500 font-medium'>Max</span>
              <span className='text-lg font-bold text-gray-900'>${maxPrice}</span>
            </div>
          </div>

          <div className='flex gap-3'>
            <div className='flex-1'>
              <label className='text-xs font-medium text-gray-600 mb-1.5 block'>Min Price</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium'>
                  $
                </span>
                <input
                  type='number'
                  value={minPrice}
                  onChange={e => setMinPrice(Number(e.target.value))}
                  className='w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-sm font-medium transition-all'
                  placeholder='0'
                />
              </div>
            </div>
            <div className='flex-1'>
              <label className='text-xs font-medium text-gray-600 mb-1.5 block'>Max Price</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium'>
                  $
                </span>
                <input
                  type='number'
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className='w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 text-sm font-medium transition-all'
                  placeholder='100'
                />
              </div>
            </div>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}
export default FilterSidebar;
