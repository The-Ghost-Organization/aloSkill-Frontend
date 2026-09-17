"use client";

import { apiClient } from "@/lib/api/client";
import { ArrowRight, Box, PackageSearch, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { orderStatusLabel, type StudentOrder } from "./types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get<StudentOrder[]>("/order/my-orders");
      if (!response.success || !response.data) throw new Error("Could not load orders");
      setOrders(response.data);
    } catch {
      setError("We could not load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className='space-y-5'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Orders</h1>
          <p className='mt-1 text-sm text-gray-500'>View order details and delivery progress.</p>
        </div>
        <button
          type='button'
          onClick={() => void loadOrders()}
          disabled={loading}
          className='inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50'
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map(item => <div key={item} className='h-32 animate-pulse rounded-xl bg-gray-100' />)}
        </div>
      ) : error ? (
        <div className='rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-700'>{error}</div>
      ) : orders.length === 0 ? (
        <div className='rounded-xl border border-gray-200 bg-white px-6 py-16 text-center'>
          <PackageSearch className='mx-auto h-12 w-12 text-gray-300' />
          <h2 className='mt-4 font-semibold text-gray-800'>No orders yet</h2>
          <p className='mt-1 text-sm text-gray-500'>Your completed checkout orders will appear here.</p>
          <Link href='/books' className='mt-5 inline-flex rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Browse books</Link>
        </div>
      ) : (
        <div className='space-y-3'>
          {orders.map(order => {
            const firstItem = order.orderItems[0];
            const title = firstItem?.book?.title ?? firstItem?.course?.title ?? "Order item";
            const extraItems = Math.max(0, order.orderItems.length - 1);
            return (
              <article key={order.id} className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex min-w-0 items-start gap-4'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500'><Box className='h-6 w-6' /></div>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h2 className='truncate font-semibold text-gray-900'>{title}</h2>
                        {extraItems > 0 && <span className='text-xs text-gray-500'>+{extraItems} more</span>}
                      </div>
                      <p className='mt-1 break-all text-xs text-gray-500'>Order #{order.id}</p>
                      <p className='mt-1 text-xs text-gray-500'>{formatDate(order.createdAt)} · {order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online Payment"}</p>
                    </div>
                  </div>
                  <div className='flex items-center justify-between gap-5 sm:justify-end'>
                    <div className='text-right'>
                      <span className='inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700'>{orderStatusLabel[order.status]}</span>
                      <p className='mt-2 font-bold text-gray-900'>৳{Number(order.totalAmount).toFixed(2)}</p>
                    </div>
                    <Link href={`/dashboard/student/orders/${order.id}`} aria-label={`Track order ${order.id}`} className='flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'><ArrowRight className='h-5 w-5' /></Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
