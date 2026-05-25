import { Search, SlidersHorizontal } from "lucide-react";
import { memo } from "react";
import { PAYMENT_STATUS_CONFIG, PRODUCT_TYPE_CONFIG } from "../config";
import type { SortOrder } from "../types";

interface Props {
  search: string;
  typeFilter: string;
  statusFilter: string;
  sortOrder: SortOrder;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSortChange: (value: SortOrder) => void;
}

// Stable reference – derived from the registry so new types auto-appear as pills
const TYPE_OPTIONS = ["ALL", ...Object.keys(PRODUCT_TYPE_CONFIG)] as const;

const selectClass =
  "text-xs px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white text-gray-700 cursor-pointer";

const PurchaseControls = memo(
  ({
    search,
    typeFilter,
    statusFilter,
    sortOrder,
    onSearchChange,
    onTypeFilterChange,
    onStatusFilterChange,
    onSortChange,
  }: Props) => (
    <div className="px-5 py-4 border-b border-gray-100 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, order ID, or transaction ID…"
          aria-label="Search purchases"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />

        {/* Product type pills – auto-generated from PRODUCT_TYPE_CONFIG */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by product type">
          {TYPE_OPTIONS.map((type) => {
            const isAll = type === "ALL";
            const label = isAll ? "All" : (PRODUCT_TYPE_CONFIG[type]?.label ?? type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => onTypeFilterChange(type)}
                aria-pressed={typeFilter === type}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  typeFilter === type
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Status + sort dropdowns */}
        <div className="flex gap-2 ml-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            aria-label="Filter by payment status"
            className={selectClass}
          >
            <option value="ALL">All Status</option>
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as SortOrder)}
            aria-label="Sort order"
            className={selectClass}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  )
);
PurchaseControls.displayName = "PurchaseControls";

export default PurchaseControls;