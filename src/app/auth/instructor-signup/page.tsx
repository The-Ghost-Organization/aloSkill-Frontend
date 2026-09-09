"use client";

import Logo from "@/components/shared/header/Logo.tsx";
import {
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Home,
  LogIn,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSessionContext } from "../../contexts/SessionContext.tsx";
import InstructorStep0 from "./InstructorStep0.tsx";
import InstructorStep1 from "./InstructorStep1.tsx";
import InstructorStep2 from "./InstructorStep2.tsx";
import InstructorStep3 from "./InstructorStep3.tsx";
import InstructorStep4 from "./InstructorStep4.tsx";

export interface FormData {
  displayName: string;
  profileImage: string | null;
  DOB: string;
  gender: string;
  nationality: string;
  phoneNumber: string;
  email: string;
  password: string | undefined;
  address: string;
  city: string;
  qualifications: string;
  experience: number;
  expertise: string;
  currentOrg: string;
  proposedCourseCategory: string;
  courseLevel: string;
  courseType: string;
  demoVideo: string | undefined;
  teachingExperience: number;
  prevTeachingApproach: string;
  language: string;
  bio: string;
  skills: string[];
  website: string;
  socialAccount: { platform: string; url: string }[];
}

const InstructorRegistrationForm = () => {
  const { user } = useSessionContext();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [apiResponse, setApiResponse] = useState<{
    status: "" | "Success" | "Error";
    message: string;
  }>({ status: "", message: "" });
  const [instructorData, setInstructorData] = useState<FormData>({
    displayName: "",
    profileImage: null,
    DOB: "",
    gender: "",
    nationality: "",
    phoneNumber: "",
    email: "",
    password: undefined,
    address: "",
    city: "",
    qualifications: "",
    experience: 0,
    expertise: "",
    currentOrg: "",
    proposedCourseCategory: "",
    courseLevel: "",
    courseType: "",
    demoVideo: undefined,
    teachingExperience: 0,
    prevTeachingApproach: "",
    language: "",
    bio: "",
    skills: [],
    website: "",
    socialAccount: [],
  });

  useEffect(() => {
    if (user?.role?.includes("INSTRUCTOR")) {
      router.push("/");
    }
    if (user?.email) {
      setInstructorData(prev => ({ ...prev, email: user?.email }));
    }
  }, [user, router]);

  const STEPS = [
    { number: 0, title: "Login Info", icon: LogIn },
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Professional", icon: Briefcase },
    { number: 3, title: "Course Details", icon: BookOpen },
    { number: 4, title: "Additional", icon: Award },
  ];

  const progressPercent = (currentStep / (STEPS.length - 1)) * 100;

  const StatusMessage = () => {
    if (!apiResponse.status) return null;

    return apiResponse.status === "Success" ? (
      <div className='mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3'>
        <CheckCircle2 className='h-4 w-4 shrink-0 text-green-600' />
        <p className='text-xs font-semibold text-green-700'>Application submitted successfully!</p>
      </div>
    ) : (
      <div className='mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3'>
        <AlertCircle className='h-4 w-4 shrink-0 text-red-500' />
        <p className='text-xs font-semibold text-red-600'>{apiResponse.message}</p>
      </div>
    );
  };

  return (
    <section className='min-h-screen w-screen overflow-x-hidden overflow-y-auto bg-[#F8F9FC]'>
      {/* ── Top Navigation Bar ── */}
      <nav className='sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-6 py-3'>
          {/* Brand — mirrors AloSkill logo style */}
          <Logo />
          {/* <button
            type='button'
            onClick={() => router.push("/")}
            className='flex items-center gap-2 transition-opacity hover:opacity-80'
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow shadow-orange-200'>
              <span className='text-sm font-extrabold italic text-white'>A</span>
            </div>
            <span className='text-base font-extrabold text-gray-900'>
              আলো <span className='text-orange-500'>স্কিল</span>
            </span>
          </button> */}

          {/* Center label */}
          <span className='hidden text-sm font-medium text-gray-400 sm:block'>
            Instructor Application
          </span>

          {/* Return Home button */}
          <button
            type='button'
            onClick={() => router.push("/")}
            className='group flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-100'
          >
            <Home className='h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5' />
            Return Home
          </button>
        </div>
      </nav>

      <main className='mx-auto w-full max-w-3xl px-4 pb-24 pt-8'>
        {/* ── Page Header ── */}
        <div className='mb-8 text-center'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1'>
            <div className='h-1.5 w-1.5 rounded-full bg-orange-500' />
            <span className='text-xs font-semibold text-orange-600'>
              Join Our Instructor Community
            </span>
          </div>
          <h1 className='mb-2 text-[26px] font-extrabold tracking-tight text-gray-900'>
            Become an <span className='text-orange-500'>Instructor</span>
          </h1>
          <p className='text-sm text-gray-500'>
            Share your expertise and empower thousands of learners across Bangladesh
          </p>
        </div>

        {/* ── Main Form Card ── */}
        <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-100/80'>
          {/* ── Stepper Header ── */}
          <div className='border-b border-gray-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 px-6 pb-4 pt-5'>
            {/* Step circles + connectors */}
            <div className='mb-4 flex items-center justify-between'>
              {STEPS.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className='flex flex-col items-center gap-1.5'>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        currentStep > step.number
                          ? "border-green-400 bg-green-400 text-white shadow-md shadow-green-100"
                          : currentStep === step.number
                            ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200"
                            : "border-gray-200 bg-white text-gray-300"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className='h-4 w-4' />
                      ) : (
                        <step.icon className='h-4 w-4' />
                      )}
                    </div>
                    <span
                      className={`hidden text-[10px] font-semibold tracking-wide sm:block ${
                        currentStep > step.number
                          ? "text-green-500"
                          : currentStep === step.number
                            ? "text-orange-500"
                            : "text-gray-300"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div className='relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-gray-200'>
                      <div
                        className='absolute inset-y-0 left-0 rounded-full bg-orange-400 transition-all duration-500'
                        style={{
                          width:
                            currentStep > step.number
                              ? "100%"
                              : currentStep === step.number
                                ? "50%"
                                : "0%",
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Overall progress bar */}
            <div className='flex items-center gap-3'>
              <div className='relative h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100'>
                <div
                  className='absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500'
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className='min-w-[2.5rem] text-right text-[11px] font-bold tabular-nums text-gray-400'>
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>

          {/* ── Step Content ── */}
          <div className='p-6 sm:p-8'>
            <StatusMessage />

            {currentStep === 0 && (
              <InstructorStep0
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                instructorData={instructorData}
                setInstructorData={setInstructorData}
              />
            )}
            {currentStep === 1 && (
              <InstructorStep1
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                instructorData={instructorData}
                setInstructorData={setInstructorData}
              />
            )}
            {currentStep === 2 && (
              <InstructorStep2
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                instructorData={instructorData}
                setInstructorData={setInstructorData}
              />
            )}
            {currentStep === 3 && (
              <InstructorStep3
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                instructorData={instructorData}
                setInstructorData={setInstructorData}
              />
            )}
            {currentStep === 4 && (
              <InstructorStep4
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                instructorData={instructorData}
                setInstructorData={setInstructorData}
                setApiResponse={setApiResponse}
              />
            )}
          </div>

          {/* ── Card Footer ── */}
          <div className='flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-3'>
            <p className='text-[11px] text-gray-400'>
              Step <span className='font-semibold text-gray-600'>{currentStep + 1}</span> of{" "}
              <span className='font-semibold text-gray-600'>{STEPS.length}</span>
            </p>
            <p className='text-[11px] text-gray-400'>🔒 Your data is securely encrypted</p>
          </div>
        </div>

        {/* Bottom trust note */}
        <p className='mt-5 text-center text-xs text-gray-400'>
          By submitting, you agree to AloSkill&apos;s{" "}
          <span className='cursor-pointer font-medium text-orange-500 hover:underline'>
            Terms of Service
          </span>{" "}
          and{" "}
          <span className='cursor-pointer font-medium text-orange-500 hover:underline'>
            Privacy Policy
          </span>
        </p>
      </main>
    </section>
  );
};

export default InstructorRegistrationForm;
