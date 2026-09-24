"use server";

import { getServerSession } from "next-auth";
import { API_BASE_URL } from "@/lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import type { BookState } from "./UserBook.type";

export const getUserBookData = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { data: [] as BookState, error: "Please sign in to view your books." };
    }

    const response = await fetch(`${API_BASE_URL}/book/user/all-books-data`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as {
      success: boolean;
      data?: BookState;
      message?: string;
    };

    if (!response.ok || !payload.success) {
      return {
        data: [] as BookState,
        error: payload.message || "We could not load your book library.",
      };
    }

    return { data: payload.data ?? [], error: "" };
  } catch {
    return { data: [] as BookState, error: "We could not load your book library." };
  }
};
