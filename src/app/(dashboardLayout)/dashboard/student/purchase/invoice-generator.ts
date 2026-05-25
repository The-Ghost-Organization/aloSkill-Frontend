import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_CONFIG,
  PRODUCT_TYPE_CONFIG,
} from "./config";
import type { Purchase } from "./types";
import { fmt, fmtDate, fmtDateTime } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// Pure HTML generator – no DOM side-effects, easy to unit-test
// ─────────────────────────────────────────────────────────────────────────────
export const generateInvoiceHTML = (p: Purchase): string => {
  const typeConfig  = PRODUCT_TYPE_CONFIG[p.productType];
  const statusConf  = PAYMENT_STATUS_CONFIG[p.paymentStatus];
  const method      = PAYMENT_METHOD_LABELS[p.paymentMethod] ?? p.paymentMethod;
  const subtotal    = p.originalPrice * p.quantity;

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
  .brand h1{font-size:26px;font-weight:900;color:#f97316;letter-spacing:-.5px}
  .brand p{font-size:12px;color:#6b7280;margin-top:4px}
  .inv-meta{text-align:right}
  .inv-meta h2{font-size:22px;font-weight:800;color:#111827;letter-spacing:2px}
  .inv-meta p{font-size:12px;color:#6b7280;margin-top:3px}
  .inv-meta span{font-weight:700;color:#374151}
  .status-badge{display:inline-block;padding:3px 12px;border-radius:100px;font-size:11px;font-weight:700;background:#dcfce7;color:#16a34a;margin-top:6px}
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
      <div class="status-badge">${statusConf?.label}</div>
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
      <p><strong>Status:</strong> ${statusConf?.label}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th><th>Type</th><th>Qty</th><th>Unit Price</th><th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${p.productTitle}</td>
        <td><span class="type-badge">${typeConfig?.label ?? p.productType}</span></td>
        <td>${p.quantity}</td>
        <td>${fmt(p.originalPrice)}</td>
        <td>${fmt(subtotal)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="t-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    ${p.discountAmount > 0
      ? `<div class="t-row disc"><span>Discount${p.couponCode ? ` (${p.couponCode})` : ""}</span><span>− ${fmt(p.discountAmount)}</span></div>`
      : ""}
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
// Side-effectful helper – opens a print dialog in a new tab.
// Handles popup-blocker gracefully.
// ─────────────────────────────────────────────────────────────────────────────
export const openInvoiceForPrint = (purchase: Purchase): void => {
  const html = generateInvoiceHTML(purchase);
  const win  = window.open("", "_blank");

  if (!win) {
    // Popup was blocked by the browser
    window.alert(
      "Your browser blocked the invoice popup.\n" +
      "Please allow popups for this site and try again."
    );
    return;
  }

  win.document.write(html);
  win.document.close();
  win.focus();
  // Small delay so the browser finishes rendering before print dialog opens
  setTimeout(() => win.print(), 600);
};