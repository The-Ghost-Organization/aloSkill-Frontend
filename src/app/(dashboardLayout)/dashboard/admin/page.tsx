import {
  Banknote,
  BookOpen,
  Boxes,
  CircleDollarSign,
  CircleGauge,
  Clock3,
  GraduationCap,
  PackageCheck,
  ReceiptText,
  RefreshCcw,
  ShoppingBag,
  Star,
  TrendingDown,
  TrendingUp,
  UserRoundCheck,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import DashboardCharts from "./DashboardCharts";
import { getAdminDashboardData } from "./action";
import type { ProductPerformance } from "./dashboard.types";

export const dynamic = "force-dynamic";

const money = (value: number) =>
  `৳ ${Number(value).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
const number = (value: number) => Number(value).toLocaleString("en-BD");
const percent = (value: number) => `${Number(value).toFixed(1)}%`;

const panel = "rounded border border-[#1a3158] bg-[#0d1f3c]";

function Trend({ value, label = "vs previous 7 days" }: { value: number; label?: string }) {
  const up = value >= 0;
  return (
    <div className='mt-3 flex items-center gap-1.5 text-[11px]'>
      <span
        className={`inline-flex items-center gap-1 font-semibold ${up ? "text-emerald-400" : "text-rose-400"}`}
      >
        {up ? <TrendingUp className='h-3.5 w-3.5' /> : <TrendingDown className='h-3.5 w-3.5' />}
        {up ? "+" : ""}
        {value.toFixed(1)}%
      </span>
      <span className='text-slate-600'>{label}</span>
    </div>
  );
}

function Kpi({
  label,
  value,
  detail,
  trend,
  icon,
  color,
}: {
  label: string;
  value: string;
  detail?: string;
  trend?: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`${panel} relative overflow-hidden px-5 py-3`}>
      <div
        className='absolute inset-x-0 bottom-0 h-0.5 opacity-70'
        style={{ background: color }}
      />
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500'>
            {label}
          </p>
          <p className='mt-1 text-2xl font-extrabold tracking-tight text-slate-100'>{value}</p>
        </div>
        <span
          className='grid h-10 w-10 shrink-0 place-items-center rounded'
          style={{ background: `${color}18`, color }}
        >
          {icon}
        </span>
      </div>
      {detail && <p className='mt-1 text-xs text-slate-500'>{detail}</p>}
      {trend !== undefined && <Trend value={trend} />}
    </div>
  );
}

function ProductList({
  title,
  subtitle,
  items,
  empty,
}: {
  title: string;
  subtitle: string;
  items: ProductPerformance[];
  empty: string;
}) {
  return (
    <section className={`${panel} p-5 sm:p-6`}>
      <div className='mb-5'>
        <h2 className='font-bold text-slate-100'>{title}</h2>
        <p className='mt-1 text-xs uppercase tracking-wider text-slate-500'>{subtitle}</p>
      </div>
      <div className='space-y-4'>
        {!items.length && (
          <p className='rounded border border-dashed border-[#284367] p-6 text-center text-sm text-slate-500'>
            {empty}
          </p>
        )}
        {items.map((item, index) => (
          <div
            key={item.id ?? `${title}-${index}`}
            className='grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3'
          >
            <span className='text-xs font-bold text-slate-600'>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className='min-w-0'>
              <p
                className='truncate text-sm font-semibold text-slate-200'
                title={item.name}
              >
                {item.name}
              </p>
              <p className='mt-0.5 truncate text-xs text-slate-500'>
                {item.owner} · {number(item.units)} sold
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm font-bold text-emerald-400'>{money(item.revenue)}</p>
              <p className='mt-0.5 text-xs text-amber-400'>★ {item.rating.toFixed(1)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  if (!data) {
    return (
      <div className='grid min-h-[60vh] place-items-center'>
        <div className={`${panel} max-w-lg p-8 text-center`}>
          <CircleGauge className='mx-auto h-10 w-10 text-orange-400' />
          <h1 className='mt-4 text-xl font-bold text-slate-100'></h1>
          <p className='mt-2 text-sm leading-6 text-slate-500'>
            The layout is ready, but the server could not retrieve the admin statistics. Refresh
            after checking the API connection and admin session.
          </p>
        </div>
      </div>
    );
  }

  const paymentTotal = data.paymentHealth.reduce((sum, item) => sum + item.count, 0);
  const orderTotal = data.orderHealth.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className='space-y-5'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400'>
            Admin command center
          </p>
          <h1 className='mt-2 text-2xl font-extrabold tracking-tight text-slate-100 sm:text-3xl'>
            Platform overview
          </h1>
          <p className='mt-1 text-sm text-slate-500'>
            Books, courses, customers, payments and operational health at a glance.
          </p>
        </div>
        <div className='flex items-center gap-2 text-xs text-slate-500'>
          <Clock3 className='h-4 w-4' />
          Updated{" "}
          {new Date(data.generatedAt).toLocaleString("en-BD", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      </header>

      <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <Kpi
          label='Gross revenue'
          value={money(data.overview.grossRevenue)}
          detail={`${number(data.finance.successfulPayments)} successful payments`}
          trend={data.overview.revenueTrend}
          icon={<CircleDollarSign className='h-5 w-5' />}
          color='#00d49a'
        />
        <Kpi
          label='Net cash position'
          value={money(data.overview.netCash)}
          detail={`After refunds, payouts and ${money(data.finance.providerFees)} fees`}
          icon={<Banknote className='h-5 w-5' />}
          color='#4a9eff'
        />
        <Kpi
          label='Units sold this week'
          value={number(data.overview.weeklySales)}
          detail={`${money(data.overview.weeklyRevenue)} collected`}
          trend={data.overview.salesTrend}
          icon={<ShoppingBag className='h-5 w-5' />}
          color='#da7c36'
        />
        <Kpi
          label='Average order value'
          value={money(data.overview.averageOrderValue)}
          detail={`${number(data.overview.orders)} orders overall`}
          icon={<ReceiptText className='h-5 w-5' />}
          color='#b47aff'
        />
      </section>

      <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <Kpi
          label='Students'
          value={number(data.overview.students)}
          detail='Registered student profiles'
          trend={data.overview.studentsTrend}
          icon={<Users className='h-5 w-5' />}
          color='#4a9eff'
        />
        <Kpi
          label='Approved instructors'
          value={number(data.overview.instructors)}
          detail={`${number(data.catalog.pendingInstructors)} waiting for approval`}
          icon={<UserRoundCheck className='h-5 w-5' />}
          color='#00d49a'
        />
        <Kpi
          label='Published courses'
          value={number(data.overview.courses)}
          detail={`${number(data.catalog.pendingCourses)} waiting for approval`}
          icon={<GraduationCap className='h-5 w-5' />}
          color='#b47aff'
        />
        <Kpi
          label='Approved books'
          value={number(data.overview.books)}
          detail={`${number(data.catalog.physicalStock)} physical units in stock`}
          icon={<BookOpen className='h-5 w-5' />}
          color='#da7c36'
        />
      </section>

      <DashboardCharts data={data} />

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <div className={`${panel} p-5`}>
          <div className='flex items-center justify-between'>
            <span className='text-xs uppercase tracking-wider text-slate-500'>Platform rating</span>
            <Star className='h-5 w-5 fill-amber-400 text-amber-400' />
          </div>
          <p className='mt-4 text-3xl font-extrabold text-slate-100'>
            {data.overview.platformRating.toFixed(1)}
            <span className='text-base text-slate-600'>/5</span>
          </p>
          <p className='mt-1 text-xs text-slate-500'>
            From {number(data.overview.reviewCount)} reviews
          </p>
        </div>
        <div className={`${panel} p-5`}>
          <div className='flex items-center justify-between'>
            <span className='text-xs uppercase tracking-wider text-slate-500'>
              Course completion
            </span>
            <PackageCheck className='h-5 w-5 text-blue-400' />
          </div>
          <p className='mt-4 text-3xl font-extrabold text-slate-100'>
            {percent(data.overview.completionRate)}
          </p>
          <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-[#08162a]'>
            <div
              className='h-full rounded-full bg-blue-500'
              style={{ width: `${Math.min(100, data.overview.completionRate)}%` }}
            />
          </div>
        </div>
        <div className={`${panel} p-5`}>
          <div className='flex items-center justify-between'>
            <span className='text-xs uppercase tracking-wider text-slate-500'>Refund rate</span>
            <RefreshCcw className='h-5 w-5 text-rose-400' />
          </div>
          <p className='mt-4 text-3xl font-extrabold text-slate-100'>
            {percent(data.overview.refundRate)}
          </p>
          <p className='mt-1 text-xs text-slate-500'>
            {money(data.overview.refunds)} refunded overall
          </p>
        </div>
        <div className={`${panel} p-5`}>
          <div className='flex items-center justify-between'>
            <span className='text-xs uppercase tracking-wider text-slate-500'>Pending payouts</span>
            <WalletCards className='h-5 w-5 text-violet-400' />
          </div>
          <p className='mt-4 text-3xl font-extrabold text-slate-100'>
            {money(data.finance.pendingPayoutAmount)}
          </p>
          <p className='mt-1 text-xs text-slate-500'>
            {number(data.finance.pendingPayoutCount)} payout requests
          </p>
        </div>
      </section>

      <section className='grid gap-4 xl:grid-cols-3'>
        <div className={`${panel} p-5 sm:p-6`}>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h2 className='font-bold text-slate-100'>Catalog attention</h2>
              <p className='mt-1 text-xs uppercase tracking-wider text-slate-500'>
                Items requiring action
              </p>
            </div>
            <Boxes className='h-5 w-5 text-orange-400' />
          </div>
          <div className='mt-5 grid grid-cols-3 gap-2 text-center'>
            <Link
              href='/dashboard/admin/books'
              className='rounded border border-rose-500/20 bg-rose-500/5 p-3 hover:bg-rose-500/10'
            >
              <strong className='block text-xl text-rose-400'>
                {data.catalog.outOfStockCount}
              </strong>
              <span className='mt-1 block text-[10px] uppercase text-slate-500'>Out</span>
            </Link>
            <Link
              href='/dashboard/admin/books'
              className='rounded border border-amber-500/20 bg-amber-500/5 p-3 hover:bg-amber-500/10'
            >
              <strong className='block text-xl text-amber-400'>{data.catalog.lowStockCount}</strong>
              <span className='mt-1 block text-[10px] uppercase text-slate-500'>Low</span>
            </Link>
            <Link
              href='/dashboard/admin/approvals'
              className='rounded border border-blue-500/20 bg-blue-500/5 p-3 hover:bg-blue-500/10'
            >
              <strong className='block text-xl text-blue-400'>
                {data.catalog.pendingApprovals}
              </strong>
              <span className='mt-1 block text-[10px] uppercase text-slate-500'>Approvals</span>
            </Link>
          </div>
          <div className='mt-4 space-y-2 text-xs text-slate-400'>
            <div className='flex justify-between'>
              <span>Books pending</span>
              <strong className='text-slate-200'>{data.catalog.pendingBooks}</strong>
            </div>
            <div className='flex justify-between'>
              <span>Courses pending</span>
              <strong className='text-slate-200'>{data.catalog.pendingCourses}</strong>
            </div>
            <div className='flex justify-between'>
              <span>Instructors pending</span>
              <strong className='text-slate-200'>{data.catalog.pendingInstructors}</strong>
            </div>
          </div>
        </div>

        <div className={`${panel} p-5 sm:p-6`}>
          <h2 className='font-bold text-slate-100'>Payment health</h2>
          <p className='mt-1 text-xs uppercase tracking-wider text-slate-500'>
            All transaction states
          </p>
          <div className='mt-5 space-y-3'>
            {data.paymentHealth.map(item => {
              const width = paymentTotal ? (item.count / paymentTotal) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className='mb-1 flex justify-between text-xs'>
                    <span className='text-slate-400'>{item.status}</span>
                    <span className='text-slate-200'>
                      {number(item.count)} · {money(item.amount)}
                    </span>
                  </div>
                  <div className='h-1.5 overflow-hidden rounded-full bg-[#08162a]'>
                    <div
                      className={`h-full rounded-full ${item.status === "SUCCEEDED" ? "bg-emerald-500" : item.status === "PENDING" ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${panel} p-5 sm:p-6`}>
          <h2 className='font-bold text-slate-100'>Order pipeline</h2>
          <p className='mt-1 text-xs uppercase tracking-wider text-slate-500'>
            Fulfilment distribution
          </p>
          <div className='mt-5 space-y-3'>
            {data.orderHealth.map(item => (
              <div
                key={item.status}
                className='flex items-center gap-3'
              >
                <div className='h-2 flex-1 overflow-hidden rounded-full bg-[#08162a]'>
                  <div
                    className='h-full rounded-full bg-blue-500'
                    style={{ width: `${orderTotal ? (item.count / orderTotal) * 100 : 0}%` }}
                  />
                </div>
                <span className='w-28 truncate text-xs text-slate-400'>{item.status}</span>
                <strong className='w-10 text-right text-xs text-slate-200'>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='grid gap-4 xl:grid-cols-2'>
        <ProductList
          title='Top-performing courses'
          subtitle='Ranked by paid revenue'
          items={data.topCourses}
          empty='No paid course sales yet.'
        />
        <ProductList
          title='Top-selling books'
          subtitle='Physical and digital combined'
          items={data.topBooks}
          empty='No paid book sales yet.'
        />
      </section>

      <section className={`${panel} overflow-hidden`}>
        <div className='flex items-center justify-between border-b border-[#1a3158] p-5 sm:px-6'>
          <div>
            <h2 className='font-bold text-slate-100'>Recent payment activity</h2>
            <p className='mt-1 text-xs uppercase tracking-wider text-slate-500'>
              Latest gateway transactions
            </p>
          </div>
          <Link
            href='/dashboard/admin/finance'
            className='text-xs font-semibold text-orange-400 hover:text-orange-300'
          >
            View finance →
          </Link>
        </div>
        <div className='divide-y divide-[#1a3158]'>
          {!data.recentTransactions.length && (
            <p className='p-8 text-center text-sm text-slate-500'>No payment transactions found.</p>
          )}
          {data.recentTransactions.map(item => (
            <div
              key={item.id}
              className='grid gap-3 px-4 py-2 sm:grid-cols-[minmax(0,1fr)_120px_110px_100px] sm:items-center sm:px-6'
            >
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold text-slate-200'>{item.customer}</p>
                <p className='mt-0.5 truncate text-xs text-slate-600'>
                  {item.reference ?? item.id}
                </p>
              </div>
              <div>
                <p className='text-xs font-semibold text-slate-300'>{item.provider}</p>
                <p className='text-[10px] text-slate-600'>{item.type ?? "TRANSACTION"}</p>
              </div>
              <p className='text-sm font-bold text-slate-100'>{money(item.amount)}</p>
              <div className='sm:text-right'>
                <span
                  className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${item.status === "SUCCEEDED" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : item.status === "PENDING" ? "border-amber-500/20 bg-amber-500/10 text-amber-400" : "border-rose-500/20 bg-rose-500/10 text-rose-400"}`}
                >
                  {item.status}
                </span>
                <p className='mt-1 text-[10px] text-slate-600'>
                  {new Date(item.createdAt).toLocaleDateString("en-BD")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
