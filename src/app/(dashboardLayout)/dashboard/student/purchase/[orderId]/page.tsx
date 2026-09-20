"use client";

import { apiClient } from "@/lib/api/client";
import { ArrowLeft, Check, MapPin, PackageCheck, Phone, RefreshCw, Truck } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardState from "../../components/DashboardState";
import { orderStatusLabel, type OrderStatus, type StudentOrder } from "../../orders/types";

const trackingSteps: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Order placed" },
  { status: "CONFIRMED", label: "Order confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

const progressRank: Partial<Record<OrderStatus, number>> = {
  PENDING: 0,
  PAID: 1,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<StudentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshingTracking, setRefreshingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get<StudentOrder>(`/order/my-orders/${orderId}`);
      if (!response.success || !response.data) throw new Error("Order not found");
      setOrder(response.data);
    } catch {
      setError("This order could not be found or does not belong to your account.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const refreshTracking = async () => {
    setRefreshingTracking(true);
    setTrackingError("");
    try {
      const response = await apiClient.post<{
        trackingAvailable: boolean;
        courierStatus: string | null;
      }>(`/order/my-orders/${orderId}/refresh-tracking`, {});
      if (!response.success) throw new Error("Tracking refresh failed");
      await loadOrder();
    } catch {
      setTrackingError(
        "Live Steadfast tracking is temporarily unavailable. Please try again shortly."
      );
    } finally {
      setRefreshingTracking(false);
    }
  };

  const currentRank = useMemo(() => {
    if (!order) return 0;
    const itemRank = order.orderItems.reduce((rank, item) => {
      if (item.status === "DELIVERED") return Math.max(rank, 5);
      if (item.status === "SHIPPED") return Math.max(rank, 3);
      return rank;
    }, 0);
    return Math.max(progressRank[order.status] ?? 0, itemRank);
  }, [order]);

  if (loading)
    return (
      <DashboardState
        kind='loading'
        title='Loading order tracking'
        description='Getting the latest order and courier information.'
      />
    );
  if (error || !order)
    return (
      <DashboardState
        kind='error'
        title='Order tracking is unavailable'
        description={error}
        action={
          <Link
            href='/dashboard/student/purchase'
            className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'
          >
            Back to purchases
          </Link>
        }
      />
    );

  const cancelled = order.status === "CANCELLED" || order.status === "FAILED";
  const subtotal = Number(order.totalAmount) - Number(order.shippingCost);
  const courierItem = order.orderItems.find(item => item.trackingNumber || item.courierName);
  const courierName = order.courierName ?? courierItem?.courierName;
  const trackingCode = order.courierTrackingCode ?? courierItem?.trackingNumber;
  const courierStatus = order.courierStatus?.replaceAll("_", " ");

  return (
    <div className='space-y-5'>
      <Link
        href='/dashboard/student/purchase'
        className='inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600'
      >
        <ArrowLeft className='h-4 w-4' /> Purchases & Orders
      </Link>

      {searchParams.get("placed") === "true" && (
        <div className='flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800'>
          <PackageCheck className='h-5 w-5 shrink-0' />
          <div>
            <p className='font-semibold'>Your Cash on Delivery order has been placed.</p>
            <p className='mt-0.5 text-sm'>
              Pay ৳{Number(order.totalAmount).toFixed(2)} when the order arrives.
            </p>
          </div>
        </div>
      )}

      <section className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7'>
        <div className='flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <p className='text-sm text-gray-500'>Order</p>
            <h1 className='mt-1 break-all text-xl font-bold text-gray-900'>#{order.id}</h1>
            <p className='mt-2 text-sm text-gray-500'>Placed {formatDate(order.createdAt)}</p>
          </div>
          <div className='sm:text-right'>
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${cancelled ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"}`}
            >
              {orderStatusLabel[order.status]}
            </span>
            <p className='mt-2 text-sm font-medium text-gray-700'>
              {order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online Payment"}
            </p>
          </div>
        </div>

        {cancelled ? (
          <div className='mt-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700'>
            This order is {order.status.toLowerCase()}.
          </div>
        ) : (
          <ol className='mt-8 grid gap-0 sm:grid-cols-6'>
            {trackingSteps.map((step, index) => {
              const complete = index <= currentRank;
              return (
                <li
                  key={step.status}
                  className='relative flex gap-3 pb-6 sm:block sm:pb-0 sm:text-center'
                >
                  {index < trackingSteps.length - 1 && (
                    <span
                      className={`absolute left-3 top-6 h-full w-0.5 sm:left-1/2 sm:top-3 sm:h-0.5 sm:w-full ${index < currentRank ? "bg-orange-500" : "bg-gray-200"}`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 sm:mx-auto ${complete ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300 bg-white"}`}
                  >
                    {complete && <Check className='h-3.5 w-3.5' />}
                  </span>
                  <span
                    className={`text-sm sm:mt-3 sm:block ${complete ? "font-semibold text-gray-900" : "text-gray-400"}`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <div className='mt-8 rounded-xl border border-gray-100 bg-gray-50 p-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-400'>
                Courier shipment
              </p>
              <p className='mt-1 font-semibold text-gray-900'>
                {courierName ?? "Courier assignment pending"}
              </p>
              <p className='mt-1 break-all text-sm text-gray-600'>
                {trackingCode
                  ? `Tracking ID: ${trackingCode}`
                  : "Tracking ID will appear after the order is submitted to the courier."}
              </p>
            </div>
            <span className='inline-flex w-fit rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold capitalize text-orange-700'>
              {courierStatus ?? "awaiting courier update"}
            </span>
          </div>
          <div className='mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-xs text-gray-500'>
              Last checked: {formatDate(order.courierStatusUpdatedAt)}
            </p>
            <button
              type='button'
              onClick={() => void refreshTracking()}
              disabled={refreshingTracking || !trackingCode}
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <RefreshCw className={`h-4 w-4 ${refreshingTracking ? "animate-spin" : ""}`} />{" "}
              {refreshingTracking ? "Checking Steadfast…" : "Refresh live tracking"}
            </button>
          </div>
          {trackingError && (
            <p
              role='alert'
              className='mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700'
            >
              {trackingError}
            </p>
          )}
          {order.courierLastError && !trackingCode && (
            <p className='mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800'>
              Courier submission is still pending. Our team can retry it without recreating your
              order.
            </p>
          )}
        </div>
      </section>

      <div className='grid gap-5 lg:grid-cols-[1.4fr_0.8fr]'>
        <section className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6'>
          <h2 className='font-bold text-gray-900'>Order items</h2>
          <div className='mt-4 divide-y divide-gray-100'>
            {order.orderItems.map(item => (
              <div
                key={item.id}
                className='flex items-center justify-between gap-4 py-4'
              >
                <div className='min-w-0'>
                  <p className='truncate font-medium text-gray-900'>
                    {item.book?.title ?? item.course?.title ?? "Item"}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {item.format === "PHYSICAL" ? "Physical book" : item.book ? "E-book" : "Course"}{" "}
                    · Qty {item.quantity}
                  </p>
                </div>
                <p className='shrink-0 font-semibold text-gray-900'>
                  ৳{Number(item.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className='space-y-5'>
          <section className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
            <h2 className='font-bold text-gray-900'>Payment summary</h2>
            <dl className='mt-4 space-y-3 text-sm'>
              <div className='flex justify-between text-gray-600'>
                <dt>Subtotal</dt>
                <dd>৳{subtotal.toFixed(2)}</dd>
              </div>
              <div className='flex justify-between text-gray-600'>
                <dt>Shipping</dt>
                <dd>৳{Number(order.shippingCost).toFixed(2)}</dd>
              </div>
              <div className='flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900'>
                <dt>Total</dt>
                <dd className='text-orange-600'>৳{Number(order.totalAmount).toFixed(2)}</dd>
              </div>
            </dl>
          </section>
          {order.shippingAddress && (
            <section className='rounded-xl border border-gray-200 bg-white p-5 shadow-sm'>
              <h2 className='flex items-center gap-2 font-bold text-gray-900'>
                <MapPin className='h-4 w-4 text-orange-500' /> Delivery address
              </h2>
              <div className='mt-4 space-y-1 text-sm text-gray-600'>
                <p className='font-semibold text-gray-900'>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine}</p>
                <p>
                  {order.shippingAddress.city} {order.shippingAddress.postalCode}
                </p>
                <p className='flex items-center gap-2 pt-2'>
                  <Phone className='h-3.5 w-3.5' /> {order.shippingAddress.phone}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row'>
        <Link
          href='/dashboard/student/books'
          className='inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-600'
        >
          <Truck className='h-4 w-4' /> View my books
        </Link>
        <Link
          href='/books'
          className='inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
