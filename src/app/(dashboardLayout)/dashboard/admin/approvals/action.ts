"use server";

import { getServerSession } from "next-auth";
import { apiClient } from "../../../../../lib/api/client";
import { authOptions } from "../../../../api/auth/[...nextauth]/route";

// type ApprovalData = {
//     pendingBooks: {
//         id: string;
//         title: string;
//         author: string;
//         translator: string | null;
//         editor: string | null;
//         publisher: string;
//         description: string;
//         regularPrice: number;
//         salePrice: number;
//         stock: number;
//         isbn: string | null;
//         edition: string | null;
//         pages: number | null;
//         language: string;
//         formats: string[];
//         totalEarning: number;
//         viewCount: number;
//         status: string;
//         suspendReason: string | null;
//         adminNote: string | null;
//         updatedContent: string | null;
//         ... 6 more ...;
//         updatedAt: Date;
//     }[];
//     pendingInstructors: {
//         ...;
//     }[];
//     pendingCourses: {
//         ...;
//     }[];
//     updatedBooks: {
//         ...;
//     }[];
//     updatedCourse: {
//         ...;
//     }[];
// };

export const getAllApprovals = async () => {
  console.log("Data calling in all approvals");
  const session = await getServerSession(authOptions);
  const approvalResponse = await apiClient.get<any>("/admin/all-approvals", {
    Authorization: `Bearer ${session?.accessToken}`,
  });
  if (!approvalResponse.success) {
    return null;
  }
  return approvalResponse.data;
};
