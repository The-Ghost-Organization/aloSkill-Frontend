import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const PurchasePagination = memo(
  ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: Props) => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <nav
        className='px-5 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3'
        aria-label='Pagination'
      >
        <p className='text-xs text-gray-500'>
          Showing{" "}
          <span className='font-semibold text-gray-700'>
            {start}–{end}
          </span>{" "}
          of <span className='font-semibold text-gray-700'>{totalItems}</span>
        </p>

        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label='Previous page'
            className='p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition'
          >
            <ChevronLeft
              className='w-4 h-4 text-gray-600'
              aria-hidden='true'
            />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              type='button'
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                currentPage === page
                  ? "bg-orange-600 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type='button'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label='Next page'
            className='p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition'
          >
            <ChevronRight
              className='w-4 h-4 text-gray-600'
              aria-hidden='true'
            />
          </button>
        </div>
      </nav>
    );
  }
);
PurchasePagination.displayName = "PurchasePagination";

export default PurchasePagination;
