export type StudentForAdmin = {
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  status: string;
  studentProfile: {
    displayName: string;
    encryptedPhone: string;
  } | null;
  lessonProgresses: {
    completed: boolean;
  }[];
  orders: {
    totalAmount: number;
    orderItems: {
      bookId: string | null;
    }[];
  }[];
  _count: {
    enrollments: number;
  };
}[];
