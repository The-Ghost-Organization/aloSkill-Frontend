import { ShoppingBag, TrendingDown, Wallet } from "lucide-react";
import { memo } from "react";
import type { SummaryStats } from "../types";
import { fmt } from "../utils";

interface Props {
  stats: SummaryStats;
}

// Defined outside the component so the array reference is stable across renders
const STAT_CARDS: Array<{
  key: keyof SummaryStats;
  label: string;
  Icon: React.ElementType;
  bg: string;
  fg: string;
  render: (v: number) => string;
}> = [
  {
    key: "totalOrders",
    label: "Total Orders",
    Icon: ShoppingBag,
    bg: "bg-blue-50",
    fg: "text-blue-600",
    render: (v) => String(v),
  },
  {
    key: "totalSpent",
    label: "Total Spent",
    Icon: Wallet,
    bg: "bg-orange-50",
    fg: "text-orange-600",
    render: fmt,
  },
  {
    key: "totalSaved",
    label: "Total Saved",
    Icon: TrendingDown,
    bg: "bg-green-50",
    fg: "text-green-600",
    render: fmt,
  },
];

const SummaryCards = memo(({ stats }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {STAT_CARDS.map(({ key, label, Icon, bg, fg, render }) => (
      <div
        key={key}
        className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg} ${fg}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-lg font-bold text-gray-900">{render(stats[key])}</p>
        </div>
      </div>
    ))}
  </div>
));
SummaryCards.displayName = "SummaryCards";

export default SummaryCards;