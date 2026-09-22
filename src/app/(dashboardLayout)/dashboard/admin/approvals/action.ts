"use server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";

export type ApprovalType = "book" | "course" | "instructor";
async function auth() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) throw new Error("Please sign in as an administrator.");
  return { Authorization: `Bearer ${session.accessToken}` };
}
export async function getAllApprovals() {
  const response = await apiClient.get<any>("/admin/all-approvals", await auth());
  if (!response.success) throw new Error("Could not load approvals.");
  return response.data;
}
export async function getApproval(type: ApprovalType, id: string) {
  const response = await apiClient.get<any>(`/admin/approvals/${type}/${encodeURIComponent(id)}`, await auth());
  if (!response.success) return null;
  return response.data;
}
export async function decideApproval(type: ApprovalType, id: string, decision: "APPROVE" | "REJECT", note: string) {
  if (decision === "REJECT" && note.trim().length < 5) return { success: false, message: "Enter a reason of at least 5 characters." };
  try {
    const response = await apiClient.patch(`/admin/approvals/${type}/${encodeURIComponent(id)}`, { decision, note: note.trim() }, await auth());
    if (!response.success) return { success: false, message: "Decision could not be saved. Refresh the page and try again." };
    revalidatePath("/dashboard/admin/approvals");
    revalidatePath(`/dashboard/admin/approvals/review/${type}/${id}`);
    return { success: true, message: "Decision saved." };
  } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Decision could not be saved." }; }
}
