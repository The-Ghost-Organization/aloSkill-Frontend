import { getServerSession } from "next-auth";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";
import { apiClient } from '../../../../../lib/api/client';
import type { BookState } from './UserBook.type';

export const getUserBookData = async () => {
  const session = await getServerSession(authOptions);
  const fetchData = await apiClient.get<BookState>("/book/user/all-books-data", {
    Authorization: `Bearer ${session?.accessToken}`,
  });
  if (!fetchData.success) {
    return null;
  }
  return fetchData;
};
