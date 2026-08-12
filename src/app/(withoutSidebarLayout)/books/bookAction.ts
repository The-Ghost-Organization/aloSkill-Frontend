"use server";

import { getServerSession } from "next-auth";
import { apiClient } from "../../../lib/api/client";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export type Book = {
  id: string;
  title: string;
  author: string;

  physicalRegularPrice: number | null;
  physicalSalePrice: number | null;
  digitalRegularPrice: number | null;
  digitalSalePrice: number | null;

  stock: "in-stock" | "limited" | "out-of-stock";

  publisher: string;
  createdAt: string;

  category: {
    name: string;
  } | null;

  formats: string[];
  coverImage: string;
};

export type BookResponse = Book[];

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
