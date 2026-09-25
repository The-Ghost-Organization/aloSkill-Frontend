"use client";

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
import type { AdminDashboardData } from "./dashboard.types";

const money = (value: number) =>
  `৳${Number(value).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;

const tooltipStyle = {
  background: "#0d1f3c",
  border: "1px solid #1a3158",
  borderRadius: 12,
  color: "#e8f0fe",
  fontSize: 12,
};

export default function DashboardCharts({ data }: { data: AdminDashboardData }) {
  const weeklyData = data.revenueTrend.map(item => ({
    ...item,
    label: new Date(`${item.week}T00:00:00`).toLocaleDateString("en-BD", {
      month: "short",
      day: "numeric",
    }),
  }));
  const revenueTotal = data.revenueSplit.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className='grid gap-4 xl:grid-cols-[1.7fr_1fr]'>
      <section className='rounded border border-[#1a3158] bg-[#0d1f3c] p-5 sm:p-6'>
        <div className='mb-6 flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-base font-bold text-slate-100'>Revenue momentum</h2>
            <p className='mt-1 text-xs uppercase tracking-wider text-slate-500'>
              Successful payments · last 12 weeks
            </p>
          </div>
          <div className='text-right'>
            <p className='text-xl font-bold text-emerald-400'>
              {money(data.overview.weeklyRevenue)}
            </p>
            <p className='text-xs text-slate-500'>Last 7 days</p>
          </div>
        </div>
        <div className='h-72 w-full'>
          <ResponsiveContainer
            width='100%'
            height='100%'
          >
            <AreaChart
              data={weeklyData}
              margin={{ left: -18, right: 8 }}
            >
              <defs>
                <linearGradient
                  id='revenueFill'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='0%'
                    stopColor='#4a9eff'
                    stopOpacity={0.35}
                  />
                  <stop
                    offset='100%'
                    stopColor='#4a9eff'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke='#1a3158'
                strokeDasharray='3 3'
                vertical={false}
              />
              <XAxis
                dataKey='label'
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#5f7899", fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#5f7899", fontSize: 10 }}
                tickFormatter={value =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  name === "Revenue" ? money(Number(value)) : value,
                  name,
                ]}
              />
              <Area
                type='monotone'
                dataKey='revenue'
                name='Revenue'
                stroke='#4a9eff'
                strokeWidth={2.5}
                fill='url(#revenueFill)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className='rounded border border-[#1a3158] bg-[#0d1f3c] p-5 sm:p-6'>
        <h2 className='text-base font-bold text-slate-100'>Product revenue</h2>
        <p className='mt-1 text-xs uppercase tracking-wider text-slate-500'>Books vs courses</p>
        <div className='relative h-48'>
          <ResponsiveContainer
            width='100%'
            height='100%'
          >
            <PieChart>
              <Pie
                data={data.revenueSplit}
                innerRadius={58}
                outerRadius={82}
                paddingAngle={4}
                dataKey='value'
              >
                <Cell fill='#4a9eff' />
                <Cell fill='#da7c36' />
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={value => money(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className='pointer-events-none absolute inset-0 grid place-content-center text-center'>
            <strong className='text-lg text-slate-100'>{money(revenueTotal)}</strong>
            <span className='text-[10px] uppercase tracking-wider text-slate-500'>
              Product sales
            </span>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          {data.revenueSplit.map((item, index) => (
            <div
              key={item.name}
              className='rounded border border-[#1a3158] bg-[#08162a] p-3'
            >
              <div className='flex items-center gap-2 text-xs text-slate-400'>
                <span
                  className='h-2 w-2 rounded-full'
                  style={{ background: index === 0 ? "#4a9eff" : "#da7c36" }}
                />
                {item.name}
              </div>
              <p className='mt-1 font-bold text-slate-100'>
                {revenueTotal ? ((item.value / revenueTotal) * 100).toFixed(1) : "0.0"}%
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className='rounded border border-[#1a3158] bg-[#0d1f3c] p-5 sm:p-6 xl:col-span-2'>
        <h2 className='text-base font-bold text-slate-100'>Revenue by payment provider</h2>
        <p className='mt-1 text-xs uppercase tracking-wider text-slate-500'>
          Successful purchase transactions
        </p>
        <div className='mt-5 h-56'>
          <ResponsiveContainer
            width='100%'
            height='100%'
          >
            <BarChart
              data={data.providerMix}
              margin={{ left: -18, right: 8 }}
            >
              <CartesianGrid
                stroke='#1a3158'
                strokeDasharray='3 3'
                vertical={false}
              />
              <XAxis
                dataKey='provider'
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#5f7899", fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#5f7899", fontSize: 10 }}
                tickFormatter={value =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                }
              />
              {/* <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  name === "Revenue" ? money(Number(value)) : value,
                  name,
                ]}
              /> */}
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{
                  fill: "#4a9eff",
                  fillOpacity: 0.08,
                }}
                formatter={(value, name) => [
                  name === "Revenue" ? money(Number(value)) : value,
                  name,
                ]}
              />
              <Bar
                dataKey='amount'
                name='Revenue'
                fill='#00c98d'
                radius={[6, 6, 0, 0]}
                maxBarSize={52}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
