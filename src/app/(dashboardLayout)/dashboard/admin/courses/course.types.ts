export type CourseStatus = "PUBLISHED" | "PENDING" | "DRAFT" | "SUSPENDED";

export type AdminCourse = {
  id: string;
  title: string;
  slug: string;
  status: CourseStatus;
  databaseStatus: "PUBLISHED" | "PENDING" | "DRAFT";
  suspendReason: string | null;
  adminNote: string | null;
  originalPrice: number;
  discountPrice: number | null;
  currency: string;
  thumbnailUrl: string | null;
  ratingAverage: number;
  ratingCount: number;
  enrollments: number;
  completed: number;
  completionRate: number;
  averageProgress: number;
  enrolledThisWeek: number;
  enrollmentTrend: number;
  revenue: number;
  unitsSold: number;
  views: number;
  wishlists: number;
  modules: number;
  lessons: number;
  durationMinutes: number;
  level: string;
  language: string;
  category: string;
  instructor: { id: string; name: string; email: string; avatarUrl: string | null } | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCoursesResponse = {
  items: AdminCourse[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  counts: { all: number; published: number; pending: number; draft: number; suspended: number };
};
