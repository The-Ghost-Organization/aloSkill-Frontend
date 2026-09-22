"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";

export type AdminAuthor = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photoUrl: string | null;
  websiteUrl: string | null;
  instructorProfileId: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { books: number };
};

const adminHeaders = async () => {
  const session = await getServerSession(authOptions);
  return { Authorization: `Bearer ${session?.accessToken}` };
};

export const getAdminAuthors = async () =>
  apiClient.get<AdminAuthor[]>("/book/admin/authors", await adminHeaders());

export const getAuthorCandidates = async () =>
  apiClient.get<{ id: string; displayName: string }[]>(
    "/book/admin/author-candidates",
    await adminHeaders()
  );

export const createAuthor = async (input: {
  name?: string;
  instructorProfileId?: string;
  bio?: string;
  photoUrl?: string;
  websiteUrl?: string;
}) => {
  const result = await apiClient.post("/book/admin/authors", input, await adminHeaders());
  if (result.success) {
    revalidatePath("/dashboard/admin/authors");
    revalidatePath("/dashboard/admin/books");
  }
  return result;
};

export type AuthorBook = {
  id: string;
  title: string;
  status: string;
  coverImage: string;
  formats: string[];
  stock: number;
  viewCount: number;
  unitsSold: number;
  sales: number;
  reviewCount: number;
  rating: number | null;
};

export type AdminAuthorDetails = Omit<AdminAuthor, "_count"> & {
  books: AuthorBook[];
  stats: {
    bookCount: number;
    publishedBooks: number;
    unitsSold: number;
    sales: number;
    views: number;
    reviewCount: number;
    rating: number | null;
  };
};

export const getAdminAuthorDetails = async (authorId: string) =>
  apiClient.get<AdminAuthorDetails>(
    `/book/admin/authors/${encodeURIComponent(authorId)}`,
    await adminHeaders()
  );

export const updateAuthor = async (
  authorId: string,
  changes: {
    name?: string;
    bio?: string | null;
    photoUrl?: string | null;
    websiteUrl?: string | null;
    isActive?: boolean;
  }
) => {
  const result = await apiClient.patch(
    `/book/admin/authors/${encodeURIComponent(authorId)}`,
    changes,
    await adminHeaders()
  );
  if (result.success) {
    revalidatePath("/dashboard/admin/authors");
    revalidatePath("/dashboard/admin/books");
  }
  return result;
};
