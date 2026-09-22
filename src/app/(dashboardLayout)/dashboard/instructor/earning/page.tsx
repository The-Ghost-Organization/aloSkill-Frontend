import {
  ArrowDownToLine,
  BookOpen,
  CircleDollarSign,
  Clock3,
  CreditCard,
  GraduationCap,
  Landmark,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";

type EarningsData = {
  currency: string;
  instructorName: string;
  summary: {
    totalRevenue: number;
    availableBalance: number;
    totalWithdrawn: number;
    pendingPayout: number;
    todayRevenue: number;
    totalSales: number;
  };
  monthlyRevenue: { month: string; amount: number }[];
  topProducts: {
    id: string;
    title: string;
    type: "COURSE" | "BOOK";
    sales: number;
    revenue: number;
  }[];
  recentSales: {
    id: string;
    orderId: string;
    productId: string;
    productTitle: string;
    type: "COURSE" | "BOOK";
    amount: number;
    quantity: number;
    createdAt: string;
  }[];
  payouts: {
    id: string;
    amount: number;
    fee: number;
    currency: string;
    payoutDate: string;
    status: "PENDING" | "PAID" | "FAILED";
    failureReason?: string | null;
    rejectionReason?: string | null;
    createdAt: string;
  }[];
  payoutMethods: {
    id: string;
    type: string;
    bankName?: string | null;
    mobileBankingName?: string | null;
    accHolderName: string;
    accountNumber: string;
    branchName?: string | null;
    routingNumber?: string | null;
    isDefault: boolean;
  }[];
};

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const EarningsPage = async () => {
  const session = await getServerSession(authOptions);

  const fallbackData: EarningsData = {
    currency: "BDT",
    instructorName: session?.user?.name || "Instructor",

    summary: {
      totalRevenue: 0,
      availableBalance: 0,
      totalWithdrawn: 0,
      pendingPayout: 0,
      todayRevenue: 0,
      totalSales: 0,
    },

    monthlyRevenue: [
      { month: "May", amount: 0 },
      { month: "Jun", amount: 0 },
      { month: "Jul", amount: 0 },
      { month: "Aug", amount: 0 },
      { month: "Sep", amount: 0 },
      { month: "Oct", amount: 0 },
    ],

    topProducts: [],
    recentSales: [],
    payouts: [],
    payoutMethods: [],
  };

  let data: EarningsData = fallbackData;

  try {
    const response = await apiClient.get<EarningsData>("/course/instructor/earnings", {
      Authorization: `Bearer ${session?.accessToken}`,
    });

    if (response.success && response.data) {
      data = response.data;
    } else {
      console.error("Instructor earnings returned no data:", response);
    }
  } catch (error) {
    console.error("Failed to load instructor earnings:", error);
  }
  const maxMonthly = Math.max(...data.monthlyRevenue.map(item => item.amount), 1);

  const stats = [
    {
      label: "Gross Revenue",
      value: money(data.summary.totalRevenue, data.currency),
      description: `${data.summary.totalSales} paid item${data.summary.totalSales === 1 ? "" : "s"}`,
      icon: TrendingUp,
    },
    {
      label: "Available Balance",
      value: money(data.summary.availableBalance, data.currency),
      description: "After paid and pending payouts",
      icon: WalletCards,
    },
    {
      label: "Total Withdrawn",
      value: money(data.summary.totalWithdrawn, data.currency),
      description: "Completed payouts",
      icon: ArrowDownToLine,
    },
    {
      label: "Today's Revenue",
      value: money(data.summary.todayRevenue, data.currency),
      description:
        data.summary.pendingPayout > 0
          ? `${money(data.summary.pendingPayout, data.currency)} payout pending`
          : "No payout currently pending",
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className='space-y-5 pb-8'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.16em] text-orange-600'>
            Instructor Finance
          </p>
          <h1 className='mt-1 text-2xl font-bold tracking-tight text-slate-950'>Earnings</h1>
          <p className='mt-1 text-sm text-slate-500'>
            Revenue from paid orders for your courses and books.
          </p>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500'>
          Amounts are gross sales because an instructor commission rule is not defined in the
          current database schema.
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map(stat => (
          <div
            key={stat.label}
            className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm'
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-xs font-semibold text-slate-500'>{stat.label}</p>
                <p className='mt-2 text-2xl font-bold tracking-tight text-slate-950'>
                  {stat.value}
                </p>
                <p className='mt-1 text-xs text-slate-400'>{stat.description}</p>
              </div>
              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600'>
                <stat.icon className='h-5 w-5' />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
        <section className='rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-8'>
          <div className='border-b border-slate-100 p-5'>
            <h2 className='text-sm font-bold text-slate-900'>Revenue Overview</h2>
            <p className='mt-1 text-xs text-slate-500'>
              Paid sales during the last six calendar months
            </p>
          </div>
          <div className='p-5'>
            <div className='flex h-64 items-end gap-3 sm:gap-5'>
              {data.monthlyRevenue.map(item => {
                const height =
                  item.amount === 0 ? 4 : Math.max(10, (item.amount / maxMonthly) * 100);
                return (
                  <div
                    key={item.month}
                    className='flex h-full min-w-0 flex-1 flex-col justify-end'
                  >
                    <div className='mb-2 truncate text-center text-[10px] font-semibold text-slate-500 sm:text-xs'>
                      {item.amount > 0 ? money(item.amount, data.currency) : "—"}
                    </div>
                    <div className='flex h-[190px] items-end rounded-xl bg-slate-50 p-1.5'>
                      <div
                        className='w-full rounded-lg bg-orange-500 transition-all'
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className='mt-2 text-center text-xs font-medium text-slate-500'>
                      {item.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className='rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-4'>
          <div className='border-b border-slate-100 p-5'>
            <h2 className='text-sm font-bold text-slate-900'>Payout Methods</h2>
            <p className='mt-1 text-xs text-slate-500'>Saved withdrawal destinations</p>
          </div>
          <div className='space-y-3 p-4'>
            {data.payoutMethods.length === 0 ? (
              <div className='rounded-xl border border-dashed border-slate-200 p-6 text-center'>
                <CreditCard className='mx-auto h-8 w-8 text-slate-300' />
                <p className='mt-2 text-sm font-semibold text-slate-700'>No payout method</p>
                <p className='mt-1 text-xs text-slate-500'>
                  No bank or mobile wallet has been saved yet.
                </p>
              </div>
            ) : (
              data.payoutMethods.map(method => (
                <div
                  key={method.id}
                  className='rounded-xl border border-slate-200 p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600'>
                        {method.mobileBankingName ? (
                          <WalletCards className='h-5 w-5' />
                        ) : (
                          <Landmark className='h-5 w-5' />
                        )}
                      </div>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-bold text-slate-900'>
                          {method.mobileBankingName ||
                            method.bankName ||
                            method.type.replaceAll("_", " ")}
                        </p>
                        <p className='mt-0.5 text-xs text-slate-500'>{method.accountNumber}</p>
                        <p className='mt-0.5 truncate text-xs text-slate-400'>
                          {method.accHolderName}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className='rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700'>
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
        <section className='rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-5'>
          <div className='border-b border-slate-100 p-5'>
            <h2 className='text-sm font-bold text-slate-900'>Top Earning Content</h2>
            <p className='mt-1 text-xs text-slate-500'>
              Your courses and books ranked by paid revenue
            </p>
          </div>
          <div className='divide-y divide-slate-100'>
            {data.topProducts.length === 0 ? (
              <div className='p-8 text-center text-sm text-slate-500'>No paid sales yet.</div>
            ) : (
              data.topProducts.map(product => (
                <div
                  key={`${product.type}-${product.id}`}
                  className='flex items-center gap-3 p-4'
                >
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600'>
                    {product.type === "COURSE" ? (
                      <GraduationCap className='h-5 w-5' />
                    ) : (
                      <BookOpen className='h-5 w-5' />
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-slate-900'>{product.title}</p>
                    <p className='mt-0.5 text-xs text-slate-500'>
                      {product.type === "COURSE" ? "Course" : "Book"} · {product.sales} sale
                      {product.sales === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className='shrink-0 text-sm font-bold text-slate-900'>
                    {money(product.revenue, data.currency)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-7'>
          <div className='border-b border-slate-100 p-5'>
            <h2 className='text-sm font-bold text-slate-900'>Recent Sales</h2>
            <p className='mt-1 text-xs text-slate-500'>Latest paid course and book order items</p>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[680px] text-left'>
              <thead className='bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500'>
                <tr>
                  <th className='px-5 py-3 font-semibold'>Content</th>
                  <th className='px-5 py-3 font-semibold'>Date</th>
                  <th className='px-5 py-3 text-right font-semibold'>Amount</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {data.recentSales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className='px-5 py-10 text-center text-sm text-slate-500'
                    >
                      No paid sales yet.
                    </td>
                  </tr>
                ) : (
                  data.recentSales.map(sale => (
                    <tr key={sale.id}>
                      <td className='px-5 py-4'>
                        <p className='max-w-[260px] truncate text-sm font-semibold text-slate-900'>
                          {sale.productTitle}
                        </p>
                        <p className='mt-0.5 text-xs text-slate-400'>
                          {sale.type === "COURSE" ? "Course" : "Book"}
                          {sale.quantity > 1 ? ` · Qty ${sale.quantity}` : ""}
                        </p>
                      </td>
                      <td className='px-5 py-4 text-xs text-slate-500'>
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className='px-5 py-4 text-right text-sm font-bold text-slate-900'>
                        {money(sale.amount, data.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-slate-100 p-5'>
          <div>
            <h2 className='text-sm font-bold text-slate-900'>Payout History</h2>
            <p className='mt-1 text-xs text-slate-500'>Withdrawals recorded in AloSkill</p>
          </div>
          <ReceiptText className='h-5 w-5 text-slate-400' />
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[720px] text-left'>
            <thead className='bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500'>
              <tr>
                <th className='px-5 py-3 font-semibold'>Requested / Paid</th>
                <th className='px-5 py-3 font-semibold'>Status</th>
                <th className='px-5 py-3 font-semibold'>Fee</th>
                <th className='px-5 py-3 text-right font-semibold'>Amount</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {data.payouts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className='px-5 py-10 text-center text-sm text-slate-500'
                  >
                    No payout history yet.
                  </td>
                </tr>
              ) : (
                data.payouts.map(payout => {
                  const statusClass =
                    payout.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700"
                      : payout.status === "FAILED"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700";
                  return (
                    <tr key={payout.id}>
                      <td className='px-5 py-4 text-xs text-slate-500'>
                        {formatDate(payout.payoutDate || payout.createdAt)}
                      </td>
                      <td className='px-5 py-4'>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass}`}
                        >
                          <Clock3 className='h-3 w-3' />
                          {payout.status}
                        </span>
                      </td>
                      <td className='px-5 py-4 text-sm text-slate-600'>
                        {money(payout.fee, payout.currency)}
                      </td>
                      <td className='px-5 py-4 text-right text-sm font-bold text-slate-900'>
                        {money(payout.amount, payout.currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default EarningsPage;
