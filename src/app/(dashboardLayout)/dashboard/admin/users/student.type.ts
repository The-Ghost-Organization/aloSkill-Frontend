export type UserRole = "STUDENT" | "INSTRUCTOR";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export type AdminUser = {
  id: string; email: string; avatarUrl: string | null; status: UserStatus;
  isEmailVerified: boolean; createdAt: string; lastLogin: string | null; lastActivityAt: string | null;
  roles: UserRole[]; displayName: string; phoneLastFour: string | null; totalSpent: number;
  instructorStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  instructorRating: number | null; instructorCourseCount: number;
  _count: { orders: number; enrollments: number };
};

export type AdminUserDetails = AdminUser & {
  locale: string | null; suspendReason: string | null; adminNote: string | null;
  updatedAt: string; lastLoginIP: string | null; phoneNumber: string | null;
  studentProfile: { displayName: string; gender: string; bio: string | null } | null;
  instructorProfile: null | {
    id: string; displayName: string; gender: string; DOB: string; nationality: string;
    address: string; city: string; qualifications: string; experience: number;
    expertise: string | null; currentOrg: string | null; proposedCourseCategory: string;
    courseLevel: string; courseType: string; teachingExperience: number;
    prevTeachingApproach: string; language: string; demoVideo: string | null;
    bio: string; website: string | null; status: "PENDING" | "APPROVED" | "REJECTED";
    adminNote: string | null; suspendReason: string | null; ratingAverage: number;
    ratingCount: number; totalStudents: number; totalCourses: number;
    totalRevenueAmount: number; totalRefunds: number; skills: string[];
    ownedCourses: Array<{ id: string; title: string; slug: string; status: string; enrollmentCount: number; ratingAverage: number; totalRevenueAmount: number }>;
  };
  orders: Array<{ id: string; totalAmount: number; status: string; provider: string | null; createdAt: string; _count: { orderItems: number } }>;
  payments: Array<{ id: string; amount: number; currency: string; provider: string; status: string; createdAt: string }>;
  _count: { orders: number; enrollments: number; reviews: number; wishlists: number; sessions: number };
};

export type CreateAdminUserInput = Record<string, unknown> & { role: UserRole; email: string; password: string; displayName: string; phoneNumber: string; gender: "MALE" | "FEMALE"; isEmailVerified: boolean };
export type AdminUserAction = "VERIFY_EMAIL" | "SUSPEND" | "REACTIVATE" | "APPROVE_INSTRUCTOR" | "REJECT_INSTRUCTOR";
export type StudentForAdmin = AdminUser[];
