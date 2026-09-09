import { useDebounce } from "@/hooks/useDebounce.ts";
import { apiClient } from "@/lib/api/client.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, UserCircleIcon, X } from "lucide-react";
// import { useSession } from "next-auth/react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useSessionContext } from "../../../../../contexts/SessionContext.tsx";
import CourseFooter from "./CourseFooter.tsx";
import { type CreateCourseData } from "./page.tsx";
import StepHeader from "./StepHeader.tsx";

const CoursePriceAndInstructorSchema = z
  .object({
    welcomeMessage: z
      .string()
      .max(1000, "Welcome Message cannot exceed 1000 characters")
      .optional()
      .refine(val => {
        if (val === undefined || val === "") return true;
        return /^[\w\s\p{P}&\-]+$/u.test(val);
      }, "Title contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed."),
    congratulationsMessage: z
      .string()
      .max(1000, "Congratulations Message cannot exceed 1000 characters")
      .optional()
      .refine(val => {
        if (val === undefined || val === "") return true;
        return /^[\w\s\p{P}&\-]+$/u.test(val);
      }, "Title contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed."),
    paymentSelection: z.enum(["paid", "free"]).default("paid").optional(),
    originalPrice: z
      .string()
      .refine(value => !isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 9999.99, {
        message: "Original price must be a number between 0 and 9999.99",
      })
      .optional(),
    discountPrice: z
      .string()
      .refine(value => !isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 9999.99, {
        message: "Discount price must be a number between 0 and 9999.99",
      })
      .optional(),
    discountEndDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
      .optional()
      .or(z.literal("")),
    courseInstructors: z
      .array(
        z.object({
          instructorId: z.string(),
          displayName: z.string(),
          role: z.enum(["PRIMARY", "CO_INSTRUCTOR"]),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentSelection === "paid") {
      if (!data.originalPrice) {
        ctx.addIssue({
          code: "custom",
          message: "Original price is required",
          path: ["originalPrice"],
        });
      }

      if (data.discountPrice) {
        if (Number(data.discountPrice) > Number(data.originalPrice)) {
          ctx.addIssue({
            code: "custom",
            message: "Discount price must be less than or equal to original price",
            path: ["discountPrice"],
          });
        }
      }
    }
  });

type FinalStepForm = z.infer<typeof CoursePriceAndInstructorSchema>;

const FinalStep = ({
  currentStep,
  setCurrentStep,
  courseData,
  setCourseData,
  isParamsExisting,
  setCourseUploadError,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  courseData: CreateCourseData;
  setCourseData: React.Dispatch<React.SetStateAction<CreateCourseData>>;
  setCourseUploadError: React.Dispatch<React.SetStateAction<string>>;
  isParamsExisting: boolean;
}) => {
  // const { data: session } = useSession();
  const { user } = useSessionContext();
  const [paymentSelection, setPaymentSelection] = useState<"paid" | "free">("paid");
  const [query, setQuery] = useState<string>("");
  const [dataSaveMode, setDataSaveMode] = useState<
    "draft" | "publish" | "update" | "updateAndPublish"
  >("draft");
  const [results, setResults] = useState<
    | {
        userId: string;
        displayName: string;
        avatarUrl?: string;
      }[]
    | []
  >([]);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FinalStepForm>({
    resolver: zodResolver(CoursePriceAndInstructorSchema),
  });

  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    async function fetchInstructors() {
      try {
        const data = await apiClient.get<
          | {
              userId: string;
              displayName: string;
              avatarUrl?: string;
            }[]
          | []
        >(`/course/instructors?instructor=${debouncedQuery}`);
        setResults(data.data ?? []);
      } catch (_error) {
        // console.error(error);
      }
    }
    fetchInstructors();
  }, [debouncedQuery]);

  useEffect(() => {
    if (courseData.courseInstructors && courseData.courseInstructors.length > 0) {
      setValue("courseInstructors", courseData.courseInstructors);
    }
  }, [courseData.courseInstructors, setValue]);

  const { fields, append, remove } = useFieldArray({
    name: "courseInstructors",
    control,
  });

  const handleAddInstructor = (userId: string, name: string) => {
    const isExists = fields.some(item => item.instructorId === userId);

    if (isExists) {
      // console.warn("Instructor already added");
      return;
    }

    append({
      instructorId: userId,
      displayName: name,
      role: "PRIMARY",
    });
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePriceChange = (field: "originalPrice" | "discountPrice", value: string) => {
    if (!value) {
      return;
    }
    setCourseData(prev => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleCourseSaveToDb = async (data: FinalStepForm, status: string) => {
    const { originalPrice, discountPrice } = data;
    const { allCategory: _allCategory, ...restCourseData } = courseData;
    const courseSaveToDB = await apiClient.post(`/course/create-course?user=${user?.email}`, {
      ...restCourseData,
      originalPrice: Number(originalPrice),
      discountPrice: Number(discountPrice),
      discountEndDate: data.discountEndDate ? new Date(data.discountEndDate) : null,
      welcomeMessage: data.welcomeMessage,
      congratulationsMessage: data.congratulationsMessage,
      courseInstructors: data.courseInstructors,
      status: status,
    });
    return courseSaveToDB;
  };

  const errorMessages = {
    Unauthorized: "You are not authorized to perform this action.",
    "Validation failed": "Please fill the required fields correctly.",
    "Internal Server Error":
      "Something went wrong while saving your course. Please try again later.",
    "Database operation failed":
      "Something went wrong while saving your course. Please try again later.",
    "Duplicate entry found": "This course already exists in our database.",
    "Unknown error occurred":
      "Something went wrong while saving your course. Please try again later.",
  };

  const onFormSubmit = async (data: FinalStepForm) => {
    const { originalPrice, discountPrice } = data;
    const { allCategory: _allCategory, ...restCourseData } = courseData;
    setCourseData(prev => ({
      ...prev,
      originalPrice: Number(originalPrice),
      discountPrice: Number(discountPrice),
      discountEndDate: data.discountEndDate ? new Date(data.discountEndDate) : null,
      welcomeMessage: data.welcomeMessage,
      congratulationsMessage: data.congratulationsMessage,
      courseInstructors: data.courseInstructors,
    }));
    if (dataSaveMode === "publish") {
      const backendData = await handleCourseSaveToDb(data, "PUBLISHED");
      if (!backendData.success) {
        const message =
          backendData.message && typeof backendData.message === "string"
            ? errorMessages[backendData.message as keyof typeof errorMessages] ||
              backendData.message
            : "Unknown error occurred";
        setCourseUploadError(message);
      }
      // console.log("Response from DB : ", backendData);
      if (backendData.success) {
        redirect("/dashboard/instructor/course");
      }
    }
    if (dataSaveMode === "draft") {
      const backendData = await handleCourseSaveToDb(data, "DRAFT");
      if (!backendData.success) {
        const message =
          backendData.message && typeof backendData.message === "string"
            ? errorMessages[backendData.message as keyof typeof errorMessages] ||
              backendData.message
            : "Unknown error occurred";
        setCourseUploadError(message);
      }
      // console.log("Response from DB : ", backendData);
      if (backendData.success) {
        redirect("/dashboard/instructor/course");
      }
    }
    if (dataSaveMode === "update") {
      const backendData = await apiClient.patch(`/course/editOrUpdate-course?user=${user?.email}`, {
        ...restCourseData,
        originalPrice: Number(originalPrice),
        discountPrice: Number(discountPrice),
        discountEndDate: data.discountEndDate ? new Date(data.discountEndDate) : null,
        welcomeMessage: data.welcomeMessage,
        congratulationsMessage: data.congratulationsMessage,
        courseInstructors: data.courseInstructors,
        status: courseData.status,
      });
      if (!backendData.success) {
        const message =
          backendData.message && typeof backendData.message === "string"
            ? errorMessages[backendData.message as keyof typeof errorMessages] ||
              backendData.message
            : "Unknown error occurred";
        setCourseUploadError(message);
      }
      // console.log("Response from DB for update: ", backendData);
      if (backendData.success) {
        redirect("/dashboard/instructor/course");
      }
    }
    if (dataSaveMode === "updateAndPublish") {
      const backendData = await apiClient.patch(`/course/editOrUpdate-course?user=${user?.email}`, {
        ...restCourseData,
        originalPrice: Number(originalPrice),
        discountPrice: Number(discountPrice),
        discountEndDate: data.discountEndDate ? new Date(data.discountEndDate) : null,
        welcomeMessage: data.welcomeMessage,
        congratulationsMessage: data.congratulationsMessage,
        courseInstructors: data.courseInstructors,
        status: "PUBLISHED",
      });
      if (!backendData.success) {
        const message =
          backendData.message && typeof backendData.message === "string"
            ? errorMessages[backendData.message as keyof typeof errorMessages] ||
              backendData.message
            : "Unknown error occurred";
        setCourseUploadError(message);
      }
      // console.log("Response from DB for update: ", backendData);
      if (backendData.success) {
        redirect("/dashboard/instructor/course");
      }
    }
    // console.log("courseData : ", courseData, "data : ", data);
  };

  return (
    <div className='w-full bg-white'>
      <StepHeader headingText='Publish Course' />
      <div className='p-6'>
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className='space-y-4'
        >
          {/* Add Message here */}
          <div className='flex items-center gap-4'>
            <div className='w-full'>
              <label className='block text-xs font-medium text-gray-700 mb-1'>
                Welcome Message
              </label>
              <textarea
                {...register("welcomeMessage", {
                  pattern: {
                    value: /^[^<>]*$/,
                    message: "Welcome Message must not contain any opening or closing HTML tags",
                  },
                })}
                rows={4}
                maxLength={1000}
                defaultValue={courseData.welcomeMessage}
                placeholder='Enter Course Welcome Message here...'
                className={`w-full px-3 py-1.5 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-gray-400 placeholder:text-sm resize-none ${errors["welcomeMessage"] ? "border-red-200 bg-red-50" : "border-gray-200"}`}
              />
              {errors["welcomeMessage"] && (
                <p className='text-xs! text-red-500 mt-1'>
                  {errors["welcomeMessage"]?.message as string}
                </p>
              )}
            </div>
            <div className='w-full'>
              <label className='block text-xs font-medium text-gray-700 mb-1'>
                Congratulations Message
              </label>
              <textarea
                {...register("congratulationsMessage", {
                  pattern: {
                    value: /^[^<>]*$/,
                    message: "Congratulations Message must not contain any opening or closing HTML tags",
                  },
                })}
                rows={4}
                maxLength={1000}
                defaultValue={courseData.congratulationsMessage}
                placeholder='Enter Your Course Complete Message here...'
                className={`w-full px-3 py-1.5 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-gray-400 placeholder:text-sm resize-none ${errors["congratulationsMessage"] ? "border-red-200 bg-red-50" : "border-gray-200"}`}
              />
              {errors["congratulationsMessage"] && (
                <p className='text-xs! text-red-500 mt-1'>
                  {errors["congratulationsMessage"]?.message as string}
                </p>
              )}
            </div>
          </div>
          <h5 className='font-medium text-gray-800'>Price</h5>
          <div className='w-3/4'>
            <div className='w-full flex items-center relative'>
              <div
                className={`absolute w-1/2 h-full bg-orange transition-transform duration-600 ease-[cubic-bezier(.25, .8, .25, 1)] pointer-events-none text-white flex items-center justify-center
                  ${paymentSelection === "free" ? "translate-x-full" : "translate-x-0"}
                `}
              >
                <span className='text-md'>{paymentSelection === "paid" ? "Paid" : "Free"}</span>
              </div>
              <button
                type='button'
                className={`w-full py-2 text-md bg-gray-400/60 transition-colors duration-500 cursor-pointer`}
                onClick={() => {
                  setPaymentSelection("paid");
                  setValue("paymentSelection", "paid");
                }}
              >
                Paid
              </button>
              <button
                type='button'
                className={`w-full py-2 text-md bg-gray-400/60 transition-colors duration-500 cursor-pointer`}
                onClick={() => {
                  setPaymentSelection("free");
                  setValue("paymentSelection", "free");
                  setValue("originalPrice", "");
                  setValue("discountPrice", "");
                  setValue("discountEndDate", "");
                  setCourseData(prev => ({
                    ...prev,
                    originalPrice: 0,
                    discountPrice: 0,
                    discountEndDate: null,
                  }));
                }}
              >
                Free
              </button>
            </div>
            {paymentSelection === "paid" || courseData.originalPrice ? (
              <div className='mt-4 flex flex-col gap-3'>
                <div className='w-full flex gap-3'>
                  <div className='w-full'>
                    <span className='text-sm text-gray-500 font-medium mb-2'>Original Price:</span>
                    <input
                      {...register("originalPrice", {
                        required: true,
                      })}
                      type='number'
                      placeholder='Your course price'
                      defaultValue={courseData.originalPrice.toString()}
                      min={0}
                      onChange={e => handlePriceChange("originalPrice", e.target.value)}
                      className={`w-full px-4 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm ${errors["originalPrice"] ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors["originalPrice"] && (
                      <p className='text-xs! text-red-500 mt-1'>
                        {errors["originalPrice"]?.message as string}
                      </p>
                    )}
                  </div>
                  <div className='w-full'>
                    <span className='text-sm text-gray-500 font-medium mb-2'>Discount Price:</span>
                    <input
                      {...register("discountPrice")}
                      type='number'
                      placeholder='Your discount price'
                      defaultValue={courseData.discountPrice?.toString()}
                      min={0}
                      onChange={e => handlePriceChange("discountPrice", e.target.value)}
                      className={`w-full px-4 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm ${errors["discountPrice"] ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors["discountPrice"] && (
                      <p className='text-xs! text-red-500 mt-1'>
                        {errors["discountPrice"]?.message as string}
                      </p>
                    )}
                  </div>
                </div>
                <div className='w-full'>
                  <span className='text-sm text-gray-500 font-medium mb-2'>Discount End Date:</span>
                  <input
                    {...register("discountEndDate")}
                    type='date'
                    placeholder='Discount End Date'
                    defaultValue={(() => {
                      if (!courseData.discountEndDate) return "";
                      const date = new Date(courseData.discountEndDate);
                      return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
                    })()}
                    min={new Date().toISOString().slice(0, 10)}
                    className={`w-full px-4 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm ${errors["discountEndDate"] ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                  />
                  {errors["discountEndDate"] && (
                    <p className='text-xs! text-red-500 mt-1'>
                      {errors["discountEndDate"]?.message as string}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className='w-full h-20 flex items-center justify-center shadow'>
                <p>This courese is Free for everyone. Enjoy it!</p>
              </div>
            )}
          </div>
          {/* Add Instructor here */}
          <div className='space-y-4 w-full mt-8'>
            <h5 className='font-medium text-gray-800'>Add Instructors</h5>
            <div className='flex flex-col gap-2 items-start'>
              <div className='relative rounded w-full'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  onChange={e => setQuery(e.target.value)}
                  placeholder='Search...'
                  className='w-1/2 pl-10 pr-4 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light'
                />
              </div>
              {results.length > 0 && (
                <ul className='w-full h-fit max-h-[150px] overflow-y-auto'>
                  {results.map(result => (
                    <li
                      key={result.userId}
                      className='w-1/2 px-3 py-1.5 text-sm hover:bg-gray-100 cursor-pointer'
                      onClick={() => {
                        handleAddInstructor(result.userId, result.displayName);
                        setQuery("");
                        setResults([]);
                      }}
                    >
                      <div className='w-full flex items-center gap-2'>
                        {result.avatarUrl ? (
                          <Image
                            src={result.avatarUrl}
                            alt=''
                            width={20}
                            height={20}
                            className='rounded-full'
                          />
                        ) : (
                          <UserCircleIcon className='w-5 h-5' />
                        )}
                        <p>{result.displayName}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className='w-full h-auto flex flex-wrap items-center gap-2'>
                {/* Instructor List Here */}
                {fields.map((data, index) => (
                  <div
                    key={data.id}
                    className='w-fit flex items-center gap-4 px-2 py-1 bg-gray-100 rounded'
                  >
                    <div>
                      <p className='text-sm font-semibold'>{data.displayName}</p>
                      <p className='text-sm'>{data.role}</p>
                    </div>

                    <button
                      onClick={() => remove(index)}
                      className='cursor-pointer bg-gray-300 p-1 rounded-full hover:bg-gray-400 transition-colors'
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              {errors.courseInstructors && (
                <p className='text-red-500 text-xs mt-2'>{errors.courseInstructors.message}</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className='py-6'>
            <CourseFooter
              handlePrevious={handlePrevious}
              isSubmitting={isSubmitting}
              currentStep={currentStep}
              setDataSaveMode={setDataSaveMode}
              isParamsExisting={isParamsExisting}
              isDraft={courseData.status === "DRAFT" ? true : false}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinalStep;
