"use client";

import { apiClient } from "@/lib/api/client";
import {
  BookOpen,
  BookText,
  ChevronRight,
  GraduationCap,
  Heart,
  Loader2,
  type LucideIcon,
  PackageCheck,
  ShoppingBag,
  Truck,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DashboardData = {
  profile: {
    id: string;
    email: string;
    avatarUrl: string | null;
    displayName: string;
  };
  stats: {
    totalPurchases: number;
    coursesPurchased: number;
    booksPurchased: number;
    ebookPurchases: number;
    physicalBookPurchases: number;
    activeCourses: number;
    completedCourses: number;
    totalOrders: number;
    inTransitOrders: number;
    wishlistCount: number;
    totalSpent: number;
  };
  recentCourses: Array<{
    id: string;
    title: string;
    thumbnailUrl: string | null;
    instructorName: string;
    status: "ACTIVE" | "COMPLETED";
    progress: number;
    startedAt: string;
    completedAt: string | null;
  }>;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    courierTrackingCode: string | null;
    itemCount: number;
    orderItems: Array<{
      id: string;
      title: string;
      quantity: number;
      format: "PHYSICAL" | "DIGITAL";
    }>;
  }>;
};

type StatCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

const money = (value: number) =>
  `৳${Number(value || 0).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;

const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function StatCard({ label, value, helper, icon: Icon, tone }: StatCardProps) {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-sm font-medium text-gray-500'>{label}</p>
          <p className='mt-2 text-2xl font-bold tracking-tight text-gray-900'>{value}</p>
          <p className='mt-1 text-xs text-gray-400'>{helper}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${tone}`}>
          <Icon className='h-5 w-5' />
        </div>
      </div>
    </div>
  );
}

function orderTone(status: string) {
  if (["FAILED", "CANCELLED"].includes(status)) return "bg-red-50 text-red-700";
  if (status === "REFUNDED") return "bg-gray-100 text-gray-600";
  if (["DELIVERED", "PAID"].includes(status)) return "bg-emerald-50 text-emerald-700";
  return "bg-orange-50 text-orange-700";
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    const response = await apiClient.get<DashboardData>("/user/student/me/dashboard");
    
    if (!response.success || !response.data) {
      setError(response.message || "Unable to load dashboard data.");
      setLoading(false);
      return;
    }

    setData(response.data);
    setLoading(false);
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const purchaseBreakdown = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Active courses",
        value: data.stats.activeCourses,
        icon: BookOpen,
        className: "bg-blue-50 text-blue-700",
      },
      {
        label: "Completed courses",
        value: data.stats.completedCourses,
        icon: PackageCheck,
        className: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "eBooks",
        value: data.stats.ebookPurchases,
        icon: BookText,
        className: "bg-violet-50 text-violet-700",
      },
      {
        label: "Physical books",
        value: data.stats.physicalBookPurchases,
        icon: ShoppingBag,
        className: "bg-amber-50 text-amber-700",
      },
      {
        label: "Orders in transit",
        value: data.stats.inTransitOrders,
        icon: Truck,
        className: "bg-cyan-50 text-cyan-700",
      },
      {
        label: "Wishlist",
        value: data.stats.wishlistCount,
        icon: Heart,
        className: "bg-rose-50 text-rose-700",
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className='flex min-h-[420px] items-center justify-center rounded-xl bg-white'>
        <div className='flex items-center gap-2 text-sm font-medium text-gray-500'>
          <Loader2 className='h-5 w-5 animate-spin text-orange-500' /> Loading your dashboard...
        </div>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className='rounded-xl border border-red-100 bg-white p-8 text-center shadow-sm'>
        <h2 className='text-lg font-semibold text-gray-900'>Dashboard data is unavailable</h2>
        <p className='mx-auto mt-2 max-w-md text-sm text-gray-500'>
          {error || "We could not load your student data right now."}
        </p>
        <button
          type='button'
          onClick={() => void loadDashboard()}
          className='mt-5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'
        >
          Try again
        </button>
      </div>
    );
  }

  const stats = data.stats;

  return (
    <div className='space-y-6 pb-8'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-medium text-orange-600'>Student Dashboard</p>
          <h1 className='mt-1 text-2xl font-bold text-gray-900'>
            Welcome back, {data.profile.displayName}
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Your course learning, book purchases, orders and spending in one place.
          </p>
        </div>
        <Link
          href='/dashboard/student/purchase'
          className='inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700'
        >
          Purchase history <ChevronRight className='h-4 w-4' />
        </Link>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Total Purchases'
          value={stats.totalPurchases}
          helper={`${stats.coursesPurchased} courses + ${stats.booksPurchased} books`}
          icon={ShoppingBag}
          tone='bg-orange-50 text-orange-600'
        />
        <StatCard
          label='Courses Purchased'
          value={stats.coursesPurchased}
          helper={`${stats.activeCourses} active · ${stats.completedCourses} completed`}
          icon={GraduationCap}
          tone='bg-blue-50 text-blue-600'
        />
        <StatCard
          label='Books Purchased'
          value={stats.booksPurchased}
          helper={`${stats.ebookPurchases} eBooks · ${stats.physicalBookPurchases} physical`}
          icon={BookText}
          tone='bg-violet-50 text-violet-600'
        />
        <StatCard
          label='Total Order Value'
          value={money(stats.totalSpent)}
          helper={`${stats.totalOrders} successful orders`}
          icon={WalletCards}
          tone='bg-emerald-50 text-emerald-600'
        />
      </div>

      <section className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5'>
        <div className='mb-4 flex items-center justify-between gap-3'>
          <div>
            <h2 className='font-semibold text-gray-900'>Your activity</h2>
            <p className='mt-0.5 text-xs text-gray-500'>
              Live totals from your purchases and learning records.
            </p>
          </div>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
          {purchaseBreakdown.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className='rounded-lg border border-gray-100 bg-gray-50/70 p-3'
              >
                <div className={`mb-3 inline-flex rounded-lg p-2 ${item.className}`}>
                  <Icon className='h-4 w-4' />
                </div>
                <p className='text-xl font-bold text-gray-900'>{item.value}</p>
                <p className='mt-0.5 text-xs text-gray-500'>{item.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className='grid gap-6 xl:grid-cols-[1.35fr_1fr]'>
        <section className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
          <div className='flex items-center justify-between border-b border-gray-100 px-5 py-4'>
            <div>
              <h2 className='font-semibold text-gray-900'>Continue learning</h2>
              <p className='mt-0.5 text-xs text-gray-500'>
                Your latest purchased courses and progress.
              </p>
            </div>
            <Link
              href='/dashboard/student/courses'
              className='text-xs font-semibold text-orange-600 hover:text-orange-700'
            >
              View all
            </Link>
          </div>

          {data.recentCourses.length === 0 ? (
            <div className='px-5 py-10 text-center'>
              <GraduationCap className='mx-auto h-8 w-8 text-gray-300' />
              <p className='mt-3 text-sm font-medium text-gray-700'>No purchased courses yet</p>
              <Link
                href='/courses'
                className='mt-2 inline-block text-sm font-semibold text-orange-600'
              >
                Explore courses
              </Link>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {data.recentCourses.map(course => {
                const progress = Math.max(0, Math.min(100, Number(course.progress || 0)));
                return (
                  <div
                    key={course.id}
                    className='flex gap-4 px-5 py-4'
                  >
                    <div className='relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100'>
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          sizes='96px'
                          className='object-cover'
                          unoptimized={course.thumbnailUrl.startsWith("http")}
                        />
                      ) : (
                        <div className='flex h-full items-center justify-center text-gray-300'>
                          <GraduationCap className='h-6 w-6' />
                        </div>
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-semibold text-gray-900'>
                            {course.title}
                          </p>
                          <p className='mt-0.5 truncate text-xs text-gray-500'>
                            {course.instructorName}
                          </p>
                        </div>
                        <span className='shrink-0 text-xs font-semibold text-gray-600'>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100'>
                        <div
                          className='h-full rounded-full bg-orange-500'
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
          <div className='flex items-center justify-between border-b border-gray-100 px-5 py-4'>
            <div>
              <h2 className='font-semibold text-gray-900'>Recent purchases</h2>
              <p className='mt-0.5 text-xs text-gray-500'>Latest course and book orders.</p>
            </div>
            <Link
              href='/dashboard/student/purchase'
              className='text-xs font-semibold text-orange-600 hover:text-orange-700'
            >
              View all
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className='px-5 py-10 text-center'>
              <ShoppingBag className='mx-auto h-8 w-8 text-gray-300' />
              <p className='mt-3 text-sm font-medium text-gray-700'>No purchase history yet</p>
              <p className='mt-1 text-xs text-gray-400'>
                Your orders will appear here after checkout.
              </p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {data.recentOrders.map(order => (
                <Link
                  key={order.id}
                  href={`/dashboard/student/purchase/${order.id}`}
                  className='block px-5 py-4 transition hover:bg-gray-50'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold text-gray-900'>
                        {order.orderItems[0]?.title || `Order #${order.id.slice(0, 8)}`}
                        {order.itemCount > 1 ? ` +${order.itemCount - 1} more` : ""}
                      </p>
                      <p className='mt-1 text-xs text-gray-500'>{dateLabel(order.createdAt)}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${orderTone(order.status)}`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className='mt-3 flex items-center justify-between gap-3'>
                    <span className='text-xs text-gray-400'>
                      {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                    </span>
                    <span className='text-sm font-bold text-gray-900'>
                      {money(order.totalAmount)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
