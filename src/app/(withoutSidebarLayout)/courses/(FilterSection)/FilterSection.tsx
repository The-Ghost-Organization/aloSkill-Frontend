import { ChevronRight } from "lucide-react";

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  handleFilterChange?: (fieldName: string, value: string) => void;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className='border-b border-gray-100 pb-2 last:border-b-0'>
      <button
        onClick={onToggle}
        className='w-full flex items-center justify-between  p-2  hover:bg-gray-50 rounded-xl transition-all group'
      >
        <h3 className='text-sm font-bold text-gray-600 tracking-wider uppercase group-hover:text-gray-900 transition-colors'>
          {title}
        </h3>
        <div
          className={`p-1.5 bg-gray-100 rounded-lg group-hover:bg-orange-100 transition-all ${isExpanded ? "rotate-90" : ""}`}
        >
          <ChevronRight
            className={`w-3.5 h-3.5 text-gray-500 group-hover:text-orange-600 transition-all`}
          />
        </div>
      </button>
      {isExpanded && (
        <div className='animate-in fade-in slide-in-from-top-2 duration-200'>{children}</div>
      )}
    </div>
  );
}
export default FilterSection;
