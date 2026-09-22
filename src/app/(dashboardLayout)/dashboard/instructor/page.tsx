import {
  BookOpen,
  Eye,
  GraduationCap,
  MessageSquare,
  ShoppingBag,
  Star,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import type { DashboardDataType } from "../../../(withoutSidebarLayout)/courses/allCourses.types";
import { apiClient } from "../../../../lib/api/client";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value ?? 0);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatRelativeTime = (value: string | Date) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
};

const EmptyState = ({ text }: { text: string }) => (
  <div className='flex min-h-44 items-center justify-center p-6 text-center'>
    <p className='max-w-xs text-sm text-slate-500'>{text}</p>
  </div>
);

const Dashboard = async () => {
  const session = await getServerSession(authOptions);

  const fallbackData = {
    profile: {
      name: session?.user?.name || "Instructor",
      avatarUrl: null,
      overallRating: 0,
      ratingCount: 0,
    },
    counters: {
      totalCourses: 0,
      totalStudents: 0,
      totalEnrolled: 0,
      totalRevenue: 0,
      totalViews: 0,
    },
    recentActivity: [],
    reviews: [],
    ratingDistribution: [
      { star: 5, count: 0, percentage: 0 },
      { star: 4, count: 0, percentage: 0 },
      { star: 3, count: 0, percentage: 0 },
      { star: 2, count: 0, percentage: 0 },
      { star: 1, count: 0, percentage: 0 },
    ],
    courseOverview: [],
  } as DashboardDataType;

  let data: DashboardDataType = fallbackData;

  try {
    const response = await apiClient.get<DashboardDataType>("/course/instructorDashboard", {
      Authorization: `Bearer ${session?.accessToken}`,
    });

    if (response.success && response.data) {
      data = response.data;
    } else {
      console.error("Instructor dashboard returned no data:", response);
    }
  } catch (error) {
    console.error("Failed to load instructor dashboard:", error);
  }

  const stats = [
    {
      label: "Total Courses",
      value: formatNumber(data.counters.totalCourses),
      icon: BookOpen,
      iconWrap: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      label: "Unique Students",
      value: formatNumber(data.counters.totalStudents),
      icon: Users,
      iconWrap: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      label: "Active Enrollments",
      value: formatNumber(data.counters.totalEnrolled),
      icon: UserCheck,
      iconWrap: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Gross Revenue",
      value: formatCurrency(data.counters.totalRevenue),
      icon: Wallet,
      iconWrap: "bg-sky-50",
      iconColor: "text-sky-600",
    },
  ];

  const activityIcon = {
    ENROLLMENT: GraduationCap,
    REVIEW: MessageSquare,
    PURCHASE: ShoppingBag,
  } as const;

  return (
    <div className='w-full space-y-6'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold tracking-tight text-slate-950'>
          Welcome back, {data.profile.name}
        </h1>
        <p className='text-sm text-slate-500'>
          Here&apos;s what&apos;s happening across your courses and sales.
        </p>
      </div>

      <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map(stat => (
          <div
            key={stat.label}
            className='group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconWrap}`}
            >
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div className='min-w-0'>
              <div className='truncate text-2xl font-bold tracking-tight text-slate-900'>
                {stat.value}
              </div>
              <div className='mt-0.5 text-xs font-medium text-slate-500'>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className='grid w-full grid-cols-1 gap-4 xl:grid-cols-12'>
        <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-4'>
          <div className='flex items-center justify-between border-b border-slate-100 p-5'>
            <div>
              <h2 className='text-sm font-bold text-slate-900'>Recent Activity</h2>
              <p className='mt-1 text-xs text-slate-500'>Latest student and sales activity</p>
            </div>
          </div>

          {data.recentActivity.length === 0 ? (
            <EmptyState text='No activity yet. New enrollments, reviews and purchases will appear here.' />
          ) : (
            <div className='max-h-[420px] divide-y divide-slate-100 overflow-y-auto'>
              {data.recentActivity.map(activity => {
                const Icon = activityIcon[activity.type];
                return (
                  <div
                    key={activity.id}
                    className='flex gap-3 p-4'
                  >
                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50'>
                      <Icon className='h-4 w-4 text-orange-600' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-semibold text-slate-800'>{activity.title}</p>
                      <p className='mt-0.5 truncate text-xs text-slate-500'>{activity.detail}</p>
                      <p className='mt-1 text-[11px] text-slate-400'>
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-5'>
          <div className='flex items-center justify-between border-b border-slate-100 p-5'>
            <div>
              <h2 className='text-sm font-bold text-slate-900'>Recent Reviews</h2>
              <p className='mt-1 text-xs text-slate-500'>Feedback from your students</p>
            </div>
          </div>

          {data.reviews.length === 0 ? (
            <EmptyState text='No course reviews yet. Student feedback will appear here.' />
          ) : (
            <div className='max-h-[420px] divide-y divide-slate-100 overflow-y-auto'>
              {data.reviews.map(review => (
                <div
                  key={review.id}
                  className='p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold text-slate-900'>
                        {review.userDisplayName}
                      </p>
                      <p className='truncate text-xs text-slate-500'>{review.courseTitle}</p>
                    </div>
                    <div className='flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700'>
                      <Star className='h-3.5 w-3.5 fill-current' />
                      {review.rating}
                    </div>
                  </div>
                  {(review.title || review.body) && (
                    <p className='mt-2 line-clamp-2 text-xs leading-5 text-slate-600'>
                      {review.title ? `${review.title}${review.body ? ": " : ""}` : ""}
                      {review.body}
                    </p>
                  )}
                  <p className='mt-2 text-[11px] text-slate-400'>
                    {formatRelativeTime(review.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-3'>
          <div className='border-b border-slate-100 p-5'>
            <h2 className='text-sm font-bold text-slate-900'>Course Performance</h2>
            <p className='mt-1 text-xs text-slate-500'>Combined public engagement</p>
          </div>

          <div className='space-y-5 p-5'>
            <div className='rounded-xl bg-slate-50 p-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm'>
                  <Eye className='h-5 w-5 text-slate-700' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-slate-950'>
                    {formatNumber(data.counters.totalViews)}
                  </p>
                  <p className='text-xs text-slate-500'>Total course views</p>
                </div>
              </div>
            </div>

            <div className='rounded-xl bg-orange-50 p-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm'>
                  <Star className='h-5 w-5 fill-orange-400 text-orange-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-slate-950'>
                    {data.profile.overallRating.toFixed(1)}
                  </p>
                  <p className='text-xs text-slate-500'>
                    {formatNumber(data.profile.ratingCount)} course reviews
                  </p>
                </div>
              </div>
            </div>

            <Link
              href='/dashboard/instructor/course'
              className='block rounded-xl border border-slate-200 px-4 py-3 text-center text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600'
            >
              Manage courses →
            </Link>
          </div>
        </section>
      </div>

      <div className='grid w-full grid-cols-1 gap-4 xl:grid-cols-12'>
        <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-5'>
          <div className='border-b border-slate-100 p-5'>
            <h2 className='text-sm font-bold text-slate-900'>Overall Course Ratings</h2>
            <p className='mt-1 text-xs text-slate-500'>
              Distribution across all your course reviews
            </p>
          </div>

          <div className='p-5'>
            <div className='mb-6 flex items-center gap-5 rounded-xl bg-orange-50 p-4'>
              <div className='text-4xl font-bold tracking-tight text-slate-950'>
                {data.profile.overallRating.toFixed(1)}
              </div>
              <div>
                <div className='flex gap-0.5'>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(data.profile.overallRating)
                          ? "fill-orange-400 text-orange-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <p className='mt-1 text-xs text-slate-500'>
                  Based on {formatNumber(data.profile.ratingCount)} reviews
                </p>
              </div>
            </div>

            <div className='space-y-3'>
              {data.ratingDistribution.map(item => (
                <div
                  key={item.star}
                  className='flex items-center gap-3'
                >
                  <div className='flex w-12 items-center gap-1 text-xs font-medium text-slate-600'>
                    {item.star}
                    <Star className='h-3.5 w-3.5 fill-orange-400 text-orange-400' />
                  </div>
                  <div className='h-2 flex-1 overflow-hidden rounded-full bg-slate-100'>
                    <div
                      className='h-full rounded-full bg-orange-400'
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className='w-12 text-right text-xs text-slate-500'>{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-7'>
          <div className='flex items-center justify-between border-b border-slate-100 p-5'>
            <div>
              <h2 className='text-sm font-bold text-slate-900'>Course Overview</h2>
              <p className='mt-1 text-xs text-slate-500'>Your best performing courses</p>
            </div>
            <Link
              href='/dashboard/instructor/course'
              className='text-xs font-semibold text-orange-600 hover:text-orange-700'
            >
              View all →
            </Link>
          </div>

          {data.courseOverview.length === 0 ? (
            <EmptyState text="You don't have any courses yet. Create your first course to see performance here." />
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[680px] text-left'>
                <thead className='border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500'>
                  <tr>
                    <th className='px-5 py-3 font-semibold'>Course</th>
                    <th className='px-4 py-3 font-semibold'>Students</th>
                    <th className='px-4 py-3 font-semibold'>Rating</th>
                    <th className='px-4 py-3 font-semibold'>Views</th>
                    <th className='px-4 py-3 font-semibold'>Revenue</th>
                    <th className='px-4 py-3 font-semibold'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {data.courseOverview.map(course => (
                    <tr
                      key={course.id}
                      className='text-sm text-slate-700'
                    >
                      <td className='px-5 py-4'>
                        <Link
                          href={`/dashboard/instructor/course/${course.id}`}
                          className='font-semibold text-slate-900 hover:text-orange-600'
                        >
                          {course.title}
                        </Link>
                      </td>
                      <td className='px-4 py-4'>{formatNumber(course.enrollmentCount)}</td>
                      <td className='px-4 py-4'>
                        <span className='inline-flex items-center gap-1'>
                          <Star className='h-3.5 w-3.5 fill-orange-400 text-orange-400' />
                          {course.ratingAverage.toFixed(1)}
                        </span>
                      </td>
                      <td className='px-4 py-4'>{formatNumber(course.views)}</td>
                      <td className='px-4 py-4 font-medium text-slate-900'>
                        {formatCurrency(course.revenue)}
                      </td>
                      <td className='px-4 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            course.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700"
                              : course.status === "DRAFT"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
