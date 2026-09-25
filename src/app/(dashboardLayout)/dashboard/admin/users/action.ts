"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import type { AdminUser, AdminUserAction, AdminUserDetails, CreateAdminUserInput } from "./student.type";

const headers = async () => {
  const session = await getServerSession(authOptions);
  return { Authorization: `Bearer ${session?.accessToken}` };
};

export const getAdminUsers = async () => {
  const response = await apiClient.get<AdminUser[]>("/user/admin/users", await headers());
  return response.success ? response.data : null;
};

export const getAdminUserDetails = async (id: string) => {
  const response = await apiClient.get<AdminUserDetails>(`/user/admin/users/${id}`, await headers());
  return response.success ? { success: true as const, data: response.data } : { success: false as const, message: response.message };
};

export const createAdminUser = async (input: CreateAdminUserInput) => {
  const response = await apiClient.post<{ id: string }>("/user/admin/users", input, await headers());
  if (response.success) revalidatePath("/dashboard/admin/users");
  return { success: response.success, message: response.message };
};

export const runAdminUserAction = async (id: string, action: AdminUserAction, note = "") => {
  const response = await apiClient.patch(`/user/admin/users/${id}/action`, { action, note }, await headers());
  if (response.success) revalidatePath("/dashboard/admin/users");
  return { success: response.success, message: response.message };
};

export const getAllStudents = getAdminUsers;
