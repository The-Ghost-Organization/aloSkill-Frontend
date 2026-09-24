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
    <div className='border-b border-slate-100 py-2 last:border-b-0'>
      <button
        type='button'
        onClick={onToggle}
        className='group flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50'
      >
        <h3 className='text-sm font-bold text-slate-800'>{title}</h3>
        <span
          className={`grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-orange-50 group-hover:text-orange-600 ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          <ChevronRight className='h-4 w-4' />
        </span>
      </button>
      {isExpanded && <div className='animate-in fade-in slide-in-from-top-1 duration-200'>{children}</div>}
    </div>
  );
}

export default FilterSection;
