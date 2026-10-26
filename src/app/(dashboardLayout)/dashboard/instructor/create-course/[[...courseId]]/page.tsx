"use client";

import { apiClient } from "@/lib/api/client.ts";
import {
  Check,
  CheckCircle2,
  Circle,
  FileText,
  Globe,
  Layers,
  ListChecks,
  Loader2,
  LucidePlaySquare,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { type Category, useSessionContext } from "../../../../../contexts/SessionContext.tsx";
import AdvanceInformation from "./AdvanceInformation.tsx";
import BasicInformaton from "./BasicInformaton.tsx";
import CourseCurriculum from "./CourseCurriculum.tsx";
import { validateCurriculum } from "./curriculumValidation";
import FinalStep from "./FinalStep.tsx";
import { cx } from "./formUi.tsx";

// ── Types (unchanged) ────────────────────────────────────────────────────────

type Quiz = {
  title: string;
  description?: string;
  duration?: number;
  passingScore: number;
  attemptsAllowed: number;
  questions: {
    position: number;
    text: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SINGLE_CHOICE";
    points: number;
    options: {
      position: number;
      text: string;
      isCorrect: boolean;
    }[];
  }[];
};

export type CourseLesson = {
  id?: string;
  hostingType?: "FREE" | "PREMIUM";
  requestedHostingType?: "FREE" | "PREMIUM";
  videoUploadJobId?: string | null;
  pendingVideoUploadJobId?: string;
  pendingHostingType?: "FREE" | "PREMIUM";
  freeHostingAcknowledged?: boolean;
  youtubeDisclosureAccepted?: boolean;
  uploadMessage?: string;
  uploadProgress?: import("@/lib/course/videoHosting").VideoUploadProgress;
  title: string;
  position: number;
  notes?: string;
  description: string;
  type: "VIDEO" | "ARTICLE" | "QUIZ" | null;
  contentUrl?: { name: string; url: string } | null;
  files?: { name: string; url: string }[];
  duration?: number | null;
  quiz?: Quiz;
  expanded: boolean;
  lessonTypeSelection: boolean;
};

type CourseInstructor = {
  instructorId: string;
  displayName: string;
  role: "PRIMARY" | "CO_INSTRUCTOR";
};

export type CourseModule = {
  id?: string;
  title: string;
  position: number;
  lessons: CourseLesson[];
};

export type CreateCourseData = {
  defaultHosting?: "FREE" | "PREMIUM";
  id?: string;
  title: string;
  slug: string;
  allCategory: Category[];
  category: string;
  subCategory: string;
  tags: string[];
  description: string;
  welcomeMessage?: string;
  congratulationsMessage?: string;
  originalPrice: number;
  discountPercent?: number;
  discountPrice?: number | null;
  discountEndDate?: Date | null;
  language: "ENGLISH" | "BANGLA";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  thumbnailUrl?: string | null;
  trailerUrl?: string | null;
  modules: CourseModule[];
  courseInstructors?: CourseInstructor[];
  status: "DRAFT" | "PUBLISHED";
};

// ── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, name: "Basics", description: "Title, category, level", icon: Layers },
  { id: 2, name: "Course details", description: "Media, description, outcomes", icon: FileText },
  { id: 3, name: "Curriculum", description: "Modules, lessons, quizzes", icon: LucidePlaySquare },
  { id: 4, name: "Pricing & publish", description: "Price, team, messages", icon: Globe },
] as const;

// ── Stepper (desktop) ─────────────────────────────────────────────────────────
const StepItem = ({
  step,
  isActive,
  isCompleted,
  onClick,
}: {
  step: (typeof STEPS)[number];
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) => (
  <button
    type='button'
    onClick={onClick}
    aria-current={isActive ? "step" : undefined}
    className='group flex min-w-0 items-center gap-3 rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2'
  >
    <span
      className={cx(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums transition-colors",
        isActive
          ? "border-orange bg-orange text-white"
          : isCompleted
            ? "border-orange bg-orange-500/10 text-orange"
            : "border-gray-200 bg-white text-gray-400 group-hover:border-gray-300"
      )}
    >
      {isCompleted ? (
        <Check
          className='h-4 w-4'
          strokeWidth={3}
          aria-hidden='true'
        />
      ) : (
        step.id
      )}
    </span>
    <span className='min-w-0'>
      <span
        className={cx(
          "block truncate text-sm font-semibold",
          isActive ? "text-gray-900" : isCompleted ? "text-gray-700" : "text-gray-500"
        )}
      >
        {step.name}
      </span>
      <span className='hidden truncate text-xs text-gray-400 lg:block'>{step.description}</span>
    </span>
  </button>
);

// ── Error banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }: { message: string }) => (
  <div
    role='alert'
    className='mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
  >
    <span
      className='mt-0.5 shrink-0'
      aria-hidden='true'
    >
      ⚠
    </span>
    <p className='font-medium'>{message}</p>
  </div>
);

// ── Loading state ─────────────────────────────────────────────────────────────
const LoadingOverlay = () => (
  <div className='flex flex-col items-center justify-center gap-3 py-24'>
    <Loader2
      className='h-8 w-8 animate-spin text-orange'
      aria-hidden='true'
    />
    <p className='text-sm font-medium text-gray-500'>Loading course…</p>
  </div>
);

// ── Checklist (read-only summary of the saved draft) ──────────────────────────
type ChecklistItem = { label: string; done: boolean; detail?: string; info?: boolean };

const parseDescription = (raw: string) => {
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, string | undefined>;
    return parsed;
  } catch {
    return {} as Record<string, string | undefined>;
  }
};

const formatTaka = (value: number) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

const CourseChecklist = ({
  courseData,
  onNavigate,
}: {
  courseData: CreateCourseData;
  onNavigate: (step: number) => void;
}) => {
  const groups = useMemo(() => {
    const description = parseDescription(courseData.description);
    const lessons = courseData.modules.flatMap(m => m.lessons);
    const curriculumIssues = Object.keys(validateCurriculum(courseData.modules)).length;
    const uploading = lessons.filter(l => l.pendingVideoUploadJobId).length;

    const result: { step: number; title: string; items: ChecklistItem[] }[] = [
      {
        step: 1,
        title: "Basics",
        items: [
          { label: "Title", done: courseData.title.trim().length >= 5 },
          { label: "Category", done: Boolean(courseData.category || courseData.subCategory) },
          {
            label: "Tags",
            done: courseData.tags.length > 0,
            detail: courseData.tags.length ? String(courseData.tags.length) : undefined,
          },
        ],
      },
      {
        step: 2,
        title: "Course details",
        items: [
          { label: "Thumbnail", done: Boolean(courseData.thumbnailUrl) },
          { label: "Trailer", done: Boolean(courseData.trailerUrl), detail: "Optional" },
          { label: "Description", done: (description.description ?? "").trim().length >= 10 },
          { label: "Learning outcomes", done: Boolean(description.whatYouTeach) },
        ],
      },
      {
        step: 3,
        title: "Curriculum",
        items: [
          {
            label: "Lessons",
            done: lessons.length > 0 && curriculumIssues === 0 && uploading === 0,
            detail: `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}`,
          },
          ...(uploading > 0
            ? [{ label: "Videos uploading", done: false, detail: String(uploading) }]
            : curriculumIssues > 0
              ? [{ label: "Items to fix", done: false, detail: String(curriculumIssues) }]
              : []),
        ],
      },
      {
        step: 4,
        title: "Pricing",
        items: [
          {
            label: "Price",
            done: courseData.originalPrice > 0,
            info: true,
            detail: courseData.originalPrice > 0 ? formatTaka(courseData.originalPrice) : "Free or not set",
          },
        ],
      },
    ];
    return result;
  }, [courseData]);

  // Optional items and informational rows are not counted towards completeness.
  const all = groups.flatMap(g => g.items).filter(i => i.detail !== "Optional" && !i.info);
  const done = all.filter(i => i.done).length;
  const percent = Math.round((done / Math.max(1, all.length)) * 100);

  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
      <div className='flex items-center gap-2'>
        <ListChecks
          className='h-4 w-4 text-orange'
          aria-hidden='true'
        />
        <h2 className='text-sm font-semibold text-gray-900'>Course checklist</h2>
        <span className='ml-auto text-xs font-semibold tabular-nums text-gray-500'>
          {done}/{all.length}
        </span>
      </div>
      <div
        className='mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100'
        role='progressbar'
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label='Course completeness'
      >
        <div
          className='h-full rounded-full bg-orange transition-all duration-500'
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className='mt-2 text-xs text-gray-400'>Updates each time you save a step.</p>

      <div className='mt-4 space-y-4'>
        {groups.map(group => (
          <div key={group.step}>
            <button
              type='button'
              onClick={() => onNavigate(group.step)}
              className='mb-1.5 rounded text-xs font-semibold text-gray-500 hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange'
            >
              {group.title}
            </button>
            <ul className='space-y-1.5'>
              {group.items.map(item => (
                <li
                  key={item.label}
                  className='flex items-center gap-2 text-[13px]'
                >
                  {item.done ? (
                    <CheckCircle2
                      className='h-4 w-4 shrink-0 text-emerald-600'
                      aria-label='Done'
                    />
                  ) : (
                    <Circle
                      className='h-4 w-4 shrink-0 text-gray-300'
                      aria-label='Not done'
                    />
                  )}
                  <span className={item.done ? "text-gray-700" : "text-gray-500"}>{item.label}</span>
                  {item.detail && (
                    <span className='ml-auto truncate text-xs tabular-nums text-gray-400'>
                      {item.detail}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// The same form is shared by the instructor and admin dashboards. These scoped
// descendant utilities apply the admin palette without changing instructor UI.
const ADMIN_COURSE_THEME = [
  "bg-[#071426] text-slate-100",
  "[&_.bg-white]:!bg-[#0d1f3c] [&_.bg-gray-50]:!bg-[#071426]",
  "[&_.bg-gray-100]:!bg-slate-800 [&_.bg-gray-200]:!bg-slate-700",
  "[&_.bg-gray-100\/40]:!bg-slate-800/40 [&_.bg-gray-100\/20]:!bg-slate-800/20",
  "[&_.bg-gray-300]:!bg-slate-600 [&_.bg-gray-400]:!bg-slate-600",
  "[&_.bg-gray-400\/60]:!bg-slate-700 [&_.bg-gray-600\/60]:!bg-slate-950/80",
  "[&_.text-gray-900]:!text-slate-100 [&_.text-gray-800]:!text-slate-200",
  "[&_.text-gray-700]:!text-slate-300 [&_.text-gray-600]:!text-slate-400",
  "[&_.text-gray-500]:!text-slate-400 [&_.text-gray-400]:!text-slate-500",
  "[&_.text-gray-300]:!text-slate-500",
  "[&_.border-gray-100]:!border-slate-800 [&_.border-gray-200]:!border-slate-700",
  "[&_.border-gray-300]:!border-slate-600 [&_.shadow-sm]:!shadow-black/20",
  "[&_.bg-red-50]:!bg-red-950/30 [&_.border-red-200]:!border-red-500/30",
  "[&_.text-red-700]:!text-red-300 [&_.text-red-600]:!text-red-300",
  "[&_.text-amber-800]:!text-amber-200 [&_.text-amber-700]:!text-amber-300 [&_.text-amber-600]:!text-amber-300",
  "[&_.text-emerald-800]:!text-emerald-200 [&_.text-emerald-700]:!text-emerald-300 [&_.text-emerald-600]:!text-emerald-400",
  "[&_.text-orange-700]:!text-orange-300",
  "[&_input]:!border-slate-700 [&_input]:!bg-slate-950 [&_input]:!text-slate-100",
  "[&_textarea]:!border-slate-700 [&_textarea]:!bg-slate-950 [&_textarea]:!text-slate-100",
  "[&_select]:!border-slate-700 [&_select]:!bg-slate-950 [&_select]:!text-slate-100",
  "[&_input::placeholder]:!text-slate-600 [&_textarea::placeholder]:!text-slate-600",
  "[&_label]:!text-slate-400",
  // Selected choice cards / segments (must out-rank the bg-white & border overrides above)
  "[&_input:checked+.choice-card]:!border-orange [&_input:checked+.choice-card]:!bg-orange-500/15",
  "[&_input:checked+.choice-card_.choice-dot]:!border-orange [&_input:checked+.choice-card_.choice-dot]:!bg-orange",
  "[&_input:checked+.segment]:!bg-slate-700 [&_input:checked+.segment]:!text-slate-100",
  "[&_.bare-input]:!border-0 [&_.bare-input]:!bg-transparent",
].join(" ");

// ── Main component ────────────────────────────────────────────────────────────
export default function CourseCreationForm({ adminMode = false }: { adminMode?: boolean }) {
  // ── State & logic (unchanged) ─────────────────────────────────────────────
  const { courseId } = useParams();
  const { categories } = useSessionContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1);
  const [courseUploadError, setCourseUploadError] = useState<string>("");
  const [courseData, setCourseData] = useState<CreateCourseData>({
    title: "",
    slug: "",
    tags: [],
    allCategory: [],
    category: "",
    subCategory: "",
    description: "",
    thumbnailUrl: "",
    trailerUrl: "",
    originalPrice: 0,
    discountPercent: 0,
    discountPrice: 0,
    discountEndDate: null,
    language: "ENGLISH",
    level: "BEGINNER",
    status: "DRAFT",
    modules: [
      {
        position: 1,
        title: "Module 1",
        lessons: [
          {
            position: 1,
            title: "Lesson 1",
            description: "",
            notes: "",
            type: null,
            contentUrl: { name: "", url: "" },
            files: [] as { name: string; url: string }[],
            duration: null,
            expanded: false,
            lessonTypeSelection: true,
          },
        ],
      },
    ],
  });

  useEffect(() => {
    if (!categories) return;
    setCourseData(prev => ({ ...prev, allCategory: categories }));
  }, [categories]);

  const handleGetCourse = useCallback(async () => {
    setLoading(true);
    setCategoryError("");
    try {
      const response = await apiClient.get<CreateCourseData>(
        `/course/getAndEditCourse/${courseId}`
      );
      if (response.success && response.data) {
        setCourseData(prev => ({ ...prev, ...response.data }));
        setLoading(false);
        return;
      } else {
        throw new Error("Failed to fetch Course");
      }
    } catch (_error) {
      setCategoryError("Failed to load Course. Please try again.");
      setLoading(false);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    handleGetCourse();
  }, [courseId, handleGetCourse]);

  // Scroll to the top of the form whenever the step changes (UI only).
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // ── Derived values ────────────────────────────────────────────────────────
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  const currentStepMeta = STEPS.find(s => s.id === currentStep)!;
  const isEditing = courseId !== undefined;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      data-course-theme={adminMode ? "admin" : "instructor"}
      className={`min-h-screen w-full overflow-x-clip ${adminMode ? ADMIN_COURSE_THEME : "bg-[#F8F9FC]"}`}
    >
      {/* ── Sticky header: title + step navigation ── */}
      <header className='sticky top-0 z-20 border-b border-gray-200 bg-white'>
        {adminMode && (
          <div className='border-b border-slate-800 bg-slate-950/70 px-4 py-2 text-center text-xs font-semibold text-orange-400 sm:px-6'>
            Admin course workspace
          </div>
        )}
        <div className='mx-auto max-w-[1280px] px-4 sm:px-6'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 pt-4'>
            <h1 className='text-lg font-semibold text-gray-900 sm:text-xl'>
              {isEditing ? courseData.title || "Edit course" : "Create a new course"}
            </h1>
            {isEditing && (
              <span
                className={cx(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  courseData.status === "PUBLISHED"
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {courseData.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            )}
          </div>

          {/* Desktop stepper (sm+) */}
          <nav
            aria-label='Course creation steps'
            className='hidden items-center gap-2 py-4 sm:flex'
          >
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <StepItem
                  step={step}
                  isActive={currentStep === step.id}
                  isCompleted={currentStep > step.id}
                  onClick={() => setCurrentStep(step.id)}
                />
                {idx < STEPS.length - 1 && (
                  <div
                    aria-hidden='true'
                    className='relative h-0.5 min-w-4 flex-1 overflow-hidden rounded-full bg-gray-200'
                  >
                    <div
                      className={cx(
                        "absolute inset-y-0 left-0 rounded-full bg-orange transition-all duration-500 ease-out",
                        currentStep > step.id ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Mobile stepper (xs only) */}
          <div className='space-y-2 py-3 sm:hidden'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-semibold text-gray-900'>{currentStepMeta.name}</span>
              <span className='text-xs font-medium tabular-nums text-gray-400'>
                Step {currentStep} of {STEPS.length}
              </span>
            </div>
            <div
              className='h-1.5 w-full overflow-hidden rounded-full bg-gray-100'
              role='progressbar'
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={STEPS.length}
              aria-label='Step progress'
            >
              <div
                className='h-full rounded-full bg-orange transition-all duration-500 ease-out'
                style={{ width: `${Math.max(progressPercent, 6)}%` }}
              />
            </div>
            <div className='flex items-center justify-center gap-3 pt-0.5'>
              {STEPS.map(step => (
                <button
                  key={step.id}
                  type='button'
                  onClick={() => setCurrentStep(step.id)}
                  aria-label={`Go to ${step.name}`}
                  aria-current={currentStep === step.id ? "step" : undefined}
                  className={cx(
                    "h-2 rounded-full transition-all duration-300",
                    currentStep === step.id
                      ? "w-6 bg-orange"
                      : currentStep > step.id
                        ? "w-3 bg-orange/50"
                        : "w-3 bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className='mx-auto grid max-w-[1280px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_280px]'>
        <div className='min-w-0'>
          {categoryError && <ErrorBanner message={categoryError} />}
          {courseUploadError && <ErrorBanner message={courseUploadError} />}

          <div className='rounded-2xl border border-gray-200 bg-white shadow-sm'>
            {loading ? (
              <LoadingOverlay />
            ) : (
              <>
                {currentStep === 1 && (
                  <BasicInformaton
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    courseData={courseData}
                    setCourseData={setCourseData}
                    loading={loading}
                  />
                )}
                {currentStep === 2 && (
                  <AdvanceInformation
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    courseData={courseData}
                    setCourseData={setCourseData}
                  />
                )}
                {currentStep === 3 && (
                  <CourseCurriculum
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    courseData={courseData}
                    setCourseData={setCourseData}
                  />
                )}
                {currentStep === 4 && (
                  <FinalStep
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    courseData={courseData}
                    setCourseData={setCourseData}
                    isParamsExisting={courseId !== undefined}
                    setCourseUploadError={setCourseUploadError}
                    adminMode={adminMode}
                  />
                )}
              </>
            )}
          </div>
        </div>

        <aside className='hidden xl:block'>
          <div className='sticky top-36'>
            <CourseChecklist
              courseData={courseData}
              onNavigate={setCurrentStep}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
