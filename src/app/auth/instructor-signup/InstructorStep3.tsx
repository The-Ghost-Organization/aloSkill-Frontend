import { ChevronDown } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type Category, useSessionContext } from "../../contexts/SessionContext.tsx";
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
  const { categories } = useSessionContext();

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
    setInstructorData({
      ...instructorData,
      ...data,
    });
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // ── Style helpers ───────────────────────────────────────────────────────────
  const selectBase =
    "w-full min-w-0 appearance-none text-sm px-3 py-2.5 pr-9 rounded-lg border " +
    "focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 focus:outline-none " +
    "transition-all bg-gray-50 focus:bg-white text-gray-700 cursor-pointer";
  const selectError = "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400";
  const selectNormal = "border-gray-200";

  // Reusable wrapper that adds the chevron icon over any select
  const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className='relative'>
      {children}
      <ChevronDown
        className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
        aria-hidden='true'
      />
    </div>
  );

  const ErrorMsg = ({ msg }: { msg: string }) => (
    <p className='mt-1.5 flex items-start gap-1 text-xs text-red-500'>
      <span className='mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-400' />
      {msg}
    </p>
  );

  const FieldLabel = ({
    children,
    required,
  }: {
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
      {children}
      {required && <span className='ml-0.5 text-orange-500'>*</span>}
    </label>
  );

  return (
    <div className='space-y-5'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-5'
      >
        {/* ── Section header ── */}
        <div>
          <h2 className='text-lg font-extrabold text-gray-900 sm:text-xl'>Course Details</h2>
          <p className='mt-0.5 text-xs text-gray-400'>
            Tell us about the course you plan to create on AloSkill.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* ── Proposed Course Category — full width for long dynamic option names ── */}
          <div className='col-span-1 min-w-0 sm:col-span-2'>
            <FieldLabel required>Proposed Course Category</FieldLabel>
            <SelectWrapper>
              <select
                {...register("proposedCourseCategory", {
                  required: "Enter Your proposed Course Category",
                })}
                defaultValue={instructorData.proposedCourseCategory}
                className={`${selectBase} ${errors.proposedCourseCategory ? selectError : selectNormal}`}
              >
                <option value=''>Select Course Category</option>
                {categories &&
                  categories
                    .filter((category: Category) => category.parentId === null)
                    .map((cat: Category) => (
                      <option
                        key={cat.id}
                        value={cat.name}
                      >
                        {cat.name}
                      </option>
                    ))}
              </select>
            </SelectWrapper>
            {errors.proposedCourseCategory && (
              <ErrorMsg msg={errors.proposedCourseCategory.message!} />
            )}
          </div>

          {/* ── Course Level ── */}
          <div className='min-w-0'>
            <FieldLabel required>Course Level</FieldLabel>
            <SelectWrapper>
              <select
                {...register("courseLevel", { required: "Select Course Level" })}
                defaultValue={instructorData.courseLevel}
                className={`${selectBase} ${errors.courseLevel ? selectError : selectNormal}`}
              >
                <option value=''>Select Level</option>
                <option value='BEGINNER'>Beginner</option>
                <option value='INTERMEDIATE'>Intermediate</option>
                <option value='ADVANCED'>Advanced</option>
                <option value='EXPERT'>Expert</option>
              </select>
            </SelectWrapper>
            {errors.courseLevel && <ErrorMsg msg={errors.courseLevel.message!} />}
          </div>

          {/* ── Course Type ── */}
          <div className='min-w-0'>
            <FieldLabel required>Course Type</FieldLabel>
            <SelectWrapper>
              <select
                {...register("courseType", { required: "Select Course Type" })}
                defaultValue={instructorData.courseType}
                className={`${selectBase} ${errors.courseType ? selectError : selectNormal}`}
              >
                <option value=''>Select Type</option>
                <option value='LIVE'>Live</option>
                <option value='PRE_RECORDED'>Pre-Recorded</option>
                <option value='HYBRID'>Hybrid</option>
                <option value='SELF_STUDY'>Self-Study</option>
              </select>
            </SelectWrapper>
            {errors.courseType && <ErrorMsg msg={errors.courseType.message!} />}
          </div>

          {/* ── Teaching Approach ── */}
          <div className='min-w-0'>
            <FieldLabel required>Teaching Approach</FieldLabel>
            <SelectWrapper>
              <select
                {...register("prevTeachingApproach", { required: "Select Teaching Approach" })}
                defaultValue={instructorData.prevTeachingApproach}
                className={`${selectBase} ${errors.prevTeachingApproach ? selectError : selectNormal}`}
              >
                <option value=''>Select Approach</option>
                <option value='INTERACTIVE'>Activity Based</option>
                <option value='VIDEO'>Lecture Based</option>
                <option value='LIVE'>Flipped Classroom</option>
                <option value='PROJECT_BASED'>Project Based</option>
              </select>
            </SelectWrapper>
            {errors.prevTeachingApproach && <ErrorMsg msg={errors.prevTeachingApproach.message!} />}
          </div>

          {/* ── Teaching Language ── */}
          <div className='min-w-0'>
            <FieldLabel required>Teaching Language</FieldLabel>
            <SelectWrapper>
              <select
                {...register("language", { required: "Enter your Teaching Language" })}
                defaultValue={instructorData.language}
                className={`${selectBase} ${errors.language ? selectError : selectNormal}`}
              >
                <option value=''>Select Language</option>
                <option value='BANGLA'>Bangla</option>
                <option value='ENGLISH'>English</option>
              </select>
            </SelectWrapper>
            {errors.language && <ErrorMsg msg={errors.language.message!} />}
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

export default InstructorStep3;
