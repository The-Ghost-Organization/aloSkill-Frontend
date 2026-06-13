"use client";

import { apiClient } from "@/lib/api/client.ts";
import { Check, FileText, Globe, Layers, Loader2, LucidePlaySquare } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { type Category, useSessionContext } from "../../../../../contexts/SessionContext.tsx";
import AdvanceInformation from "./AdvanceInformation.tsx";
import BasicInformaton from "./BasicInformaton.tsx";
import CourseCurriculum from "./CourseCurriculum.tsx";
import FinalStep from "./FinalStep.tsx";

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
  title: string;
  position: number;
  lessons: CourseLesson[];
};

export type CreateCourseData = {
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
  { id: 1, name: "Basic Information", shortName: "Basic", icon: Layers },
  { id: 2, name: "Advance Information", shortName: "Advanced", icon: FileText },
  { id: 3, name: "Curriculum", shortName: "Curriculum", icon: LucidePlaySquare },
  { id: 4, name: "Publish Course", shortName: "Publish", icon: Globe },
] as const;

// ── Stepper connector ─────────────────────────────────────────────────────────
const StepConnector = ({ completed }: { completed: boolean }) => (
  <div className='relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-gray-200'>
    <div
      className={`absolute inset-y-0 left-0 rounded-full bg-orange-500 transition-all duration-500 ease-out ${
        completed ? "w-full" : "w-0"
      }`}
    />
  </div>
);

// ── Step circle + label ───────────────────────────────────────────────────────
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
}) => {
  const Icon = step.icon;
  return (
    <button
      type='button'
      onClick={onClick}
      aria-current={isActive ? "step" : undefined}
      className='group flex flex-col items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2'
    >
      <div
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
          isActive
            ? "border-orange-500 bg-orange-500 shadow-md shadow-orange-200 scale-110"
            : isCompleted
              ? "border-orange-400 bg-orange-400"
              : "border-gray-200 bg-white group-hover:border-orange-200"
        }`}
      >
        {isCompleted ? (
          <Check
            className='h-4 w-4 text-white'
            strokeWidth={2.5}
            aria-hidden='true'
          />
        ) : (
          <Icon
            className={`h-4 w-4 transition-colors ${
              isActive ? "text-white" : "text-gray-400 group-hover:text-orange-400"
            }`}
            aria-hidden='true'
          />
        )}
      </div>
      <span
        className={`hidden text-xs font-semibold tracking-wide transition-colors sm:block ${
          isActive
            ? "text-orange-500"
            : isCompleted
              ? "text-orange-400"
              : "text-gray-400 group-hover:text-gray-600"
        }`}
      >
        {step.name}
      </span>
    </button>
  );
};

// ── Error banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }: { message: string }) => (
  <div
    role='alert'
    className='mx-4 mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6'
  >
    <span className='mt-0.5 shrink-0 text-red-400'>⚠</span>
    <p className='font-medium'>{message}</p>
  </div>
);

// ── Loading overlay ───────────────────────────────────────────────────────────
const LoadingOverlay = () => (
  <div className='flex flex-col items-center justify-center gap-3 py-24 text-gray-400'>
    <Loader2
      className='h-8 w-8 animate-spin text-orange-500'
      aria-hidden='true'
    />
    <p className='text-sm font-medium text-gray-500'>Loading course data…</p>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function CourseCreationForm() {
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

  // ── Derived values ────────────────────────────────────────────────────────
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  const currentStepMeta = STEPS.find(s => s.id === currentStep)!;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen w-full overflow-x-hidden bg-[#F8F9FC]'>
      {/* ── Sticky step navigation ── */}
      <header className='sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm'>
        {/* Desktop stepper (sm+) */}
        <nav
          aria-label='Course creation steps'
          className='hidden items-center px-6 py-4 sm:flex'
        >
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <StepItem
                step={step}
                isActive={currentStep === step.id}
                isCompleted={currentStep > step.id}
                onClick={() => setCurrentStep(step.id)}
              />
              {idx < STEPS.length - 1 && <StepConnector completed={currentStep > step.id} />}
            </React.Fragment>
          ))}
        </nav>

        {/* Mobile stepper (xs only) */}
        <div className='space-y-2 px-4 py-3 sm:hidden'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white'>
                {currentStep}
              </span>
              <span className='text-sm font-semibold text-gray-900'>{currentStepMeta.name}</span>
            </div>
            <span className='text-xs font-medium tabular-nums text-gray-400'>
              {currentStep} / {STEPS.length}
            </span>
          </div>

          {/* Progress bar */}
          <div
            className='h-1.5 w-full overflow-hidden rounded-full bg-gray-100'
            role='progressbar'
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
          >
            <div
              className='h-full rounded-full bg-orange-500 transition-all duration-500 ease-out'
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Mini step dots */}
          <div className='flex items-center justify-center gap-3 pt-0.5'>
            {STEPS.map(step => (
              <button
                key={step.id}
                type='button'
                onClick={() => setCurrentStep(step.id)}
                aria-label={`Go to ${step.name}`}
                aria-current={currentStep === step.id ? "step" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep === step.id
                    ? "w-6 bg-orange-500"
                    : currentStep > step.id
                      ? "w-3 bg-orange-300"
                      : "w-3 bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* ── Error banners ── */}
      {categoryError && <ErrorBanner message={categoryError} />}
      {courseUploadError && <ErrorBanner message={courseUploadError} />}

      {/* ── Step content ── */}
      <main className='w-full'>
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
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
