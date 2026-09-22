import { redirect } from "next/navigation";
// Previous links used mock approval IDs. The queue now links to typed, database-backed reviews.
export default async function LegacyApprovalPage() { redirect("/dashboard/admin/approvals"); }
