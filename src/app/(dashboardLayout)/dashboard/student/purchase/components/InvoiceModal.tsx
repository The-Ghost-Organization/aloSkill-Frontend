import { Download, Tag, TrendingDown, X } from "lucide-react";
import { memo, type MouseEvent } from "react";
import { PAYMENT_METHOD_LABELS } from "../config";
import type { Purchase } from "../types";
import { fmt, fmtDateTime } from "../utils";
import PaymentStatusBadge from "./PaymentStatusBadge";
import ProductTypeBadge from "./ProductTypeBadge";

interface Props {
  purchase: Purchase;
  onClose: () => void;
  onDownload: () => void;
}

// Strongly typed instead of `[string, string][]` to avoid runtime surprises
interface InfoItem {
  label: string;
  value: string;
  mono?: boolean;
  green?: boolean;
}

const InvoiceModal = memo(({ purchase: p, onClose, onDownload }: Props) => {
  const subtotal    = p.originalPrice * p.quantity;
  const savingsPct  = subtotal > 0 ? Math.round((p.discountAmount / subtotal) * 100) : 0;

  const paymentInfoItems: InfoItem[] = [
    { label: "Method",         value: PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod },
    { label: "Transaction ID", value: p.transactionId, mono: true },
    ...(p.couponCode ? [{ label: "Coupon", value: p.couponCode, green: true }] : []),
  ];

  // Close when clicking the backdrop (not the card itself)
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Sticky header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 rounded-t-2xl z-10">
          <div>
            <h3
              id="invoice-modal-title"
              className="font-bold text-gray-900 text-sm"
            >
              Invoice Details
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{p.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close invoice"
              className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Brand + Invoice ref */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-black text-orange-600 tracking-tight">EduPlatform</h2>
              <p className="text-xs text-gray-400 mt-0.5">Learning without limits</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Invoice</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{p.id}</p>
              <p className="text-xs text-gray-500 mt-0.5">{fmtDateTime(p.purchaseDate)}</p>
              <div className="mt-1.5">
                <PaymentStatusBadge status={p.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-orange-200" />

          {/* Billed To + Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Billed To
              </p>
              <p className="font-semibold text-gray-900 text-sm">Student Name</p>
              <p className="text-xs text-gray-500 mt-1">student@email.com</p>
              <p className="text-xs text-gray-500">Dhaka, Bangladesh</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Payment Info
              </p>
              <div className="space-y-1.5">
                {paymentInfoItems.map(({ label, value, mono, green }) => (
                  <div key={label} className="flex justify-between gap-2 text-xs">
                    <span className="text-gray-500 shrink-0">{label}</span>
                    <span
                      className={[
                        "font-semibold text-right break-all",
                        green ? "text-green-600" : "text-gray-900",
                        mono  ? "font-mono text-[10px]" : "",
                      ].join(" ")}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Items Purchased
            </p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-600 text-white">
                    <th className="px-4 py-2.5 text-left text-xs font-bold">Product</th>
                    <th className="px-4 py-2.5 text-center text-xs font-bold">Qty</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">
                        {p.productTitle}
                      </p>
                      <div className="mt-1.5">
                        <ProductTypeBadge type={p.productType} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{p.quantity}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{fmt(subtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2 pt-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>

              {p.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span className="flex items-center gap-1 flex-wrap">
                    <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                    Discount
                    {p.couponCode && (
                      <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {p.couponCode}
                      </span>
                    )}
                    {savingsPct > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                        -{savingsPct}%
                      </span>
                    )}
                  </span>
                  <span>− {fmt(p.discountAmount)}</span>
                </div>
              )}

              {p.vatAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>VAT</span>
                  <span>{fmt(p.vatAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t-2 border-gray-800 mt-1">
                <span>Total Paid</span>
                <span className="text-orange-600">{fmt(p.finalAmount)}</span>
              </div>

              {p.discountAmount > 0 && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 font-semibold mt-1">
                  <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                  You saved {fmt(p.discountAmount)} on this order!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
InvoiceModal.displayName = "InvoiceModal";

export default InvoiceModal;