/** Formats a number as Bangladeshi Taka, e.g. ৳ 1,500 */
export const fmt = (amount: number): string =>
  `৳ ${amount.toLocaleString("en-IN")}`;

/** Short date: "24 Oct 2025" */
export const fmtDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-BD", {
    day: "2-digit", month: "short", year: "numeric",
  });

/** Full date + time: "24 Oct 2025, 10:30 AM" */
export const fmtDateTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleString("en-BD", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });