"use server";

import { getServerSession } from "next-auth";
import { apiClient } from "../../../lib/api/client";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import type { BookDetailsResponse, BookResponse } from "./Books.type.ts";

export const getAllBooks = async () => {
  const session = await getServerSession(authOptions);
  const fetchData = await apiClient.get<BookResponse>("/book/public/all-books", {
    Authorization: `Bearer ${session?.accessToken}`,
  });
  if (!fetchData.success) {
    return null;
  }
  return fetchData.data;
};

export const getBookDetails = async (bookId: string) => {
  const session = await getServerSession(authOptions);
  const fetchData = await apiClient.get<BookDetailsResponse>(`/book/book-details/${bookId}`, {
    Authorization: `Bearer ${session?.accessToken}`,
  });
  if (!fetchData.success) {
    return null;
  }
  return fetchData.data;
};

export const getAllBooksCategory = async () => {
  const session = await getServerSession(authOptions);
  const fetchData = await apiClient.get<
    {
      id: string;
      name: string;
    }[]
  >("/book/categories", {
    Authorization: `Bearer ${session?.accessToken}`,
  });
  if (!fetchData.success) {
    return null;
  }
  return fetchData.data;
};
