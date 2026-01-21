"use client";

import { AlertCircle, Award, BookOpen, Briefcase, CheckCircle2, LogIn, User } from "lucide-react";
// import { useSession } from "next-auth/react";
import React, { useState } from "react";
import InstructorStep0 from "./InstructorStep0.tsx";
import InstructorStep1 from "./InstructorStep1.tsx";
import InstructorStep2 from "./InstructorStep2.tsx";
import InstructorStep3 from "./InstructorStep3.tsx";
import InstructorStep4 from "./InstructorStep4.tsx";
import { useSessionContext } from '../../contexts/SessionContext.tsx';

export interface FormData {
  displayName: string;
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
  // const { data } = useSession();
  const { user } = useSessionContext();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [apiResponse, setApiResponse] = useState<{ status: "" | "Success" | "Error", message: string }>({ status: "", message: "" });
  const [instructorData, setInstructorData] = useState<FormData>({
    displayName: "",
    DOB: "",
    gender: "",
    nationality: "",
    phoneNumber: "",
    email: user?.email || "",
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

  const STEPS = [
    { number: 0, title: "Login Info", icon: LogIn },
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Professional", icon: Briefcase },
    { number: 3, title: "Course Details", icon: BookOpen },
    { number: 4, title: "Additional", icon: Award },
  ];

  const StatusMessage = () => {
    return !apiResponse.status ? (
      <></>
    ) :
      apiResponse.status === "Success" ? (
        <div className='mb-2 bg-green-50 border border-green-200 rounded px-4 py-2 flex items-center gap-2'>
          <CheckCircle2 className='text-green-600 w-4 h-4 shrink-0' />
          <p className='text-green-800 font-medium text-xs'>Application submitted successfully!</p>
        </div>
      ) : (
        <div className='mb-2 bg-red-50 border border-red-200 rounded px-4 py-2 flex items-center gap-2'>
          <AlertCircle className='text-red-600 w-4 h-4 shrink-0' />
          <p className='text-red-800 font-medium text-xs'>{apiResponse.message}</p>
        </div>
      );
  };

  return (
    <section className='w-screen h-screen overflow-y-auto overflow-x-hidden'>
      <main className='w-4/6 mx-auto mt-10 rounded-t'>
        <div className='text-center py-5'>
          <h2 className='mb-2'>Instructor Application</h2>
          <p className=''>Join our platform and share your expertise with students worldwide</p>
        </div>
        <div className='shadow'>
          <div className='px-5 py-4 bg-[#0F172A]'>
            <div className='flex items-center justify-between'>
              {STEPS.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep > step.number
                        ? "bg-green-400 text-white"
                        : currentStep === step.number
                          ? "bg-orange-400 text-white ring-4 ring-orange-300"
                          : "bg-white text-gray-600"
                        }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className='w-4 h-4' />
                      ) : (
                        <step.icon className='w-4 h-4' />
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${currentStep > step.number
                        ? "text-green-400"
                        : currentStep === step.number
                          ? "text-orange-400"
                          : "text-white"
                        }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${currentStep > step.number
                        ? "bg-green-500"
                        : currentStep === step.number
                          ? "bg-orange-400"
                          : "bg-gray-200"
                        }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          {/* Form Content Step -1*/}
          <div className='w-full flex flex-col gap-3 p-5'>
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
        </div>
      </main>
    </section>
  );
};

export default InstructorRegistrationForm;
