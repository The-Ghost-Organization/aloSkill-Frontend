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

  // ── Handlers — unchanged ────────────────────────────────────────────────────
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

  // ── Shared style helpers ────────────────────────────────────────────────────
  const inputBase =
    "w-full min-w-0 text-sm px-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 focus:outline-none transition-all placeholder:text-gray-400 placeholder:text-sm bg-gray-50 focus:bg-white";
  const inputError = "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400";
  const inputNormal = "border-gray-200";

  const ErrorMsg = ({ msg }: { msg: string }) => (
    <p className='mt-1.5 flex items-start gap-1 text-xs text-red-500'>
      <span className='mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-400' />
      {msg}
    </p>
  );

  return (
    <div className='space-y-5'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-5'
      >
        {/* ── Section header ── */}
        <div>
          <h2 className='text-lg font-extrabold text-gray-900 sm:text-xl'>
            Professional Background
          </h2>
          <p className='mt-0.5 text-xs text-gray-400'>
            Help students understand your credentials and experience level.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* ── Highest Qualification — full width, more room for long text ── */}
          <div className='col-span-1 min-w-0 sm:col-span-2'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Highest Education Qualification <span className='text-orange-500'>*</span>
            </label>
            <input
              {...register("qualifications", {
                required: "Enter Your Qualifications",
                pattern: {
                  value: /^[A-Za-z\-,\s\.\/]+$/,
                  message:
                    "Qualification can only contain letters, comma, dot, slash, hyphen and spaces.",
                },
                minLength: 1,
                maxLength: 100,
              })}
              type='text'
              defaultValue={instructorData.qualifications}
              placeholder='e.g., BSc Computer Science, MBA, PhD'
              className={`${inputBase} ${errors.qualifications ? inputError : inputNormal}`}
            />
            {errors.qualifications && <ErrorMsg msg={errors.qualifications.message!} />}
          </div>

          {/* ── Years of Experience ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Years of Experience
            </label>
            {/* inputMode="numeric" triggers number pad on mobile;
                type="number" kept for native min/max enforcement */}
            <input
              {...register("experience")}
              type='number'
              inputMode='numeric'
              defaultValue={instructorData.experience}
              min={0}
              max={50}
              placeholder='0'
              className={`${inputBase} ${errors.experience ? inputError : inputNormal}`}
            />
            {errors.experience && <ErrorMsg msg={errors.experience.message!} />}
          </div>

          {/* ── Years of Teaching Experience ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Years of Teaching Experience
            </label>
            <input
              {...register("teachingExperience")}
              type='number'
              inputMode='numeric'
              defaultValue={instructorData.teachingExperience}
              min={0}
              max={50}
              placeholder='0'
              className={`${inputBase} ${errors.teachingExperience ? inputError : inputNormal}`}
            />
            {errors.teachingExperience && <ErrorMsg msg={errors.teachingExperience.message!} />}
          </div>

          {/* ── Area of Expertise ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Area of Expertise <span className='text-orange-500'>*</span>
            </label>
            <input
              {...register("expertise", {
                pattern: {
                  value: /^[^<>]/,
                  message: "Expertise accepts all characters except angle brackets (< >).",
                },
                minLength: 3,
                maxLength: 100,
              })}
              type='text'
              defaultValue={instructorData.expertise}
              placeholder='e.g., Machine Learning, Data Science'
              className={`${inputBase} ${errors.expertise ? inputError : inputNormal}`}
            />
            {errors.expertise && <ErrorMsg msg={errors.expertise.message!} />}
          </div>

          {/* ── Current Organization ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Current Organization
            </label>
            <input
              {...register("currentOrg", {
                pattern: {
                  value: /^[^<>]/,
                  message:
                    "Current organization accepts all characters except angle brackets (< >).",
                },
                minLength: 3,
                maxLength: 30,
              })}
              type='text'
              defaultValue={instructorData.currentOrg}
              placeholder='e.g., Tech University'
              className={`${inputBase} ${errors.currentOrg ? inputError : inputNormal}`}
            />
            {errors.currentOrg && <ErrorMsg msg={errors.currentOrg.message!} />}
          </div>
        </div>

        {/* ── Footer actions — unchanged component ── */}
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
