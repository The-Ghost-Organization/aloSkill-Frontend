import { orderItemType, orderStatusLabel, type StudentOrder } from "./types";
import { fmt, fmtDateTime } from "./utils";

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);

export function generateInvoiceHTML(order: StudentOrder) {
  const subtotal = Number(order.totalAmount) - Number(order.shippingCost || 0);
  const rows = order.orderItems.map(item => `<tr><td>${escapeHtml(item.book?.title ?? item.course?.title ?? "Order item")}</td><td>${escapeHtml(orderItemType(item))}</td><td>${item.quantity}</td><td>${fmt(Number(item.price) * item.quantity)}</td></tr>`).join("");
  const address = order.shippingAddress ? `<section><strong>${escapeHtml(order.shippingAddress.fullName)}</strong><br>${escapeHtml(order.shippingAddress.addressLine)}, ${escapeHtml(order.shippingAddress.city)} ${escapeHtml(order.shippingAddress.postalCode)}<br>${escapeHtml(order.shippingAddress.phone)}</section>` : "";

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Invoice ${escapeHtml(order.id)}</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111827;padding:40px}.wrap{max-width:760px;margin:auto}.header{display:flex;justify-content:space-between;border-bottom:3px solid #f97316;padding-bottom:20px}.brand{font-size:26px;font-weight:900;color:#f97316}.meta{text-align:right;font-size:13px;line-height:1.7}section{background:#f9fafb;border-radius:10px;padding:16px;margin:24px 0;font-size:13px;line-height:1.7}table{width:100%;border-collapse:collapse}th{background:#f97316;color:white;text-align:left}th,td{padding:11px;border-bottom:1px solid #e5e7eb;font-size:13px}th:last-child,td:last-child{text-align:right}.totals{width:280px;margin:24px 0 0 auto}.row{display:flex;justify-content:space-between;padding:5px}.total{border-top:2px solid #111827;margin-top:8px;padding-top:12px;font-weight:800;font-size:16px}.footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:16px;color:#6b7280;font-size:12px}@media print{body{padding:15px}}</style></head><body><div class="wrap"><div class="header"><div><div class="brand">AloSkill</div><small>Learn, grow, and build your future.</small></div><div class="meta"><strong>INVOICE</strong><br>#${escapeHtml(order.id)}<br>${fmtDateTime(order.createdAt)}<br>${escapeHtml(orderStatusLabel[order.status])}</div></div>${address}<table><thead><tr><th>Item</th><th>Type</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div><div class="row"><span>Shipping</span><span>${fmt(Number(order.shippingCost || 0))}</span></div><div class="row total"><span>Total</span><span>${fmt(Number(order.totalAmount))}</span></div></div><div class="footer">Payment: ${order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Online Payment"} · Generated ${fmtDateTime(new Date().toISOString())}</div></div></body></html>`;
}

export function openInvoiceForPrint(order: StudentOrder) {
  const popup = window.open("", "_blank");
  if (!popup) {
    window.alert("Your browser blocked the invoice window. Please allow popups and try again.");
    return;
  }
  popup.document.write(generateInvoiceHTML(order));
  popup.document.close();
  popup.focus();
  setTimeout(() => popup.print(), 500);
}
