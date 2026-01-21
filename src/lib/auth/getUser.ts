// adjust path if needed
import { authOptions } from "@/app/api/auth/[...nextauth]/route.ts";
import { getServerSession } from "next-auth";

export const getUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
};
