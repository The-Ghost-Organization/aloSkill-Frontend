"use client";

import { apiClient } from "@/lib/api/client.ts";
import { FileText, Globe, Layers, LucidePlaySquare } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import AdvanceInformation from "./AdvanceInformation.tsx";
import BasicInformaton from "./BasicInformaton.tsx";
import CourseCurriculum from "./CourseCurriculum.tsx";
import FinalStep from "./FinalStep.tsx";

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
  allCategory: Categories;
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

type Categories = {
  id: string;
  name: string;
  parentId: string | null;
  children: {
    id: string;
    name: string;
  }[];
}[];

export default function CourseCreationForm() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState<Categories>([]);
  const [courseUploadError, setCourseUploadError] = useState<string>("");
  const [courseData, setCourseData] = useState<CreateCourseData>({
    title: "",
    slug: "",
    tags: [],
    allCategory: category,
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

  const handleGetCategories = useCallback(async () => {
    setLoading(true);
    setCategoryError("");
    try {
      const response = await apiClient.get<Categories>("/course/category");
      if (response.success && response.data) {
        setCategory(response.data);
        setCourseData(prev => ({ ...prev, allCategory: response.data as Categories }));
        return;
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (_error) {
      // console.error("Error fetching categories:", error);
      setCategoryError("Failed to load categories. Please try again.");
      setLoading(false);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetCategories();
  }, [handleGetCategories]);

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

  const steps = [
    { id: 1, name: "Basic Information", icon: Layers },
    { id: 2, name: "Advance Information", icon: FileText },
    { id: 3, name: "Curriculum", icon: LucidePlaySquare },
    { id: 4, name: "Publish Course", icon: Globe },
  ];

  return (
    <div className='bg-white w-full overflow-y-auto overflow-x-hidden'>
      {/* Step Navigation */}
      <div className='bg-white border-b border-gray-200'>
        <div className='w-full flex items-center justify-between'>
          {steps.map(step => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-5 py-4 border-b transition-colors relative cursor-pointer ${
                    isActive
                      ? "border-orange-light text-gray-900"
                      : isCompleted
                        ? "border-transparent text-gray-600 hover:text-gray-900"
                        : "border-transparent text-gray-400"
                  }`}
                >
                  <Icon size={18} />
                  <span className='font-medium text-sm'>{step.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content Step -1*/}
      <div className='w-full'>
        {categoryError !== "" && (
          <p className='text-red-500 text-md mb-2 p-2 font-semibold'>{categoryError}</p>
        )}
        {courseUploadError !== "" && (
          <p className='text-red-500 text-md mb-2 p-2 font-semibold'>{courseUploadError}</p>
        )}
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
            isParamsExisting={courseId !== undefined ? true : false}
            setCourseUploadError={setCourseUploadError}
          />
        )}
      </div>
    </div>
  );
}
