"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";

export type AdminInstructor = {
  id: string;
  userId: string;
  displayName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rating: number | null;
  ratingCount: number;
  createdAt: string;
  courseCount: number;
  activeEnrollments: number;
  user: { email: string; status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION"; avatarUrl: string | null };
};

export type InstructorDetails = Omit<AdminInstructor, "rating" | "ratingCount" | "courseCount" | "activeEnrollments"> & {
  bio: string;
  expertise: string | null;
  website: string | null;
  adminNote: string | null;
  suspendReason: string | null;
  authorBookCount: number;
  stats: {
    courses: number;
    activeEnrollments: number;
    unitsSold: number;
    paidSales: number;
    views: number;
    reviewCount: number;
    rating: number | null;
    pendingPayout: number;
  };
  courses: {
    id: string; title: string; slug: string; status: string;
    views: number; activeEnrollments: number; unitsSold: number;
    paidSales: number; reviewCount: number; rating: number | null;
  }[];
};

const adminHeaders = async () => {
  const session = await getServerSession(authOptions);
  return { Authorization: `Bearer ${session?.accessToken}` };
};

export const getAdminInstructors = async () =>
  apiClient.get<AdminInstructor[]>("/user/admin/instructors", await adminHeaders());

export const getInstructorDetails = async (id: string) =>
  apiClient.get<InstructorDetails>(`/user/admin/instructors/${encodeURIComponent(id)}`, await adminHeaders());

export const updateInstructor = async (
  id: string,
  action: "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE",
  note: string
) => {
  const result = await apiClient.patch(
    `/user/admin/instructors/${encodeURIComponent(id)}/action`,
    { action, note },
    await adminHeaders()
  );
  if (result.success) {
    revalidatePath("/dashboard/admin/instructors");
    revalidatePath("/dashboard/admin/approvals");
  }
  return result;
};
