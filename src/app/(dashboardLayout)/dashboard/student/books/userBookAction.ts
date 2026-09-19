import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { apiClient } from '../../../../../lib/api/client';
import type { BookState } from './UserBook.type';

export const getUserBookData = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) return { data: [] as BookState, error: "Please sign in to view your books." };
    const response = await apiClient.get<BookState>("/book/user/all-books-data", {
      Authorization: `Bearer ${session.accessToken}`,
    });
    if (!response.success) return { data: [] as BookState, error: "We could not load your book library." };
    return { data: response.data ?? [], error: "" };
  } catch {
    return { data: [] as BookState, error: "We could not load your book library." };
  }
};
