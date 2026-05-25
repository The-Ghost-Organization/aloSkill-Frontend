import { Download, Eye, TrendingDown } from "lucide-react";
import { memo } from "react";
import { PAYMENT_METHOD_LABELS } from "../config";
import type { Purchase } from "../types";
import { fmt, fmtDate } from "../utils";
import PaymentStatusBadge from "./PaymentStatusBadge";
import ProductTypeBadge from "./ProductTypeBadge";

interface Props {
  purchases: Purchase[];
  onViewInvoice: (purchase: Purchase) => void;
  onDownload: (purchase: Purchase) => void;
}

const EmptyRow = () => (
  <tr>
    <td colSpan={6} className="py-14 text-center text-sm text-gray-400">
      No transactions match your filters.
    </td>
  </tr>
);

const PurchaseTable = memo(({ purchases, onViewInvoice, onDownload }: Props) => (
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50/40">
          <th className="px-5 py-3 font-semibold">Product</th>
          <th className="px-5 py-3 font-semibold">Order ID</th>
          <th className="px-5 py-3 font-semibold">Date</th>
          <th className="px-5 py-3 font-semibold">Amount</th>
          <th className="px-5 py-3 font-semibold">Status</th>
          <th className="px-5 py-3 font-semibold text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {purchases.length === 0 ? (
          <EmptyRow />
        ) : (
          purchases.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
              {/* Product */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={p.thumbnail}
                    alt=""
                    aria-hidden="true"
                    className="w-12 h-9 rounded-lg object-cover shrink-0 border border-gray-100"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                      {p.productTitle}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <ProductTypeBadge type={p.productType} />
                      {p.quantity > 1 && (
                        <span className="text-xs text-gray-400 font-medium">×{p.quantity}</span>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              {/* Order ID */}
              <td className="px-5 py-4">
                <p className="text-xs font-mono font-bold text-gray-700">{p.id}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  {PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod}
                </p>
              </td>

              {/* Date */}
              <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                {fmtDate(p.purchaseDate)}
              </td>

              {/* Amount */}
              <td className="px-5 py-4">
                <p className="text-sm font-bold text-gray-900">{fmt(p.finalAmount)}</p>
                {p.discountAmount > 0 && (
                  <>
                    <p className="text-xs text-gray-400 line-through">
                      {fmt(p.originalPrice * p.quantity)}
                    </p>
                    <p className="text-xs text-green-600 font-semibold flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" aria-hidden="true" />
                      −{fmt(p.discountAmount)}
                    </p>
                  </>
                )}
                {p.vatAmount > 0 && (
                  <p className="text-xs text-gray-400">+{fmt(p.vatAmount)} VAT</p>
                )}
              </td>

              {/* Status */}
              <td className="px-5 py-4">
                <PaymentStatusBadge status={p.paymentStatus} />
              </td>

              {/* Actions */}
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onViewInvoice(p)}
                    aria-label={`View invoice for ${p.productTitle}`}
                    className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownload(p)}
                    aria-label={`Download PDF for ${p.productTitle}`}
                    className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
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
));
PurchaseTable.displayName = "PurchaseTable";

export default PurchaseTable;