export interface CourseInstructor {
  name: string;
  avatar: string;
}

export interface Course {
  id: string | number;
  image: string;
  category: string;
  categoryColor: string; // Tailwind class
  rating: number;
  reviewCount: string;
  price: number;

  originalPrice?: number; // optional
  discount?: number; // optional

  title: string;
  lessons: number;
  duration: string; // e.g. "19h 30m"
  students: string; // e.g. "20+"
  level: string; // Beginner | Intermediate | Advanced
  language: string; // e.g. "English"
  certificate: boolean;

  instructor: CourseInstructor;
}

export type CourseType = {
  id: string;
  title: string;
  thumbnailUrl: string | null;

  originalPrice: number;
  discountPrice: number | null;

  status: string;
  createdAt: string;
  createdBy: {
    displayName: string;
    avatarUrl: string;
  };
  category: {
    name: string;
  } | null;

  courseInstructors: {
    role: string | null;
    displayName: string;
    avatarUrl: string | null;
  }[];

  modules: {
    _count: {
      lessons: number;
    };
    lessons: {
      duration: number | null;
    }[];
  }[];

  _count: {
    enrollments: number;
    reviews: number;
  };
};
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CourseCardProps = {
  course: CourseType;

  onAddToCart?: (courseId: string) => void;
  onAddToWishlist?: (courseId: string) => Promise<void> | void;

  isInCart?: boolean;
  isInWishlist?: boolean;

  dashboardActions?: {
    onView?: (courseId: string | number) => void;
    onEdit?: (courseId: string) => void;
    onDelete?: (courseId: string) => void;
  };
};

export type CourseDetails = {
  title: string;
  originalPrice: number;
  discountPrice: number | null;
  objective: string | null;
  isDiscountActive: boolean;
  currency: string | null;
  enrollmentCount: number;
  enrolledLastWeek: number;
  language: string;
  thumbnailUrl: string | null;
  level: string;
  ratingAverage: number | null;
  ratingCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string | undefined;
  totalWishListed: number;
  createdBy: {
    displayName: string | undefined;
    avatarUrl: string | null | undefined;
  };
  courseInstructors: {
    role: string | null;
    displayName: string;
    avatarUrl: string | null;
  }[];
  reviews: {
    rating: number;
    body: string | null;
    createdAt: string;
    userDisplayName: string | undefined;
    avatarUrl: string | null;
  }[];
  content: {
    totalVideos: number;
    totalDuration: string;
    totalFiles: number;
  };
  ratingBreakdown: {
    star: number;
    count: number;
    percentage: string;
  }[];
};
export type CourseDetailsPublic = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  originalPrice: number;
  discountPrice: number | null;
  discountPercent: number | null;
  isDiscountActive: boolean;
  discountEndDate: string | null;
  language: string;
  level: string;
  ratingAverage: number | null;
  ratingCount: number;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
  category: string | undefined;
  courseInstructors: {
    instructorId: string;
    bio: string;
    expertise: string | null;
    rating: number | null;
    totalStudents: number;
    totalCourses: number;
    displayName: string;
    avatarUrl: string | null;
  }[];
  reviews: {
    rating: number;
    body: string | null;
    createdAt: string;
    userDisplayName: string | undefined;
    avatarUrl: string | null;
  }[];
  content: {
    totalModules: number;
    totalLessons: number;
    totalDuration: number;
    totalArticles: number;
    totalFiles: number;
  };
  modules: {
    title: string;
    duration: number;
    lessons: {
      title: string;
      duration: number | null;
      type: string;
      contentUrl: string | null;
    }[];
  }[];
  ratingBreakdown: {
    star: number;
    count: number;
    percentage: string;
  }[];
};
export type CourseDetailsPrivate = {
  title: string;
  createdAt: string;
  updatedAt: string;
  content: {
    totalLessons: number;
    totalDuration: string;
  };
  modules: {
    isExpanded: boolean;
    position: number;
    title: string;
    duration: number;
    lessons: {
      postion: number;
      title: string;
      description: string | null;
      notes: string | null;
      duration: number | null;
      type: string;
      contentUrl: string | null;
      files: {
        name: string;
        url: string;
      }[];
    }[];
  }[];
};
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSidebarProps {
  expandedSections: Set<string>;
  toggleSection: (section: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (value: string) => void;
  selectedRating: string;
  setSelectedRating: (value: string) => void;
  selectedDuration: string;
  setSelectedDuration: (value: string) => void;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  hasActiveFilters?: boolean;
  clearAllFilters?: () => void;
}

export interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export type ViewMode = "grid" | "list";

export type SortOption = "popular" | "rating" | "newest" | "price-low" | "price-high";
