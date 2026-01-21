import { type Dispatch, type SetStateAction } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import InstructorRegistrationFooterAction from "./InstructorRegistrationFooterAction.tsx";
import type { FormData } from "./page.tsx";

type Inputs = {
  proposedCourseCategory: string;
  courseLevel: string;
  courseType: string;
  prevTeachingApproach: string;
  language: string;
};

const InstructorStep3 = ({
  currentStep,
  setCurrentStep,
  instructorData,
  setInstructorData,
}: {
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  instructorData: FormData;
  setInstructorData: Dispatch<SetStateAction<FormData>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async data => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
    setInstructorData({
      ...instructorData,
      ...data,
    });
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className='space-y-4'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-4'
      >
        <h2 className='mb-4'>Course Details</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {/* Proposed Course Category */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Proposed Course Category *</span>
            </label>
            <select
              {...register("proposedCourseCategory", {
                required: "Enter Your proposed Course Category",
              })}
              defaultValue={instructorData.proposedCourseCategory}
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.proposedCourseCategory ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            >
              <option value=''>Select Course Category</option>
              <option value='BUSINESS'>Business & Management</option>
              <option value='MARKETING'>Marketing & Digital Growth</option>
              <option value='ENTREPRENEURSHIP'>Entrepreneurship & Startups</option>
              <option value='ICT'>ICT & Future Skills</option>
            </select>
            {errors.proposedCourseCategory && (
              <span className='text-xs text-red-500 mt-1'>
                {errors.proposedCourseCategory.message}
              </span>
            )}
          </div>

          {/* Course Level */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Course Level *</span>
            </label>
            <select
              {...register("courseLevel", {
                required: "Select Course Level",
              })}
              defaultValue={instructorData.courseLevel}
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.courseLevel ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            >
              <option value=''>Select Level</option>
              <option value='BEGINNER'>Beginner</option>
              <option value='INTERMEDIATE'>Intermediate</option>
              <option value='ADVANCED'>Advanced</option>
              <option value='EXPERT'>Expert</option>
            </select>
            {errors.courseLevel && (
              <span className='text-xs text-red-500 mt-1'>{errors.courseLevel.message}</span>
            )}
          </div>
          {/* Course Type */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Course Type *</span>
            </label>
            <select
              {...register("courseType", {
                required: "Select Course Type",
              })}
              defaultValue={instructorData.courseType}
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.courseType ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            >
              <option value=''>Select Type</option>
              <option value='LIVE'>Live</option>
              <option value='PRE_RECORDED'>Pre-Recorded</option>
              <option value='HYBRID'>Hybrid</option>
              <option value='SELF_STUDY'>Self-Study</option>
            </select>
            {errors.courseType && (
              <span className='text-xs text-red-500 mt-1'>{errors.courseType.message}</span>
            )}
          </div>
          {/* Teaching Approach */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Teaching Approach *</span>
            </label>
            <select
              {...register("prevTeachingApproach", {
                required: "Select Teaching Approach",
              })}
              defaultValue={instructorData.prevTeachingApproach}
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.prevTeachingApproach ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            >
              <option value=''>Select Approach</option>
              <option value='INTERACTIVE'>Activity Based</option>
              <option value='VIDEO'>Lecture Based</option>
              <option value='LIVE'>Flipped Classroom</option>
              <option value='PROJECT_BASED'>Project Based</option>
            </select>
            {errors.prevTeachingApproach && (
              <span className='text-xs text-red-500 mt-1'>
                {errors.prevTeachingApproach.message}
              </span>
            )}
          </div>

          {/* Teaching Language */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Teaching Language *</span>
            </label>
            <select
              {...register("language", {
                required: "Enter your Teaching Language",
              })}
              defaultValue={instructorData.language}
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.language ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            >
              <option value=''>Select language</option>
              <option value='BANGLA'>Bangla</option>
              <option value='ENGLISH'>English</option>
            </select>
            {errors.language && (
              <span className='text-xs text-red-500 mt-1'>{errors.language.message}</span>
            )}
          </div>
        </div>
        {/* Footer Actions */}
        <InstructorRegistrationFooterAction
          handlePrevious={handlePrevious}
          isSubmitting={isSubmitting}
          currentStep={currentStep}
        />
      </form>
    </div>
  );
};

export default InstructorStep3;
