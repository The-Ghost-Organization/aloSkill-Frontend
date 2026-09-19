"use server";

import { getServerSession } from "next-auth";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import type { InstructorBookState } from "./books.types";

export async function getInstructorBooks() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return null;

  const response = await apiClient.get<InstructorBookState>("/book/instructor/books", {
    Authorization: `Bearer ${session.accessToken}`,
  });
  return response.success ? response.data : null;
}
