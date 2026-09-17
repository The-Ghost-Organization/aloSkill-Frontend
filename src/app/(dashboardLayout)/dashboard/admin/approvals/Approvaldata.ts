// ═══════════════════════════════════════════════════════
//   APPROVAL REVIEW DETAIL DATA
//   Replace these fetch functions with real DB queries.
//   They are async so Next.js can cache/stream them.
// ═══════════════════════════════════════════════════════

export type ApprovalItem = {
  id: string;
  type: "New Course" | "Course Update" | "New Instructor" | "Instructor KYC" | "Book Approval";
  title: string;
  by: string;
  date: string;
  priority: "High" | "Normal";
  refId: string; // ID that maps to the course / book / instructor
};

export type Lesson = {
  id: string;
  title: string;
  type: "video" | "article" | "quiz" | "assignment" | "resource";
  duration: string;
  isFree: boolean;
  // For video lessons — replace with real signed URL from your storage
  videoUrl?: string;
  // For article/text lessons
  content?: string;
  // Short description shown in the lesson list
  description?: string;
};

export type CourseSection = {
  title: string;
  duration: string;
  lessons: Lesson[];
};

export type CourseDetail = {
  id: string;
  title: string;
  instructor: string;
  instructorEmail: string;
  category: string;
  price: number;
  language: string;
  level: string;
  status: string;
  description: string;
  objectives: string[];
  requirements: string[];
  sections: CourseSection[];
  totalLessons: number;
  totalDuration: string;
  previewVideo: string;
  thumbnail: string;
  submittedAt: string;
  previousNotes?: string;
};

export type BookDetail = {
  id: string;
  title: string;
  author: string;
  authorEmail: string;
  type: "Digital" | "Physical";
  price: number;
  isbn?: string;
  pages: number;
  language: string;
  category: string;
  description: string;
  tableOfContents: string[];
  samplePages: number;
  coverImage: string;
  fileFormat?: string;
  fileSize?: string;
  publisher?: string;
  publishedYear?: number;
  stock?: number;
  submittedAt: string;
  previousNotes?: string;
};

export type InstructorDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  timezone: string;
  bio: string;
  expertise: string[];
  socialLinks: { platform: string; url: string }[];
  education: string;
  experience: string;
  idDocType: string;
  idDocStatus: string;
  addressProofStatus: string;
  taxFormStatus: string;
  profilePhoto: string;
  existingCourses?: number;
  existingStudents?: number;
  existingRating?: number;
  submittedAt: string;
  previousNotes?: string;
};

// ── Mock fetch functions ─────────────────────────────────────────────────────
// In production replace with: prisma.course.findUnique({ where: { id } })  etc.

const COURSE_DETAILS: Record<string, CourseDetail> = {
  "APR-001": {
    id: "APR-001",
    title: "Advanced React Patterns",
    instructor: "James Carter",
    instructorEmail: "james@email.com",
    category: "Development",
    price: 49,
    language: "English",
    level: "Advanced",
    status: "Pending",
    description:
      "A deep-dive into advanced React patterns including compound components, render props, custom hooks, state machines, and performance optimisation techniques used by top engineering teams.",
    objectives: [
      "Master compound component pattern",
      "Implement render props and HOCs correctly",
      "Build reusable custom hook libraries",
      "Optimise renders with useMemo, useCallback, and React.memo",
      "Integrate XState for complex UI state machines",
    ],
    requirements: [
      "Solid understanding of React hooks",
      "Familiarity with TypeScript",
      "At least 1 year of React development experience",
    ],
    sections: [
      {
        title: "Compound Components",
        duration: "1h 20m",
        lessons: [
          { id: "l1", title: "What are Compound Components?", type: "video", duration: "8:24", isFree: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Overview of the compound component pattern and when to use it." },
          { id: "l2", title: "Building a Tabs Component", type: "video", duration: "14:10", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Step-by-step implementation of a fully flexible Tabs component." },
          { id: "l3", title: "Context API as the Glue", type: "video", duration: "11:30", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Using React Context to share state between compound children." },
          { id: "l4", title: "Compound Accordion Exercise", type: "assignment", duration: "20m", isFree: false, description: "Build an accessible accordion using the compound component pattern. Starter code provided.", content: "## Assignment\n\nUsing what you've learned, build an `<Accordion>` component that:\n\n1. Exposes `<Accordion.Item>`, `<Accordion.Trigger>`, and `<Accordion.Content>` sub-components\n2. Uses Context to track open/closed state\n3. Supports both single and multi-open modes via a prop\n\n### Acceptance Criteria\n- Keyboard navigable (arrow keys, Enter, Space)\n- ARIA attributes correctly applied\n- Works without any CSS (structure-only)" },
          { id: "l5", title: "Pattern Comparison: Prop Drilling vs Compound", type: "article", duration: "6m read", isFree: false, description: "Side-by-side comparison with code examples.", content: "## Prop Drilling vs Compound Components\n\n### The Problem with Prop Drilling\n\nWhen you need to pass data through many layers of components, you end up with:\n\n```tsx\n<Card title={title} isOpen={isOpen} onToggle={onToggle} theme={theme}>\n  <CardHeader title={title} isOpen={isOpen} onToggle={onToggle} />\n  <CardBody isOpen={isOpen} theme={theme} />\n</Card>\n```\n\n### With Compound Components\n\n```tsx\n<Card>\n  <Card.Header />\n  <Card.Body />\n</Card>\n```\n\nThe parent `Card` owns all state internally and shares it via Context. Children opt-in to only what they need." },
          { id: "l6", title: "Section Quiz", type: "quiz", duration: "10m", isFree: false, description: "5 questions covering compound component concepts.", content: "**Q1.** What React API do compound components typically use to share state between parent and children?\n\n- A) Props\n- B) React Context ✓\n- C) Redux\n- D) Refs\n\n**Q2.** Which of the following is NOT a benefit of compound components?\n- A) Flexible composition\n- B) Implicit state sharing\n- C) Reduced bundle size ✓\n- D) Clear API surface" },
        ],
      },
      {
        title: "Render Props & HOCs",
        duration: "58m",
        lessons: [
          { id: "l7", title: "The Render Prop Pattern Explained", type: "video", duration: "10:15", isFree: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Core concept and motivation behind render props." },
          { id: "l8", title: "Mouse Tracker with Render Props", type: "video", duration: "12:40", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Classic mouse position example rebuilt with render props." },
          { id: "l9", title: "Higher-Order Components (HOCs)", type: "video", duration: "13:20", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "When HOCs make sense and how to write them safely." },
          { id: "l10", title: "Render Props vs HOCs vs Hooks", type: "article", duration: "8m read", isFree: false, description: "Decision guide: which pattern to reach for and when.", content: "## Choosing the Right Pattern\n\n| Pattern | Best For | Downside |\n|---|---|---|\n| Render Props | Dynamic rendering, explicit data flow | Callback hell at scale |\n| HOCs | Cross-cutting concerns (auth, logging) | Props collision, debugging difficulty |\n| Custom Hooks | Logic reuse without UI coupling | Can't use in class components |\n\n**Rule of thumb:** Prefer hooks for logic reuse, render props when the consumer controls rendering, HOCs only for wrapping third-party components." },
          { id: "l11", title: "Section Quiz", type: "quiz", duration: "8m", isFree: false, description: "4 questions on render props and HOC patterns.", content: "**Q1.** A render prop is a function passed as a prop that returns...\n- A) A string\n- B) JSX ✓\n- C) A Promise\n- D) An object" },
        ],
      },
      {
        title: "Custom Hook Patterns",
        duration: "1h 45m",
        lessons: [
          { id: "l12", title: "Rules of Hooks Refresher", type: "video", duration: "7:00", isFree: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Quick recap of the two rules of hooks and why they exist." },
          { id: "l13", title: "useLocalStorage Hook", type: "video", duration: "11:50", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Build a production-ready localStorage sync hook." },
          { id: "l14", title: "useAsync & Data Fetching Patterns", type: "video", duration: "18:20", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Generic async state management hook with loading/error/data." },
          { id: "l15", title: "useReducer for Complex State", type: "video", duration: "15:10", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "When useState isn't enough — using useReducer with TypeScript." },
          { id: "l16", title: "Hook Library Exercise", type: "assignment", duration: "30m", isFree: false, description: "Build a mini hook library with 3 utility hooks.", content: "## Assignment: Build Your Hook Library\n\nCreate a `hooks/` directory with the following:\n\n### 1. `useDebounce<T>(value: T, delay: number): T`\nReturns a debounced version of the value.\n\n### 2. `useClickOutside(ref, callback)`\nFires callback when a click occurs outside the referenced element.\n\n### 3. `usePrevious<T>(value: T): T | undefined`\nReturns the previous render's value.\n\nEach hook must have:\n- Full TypeScript types\n- A unit test with Vitest\n- A usage example in a Storybook story" },
          { id: "l17", title: "Testing Custom Hooks with renderHook", type: "video", duration: "13:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Using React Testing Library's renderHook to test custom hooks." },
          { id: "l18", title: "Resources: Hook Libraries Worth Knowing", type: "resource", duration: "—", isFree: false, description: "Curated list of battle-tested hook libraries.", content: "## Recommended Hook Libraries\n\n- **@tanstack/react-query** — Server state, caching, background sync\n- **zustand** — Minimal client state management\n- **react-use** — 100+ utility hooks (useDebounce, useToggle, etc.)\n- **ahooks** — Alibaba's hook collection, excellent for complex scenarios\n- **use-immer** — Immutable state updates with a mutable API\n\nAll linked in the course resources section." },
          { id: "l19", title: "Section Quiz", type: "quiz", duration: "10m", isFree: false, description: "6 questions on custom hook design.", content: "**Q1.** Which prefix is required for a function to be recognised as a React hook?\n- A) get\n- B) use ✓\n- C) hook\n- D) react" },
        ],
      },
      {
        title: "State Machines with XState",
        duration: "1h 30m",
        lessons: [
          { id: "l20", title: "Why State Machines?", type: "video", duration: "9:00", isFree: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "The problem with boolean state soup and how machines fix it." },
          { id: "l21", title: "XState Basics: States & Transitions", type: "video", duration: "14:30", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Creating your first machine with states, events, and transitions." },
          { id: "l22", title: "Modelling a Form with XState", type: "video", duration: "20:15", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Multi-step form state modelled as a proper state machine." },
          { id: "l23", title: "Actors & Parallel States", type: "video", duration: "16:45", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Spawning actors for independent sub-machines." },
          { id: "l24", title: "XState + React: useMachine Hook", type: "video", duration: "12:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Wiring an XState machine into a React component." },
          { id: "l25", title: "Section Quiz", type: "quiz", duration: "8m", isFree: false, description: "5 questions on state machine concepts.", content: "**Q1.** In XState, what is a 'guard'?\n- A) A security layer\n- B) A conditional check on a transition ✓\n- C) An async side effect\n- D) A child machine" },
          { id: "l26", title: "Machine Visualizer Assignment", type: "assignment", duration: "25m", isFree: false, description: "Model a traffic light and a checkout flow as XState machines.", content: "## Assignment: State Machine Design\n\n### Part 1 — Traffic Light\nModel a 4-state traffic light (red → red-amber → green → amber → red) with a timed transition every 5 seconds.\n\n### Part 2 — Checkout Flow\nModel an e-commerce checkout with these states:\n- `cart` → `address` → `payment` → `review` → `confirmed`\n- Include a `failed` state reachable from `payment`\n- Include guards preventing transitions if required fields are empty" },
        ],
      },
      {
        title: "Performance Deep Dive",
        duration: "1h 15m",
        lessons: [
          { id: "l27", title: "How React Reconciliation Works", type: "video", duration: "11:20", isFree: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Virtual DOM diffing, fiber, and what triggers re-renders." },
          { id: "l28", title: "React.memo — When and When Not To", type: "video", duration: "10:45", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Memoising components correctly without over-optimising." },
          { id: "l29", title: "useMemo & useCallback Deep Dive", type: "video", duration: "14:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "The real cost of memoisation — when it helps and when it hurts." },
          { id: "l30", title: "Profiling with React DevTools", type: "video", duration: "9:30", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Using the Profiler tab to identify expensive renders." },
          { id: "l31", title: "Code Splitting & Lazy Loading", type: "video", duration: "10:15", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "React.lazy, Suspense, and route-level code splitting." },
          { id: "l32", title: "Final Course Quiz", type: "quiz", duration: "15m", isFree: false, description: "20 comprehensive questions covering the entire course.", content: "**Q1.** What hook is used to memoize expensive calculations?\n- A) useCallback\n- B) useMemo ✓\n- C) useRef\n- D) useEffect\n\n**Q2.** React.memo performs a shallow comparison of...\n- A) State\n- B) Context\n- C) Props ✓\n- D) Children" },
        ],
      },
    ],
    totalLessons: 32,
    totalDuration: "6h 48m",
    previewVideo: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "",
    submittedAt: "Feb 19, 2025",
    previousNotes: undefined,
  },
  "APR-005": {
    id: "APR-005",
    title: "Full-Stack Bootcamp v2.0",
    instructor: "James Carter",
    instructorEmail: "james@email.com",
    category: "Development",
    price: 29,
    language: "English",
    level: "Beginner",
    status: "Pending",
    description:
      "Updated version of the best-selling bootcamp. Added new modules on Next.js 14, server components, Prisma ORM, and deployment with Vercel and Railway.",
    objectives: [
      "Build full-stack apps with Next.js 14",
      "Design databases with Prisma & PostgreSQL",
      "Implement auth with NextAuth.js",
      "Deploy to production with Vercel",
    ],
    requirements: ["Basic HTML/CSS knowledge", "Comfortable with JavaScript"],
    sections: [
      {
        title: "HTML & CSS Foundations",
        duration: "2h 10m",
        lessons: [
          { id: "b1", title: "HTML Document Structure", type: "video", duration: "9:00", isFree: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "DOCTYPE, head, body, semantic HTML5 elements." },
          { id: "b2", title: "The CSS Box Model", type: "video", duration: "11:30", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Margin, border, padding, content — visualised clearly." },
          { id: "b3", title: "Flexbox in 20 Minutes", type: "video", duration: "20:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "All flexbox properties with live examples." },
          { id: "b4", title: "CSS Grid Essentials", type: "video", duration: "18:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Grid template, areas, auto-fill, responsive layouts." },
          { id: "b5", title: "Responsive Design & Media Queries", type: "video", duration: "14:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Mobile-first approach with Tailwind utility classes." },
        ],
      },
      {
        title: "JavaScript Essentials",
        duration: "2h 45m",
        lessons: [
          { id: "b6", title: "ES6+ Features You Must Know", type: "video", duration: "16:00", isFree: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Arrow functions, destructuring, spread, optional chaining." },
          { id: "b7", title: "Async/Await & Promises", type: "video", duration: "18:30", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "How the JS event loop works and writing clean async code." },
          { id: "b8", title: "Array & Object Methods", type: "article", duration: "10m read", isFree: false, description: "map, filter, reduce, Object.entries, and more.", content: "## Essential Array & Object Methods\n\n### Arrays\n```js\nconst nums = [1, 2, 3, 4, 5];\nnums.map(n => n * 2);        // [2, 4, 6, 8, 10]\nnums.filter(n => n % 2 === 0); // [2, 4]\nnums.reduce((acc, n) => acc + n, 0); // 15\n```\n\n### Objects\n```js\nconst obj = { a: 1, b: 2 };\nObject.keys(obj);    // ['a', 'b']\nObject.values(obj);  // [1, 2]\nObject.entries(obj); // [['a', 1], ['b', 2]]\n```" },
          { id: "b9", title: "TypeScript Fundamentals", type: "video", duration: "20:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Types, interfaces, generics — just enough TypeScript to be productive." },
        ],
      },
      {
        title: "Next.js 14 & Server Components",
        duration: "4h 00m",
        lessons: [
          { id: "b10", title: "App Router vs Pages Router", type: "video", duration: "12:00", isFree: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "What changed in Next.js 13/14 and how to migrate mentally." },
          { id: "b11", title: "Server Components Explained", type: "video", duration: "22:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "RSC vs Client Components — rendering boundaries and performance." },
          { id: "b12", title: "Data Fetching Patterns", type: "video", duration: "18:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "fetch with caching, revalidation, and streaming with Suspense." },
          { id: "b13", title: "Server Actions Deep Dive", type: "video", duration: "20:00", isFree: false, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", description: "Form submissions, mutations, and optimistic updates." },
        ],
      },
    ],
    totalLessons: 70,
    totalDuration: "16h 45m",
    previewVideo: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "",
    submittedAt: "Feb 15, 2025",
    previousNotes: "v1.0 was approved. This update adds Next.js 14 content. Please verify new sections meet quality standard.",
  },
};

const BOOK_DETAILS: Record<string, BookDetail> = {
  "APR-003": {
    id: "APR-003",
    title: "CSS Grid in Practice v2",
    author: "Sofia Lin",
    authorEmail: "sofia@email.com",
    type: "Digital",
    price: 18,
    pages: 210,
    language: "English",
    category: "Design",
    description:
      "The fully updated second edition of the best-selling CSS Grid guide. Covers CSS Grid Level 2, subgrid, masonry layout, and real-world responsive design patterns with 40+ hands-on exercises.",
    tableOfContents: [
      "Chapter 1 — Grid Fundamentals Refresher",
      "Chapter 2 — Named Lines & Template Areas",
      "Chapter 3 — Subgrid Deep Dive",
      "Chapter 4 — Masonry Layout",
      "Chapter 5 — Responsive Grid Patterns",
      "Chapter 6 — Grid + Flexbox Combinations",
      "Chapter 7 — Animation & Grid",
      "Chapter 8 — Browser Compatibility & Fallbacks",
      "Appendix A — 40 Practice Exercises",
    ],
    samplePages: 20,
    coverImage: "",
    fileFormat: "PDF + ePub",
    fileSize: "8.4 MB",
    isbn: "978-0-000-00003-2",
    submittedAt: "Feb 17, 2025",
    previousNotes: "v1 was well received (4.9★, 340 sales). v2 adds subgrid and masonry chapters.",
  },
};

const INSTRUCTOR_DETAILS: Record<string, InstructorDetail> = {
  "APR-002": {
    id: "APR-002",
    name: "Prof. Amara Nwosu",
    email: "amara.nwosu@edu.ng",
    phone: "+234 801 000 0001",
    country: "Nigeria",
    timezone: "Africa/Lagos (UTC+1)",
    bio: "Professor of Computer Science at University of Lagos with 12 years of teaching experience. Specialises in machine learning, computer vision, and data engineering. Author of two academic textbooks and 18 peer-reviewed papers.",
    expertise: ["Machine Learning", "Computer Vision", "Python", "TensorFlow", "Data Engineering"],
    socialLinks: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/amara-nwosu" },
      { platform: "GitHub", url: "https://github.com/amara-nwosu" },
      { platform: "Google Scholar", url: "https://scholar.google.com" },
    ],
    education: "PhD Computer Science — MIT, 2012",
    experience: "12 years university teaching · 3 years industry (Google Brain, visiting researcher)",
    idDocType: "International Passport",
    idDocStatus: "Submitted",
    addressProofStatus: "Submitted",
    taxFormStatus: "Pending",
    profilePhoto: "",
    submittedAt: "Feb 18, 2025",
    previousNotes: undefined,
  },
  "APR-004": {
    id: "APR-004",
    name: "Ravi Patel",
    email: "ravi@email.com",
    phone: "+91 98100-00001",
    country: "India",
    timezone: "Asia/Kolkata (UTC+5:30)",
    bio: "Senior Data Scientist with 8 years of industry experience at Amazon and Flipkart. Passionate about making data science accessible. Creator of 7 popular courses with 1,800+ students.",
    expertise: ["Python", "Data Science", "Machine Learning", "SQL", "Tableau"],
    socialLinks: [
      { platform: "LinkedIn", url: "https://linkedin.com/in/ravi-patel" },
      { platform: "GitHub", url: "https://github.com/ravipatel" },
    ],
    education: "M.Tech Computer Science — IIT Bombay, 2016",
    experience: "8 years industry (Amazon, Flipkart) · 3 years online teaching",
    idDocType: "Aadhaar Card",
    idDocStatus: "Verified",
    addressProofStatus: "Verified",
    taxFormStatus: "Submitted",
    profilePhoto: "",
    submittedAt: "Feb 16, 2025",
    previousNotes: "KYC documents submitted. Tax form still pending signature.",
  },
};

// ── Public fetch API ─────────────────────────────────────────────────────────

export async function getApprovalDetail(
  approvalId: string,
): Promise<
  | { kind: "course"; data: CourseDetail }
  | { kind: "book"; data: BookDetail }
  | { kind: "instructor"; data: InstructorDetail }
  | null
> {
  // Simulate network latency (remove in production)
  await new Promise(r => setTimeout(r, 0));

  const approval = APPROVALS_DETAIL.find(a => a.id === approvalId);
  if (!approval) return null;

  if (approval.type === "New Course" || approval.type === "Course Update") {
    const data = COURSE_DETAILS[approvalId];
    if (!data) return null;
    return { kind: "course", data };
  }

  if (approval.type === "Book Approval") {
    const data = BOOK_DETAILS[approvalId];
    if (!data) return null;
    return { kind: "book", data };
  }

  if (approval.type === "New Instructor" || approval.type === "Instructor KYC") {
    const data = INSTRUCTOR_DETAILS[approvalId];
    if (!data) return null;
    return { kind: "instructor", data };
  }

  return null;
}

export const APPROVALS_DETAIL: ApprovalItem[] = [
  { id: "APR-001", type: "New Course", title: "Advanced React Patterns", by: "James Carter", date: "Feb 19, 2025", priority: "Normal", refId: "APR-001" },
  { id: "APR-002", type: "New Instructor", title: "Prof. Amara Nwosu", by: "Self-registration", date: "Feb 18, 2025", priority: "High", refId: "APR-002" },
  { id: "APR-003", type: "Book Approval", title: "CSS Grid in Practice v2", by: "Sofia Lin", date: "Feb 17, 2025", priority: "Normal", refId: "APR-003" },
  { id: "APR-004", type: "Instructor KYC", title: "Ravi Patel — ID Verification", by: "System", date: "Feb 16, 2025", priority: "High", refId: "APR-004" },
  { id: "APR-005", type: "Course Update", title: "Full-Stack Bootcamp v2.0", by: "James Carter", date: "Feb 15, 2025", priority: "Normal", refId: "APR-005" },
];
