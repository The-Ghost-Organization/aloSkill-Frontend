// ═══════════════════════════════════════════════════════
//   SHARED DATA
// ═══════════════════════════════════════════════════════

export const monthlyRevenue = [
  { m: "Aug", rev: 42000, enr: 380, platform: 12600 },
  { m: "Sep", rev: 56000, enr: 450, platform: 16800 },
  { m: "Oct", rev: 49000, enr: 410, platform: 14700 },
  { m: "Nov", rev: 67000, enr: 530, platform: 20100 },
  { m: "Dec", rev: 82000, enr: 620, platform: 24600 },
  { m: "Jan", rev: 71000, enr: 580, platform: 21300 },
  { m: "Feb", rev: 95000, enr: 710, platform: 28500 },
];

export const categoryData = [
  { cat: "Dev", rev: 38000 },
  { cat: "Design", rev: 24000 },
  { cat: "Business", rev: 19000 },
  { cat: "Marketing", rev: 14000 },
  { cat: "Data", rev: 27000 },
];

export const STUDENTS = [
  { id: 1, name: "Fatima Al-Hassan", email: "fatima@email.com", phone: "+971 50-000-0001", courses: 15, spend: "$890", pct: 98, badge: "Platinum", status: "Active", joined: "Sep 2023" },
  { id: 2, name: "Priya Sharma", email: "priya@email.com", phone: "+91 98000-00001", courses: 12, spend: "$680", pct: 95, badge: "Platinum", status: "Active", joined: "Nov 2023" },
  { id: 3, name: "Aisha Rahman", email: "aisha@email.com", phone: "+880 1700-000001", courses: 8, spend: "$340", pct: 82, badge: "Gold", status: "Active", joined: "Jan 2024" },
  { id: 4, name: "Yuki Tanaka", email: "yuki@email.com", phone: "+81 90-0000-0001", courses: 6, spend: "$210", pct: 74, badge: "Gold", status: "Active", joined: "Feb 2024" },
  { id: 5, name: "Carlos Mendez", email: "carlos@email.com", phone: "+1 555-000102", courses: 3, spend: "$120", pct: 45, badge: "None", status: "Active", joined: "Mar 2024" },
  { id: 6, name: "Tom Bradley", email: "tom@email.com", phone: "+44 7700-000001", courses: 1, spend: "$29", pct: 10, badge: "None", status: "Suspended", joined: "Jun 2024" },
];

export const INSTRUCTORS = [
  { id: 1, name: "James Carter", email: "james@email.com", courses: 14, students: 3420, revenue: 68400, rating: 4.9, commission: 30, badge: "Platinum", status: "Approved", kyc: "Verified", pending: 2400 },
  { id: 2, name: "Sofia Lin", email: "sofia@email.com", courses: 9, students: 2100, revenue: 42000, rating: 4.8, commission: 30, badge: "Gold", status: "Approved", kyc: "Verified", pending: 1100 },
  { id: 3, name: "Ravi Patel", email: "ravi@email.com", courses: 7, students: 1800, revenue: 31500, rating: 4.7, commission: 25, badge: "Gold", status: "Approved", kyc: "Verified", pending: 0 },
  { id: 4, name: "Emma Walsh", email: "emma@email.com", courses: 5, students: 980, revenue: 16200, rating: 4.6, commission: 30, badge: "None", status: "Pending", kyc: "Pending", pending: 0 },
  { id: 5, name: "Omar Sheikh", email: "omar@email.com", courses: 2, students: 340, revenue: 4800, rating: 4.2, commission: 30, badge: "None", status: "Pending", kyc: "Pending", pending: 0 },
];

export const COURSES = [
  { id: 1, title: "Full-Stack Web Dev Bootcamp", instructor: "James Carter", cat: "Development", status: "Approved", enr: 1240, rev: 24800, rating: 4.9, pct: 74, price: 29, featured: true },
  { id: 2, title: "UI/UX Design Masterclass", instructor: "Sofia Lin", cat: "Design", status: "Approved", enr: 980, rev: 18600, rating: 4.8, pct: 68, price: 24, featured: false },
  { id: 3, title: "Python for Data Science", instructor: "Ravi Patel", cat: "Data", status: "Approved", enr: 870, rev: 15400, rating: 4.7, pct: 81, price: 19, featured: true },
  { id: 4, title: "Digital Marketing Pro", instructor: "Emma Walsh", cat: "Marketing", status: "Pending", enr: 0, rev: 0, rating: 0, pct: 0, price: 34, featured: false },
  { id: 5, title: "React Native for Beginners", instructor: "James Carter", cat: "Development", status: "Draft", enr: 0, rev: 0, rating: 0, pct: 0, price: 22, featured: false },
  { id: 6, title: "Financial Modeling Excel", instructor: "Omar Sheikh", cat: "Business", status: "Rejected", enr: 0, rev: 0, rating: 0, pct: 0, price: 29, featured: false },
];

export const BOOKS = [
  { id: 1, title: "CSS Grid in Practice", author: "Sofia Lin", type: "Digital", price: 14, sales: 340, rev: 4760, stock: null, status: "Approved" },
  { id: 2, title: "Python Cheat Sheet Pro", author: "Ravi Patel", type: "Digital", price: 9, sales: 820, rev: 7380, stock: null, status: "Approved" },
  { id: 3, title: "The UX Playbook", author: "Sofia Lin", type: "Physical", price: 29, sales: 145, rev: 4205, stock: 48, status: "Approved" },
  { id: 4, title: "Marketing Fundamentals", author: "Emma Walsh", type: "Physical", price: 24, sales: 0, rev: 0, stock: 100, status: "Pending" },
];

export const COUPONS = [
  { code: "SUMMER30", type: "Percentage", value: "30%", used: 142, limit: 500, expires: "Mar 31, 2025", scope: "Global", status: "Active" },
  { code: "JAMES10", type: "Percentage", value: "10%", used: 28, limit: 100, expires: "Feb 28, 2025", scope: "Instructor", status: "Active" },
  { code: "FLAT20", type: "Flat", value: "$20", used: 500, limit: 500, expires: "Jan 31, 2025", scope: "Global", status: "Expired" },
  { code: "WELCOME15", type: "Percentage", value: "15%", used: 89, limit: null, expires: "Dec 31, 2025", scope: "Global", status: "Active" },
];

export const APPROVALS = [
  { id: "APR-001", type: "New Course", title: "Advanced React Patterns", by: "James Carter", date: "Feb 19, 2025", priority: "Normal" },
  { id: "APR-002", type: "New Instructor", title: "Prof. Amara Nwosu", by: "Self-registration", date: "Feb 18, 2025", priority: "High" },
  { id: "APR-003", type: "Book Approval", title: "CSS Grid in Practice v2", by: "Sofia Lin", date: "Feb 17, 2025", priority: "Normal" },
  { id: "APR-004", type: "Instructor KYC", title: "Ravi Patel — ID Verification", by: "System", date: "Feb 16, 2025", priority: "High" },
  { id: "APR-005", type: "Course Update", title: "Full-Stack Bootcamp v2.0", by: "James Carter", date: "Feb 15, 2025", priority: "Normal" },
];

export const REVIEWS = [
  { id: 1, student: "Priya Sharma", course: "Full-Stack Bootcamp", rating: 5, comment: "Absolutely life-changing course. Best investment I've made in my education.", date: "Feb 18", reported: false },
  { id: 2, student: "Carlos Mendez", course: "UI/UX Design Masterclass", rating: 4, comment: "Great content, some sections could use more depth but overall excellent.", date: "Feb 17", reported: false },
  { id: 3, student: "spammer_bot", course: "Python for Data Science", rating: 1, comment: "SPAM! CLICK HERE!! BUY DISCOUNT AT XYZ.COM!!", date: "Feb 16", reported: true },
  { id: 4, student: "Yuki Tanaka", course: "Digital Marketing Pro", rating: 5, comment: "Comprehensive and well-structured. Highly recommended for anyone starting out.", date: "Feb 15", reported: false },
];

export const PAYOUTS = [
  { id: "PAY-001", instructor: "James Carter", amount: 2400, method: "Bank Transfer", date: "Feb 18, 2025", status: "Pending" },
  { id: "PAY-002", instructor: "Sofia Lin", amount: 1100, method: "PayPal", date: "Feb 16, 2025", status: "Pending" },
  { id: "PAY-003", instructor: "Ravi Patel", amount: 3200, method: "Bank Transfer", date: "Feb 14, 2025", status: "Approved" },
];

export const REFUNDS = [
  { id: "REF-001", student: "Tom Bradley", course: "React Native Basics", amount: 22, reason: "Content quality", date: "Feb 17, 2025", flagged: false },
  { id: "REF-002", student: "Carlos Mendez", course: "Digital Marketing Pro", amount: 34, reason: "Wrong course", date: "Feb 15, 2025", flagged: false },
  { id: "REF-003", student: "Unknown User", course: "Full-Stack Bootcamp", amount: 290, reason: "Dispute — Fraud Detection", date: "Feb 12, 2025", flagged: true },
];

export const TRANSACTIONS = [
  { id: "TXN-8821", type: "Enrollment", desc: "Priya Sharma — Python for Data Science", amount: +19, date: "Feb 19", status: "Success" },
  { id: "TXN-8820", type: "Payout", desc: "Ravi Patel — Monthly Payout", amount: -3200, date: "Feb 19", status: "Success" },
  { id: "TXN-8819", type: "Refund", desc: "Tom Bradley — React Native Basics", amount: -22, date: "Feb 18", status: "Success" },
  { id: "TXN-8818", type: "Enrollment", desc: "Yuki Tanaka — UI/UX Design Masterclass", amount: +24, date: "Feb 18", status: "Success" },
  { id: "TXN-8817", type: "Enrollment", desc: "Fatima Al-Hassan — Bootcamp Bundle", amount: +290, date: "Feb 17", status: "Flagged" },
];

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", badge: null },
  { id: "students", label: "Students", badge: 12 },
  { id: "instructors", label: "Instructors", badge: 2 },
  { id: "courses", label: "Courses", badge: null },
  { id: "books", label: "Books & Products", badge: null },
  { id: "finance", label: "Financial", badge: null },
  { id: "reviews", label: "Reviews", badge: 7 },
  { id: "badges", label: "Badges & Ranking", badge: null },
  { id: "coupons", label: "Coupons", badge: null },
  { id: "approvals", label: "Approvals", badge: 5 },
  { id: "cms", label: "CMS / Content", badge: null },
  { id: "analytics", label: "Analytics", badge: null },
  { id: "notifications", label: "Notifications", badge: null },
  { id: "security", label: "Security", badge: null },
  { id: "settings", label: "Settings", badge: null },
  { id: "gamification", label: "Gamification", badge: null },
];
