import { type Dispatch, type SetStateAction } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import InstructorRegistrationFooterAction from "./InstructorRegistrationFooterAction.tsx";
import type { FormData } from "./page.tsx";

type Inputs = {
  qualifications: string;
  experience: number;
  teachingExperience: number;
  expertise: string;
  currentOrg: string;
};

const InstructorStep2 = ({
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
    
    data.experience = Number(data.experience);
    data.teachingExperience = Number(data.teachingExperience);

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
        <h2 className='mb-4'>Professional Background</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {/* Qualifications */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Highest Education Qualification *</span>
            </label>
            <input
              {...register("qualifications", {
                required: "Enter Your Qualifications",
                pattern: {
                  value: /^[A-Za-z\-,\s\.\/]+$/
,
                  message: "Qualification can only contain letters,comma,dot,slash,hyphen and spaces.",
                },
                minLength: 5,
                maxLength: 100,
              })}
              type='text'
              defaultValue={instructorData.qualifications}
              placeholder='Your Last educational Qualifications'
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.qualifications ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            />
            {errors.qualifications && (
              <span className='text-xs text-red-500 mt-1'>{errors.qualifications.message}</span>
            )}
          </div>

          {/* Years of Experience */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Years of Experience </span>
            </label>
            <input
              {...register("experience")}
              type='number'
              defaultValue={instructorData.experience}
              min={0}
              max={50}
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.experience ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            />
            {errors.experience && (
              <span className='text-xs text-red-500 mt-1'>{errors.experience.message}</span>
            )}
          </div>

          {/* Years of Teaching Experience */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Years of teaching Experience</span>
            </label>
            <input
              {...register("teachingExperience")}
              type='number'
              defaultValue={instructorData.teachingExperience}
              min={0}
              max={50}
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.teachingExperience ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            />
            {errors.teachingExperience && (
              <span className='text-xs text-red-500 mt-1'>{errors.teachingExperience.message}</span>
            )}
          </div>

          {/* Area of Expertise */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Area of Expertise *</span>
            </label>
            <input
              {...register("expertise", {
                pattern: {
                  value: /^[A-Za-z\-,\s\.\/]+$/,
                  message:
                    "Expertise can only contains Text, dot, comma, hyphens, underscores and spaces.",
                },
                minLength: 3,
                maxLength: 100,
              })}
              type='text'
              defaultValue={instructorData.expertise}
              placeholder='e.g., Machine Learning, Data Science'
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.expertise ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            />
            {errors.expertise && (
              <span className='text-xs text-red-500 mt-1'>{errors.expertise.message}</span>
            )}
          </div>

          {/* Current Organization */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Current Organization</span>
            </label>
            <input
              {...register("currentOrg", {
                pattern: {
                  value: /^[A-Za-z\-,\s\.\/]+$/,
                  message: "Current Organization can only contain letters,space, dot , slash,hyphen characters.",
                },
                minLength: 3,
                maxLength: 30,
              })}
              type='text'
              defaultValue={instructorData.currentOrg}
              placeholder='e.g., Tech University'
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.currentOrg ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            />
            {errors.currentOrg && (
              <span className='text-xs text-red-500 mt-1'>{errors.currentOrg.message}</span>
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

export default InstructorStep2;
