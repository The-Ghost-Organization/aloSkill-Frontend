import { Download, Eye } from "lucide-react";
import { memo } from "react";
import type { Purchase } from "../types";
import { fmt, fmtDate } from "../utils";
import PaymentStatusBadge from "./PaymentStatusBadge";
import ProductTypeBadge from "./ProductTypeBadge";

interface Props {
  purchases: Purchase[];
  onViewInvoice: (purchase: Purchase) => void;
  onDownload: (purchase: Purchase) => void;
}

const PurchaseMobileCards = memo(({ purchases, onViewInvoice, onDownload }: Props) => (
  <div className="md:hidden divide-y divide-gray-100">
    {purchases.length === 0 ? (
      <div className="py-12 text-center text-sm text-gray-400">
        No transactions match your filters.
      </div>
    ) : (
      purchases.map((p) => (
        <div key={p.id} className="px-4 py-4 space-y-3">
          {/* Thumbnail + title + amount */}
          <div className="flex items-start gap-3">
            <img
              src={p.thumbnail}
              alt=""
              aria-hidden="true"
              className="w-14 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 leading-snug">{p.productTitle}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <ProductTypeBadge type={p.productType} />
                <PaymentStatusBadge status={p.paymentStatus} />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-gray-900">{fmt(p.finalAmount)}</p>
              {p.discountAmount > 0 && (
                <p className="text-xs text-green-600 font-semibold">−{fmt(p.discountAmount)}</p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono font-semibold text-gray-600">{p.id}</span>
            <span>{fmtDate(p.purchaseDate)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => onViewInvoice(p)}
              aria-label={`View invoice for ${p.productTitle}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-gray-700 font-semibold px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              View Invoice
            </button>
            <button
              type="button"
              onClick={() => onDownload(p)}
              aria-label={`Download PDF for ${p.productTitle}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-orange-600 font-semibold px-3 py-2 rounded-lg border border-orange-200 hover:bg-orange-50 transition"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              Download PDF
            </button>
          </div>
        </div>
      ))
    )}
  </div>
));
PurchaseMobileCards.displayName = "PurchaseMobileCards";

export default PurchaseMobileCards;