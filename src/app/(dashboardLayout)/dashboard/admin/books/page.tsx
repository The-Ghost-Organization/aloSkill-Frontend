import { Plus } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "../Components";
import { BookHeaderActions } from "./BookComponents";
import BookInventoryTable from "./BookInventoryTable";
import BulkBookImportModal from "./BulkBookImportModal";
import { getBookData } from "./action";
import type { WeeklyBookMetrics } from "./books.types";

const currency = (amount: number) =>
  `৳ ${amount.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

function Trend({
  current,
  previous,
  values,
  previousValues,
}: {
  current: number;
  previous: number;
  values: number[];
  previousValues: number[];
}) {
  const delta = previous ? ((current - previous) / Math.abs(previous)) * 100 : null;
  const max = Math.max(1, ...values, ...previousValues);
  const points = (items: number[]) =>
    items.map((value, index) => `${index * 20},${31 - (value / max) * 27}`).join(" ");
  return (
    <div className='mt-3 flex items-center justify-between gap-2'>
      <span
        className={`text-[11px] font-semibold ${delta === null ? "text-slate-400" : delta >= 0 ? "text-emerald-400" : "text-red-400"}`}
      >
        {delta === null
          ? current
            ? "New this week"
            : "No previous sales"
          : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% vs last week`}
      </span>
      <svg
        viewBox='0 0 120 35'
        className='h-9 w-24 shrink-0'
        role='img'
        aria-label='Daily trend compared with last week'
      >
        <polyline
          fill='none'
          stroke='#64748b'
          strokeWidth='1.5'
          strokeDasharray='3 3'
          points={points(previousValues)}
        />
        <polyline
          fill='none'
          stroke={delta !== null && delta < 0 ? "#f87171" : "#34d399"}
          strokeWidth='2'
          points={points(values)}
        />
      </svg>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  current,
  previous,
  kind,
}: {
  label: string;
  value: string | number;
  color: string;
  current?: WeeklyBookMetrics;
  previous?: WeeklyBookMetrics;
  kind?: "units" | "sales" | "revenue";
}) {
  const dailyKey =
    kind === "units" ? "dailyUnits" : kind === "sales" ? "dailySales" : "dailyRevenue";
  return (
    <div className='min-w-0 rounded border border-slate-800 bg-slate-900 p-4'>
      <p
        className={`truncate font-['Syne'] text-xl font-bold ${color}`}
        title={String(value)}
      >
        {value}
      </p>
      <p className='mt-1 font-mono text-[10px] uppercase tracking-wide text-slate-500'>{label}</p>
      {kind && current && previous && (
        <Trend
          current={current[kind]}
          previous={previous[kind]}
          values={current[dailyKey]}
          previousValues={previous[dailyKey]}
        />
      )}
    </div>
  );
}

export default async function BooksPage() {
  const response = await getBookData();
  const data = response?.data;
  const books = data?.bookBreakdown ?? [];
  const current = data?.salesInsights?.thisWeek;
  const previous = data?.salesInsights?.previousWeek;

  return (
    <div className='animate-slide-up'>
      <SectionHeader
        title='Books & Products'
        sub='Paid book sales and physical inventory'
        action={
          <div className='flex flex-wrap items-center gap-2'>
            <BookHeaderActions />
            <BulkBookImportModal />
            <Link
              href='/dashboard/admin/books/upload-books'
              className="inline-flex items-center gap-1.5 rounded bg-linear-to-br from-orange to-orange-dark px-4 py-2.5 font-['Outfit'] text-[13px] font-semibold text-white"
            >
              <Plus size={14} /> Add Book
            </Link>
          </div>
        }
      />
      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <MetricCard
          label='Total Books'
          value={data?.totalBooks ?? 0}
          color='text-blue-400'
        />
        <MetricCard
          label='Physical Stock'
          value={data?.totalStock ?? 0}
          color='text-orange-400'
        />
        <MetricCard
          label='Units Sold This Week'
          value={current?.units ?? 0}
          color='text-emerald-400'
          current={current}
          previous={previous}
          kind='units'
        />
        <MetricCard
          label='Units Sold Overall'
          value={data?.totalSold ?? 0}
          color='text-emerald-400'
          current={current}
          previous={previous}
          kind='units'
        />
        <MetricCard
          label='Sales This Week'
          value={currency(current?.sales ?? 0)}
          color='text-cyan-400'
          current={current}
          previous={previous}
          kind='sales'
        />
        <MetricCard
          label='Sales Overall'
          value={currency(Number(data?.totalRevenue ?? 0))}
          color='text-cyan-400'
          current={current}
          previous={previous}
          kind='sales'
        />
        <MetricCard
          label='Revenue This Week'
          value={currency(current?.revenue ?? 0)}
          color='text-purple-400'
          current={current}
          previous={previous}
          kind='revenue'
        />
        <MetricCard
          label='Revenue Overall'
          value={currency(data?.totalProfit ?? 0)}
          color='text-purple-400'
          current={current}
          previous={previous}
          kind='revenue'
        />
      </div>
      <p className='mb-5 text-xs text-slate-500'>
        Sales = paid book item totals. Revenue = sales − purchase cost × units, before fees, tax and
        shipping. Weeks start Monday in Bangladesh time. Dashed line shows last week; paid orders
        are dated by order creation because the schema has no payment date.
      </p>
      <BookInventoryTable books={books} />
    </div>
  );
}
