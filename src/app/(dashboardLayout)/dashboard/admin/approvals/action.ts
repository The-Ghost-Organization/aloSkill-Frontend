"use server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";

export type ApprovalType = "book" | "course" | "instructor" | "product";
async function auth() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken)
    throw new Error("Please sign in as an administrator.");
  return { Authorization: `Bearer ${session.accessToken}` };
}
export async function getAllApprovals() {
  const response = await apiClient.get<any>(
    "/admin/all-approvals",
    await auth(),
  );
  if (!response.success) throw new Error("Could not load approvals.");
  return response.data;
}
export async function getApproval(type: ApprovalType, id: string) {
  const response = await apiClient.get<any>(
    `/admin/approvals/${type}/${encodeURIComponent(id)}`,
    await auth(),
  );
  if (!response.success) return null;
  return response.data;
}
export async function decideApproval(
  type: ApprovalType,
  id: string,
  decision: "APPROVE" | "REJECT",
  note: string,
  commissionRate?: string,
  approvedPrice?: string,
) {
  if (decision === "REJECT" && note.trim().length < 5)
    return {
      success: false,
      message: "Enter a reason of at least 5 characters.",
    };
  if (
    type === "product" &&
    decision === "APPROVE" &&
    (!approvedPrice ||
      !/^\d+(?:\.\d{1,2})?$/.test(approvedPrice) ||
      !Number.isFinite(Number(approvedPrice)) ||
      Number(approvedPrice) <= 0)
  ) {
    return {
      success: false,
      message:
        "Confirm a positive selling price with at most two decimal places.",
    };
  }
  try {
    const response =
      type === "product"
        ? await apiClient.patch(
            `/product/admin/${encodeURIComponent(id)}/review`,
            {
              status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
              expectedStatus: "PENDING",
              reviewNote: note.trim(),
              ...(decision === "APPROVE"
                ? {
                    approvedPrice: Number(approvedPrice),
                    ...(commissionRate !== undefined
                      ? { commissionRate: Number(commissionRate) }
                      : {}),
                  }
                : {}),
            },
            await auth(),
          )
        : await apiClient.patch(
            `/admin/approvals/${type}/${encodeURIComponent(id)}`,
            {
              decision,
              note: note.trim(),
              ...(commissionRate !== undefined ? { commissionRate } : {}),
            },
            await auth(),
          );
    if (!response.success)
      return {
        success: false,
        message: "Decision could not be saved. Refresh the page and try again.",
      };
    revalidatePath("/dashboard/admin/approvals");
    revalidatePath(`/dashboard/admin/approvals/review/${type}/${id}`);
    if (type === "product") {
      revalidatePath("/dashboard/admin/products");
      revalidatePath("/products");
    }
    return { success: true, message: "Decision saved." };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Decision could not be saved.",
    };
  }
}
