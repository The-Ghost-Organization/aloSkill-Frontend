"use server";

import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { apiClient } from '../../../lib/api/client';

export type BookResponse = {
    stock: string;
    id: string;
    title: string;
    author: string;
    regularPrice: number;
    salePrice: number;
    publisher: string;
    createdAt: string;
    category: {
        name: string;
    } | null;
    formats: string[];
    coverImage: string;
}[];

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

