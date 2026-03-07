"use server";

import { getServerSession } from "next-auth";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { type BookState } from "./books.types";

export const getBookData = async () => {
  const session = await getServerSession(authOptions);
  const fetchData = await apiClient.get<BookState>("/book/admin/books-data", {
    Authorization: `Bearer ${session?.accessToken}`,
  });
  if (!fetchData.success) {
    return null;
  }
  return fetchData;
};

export const updateBookStatus = async (bookId: string) => {
  const session = await getServerSession(authOptions);
  const updateResult = await apiClient.patch(
    `/book/admin/books/approve?modifiedBookId=${bookId}`,
    {},
    {
      Authorization: `Bearer ${session?.accessToken}`,
    }
  );
  if (!updateResult.success) {
    return;
  }
  return updateResult;
};
