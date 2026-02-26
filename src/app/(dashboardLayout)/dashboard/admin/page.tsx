"use client";

import { BookOpen, DollarSign, GraduationCap, RefreshCw, ShoppingBag, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip, KpiCard, SectionHeader } from "./Components";
import { categoryData, monthlyRevenue } from "./Data";

const topCourses = [
  {
    name: "Full-Stack Web Dev Bootcamp",
    instructor: "James Carter",
    enr: 1240,
    rev: "$24,800",
    rating: 4.9,
  },
  {
    name: "UI/UX Design Masterclass",
    instructor: "Sofia Lin",
    enr: 980,
    rev: "$18,600",
    rating: 4.8,
  },
  {
    name: "Python for Data Science",
    instructor: "Ravi Patel",
    enr: 870,
    rev: "$15,400",
    rating: 4.7,
  },
  {
    name: "Digital Marketing Pro",
    instructor: "Emma Walsh",
    enr: 760,
    rev: "$12,200",
    rating: 4.6,
  },
];

const pieData = [
  { name: "Courses", value: 72 },
  { name: "Books", value: 28 },
];

const kpis = [
  {
    label: "Total Students",
    value: "14,820",
    trend: "+12.4%",
    trendUp: true,
    icon: (
      <Users
        size={19}
        color='#4a9eff'
      />
    ),
    accentColor: "#4a9eff",
  },
  {
    label: "Total Instructors",
    value: "348",
    trend: "+5.2%",
    trendUp: true,
    icon: (
      <GraduationCap
        size={19}
        color='#00e5a0'
      />
    ),
    accentColor: "#00e5a0",
  },
  {
    label: "Total Courses",
    value: "1,204",
    trend: "+8.1%",
    trendUp: true,
    icon: (
      <BookOpen
        size={19}
        color='#da7c36'
      />
    ),
    accentColor: "#da7c36",
  },
  {
    label: "Total Revenue",
    value: "$462,800",
    trend: "+22.3%",
    trendUp: true,
    icon: (
      <DollarSign
        size={19}
        color='#b47aff'
      />
    ),
    accentColor: "#b47aff",
  },
  {
    label: "Total Orders",
    value: "28,540",
    trend: "+18.6%",
    trendUp: true,
    icon: (
      <ShoppingBag
        size={19}
        color='#ffc107'
      />
    ),
    accentColor: "#ffc107",
  },
  {
    label: "Refund Rate",
    value: "2.1%",
    trend: "-0.4%",
    trendUp: true,
    icon: (
      <RefreshCw
        size={19}
        color='#ff4757'
      />
    ),
    accentColor: "#ff4757",
  },
];

const cardStyle: React.CSSProperties = {
  background: "#0d1f3c",
  border: "1px solid #1a3158",
  borderRadius: 16,
  position: "relative",
  overflow: "hidden",
};

export default function AdminDashboardPage() {
  return (
    <div className='animate-fadeUp'>
      <SectionHeader
        title='Platform Overview'
        sub='Real-time KPIs and performance metrics'
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3.5 mb-6'>
        {kpis.map(k => (
          <KpiCard
            key={k.label}
            {...k}
          />
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-4'>
        <div
          style={cardStyle}
          className='p-6'
        >
          <div className='flex justify-between items-center mb-6'>
            <div>
              <div
                className='font-bold text-[15px]'
                style={{ fontFamily: "'Syne', sans-serif", color: "#e8f0fe" }}
              >
                Revenue &amp; Enrollment Trends
              </div>
              {/* metricLabel */}
              <div
                className='text-[11px] uppercase tracking-[1px] mt-0.75'
                style={{ fontFamily: "'DM Mono', monospace", color: "#3d5a80" }}
              >
                Last 7 months
              </div>
            </div>
            {/* select → custom styled */}
            <select
              className='text-[12px] rounded-[9px] outline-none cursor-pointer appearance-none transition-[border] duration-180'
              style={{
                background:
                  "#070f1e url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%233d5a80' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\") no-repeat right 12px center",
                border: "1px solid #1a3158",
                padding: "6px 28px 6px 10px",
                color: "#e8f0fe",
                fontFamily: "'Outfit', sans-serif",
                width: "auto",
              }}
            >
              <option>Last 7 Months</option>
              <option>Last Year</option>
            </select>
          </div>

          <ResponsiveContainer
            width='100%'
            height={220}
          >
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient
                  id='g1'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor='#4a9eff'
                    stopOpacity={0.25}
                  />
                  <stop
                    offset='100%'
                    stopColor='#4a9eff'
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id='g2'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor='#da7c36'
                    stopOpacity={0.25}
                  />
                  <stop
                    offset='100%'
                    stopColor='#da7c36'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#1a3158'
              />
              <XAxis
                dataKey='m'
                tick={{ fontSize: 11, fill: "#3d5a80", fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#3d5a80", fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type='monotone'
                dataKey='rev'
                stroke='#4a9eff'
                strokeWidth={2}
                fill='url(#g1)'
                name='Revenue'
              />
              <Area
                type='monotone'
                dataKey='enr'
                stroke='#da7c36'
                strokeWidth={2}
                fill='url(#g2)'
                name='Enrollments'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie / Stats Card */}
        <div
          style={cardStyle}
          className='p-6'
        >
          <div
            className='font-bold text-[15px] mb-1'
            style={{ fontFamily: "'Syne', sans-serif", color: "#e8f0fe" }}
          >
            Revenue Split
          </div>
          <div
            className='text-[11px] uppercase tracking-[1px] mb-4'
            style={{ fontFamily: "'DM Mono', monospace", color: "#3d5a80" }}
          >
            Courses vs Books
          </div>

          <ResponsiveContainer
            width='100%'
            height={140}
          >
            <PieChart>
              <Pie
                data={pieData}
                cx='50%'
                cy='50%'
                innerRadius={42}
                outerRadius={65}
                paddingAngle={4}
                dataKey='value'
              >
                <Cell fill='#4a9eff' />
                <Cell fill='#da7c36' />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0d1f3c",
                  border: "1px solid #1a3158",
                  borderRadius: 8,
                  color: "#e8f0fe",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className='flex gap-4 justify-center mt-2'>
            {pieData.map((d, i) => (
              <div
                key={d.name}
                className='flex items-center gap-2'
              >
                <div
                  className='w-2 h-2 rounded-xs'
                  style={{ background: i === 0 ? "#4a9eff" : "#da7c36" }}
                />
                <span
                  className='text-[12px]'
                  style={{ color: "#7a9cc4" }}
                >
                  {d.name} <strong style={{ color: "#e8f0fe" }}>{d.value}%</strong>
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            className='h-px my-4'
            style={{ background: "#1a3158" }}
          />

          {/* Mini stats */}
          {[
            { l: "Platform Rating", v: "4.8 ⭐" },
            { l: "Completion Rate", v: "68.4%" },
            { l: "Conversion Rate", v: "11.7%" },
          ].map(x => (
            <div
              key={x.l}
              className='flex justify-between mb-2'
            >
              <span
                className='text-[11px] uppercase tracking-[1px]'
                style={{ fontFamily: "'DM Mono', monospace", color: "#3d5a80" }}
              >
                {x.l}
              </span>
              <span
                className='text-[13px] font-semibold'
                style={{ color: "#e8f0fe" }}
              >
                {x.v}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        {/* Bar Chart Card */}
        <div
          style={cardStyle}
          className='p-6'
        >
          <div
            className='font-bold text-[15px] mb-1'
            style={{ fontFamily: "'Syne', sans-serif", color: "#e8f0fe" }}
          >
            Revenue by Category
          </div>
          <div
            className='text-[11px] uppercase tracking-[1px] mb-5'
            style={{ fontFamily: "'DM Mono', monospace", color: "#3d5a80" }}
          >
            This month
          </div>

          <ResponsiveContainer
            width='100%'
            height={180}
          >
            <BarChart
              data={categoryData}
              barSize={28}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#1a3158'
              />
              <XAxis
                dataKey='cat'
                tick={{ fontSize: 11, fill: "#3d5a80", fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#3d5a80", fontFamily: "'DM Mono', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='rev'
                fill='#da7c36'
                radius={[5, 5, 0, 0]}
                name='Revenue'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Courses Card */}
        <div
          style={cardStyle}
          className='p-6'
        >
          <div
            className='font-bold text-[15px] mb-5'
            style={{ fontFamily: "'Syne', sans-serif", color: "#e8f0fe" }}
          >
            Top Performing Courses
          </div>

          {topCourses.map((c, i) => (
            <div
              key={c.name}
              className='flex items-center gap-3 mb-4'
            >
              {/* Rank number — monoText */}
              <div
                className='text-right text-[11px] w-4'
                style={{ fontFamily: "'DM Mono', monospace", color: "#3d5a80" }}
              >
                0{i + 1}
              </div>

              {/* Course info */}
              <div className='flex-1 min-w-0'>
                <div
                  className='text-[13px] font-semibold truncate'
                  style={{ color: "#e8f0fe" }}
                >
                  {c.name}
                </div>
                <div
                  className='text-[11px]'
                  style={{ color: "#3d5a80" }}
                >
                  {c.instructor}
                </div>
              </div>

              {/* Revenue + rating */}
              <div className='text-right shrink-0'>
                <div
                  className='text-[13px] font-bold'
                  style={{ color: "#00e5a0" }}
                >
                  {c.rev}
                </div>
                <div
                  className='text-[11px]'
                  style={{ color: "#3d5a80" }}
                >
                  ⭐ {c.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
