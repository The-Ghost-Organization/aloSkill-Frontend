"use server";

import { getServerSession } from "next-auth";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import type { StudentForAdmin } from "./student.type";

export const getAllStudents = async () => {
  const session = await getServerSession(authOptions);
  const studentResponse = await apiClient.get<StudentForAdmin>("/user/admin/students", {
    Authorization: `Bearer ${session?.accessToken}`,
  });
  if (!studentResponse.success) {
    return null;
  };
  return studentResponse.data;
};
