"use client";

import {
  BookMarked,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  Eye,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
  TrendingDown,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SCALABLE PRODUCT TYPE REGISTRY
// To support a new product type: add one entry here. Nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; dotColor: string; Icon: React.ElementType }
> = {
  COURSE: {
    label: "Course",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
    Icon: BookOpen,
  },
  EBOOK: {
    label: "eBook",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
    Icon: BookMarked,
  },
  PHYSICAL_BOOK: {
    label: "Physical Book",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    Icon: Package,
  },
  DIGITAL_PRODUCT: {
    label: "Digital Product",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    Icon: Cpu,
  },
  SERVICE: {
    label: "Service",
    color: "bg-pink-100 text-pink-700 border-pink-200",
    dotColor: "bg-pink-500",
    Icon: Briefcase,
  },
};

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; Icon: React.ElementType }
> = {
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700", Icon: CheckCircle2 },
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700", Icon: Clock },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700", Icon: XCircle },
  REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-600", Icon: RotateCcw },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BKASH: "bKash",
  NAGAD: "Nagad",
  CARD: "Visa/Mastercard",
  BANK: "Bank Transfer",
  WALLET: "Wallet",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Purchase = {
  id: string;
  transactionId: string;
  productTitle: string;
  productType: string;
  thumbnail: string;
  purchaseDate: string;
  paymentMethod: string;
  paymentStatus: string;
  quantity: number;
  originalPrice: number;
  discountAmount: number;
  couponCode: string | null;
  discountType: "PERCENTAGE" | "FIXED" | null;
  vatAmount: number;
  finalAmount: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA  (replace with your Prisma query result)
// ─────────────────────────────────────────────────────────────────────────────
const mockPurchases: Purchase[] = [
  {
    id: "ORD-2025-001",
    transactionId: "TXN-BK-78234901",
    productTitle: "Next.js 15 Mastery Complete Bootcamp",
    productType: "COURSE",
    thumbnail: "https://placehold.co/80x60/3b82f6/ffffff?text=NJS",
    purchaseDate: "2025-10-24T10:30:00",
    paymentMethod: "BKASH",
    paymentStatus: "COMPLETED",
    quantity: 1,
    originalPrice: 3500,
    discountAmount: 1000,
    couponCode: "SAVE1000",
    discountType: "FIXED",
    vatAmount: 0,
    finalAmount: 2500,
  },
  {
    id: "ORD-2025-002",
    transactionId: "TXN-NG-56123700",
    productTitle: "React Design Patterns — Complete eBook",
    productType: "EBOOK",
    thumbnail: "https://placehold.co/80x60/7c3aed/ffffff?text=RDP",
    purchaseDate: "2025-10-18T14:15:00",
    paymentMethod: "NAGAD",
    paymentStatus: "COMPLETED",
    quantity: 1,
    originalPrice: 800,
    discountAmount: 160,
    couponCode: "EBOOK20",
    discountType: "PERCENTAGE",
    vatAmount: 0,
    finalAmount: 640,
  },
  {
    id: "ORD-2025-003",
    transactionId: "TXN-CRD-99123456",
    productTitle: "Clean Code: A Handbook of Agile Software",
    productType: "PHYSICAL_BOOK",
    thumbnail: "https://placehold.co/80x60/059669/ffffff?text=CC",
    purchaseDate: "2025-10-10T09:00:00",
    paymentMethod: "CARD",
    paymentStatus: "COMPLETED",
    quantity: 2,
    originalPrice: 600,
    discountAmount: 0,
    couponCode: null,
    discountType: null,
    vatAmount: 180,
    finalAmount: 1380,
  },
  {
    id: "ORD-2025-004",
    transactionId: "TXN-BK-33456789",
    productTitle: "UI Component Library — Pro Pack",
    productType: "DIGITAL_PRODUCT",
    thumbnail: "https://placehold.co/80x60/d97706/ffffff?text=UIC",
    purchaseDate: "2025-09-30T16:45:00",
    paymentMethod: "BKASH",
    paymentStatus: "PENDING",
    quantity: 1,
    originalPrice: 4500,
    discountAmount: 900,
    couponCode: "LAUNCH20",
    discountType: "PERCENTAGE",
    vatAmount: 0,
    finalAmount: 3600,
  },
  {
    id: "ORD-2025-005",
    transactionId: "TXN-BNK-11223344",
    productTitle: "1-on-1 Mentorship Session (3 Hours)",
    productType: "SERVICE",
    thumbnail: "https://placehold.co/80x60/ec4899/ffffff?text=MNT",
    purchaseDate: "2025-09-20T11:00:00",
    paymentMethod: "BANK",
    paymentStatus: "COMPLETED",
    quantity: 1,
    originalPrice: 5000,
    discountAmount: 500,
    couponCode: "MENTOR10",
    discountType: "PERCENTAGE",
    vatAmount: 0,
    finalAmount: 4500,
  },
  {
    id: "ORD-2025-006",
    transactionId: "TXN-BK-44556677",
    productTitle: "TypeScript Advanced Patterns & Architecture",
    productType: "COURSE",
    thumbnail: "https://placehold.co/80x60/3b82f6/ffffff?text=TS",
    purchaseDate: "2025-09-05T08:30:00",
    paymentMethod: "BKASH",
    paymentStatus: "REFUNDED",
    quantity: 1,
    originalPrice: 2800,
    discountAmount: 0,
    couponCode: null,
    discountType: null,
    vatAmount: 0,
    finalAmount: 2800,
  },
  {
    id: "ORD-2025-007",
    transactionId: "TXN-NG-77889900",
    productTitle: "Figma to Code: Design Systems Masterclass",
    productType: "COURSE",
    thumbnail: "https://placehold.co/80x60/3b82f6/ffffff?text=FIG",
    purchaseDate: "2025-08-15T13:20:00",
    paymentMethod: "NAGAD",
    paymentStatus: "COMPLETED",
    quantity: 1,
    originalPrice: 3200,
    discountAmount: 800,
    couponCode: "DESIGN25",
    discountType: "FIXED",
    vatAmount: 0,
    finalAmount: 2400,
  },
  {
    id: "ORD-2025-008",
    transactionId: "TXN-CRD-55443322",
    productTitle: "Node.js API Development eBook — 2nd Edition",
    productType: "EBOOK",
    thumbnail: "https://placehold.co/80x60/7c3aed/ffffff?text=NODE",
    purchaseDate: "2025-08-01T10:00:00",
    paymentMethod: "CARD",
    paymentStatus: "FAILED",
    quantity: 1,
    originalPrice: 600,
    discountAmount: 0,
    couponCode: null,
    discountType: null,
    vatAmount: 0,
    finalAmount: 600,
  },
  {
    id: "ORD-2025-009",
    transactionId: "TXN-BK-99001122",
    productTitle: "Notion Productivity Template Bundle",
    productType: "DIGITAL_PRODUCT",
    thumbnail: "https://placehold.co/80x60/d97706/ffffff?text=NOT",
    purchaseDate: "2025-07-22T15:10:00",
    paymentMethod: "BKASH",
    paymentStatus: "COMPLETED",
    quantity: 3,
    originalPrice: 250,
    discountAmount: 75,
    couponCode: "BUNDLE30",
    discountType: "PERCENTAGE",
    vatAmount: 0,
    finalAmount: 675,
  },
  {
    id: "ORD-2025-010",
    transactionId: "TXN-NG-33214455",
    productTitle: "System Design Interview Handbook",
    productType: "PHYSICAL_BOOK",
    thumbnail: "https://placehold.co/80x60/059669/ffffff?text=SSD",
    purchaseDate: "2025-07-10T09:45:00",
    paymentMethod: "NAGAD",
    paymentStatus: "COMPLETED",
    quantity: 1,
    originalPrice: 900,
    discountAmount: 0,
    couponCode: null,
    discountType: null,
    vatAmount: 135,
    finalAmount: 1035,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (amount: number) => `৳ ${amount.toLocaleString("en-IN")}`;

const fmtDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE HTML GENERATOR  (opens in new window → browser print → PDF)
// ─────────────────────────────────────────────────────────────────────────────
const generateInvoiceHTML = (p: Purchase): string => {
  const typeConfig = PRODUCT_TYPE_CONFIG[p.productType];
  const method = PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod;
  const statusConf = PAYMENT_STATUS_CONFIG[p.paymentStatus]  ;
  const subtotal = p.originalPrice * p.quantity;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${p.id}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff;padding:48px}
  .wrap{max-width:720px;margin:0 auto}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #f97316;margin-bottom:32px}
  .brand h1{font-size:26px;font-weight:900;color:#f97316;letter-spacing:-0.5px}
  .brand p{font-size:12px;color:#6b7280;margin-top:4px}
  .inv-meta{text-align:right}
  .inv-meta h2{font-size:22px;font-weight:800;color:#111827;letter-spacing:2px}
  .inv-meta p{font-size:12px;color:#6b7280;margin-top:3px}
  .inv-meta span{font-weight:700;color:#374151}
  .status{display:inline-block;padding:3px 12px;border-radius:100px;font-size:11px;font-weight:700;background:#dcfce7;color:#16a34a;margin-top:6px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
  .info-box{background:#f9fafb;border-radius:10px;padding:16px}
  .sec-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin-bottom:10px}
  .info-box p{font-size:13px;line-height:1.9;color:#374151}
  .info-box strong{color:#111827}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  thead tr{background:#f97316;color:#fff}
  thead th{padding:11px 16px;font-size:11px;font-weight:700;text-align:left;text-transform:uppercase;letter-spacing:.5px}
  thead th:last-child{text-align:right}
  tbody td{padding:14px 16px;font-size:13px;border-bottom:1px solid #f3f4f6;vertical-align:top}
  tbody td:last-child{text-align:right;font-weight:700}
  .type-badge{display:inline-block;font-size:10px;padding:2px 8px;border-radius:100px;background:#eff6ff;color:#1d4ed8;font-weight:700;margin-top:4px}
  .totals{width:268px;margin-left:auto}
  .t-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#374151}
  .t-row.disc{color:#16a34a;font-weight:600}
  .t-row.grand{font-size:16px;font-weight:800;color:#111827;border-top:2px solid #111827;padding-top:12px;margin-top:6px}
  .savings{margin-top:10px;padding:8px 12px;background:#f0fdf4;border-radius:8px;font-size:12px;color:#16a34a;font-weight:600;text-align:center}
  .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center}
  .footer p{font-size:12px;color:#9ca3af}
  @media print{body{padding:20px}}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="brand">
      <h1>EduPlatform</h1>
      <p>Learning without limits</p>
      <p style="margin-top:10px;font-size:12px">support@eduplatform.com<br>www.eduplatform.com</p>
    </div>
    <div class="inv-meta">
      <h2>INVOICE</h2>
      <p>Invoice #: <span>${p.id}</span></p>
      <p>Transaction: <span style="font-family:monospace;font-size:11px">${p.transactionId}</span></p>
      <p>Date: <span>${fmtDateTime(p.purchaseDate)}</span></p>
      <div class="status">${statusConf.label }</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="sec-label">Billed To</div>
      <p><strong>Student Name</strong></p>
      <p>student@email.com</p>
      <p>Dhaka, Bangladesh</p>
    </div>
    <div class="info-box">
      <div class="sec-label">Payment Info</div>
      <p><strong>Method:</strong> ${method}</p>
      <p><strong>Date:</strong> ${fmtDate(p.purchaseDate)}</p>
      ${p.couponCode ? `<p><strong>Coupon:</strong> ${p.couponCode}</p>` : ""}
      <p><strong>Status:</strong> ${statusConf.label}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Type</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${p.productTitle}</td>
        <td><span class="type-badge">${typeConfig.label}</span></td>
        <td>${p.quantity}</td>
        <td>${fmt(p.originalPrice)}</td>
        <td>${fmt(subtotal)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="t-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    ${p.discountAmount > 0 ? `<div class="t-row disc"><span>Discount${p.couponCode ? ` (${p.couponCode})` : ""}</span><span>− ${fmt(p.discountAmount)}</span></div>` : ""}
    ${p.vatAmount > 0 ? `<div class="t-row"><span>VAT</span><span>${fmt(p.vatAmount)}</span></div>` : ""}
    <div class="t-row grand"><span>Total Paid</span><span style="color:#f97316">${fmt(p.finalAmount)}</span></div>
    ${p.discountAmount > 0 ? `<div class="savings">🎉 You saved ${fmt(p.discountAmount)} on this order!</div>` : ""}
  </div>

  <div class="footer">
    <p>Thank you for your purchase!</p>
    <p>Generated on ${fmtDateTime(new Date().toISOString())}</p>
  </div>
</div>
</body>
</html>`;
};

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE BADGE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const ProductTypeBadge = ({ type }: { type: string }) => {
  const config = PRODUCT_TYPE_CONFIG[type];
  if (!config) return null;
  const { Icon, color, label } = config;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}
    >
      <Icon className='w-3 h-3' />
      {label}
    </span>
  );
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const config = PAYMENT_STATUS_CONFIG[status];
  if (!config) return null;
  const { Icon, color, label } = config;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
    >
      <Icon className='w-3 h-3' />
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE MODAL
// ─────────────────────────────────────────────────────────────────────────────
const InvoiceModal = ({
  purchase,
  onClose,
  onDownload,
}: {
  purchase: Purchase;
  onClose: () => void;
  onDownload: () => void;
}) => {
  const subtotal = purchase.originalPrice * purchase.quantity;
  const savingsPct = subtotal > 0 ? Math.round((purchase.discountAmount / subtotal) * 100) : 0;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto'>
        {/* Sticky Header */}
        <div className='sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 rounded-t-2xl z-10'>
          <div>
            <h3 className='font-bold text-gray-900 text-sm'>Invoice Details</h3>
            <p className='text-xs text-gray-400 mt-0.5 font-mono'>{purchase.id}</p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={onDownload}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition'
            >
              <Download className='w-3.5 h-3.5' />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className='p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>

        <div className='p-5 space-y-5'>
          {/* Brand + Invoice ID */}
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='text-lg font-black text-orange-600 tracking-tight'>EduPlatform</h2>
              <p className='text-xs text-gray-400 mt-0.5'>Learning without limits</p>
            </div>
            <div className='text-right'>
              <p className='text-xs font-bold uppercase tracking-widest text-gray-400'>Invoice</p>
              <p className='font-bold text-gray-900 text-sm mt-0.5'>{purchase.id}</p>
              <p className='text-xs text-gray-500 mt-0.5'>{fmtDateTime(purchase.purchaseDate)}</p>
              <div className='mt-1.5'>
                <PaymentStatusBadge status={purchase.paymentStatus} />
              </div>
            </div>
          </div>

          <div className='border-t-2 border-orange-200' />

          {/* Billed To + Payment Info */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='bg-gray-50 rounded-xl p-4'>
              <p className='text-xs font-bold uppercase tracking-wider text-gray-400 mb-2'>
                Billed To
              </p>
              <p className='font-semibold text-gray-900 text-sm'>Student Name</p>
              <p className='text-xs text-gray-500 mt-1'>student@email.com</p>
              <p className='text-xs text-gray-500'>Dhaka, Bangladesh</p>
            </div>
            <div className='bg-gray-50 rounded-xl p-4'>
              <p className='text-xs font-bold uppercase tracking-wider text-gray-400 mb-2'>
                Payment Info
              </p>
              <div className='space-y-1.5'>
                {[
                  ["Method", PAYMENT_METHOD_LABELS[purchase.paymentMethod]],
                  ["Transaction ID", purchase.transactionId],
                  ...(purchase.couponCode ? [["Coupon", purchase.couponCode]] : []),
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className='flex justify-between gap-2 text-xs'
                  >
                    <span className='text-gray-500 shrink-0'>{k}</span>
                    <span
                      className={`font-semibold text-right break-all ${k === "Coupon" ? "text-green-600" : "text-gray-900"} ${k === "Transaction ID" ? "font-mono text-[10px]" : ""}`}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className='text-xs font-bold uppercase tracking-wider text-gray-400 mb-2'>
              Items Purchased
            </p>
            <div className='border border-gray-100 rounded-xl overflow-hidden'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='bg-orange-600 text-white'>
                    <th className='px-4 py-2.5 text-left text-xs font-bold'>Product</th>
                    <th className='px-4 py-2.5 text-center text-xs font-bold'>Qty</th>
                    <th className='px-4 py-2.5 text-right text-xs font-bold'>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-gray-900 text-sm leading-snug'>
                        {purchase.productTitle}
                      </p>
                      <div className='mt-1.5'>
                        <ProductTypeBadge type={purchase.productType} />
                      </div>
                    </td>
                    <td className='px-4 py-3 text-center text-gray-600 text-sm'>
                      {purchase.quantity}
                    </td>
                    <td className='px-4 py-3 text-right font-bold text-gray-900 text-sm'>
                      {fmt(subtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className='flex justify-end'>
            <div className='w-full sm:w-64 space-y-2 pt-2'>
              <div className='flex justify-between text-sm text-gray-600'>
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              {purchase.discountAmount > 0 && (
                <div className='flex justify-between text-sm text-green-600 font-semibold'>
                  <span className='flex items-center gap-1'>
                    <Tag className='w-3.5 h-3.5' />
                    Discount
                    {purchase.couponCode && (
                      <span className='bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-bold'>
                        {purchase.couponCode}
                      </span>
                    )}
                    {savingsPct > 0 && (
                      <span className='text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold'>
                        -{savingsPct}%
                      </span>
                    )}
                  </span>
                  <span>− {fmt(purchase.discountAmount)}</span>
                </div>
              )}
              {purchase.vatAmount > 0 && (
                <div className='flex justify-between text-sm text-gray-600'>
                  <span>VAT</span>
                  <span>{fmt(purchase.vatAmount)}</span>
                </div>
              )}
              <div className='flex justify-between font-bold text-gray-900 text-base pt-3 border-t-2 border-gray-800 mt-1'>
                <span>Total Paid</span>
                <span className='text-orange-600'>{fmt(purchase.finalAmount)}</span>
              </div>
              {purchase.discountAmount > 0 && (
                <div className='flex items-center justify-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 font-semibold mt-1'>
                  <TrendingDown className='w-3.5 h-3.5' />
                  You saved {fmt(purchase.discountAmount)} on this order!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 5;

export default function PurchaseHistory() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Purchase | null>(null);

  // Summary stats — only count completed orders for spend/savings
  const stats = useMemo(() => {
    const completed = mockPurchases.filter(p => p.paymentStatus === "COMPLETED");
    return {
      totalOrders: mockPurchases.length,
      totalSpent: completed.reduce((s, p) => s + p.finalAmount, 0),
      totalSaved: completed.reduce((s, p) => s + p.discountAmount, 0),
    };
  }, []);

  // Filtered + sorted list
  const processed = useMemo(() => {
    let data = [...mockPurchases];
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter(
        p =>
          p.productTitle.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "ALL") data = data.filter(p => p.productType === typeFilter);
    if (statusFilter !== "ALL") data = data.filter(p => p.paymentStatus === statusFilter);
    data.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        : new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
    );
    return data;
  }, [search, typeFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(processed.length / ITEMS_PER_PAGE));
  const paginated = processed.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetPage = () => setCurrentPage(1);

  const handleDownload = (purchase: Purchase) => {
    const html = generateInvoiceHTML(purchase);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  return (
    <>
      {/* Invoice modal */}
      {selectedInvoice && (
        <InvoiceModal
          purchase={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onDownload={() => handleDownload(selectedInvoice)}
        />
      )}

      <div className='space-y-5'>
        {/* ── Summary Cards ── */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {[
            {
              label: "Total Orders",
              value: stats.totalOrders,
              Icon: ShoppingBag,
              bg: "bg-blue-50",
              fg: "text-blue-600",
              render: (v: number) => String(v),
            },
            {
              label: "Total Spent",
              value: stats.totalSpent,
              Icon: Wallet,
              bg: "bg-orange-50",
              fg: "text-orange-600",
              render: fmt,
            },
            {
              label: "Total Saved",
              value: stats.totalSaved,
              Icon: TrendingDown,
              bg: "bg-green-50",
              fg: "text-green-600",
              render: fmt,
            },
          ].map(({ label, value, Icon, bg, fg, render }) => (
            <div
              key={label}
              className='bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4'
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${fg}`}>
                <Icon className='w-5 h-5' />
              </div>
              <div>
                <p className='text-xs text-gray-500 font-medium'>{label}</p>
                <p className='text-lg font-bold text-gray-900'>{render(value)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Card ── */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Card header */}
          <div className='px-5 py-4 border-b border-gray-100 bg-gray-50/60'>
            <h2 className='font-bold text-gray-900'>Transaction History</h2>
          </div>

          {/* Controls */}
          <div className='px-5 py-4 border-b border-gray-100 space-y-3'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
              <input
                type='text'
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                placeholder='Search by title, order ID, or transaction ID…'
                className='w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white'
              />
            </div>

            {/* Filter row */}
            <div className='flex flex-wrap items-center gap-2'>
              <SlidersHorizontal className='w-3.5 h-3.5 text-gray-400 shrink-0' />

              {/* Product type pills */}
              <div className='flex flex-wrap gap-1.5'>
                {(["ALL", ...Object.keys(PRODUCT_TYPE_CONFIG)] as string[]).map(type => {
                  const isAll = type === "ALL";
                  const conf = !isAll ? PRODUCT_TYPE_CONFIG[type] : null;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setTypeFilter(type);
                        resetPage();
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                        typeFilter === type
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                      }`}
                    >
                      {isAll ? "All" : conf!.label}
                    </button>
                  );
                })}
              </div>

              {/* Status + sort — push to right on desktop */}
              <div className='flex gap-2 ml-auto flex-wrap'>
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    resetPage();
                  }}
                  className='text-xs px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white text-gray-700 cursor-pointer'
                >
                  <option value='ALL'>All Status</option>
                  {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, { label }]) => (
                    <option
                      key={key}
                      value={key}
                    >
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={e => {
                    setSortOrder(e.target.value);
                    resetPage();
                  }}
                  className='text-xs px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white text-gray-700 cursor-pointer'
                >
                  <option value='newest'>Newest First</option>
                  <option value='oldest'>Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Desktop Table ── */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='text-xs text-gray-500 border-b border-gray-100 bg-gray-50/40'>
                  <th className='px-5 py-3 font-semibold'>Product</th>
                  <th className='px-5 py-3 font-semibold'>Order ID</th>
                  <th className='px-5 py-3 font-semibold'>Date</th>
                  <th className='px-5 py-3 font-semibold'>Amount</th>
                  <th className='px-5 py-3 font-semibold'>Status</th>
                  <th className='px-5 py-3 font-semibold text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className='py-14 text-center text-sm text-gray-400'
                    >
                      No transactions match your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map(p => (
                    <tr
                      key={p.id}
                      className='hover:bg-gray-50/70 transition-colors'
                    >
                      {/* Product cell */}
                      <td className='px-5 py-4'>
                        <div className='flex items-center gap-3'>
                          <img
                            src={p.thumbnail}
                            alt={p.productTitle}
                            className='w-12 h-9 rounded-lg object-cover shrink-0 border border-gray-100'
                          />
                          <div className='min-w-0'>
                            <p className='text-sm font-semibold text-gray-900 truncate max-w-[200px]'>
                              {p.productTitle}
                            </p>
                            <div className='mt-1 flex items-center gap-1.5'>
                              <ProductTypeBadge type={p.productType} />
                              {p.quantity > 1 && (
                                <span className='text-xs text-gray-400 font-medium'>
                                  ×{p.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Order ID */}
                      <td className='px-5 py-4'>
                        <p className='text-xs font-mono font-bold text-gray-700'>{p.id}</p>
                        <p className='text-xs text-gray-400 mt-0.5 font-medium'>
                          {PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}
                        </p>
                      </td>
                      {/* Date */}
                      <td className='px-5 py-4 text-sm text-gray-600 whitespace-nowrap'>
                        {fmtDate(p.purchaseDate)}
                      </td>
                      {/* Amount */}
                      <td className='px-5 py-4'>
                        <p className='text-sm font-bold text-gray-900'>{fmt(p.finalAmount)}</p>
                        {p.discountAmount > 0 && (
                          <>
                            <p className='text-xs text-gray-400 line-through'>
                              {fmt(p.originalPrice * p.quantity)}
                            </p>
                            <p className='text-xs text-green-600 font-semibold flex items-center gap-0.5'>
                              <TrendingDown className='w-3 h-3' />−{fmt(p.discountAmount)}
                            </p>
                          </>
                        )}
                        {p.vatAmount > 0 && (
                          <p className='text-xs text-gray-400'>+{fmt(p.vatAmount)} VAT</p>
                        )}
                      </td>
                      {/* Status */}
                      <td className='px-5 py-4'>
                        <PaymentStatusBadge status={p.paymentStatus} />
                      </td>
                      {/* Actions */}
                      <td className='px-5 py-4 text-right'>
                        <div className='flex items-center justify-end gap-1.5'>
                          <button
                            onClick={() => setSelectedInvoice(p)}
                            className='inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition'
                          >
                            <Eye className='w-3.5 h-3.5' />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(p)}
                            className='inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition'
                          >
                            <Download className='w-3.5 h-3.5' />
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className='md:hidden divide-y divide-gray-100'>
            {paginated.length === 0 ? (
              <div className='py-12 text-center text-sm text-gray-400'>
                No transactions match your filters.
              </div>
            ) : (
              paginated.map(p => (
                <div
                  key={p.id}
                  className='px-4 py-4 space-y-3'
                >
                  {/* Top row: thumbnail + title + amount */}
                  <div className='flex items-start gap-3'>
                    <img
                      src={p.thumbnail}
                      alt={p.productTitle}
                      className='w-14 h-10 rounded-lg object-cover shrink-0 border border-gray-100'
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-semibold text-gray-900 leading-snug'>
                        {p.productTitle}
                      </p>
                      <div className='flex flex-wrap items-center gap-1.5 mt-1.5'>
                        <ProductTypeBadge type={p.productType} />
                        <PaymentStatusBadge status={p.paymentStatus} />
                      </div>
                    </div>
                    <div className='text-right shrink-0'>
                      <p className='text-sm font-bold text-gray-900'>{fmt(p.finalAmount)}</p>
                      {p.discountAmount > 0 && (
                        <p className='text-xs text-green-600 font-semibold'>
                          −{fmt(p.discountAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Meta row */}
                  <div className='flex items-center justify-between text-xs text-gray-400'>
                    <span className='font-mono font-semibold text-gray-600'>{p.id}</span>
                    <span>{fmtDate(p.purchaseDate)}</span>
                  </div>
                  {/* Action buttons */}
                  <div className='flex gap-2 pt-0.5'>
                    <button
                      onClick={() => setSelectedInvoice(p)}
                      className='flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-gray-700 font-semibold px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition'
                    >
                      <Eye className='w-3.5 h-3.5' />
                      View Invoice
                    </button>
                    <button
                      onClick={() => handleDownload(p)}
                      className='flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-orange-600 font-semibold px-3 py-2 rounded-lg border border-orange-200 hover:bg-orange-50 transition'
                    >
                      <Download className='w-3.5 h-3.5' />
                      Download PDF
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Pagination ── */}
          {processed.length > ITEMS_PER_PAGE && (
            <div className='px-5 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3'>
              <p className='text-xs text-gray-500'>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, processed.length)} of {processed.length}
              </p>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition'
                >
                  <ChevronLeft className='w-4 h-4 text-gray-600' />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-orange-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className='p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition'
                >
                  <ChevronRight className='w-4 h-4 text-gray-600' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
