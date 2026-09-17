import { CourseType } from "@/app/(withoutSidebarLayout)/courses/allCourses.types.ts";

export interface InstructorListApiResponse {
  id: string;
  avaterUrl: string | null;
  role: string[];
  skills: string[];
  displayName: string;
  ratingAverage: number;
  totalCourses: number;
}

export interface Instructor {
  id: string;
  avatarUrl: string | null;
  role: string[];
  skills: string[];
  displayName: string;
  ratingAverage: number;
  totalCourses: number;
}

export interface InstructorDetail {
  userId: string;
  avatarUrl: string | null;
  displayName: string;
  ratingAverage: number;
  totalCourses: number;
  totalStudents: number;
  expertise: string | null;
  bio: string;
  website: string | null;
  skills: string[];
  socialAccounts: {
    url: string;
    platform: string;
  }[];
  ownedCourses: CourseType[];
  // ownedCourses: {
  //   id: string;
  //   title: string;
  //   thumbnailUrl: string | null;

  //   originalPrice: number;
  //   discountPrice: number | null;

  //   discountEndDate: string | null;
  //   ratingAverage: number | null;
  //   enrollmentCount: number;
  //   totalLessonCount: number;
  //   totalCourseDuration: number;
  //   reviews: {
  //     userId: string;
  //     rating: string;
  //     title: string;
  //     courseId: string;
  //     createdAt: string;
  //   }[];
  // }[];
}

export interface InstructorCardProps {
  instructor: Instructor;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  animationDelay?: number;
}
