"use client";

import { apiClient } from "@/lib/api/client";
import { Download, Eye, FileText, PackageSearch, RefreshCw, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardState from "../components/DashboardState";
import InvoiceModal from "./components/InvoiceModal";
import SummaryCards from "./components/SummaryCards";
import { openInvoiceForPrint } from "./invoice-generator";
import { orderItemType, orderStatusLabel, type OrderStatus, type SortOrder, type StudentOrder } from "./types";
import { fmt, fmtDate } from "./utils";

type ProductFilter = "ALL" | "COURSE" | "EBOOK" | "PHYSICAL_BOOK";
const productFilters: { value: ProductFilter; label: string }[] = [
  { value: "ALL", label: "All purchases" },
  { value: "COURSE", label: "Courses" },
  { value: "EBOOK", label: "eBooks" },
  { value: "PHYSICAL_BOOK", label: "Physical books" },
];

function matchesType(order: StudentOrder, filter: ProductFilter) {
  if (filter === "ALL") return true;
  return order.orderItems.some(item => {
    if (filter === "COURSE") return Boolean(item.course);
    if (filter === "PHYSICAL_BOOK") return Boolean(item.book) && item.format === "PHYSICAL";
    return Boolean(item.book) && item.format === "DIGITAL";
  });
}

function statusTone(status: OrderStatus) {
  if (["FAILED", "CANCELLED"].includes(status)) return "bg-red-50 text-red-700";
  if (status === "REFUNDED") return "bg-gray-100 text-gray-700";
  if (status === "DELIVERED" || status === "PAID") return "bg-green-50 text-green-700";
  return "bg-orange-50 text-orange-700";
}

export default function PurchaseHistoryPage() {
  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedInvoice, setSelectedInvoice] = useState<StudentOrder | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get<StudentOrder[]>("/order/my-orders");
      if (!response.success || !response.data) throw new Error("Could not load purchase history");
      setOrders(response.data);
    } catch {
      setError("We could not load your purchases and orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const stats = useMemo(() => ({
    totalOrders: orders.length,
    totalSpent: orders.filter(order => !["FAILED", "CANCELLED", "REFUNDED"].includes(order.status)).reduce((sum, order) => sum + Number(order.totalAmount), 0),
    inTransit: orders.filter(order => ["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status) && order.orderItems.some(item => item.format === "PHYSICAL")).length,
  }), [orders]);

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...orders]
      .filter(order => matchesType(order, typeFilter))
      .filter(order => statusFilter === "ALL" || order.status === statusFilter)
      .filter(order => !query || order.id.toLowerCase().includes(query) || order.providerOrderId?.toLowerCase().includes(query) || order.orderItems.some(item => (item.book?.title ?? item.course?.title ?? "").toLowerCase().includes(query) || item.trackingNumber?.toLowerCase().includes(query)))
      .sort((a, b) => sortOrder === "newest" ? +new Date(b.createdAt) - +new Date(a.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt));
  }, [orders, search, sortOrder, statusFilter, typeFilter]);

  if (loading) return <DashboardState kind='loading' title='Loading purchase history' description='Getting your courses, books, payments, and delivery updates.' />;
  if (error) return <DashboardState kind='error' title='Purchase history is unavailable' description={error} action={<button type='button' onClick={() => void loadOrders()} className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Try again</button>} />;

  return (
    <>
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} onDownload={() => openInvoiceForPrint(selectedInvoice)} />}
      <div className='space-y-5'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div><h1 className='text-2xl font-bold text-gray-900'>Purchases & Orders</h1><p className='mt-1 text-sm text-gray-500'>One place for payment history, invoices, and physical delivery tracking.</p></div>
          <button type='button' onClick={() => void loadOrders()} className='inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600'><RefreshCw className='h-4 w-4' /> Refresh</button>
        </div>

        <SummaryCards stats={stats} />

        {orders.length === 0 ? (
          <DashboardState kind='empty' icon={PackageSearch} title='No purchases yet' description='Courses, eBooks, and physical-book orders will appear here after checkout.' action={<Link href='/courses' className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>Explore courses</Link>} />
        ) : (
          <section className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
            <div className='space-y-4 border-b border-gray-100 p-4 sm:p-5'>
              <div className='relative'><Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' /><input type='search' value={search} onChange={event => setSearch(event.target.value)} placeholder='Search title, order ID, transaction ID, or tracking ID…' className='w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400' /></div>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                <div className='flex flex-wrap gap-2'>{productFilters.map(option => <button key={option.value} type='button' onClick={() => setTypeFilter(option.value)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${typeFilter === option.value ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}>{option.label}</button>)}</div>
                <div className='flex gap-2'><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as "ALL" | OrderStatus)} className='min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700'><option value='ALL'>All statuses</option>{Object.entries(orderStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={sortOrder} onChange={event => setSortOrder(event.target.value as SortOrder)} className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700'><option value='newest'>Newest first</option><option value='oldest'>Oldest first</option></select></div>
              </div>
            </div>

            {visibleOrders.length === 0 ? (
              <DashboardState kind='empty' title='No matching purchases' description='Try another search term or change the selected filters.' action={<button type='button' onClick={() => { setSearch(""); setTypeFilter("ALL"); setStatusFilter("ALL"); }} className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300'>Clear filters</button>} />
            ) : (
              <div className='divide-y divide-gray-100'>
                {visibleOrders.map(order => {
                  const physical = order.orderItems.some(item => item.format === "PHYSICAL");
                  return (
                    <article key={order.id} className='p-4 sm:p-5'>
                      <div className='flex flex-col gap-4 lg:flex-row lg:items-center'>
                        <div className='min-w-0 flex-1'>
                          <div className='flex flex-wrap items-center gap-2'><p className='break-all text-xs font-semibold text-gray-500'>#{order.id}</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(order.status)}`}>{orderStatusLabel[order.status]}</span></div>
                          <div className='mt-3 space-y-1.5'>{order.orderItems.map(item => <div key={item.id} className='flex items-start justify-between gap-3 text-sm'><div className='min-w-0'><p className='truncate font-semibold text-gray-900'>{item.book?.title ?? item.course?.title ?? "Order item"}</p><p className='text-xs text-gray-500'>{orderItemType(item)}{item.quantity > 1 ? ` · Qty ${item.quantity}` : ""}</p></div><span className='shrink-0 font-medium text-gray-700'>{fmt(Number(item.price) * item.quantity)}</span></div>)}</div>
                          <p className='mt-3 text-xs text-gray-500'>{fmtDate(order.createdAt)} · {order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online Payment"}</p>
                        </div>
                        <div className='flex flex-col gap-3 border-t border-gray-100 pt-4 lg:w-64 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0'>
                          <div className='flex items-center justify-between'><span className='text-sm text-gray-500'>Order total</span><strong className='text-lg text-gray-900'>{fmt(Number(order.totalAmount))}</strong></div>
                          <div className='grid grid-cols-2 gap-2'>
                            <button type='button' onClick={() => setSelectedInvoice(order)} className='inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-orange-300'><Eye className='h-3.5 w-3.5' /> Invoice</button>
                            <button type='button' onClick={() => openInvoiceForPrint(order)} className='inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-orange-300'><Download className='h-3.5 w-3.5' /> PDF</button>
                          </div>
                          {physical ? <Link href={`/dashboard/student/orders/${encodeURIComponent(order.id)}`} className='inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-orange-600'><Truck className='h-4 w-4' /> Track / view order</Link> : <span className='inline-flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-500'><FileText className='h-4 w-4' /> Digital purchase</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
