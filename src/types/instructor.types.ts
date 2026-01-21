export interface InstructorListApiResponse {
  id: string;
  avaterUrl: string | null;
  role: string[];
  skills: string[];
  displayName: string;
  ratingAverage: number;
  totalCourses: number;
}

export interface InstructorDetailApiResponse {
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
    platform: string;
    url: string;
  }[];
  ownedCourses: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    originalPrice: number;
    discountPrice: number | null;
    discountEndDate: string | null;
    ratingAverage: number | null;
    enrollmentCount: number;
    totalLessonCount: number;
    totalCourseDuration: number;
    reviews: {
      userId: string;
      createdAt: Date;
      title: string | null;
      courseId: string;
      rating: number;
    }[];
  }[];
}

export interface Instructor {
  id: string;
  name: string;
  image: string;
  roles: string[];
  skills: string[];
  rating: number;
  totalCourses: number;
}

export interface InstructorDetail {
  id: string;
  name: string;
  image: string;
  bio: string;
  expertise: string;
  website: string | null;
  rating: number;
  totalCourses: number;
  totalStudents: number;
  skills: string[];
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  courses: {
    id: string;
    title: string;
    image: string;
    originalPrice: number;
    discountPrice: number | null;
    discountEndDate: string | null;
    rating: number | null;
    students: number;
    lessons: number;
    duration: number;
    reviewCount?: number;
    reviews: {
      userId: string;
      createdAt: Date;
      title: string | null;
      courseId: string;
      rating: number;
    }[];
  }[];
}

export interface InstructorCardProps {
  instructor: Instructor;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  animationDelay?: number;
}
