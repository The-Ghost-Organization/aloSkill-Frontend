export type AdminDashboardData = {
  generatedAt: string;
  overview: {
    students: number;
    studentsTrend: number;
    instructors: number;
    courses: number;
    books: number;
    orders: number;
    grossRevenue: number;
    revenueTrend: number;
    weeklyRevenue: number;
    weeklySales: number;
    salesTrend: number;
    averageOrderValue: number;
    netCash: number;
    refunds: number;
    refundRate: number;
    platformRating: number;
    reviewCount: number;
    completionRate: number;
  };
  catalog: {
    physicalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
    pendingApprovals: number;
    pendingBooks: number;
    pendingCourses: number;
    pendingInstructors: number;
  };
  finance: {
    successfulPayments: number;
    pendingPayoutAmount: number;
    pendingPayoutCount: number;
    providerFees: number;
  };
  revenueTrend: Array<{ week: string; revenue: number; payments: number }>;
  revenueSplit: Array<{ name: string; value: number }>;
  paymentHealth: Array<{ status: string; count: number; amount: number }>;
  orderHealth: Array<{ status: string; count: number }>;
  providerMix: Array<{ provider: string; count: number; amount: number }>;
  topCourses: ProductPerformance[];
  topBooks: ProductPerformance[];
  recentTransactions: Array<{
    id: string;
    reference: string | null;
    customer: string;
    amount: number;
    currency: string;
    provider: string;
    status: string;
    type: string | null;
    createdAt: string;
  }>;
};

export type ProductPerformance = {
  id: string | null;
  name: string;
  owner: string;
  units: number;
  revenue: number;
  rating: number;
};
