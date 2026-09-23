"use server";

import { getServerSession } from "next-auth";
import { apiClient } from "../../../../lib/api/client";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import type { AdminDashboardData } from "./dashboard.types";

export const getAdminDashboardData = async (): Promise<AdminDashboardData | null> => {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return null;

  const response = await apiClient.get<AdminDashboardData>("/admin/dashboard", {
    Authorization: `Bearer ${session.accessToken}`,
  });

  return response.success && response.data ? response.data : null;
};
