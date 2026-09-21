"use server";

import { getServerSession } from "next-auth";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { type BookState } from "./books.types";
import { revalidatePath } from "next/cache";

const adminHeaders = async () => {
  const session = await getServerSession(authOptions);
  return { Authorization: `Bearer ${session?.accessToken}` };
};

export const getBookData = async () => {
  const session = await getServerSession(authOptions);
  const fetchData = await apiClient.get<BookState>("/book/admin/all-books-data", {
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
  revalidatePath("/dashboard/admin/approvals");
  revalidatePath("/dashboard/admin/books");
  return updateResult;
};

export const updateBookSelling = async (
  bookId: string,
  action: "STOP" | "RESUME",
  note: string
) => {
  const result = await apiClient.patch(
    `/book/admin/books/${bookId}/selling`,
    { action, note },
    await adminHeaders()
  );
  if (result.success) revalidatePath("/dashboard/admin/books");
  return result;
};

export const updateBookStock = async (bookId: string, stock: number, note: string) => {
  const result = await apiClient.patch(
    `/book/admin/books/${bookId}/stock`,
    { stock, note },
    await adminHeaders()
  );
  if (result.success) revalidatePath("/dashboard/admin/books");
  return result;
};

export const softDeleteBook = async (bookId: string, note: string) => {
  const result = await apiClient.patch(
    `/book/admin/books/${bookId}/delete`,
    { note },
    await adminHeaders()
  );
  if (result.success) revalidatePath("/dashboard/admin/books");
  return result;
};

export const createBookCategory = async (name: string) => {
  const result = await apiClient.post(
    "/book/admin/categories",
    { name },
    await adminHeaders()
  );
  if (result.success) revalidatePath("/dashboard/admin/books");
  return result;
};

export const createBookAuthor = async (input: {
  name?: string;
  instructorProfileId?: string;
  bio?: string;
  photoUrl?: string;
  websiteUrl?: string;
}) => {
  const result = await apiClient.post(
    "/book/admin/authors",
    input,
    await adminHeaders()
  );
  if (result.success) revalidatePath("/dashboard/admin/books");
  return result;
};


export const getAuthorCandidates = async () => {
  return await apiClient.get<
    {
      id: string;
      userId: string;
      displayName: string;
      bio: string;
      website: string | null;
      user: { avatarUrl: string | null };
    }[]
  >("/book/admin/author-candidates", await adminHeaders());
};
