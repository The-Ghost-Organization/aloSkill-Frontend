import { useDebounce } from "@/hooks/useDebounce.ts";
import { apiClient } from "@/lib/api/client.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Crown, Gift, Loader2, Search, Tag, UserCircleIcon, Users, X } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useSessionContext } from "../../../../../contexts/SessionContext";
import CourseFooter from "./CourseFooter.tsx";
import {
  Callout,
  ChoiceDot,
  choiceCardClass,
  cx,
  Field,
  FormSection,
  inputClass,
  Switch,
  TextArea,
} from "./formUi.tsx";
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
      }, "Welcome message contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed."),
    congratulationsMessage: z
      .string()
      .max(1000, "Congratulations Message cannot exceed 1000 characters")
      .optional()
      .refine(val => {
        if (val === undefined || val === "") return true;
        return /^[\w\s\p{P}&\-]+$/u.test(val);
      }, "Completion message contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed."),
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

type InstructorResult = {
  userId: string;
  displayName: string;
  avatarUrl?: string;
};

const formatTaka = (value: number) =>
  `৳${Number.isFinite(value) ? value.toLocaleString("en-BD", { maximumFractionDigits: 2 }) : "0"}`;

const toDateInput = (value?: Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const FinalStep = ({
  currentStep,
  setCurrentStep,
  courseData,
  setCourseData,
  isParamsExisting,
  setCourseUploadError,
  adminMode,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  courseData: CreateCourseData;
  setCourseData: React.Dispatch<React.SetStateAction<CreateCourseData>>;
  setCourseUploadError: React.Dispatch<React.SetStateAction<string>>;
  isParamsExisting: boolean;
  adminMode?: boolean;
}) => {
  const { user } = useSessionContext();
  // An existing course saved with price 0 opens on "Free"; everything else opens on "Paid" as before.
  const [paymentSelection, setPaymentSelection] = useState<"paid" | "free">(
    isParamsExisting && Number(courseData.originalPrice) === 0 ? "free" : "paid"
  );
  const [query, setQuery] = useState<string>("");
  const [dataSaveMode, setDataSaveMode] = useState<
    "draft" | "publish" | "update" | "updateAndPublish"
  >("draft");
  const [results, setResults] = useState<InstructorResult[] | []>([]);

  // UI-only state
  const [showDiscount, setShowDiscount] = useState<boolean>(
    Number(courseData.discountPrice ?? 0) > 0 || Boolean(courseData.discountEndDate)
  );
  const [instructorMenuOpen, setInstructorMenuOpen] = useState(false);
  const [activeResult, setActiveResult] = useState(0);
  const instructorListId = useId();
  const instructorInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
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
        const data = await apiClient.get<InstructorResult[] | []>(
          `/course/instructors?instructor=${debouncedQuery}`
        );
        setResults(data.data ?? []);
      } catch (_error) {
        // Search is best-effort; the list simply stays empty.
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
      return;
    }

    append({
      instructorId: userId,
      displayName: name,
      role: adminMode && !fields.some(item => item.role === "PRIMARY") ? "PRIMARY" : "CO_INSTRUCTOR",
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

  // Same handlers the Paid / Free buttons used before.
  const selectPaid = () => {
    setPaymentSelection("paid");
    setValue("paymentSelection", "paid");
  };

  const selectFree = () => {
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
  };

  // Keep the form values consistent when an existing free course opens on "Free".
  useEffect(() => {
    if (paymentSelection === "free") {
      setValue("paymentSelection", "free");
      setValue("originalPrice", "");
      setValue("discountPrice", "");
      setValue("discountEndDate", "");
    }
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDiscount = (on: boolean) => {
    setShowDiscount(on);
    if (!on) {
      // Same "no discount" values the Free option already sends.
      setValue("discountPrice", "", { shouldValidate: false });
      setValue("discountEndDate", "", { shouldValidate: false });
      setCourseData(prev => ({ ...prev, discountPrice: 0, discountEndDate: null }));
    }
  };

  const handleCourseSaveToDb = async (data: FinalStepForm, status: string) => {
    if (adminMode && !data.courseInstructors?.some(item => item.role === "PRIMARY")) {
      throw new Error("Select an approved primary instructor before saving this course.");
    }
    const { originalPrice, discountPrice } = data;
    const { allCategory: _allCategory, ...restCourseData } = courseData;
    const courseSaveToDB = await apiClient.post(`/course/create-course`, {
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
    if (courseData.modules.some(m => m.lessons.some(l => l.pendingVideoUploadJobId || (l.contentUrl?.url && l.requestedHostingType && l.requestedHostingType !== (l.hostingType ?? "PREMIUM"))))) {
      setCourseUploadError("Finish the video upload or restore its hosting selection before saving. The current video remains playable.");
      return;
    }
    if (adminMode && !data.courseInstructors?.some(item => item.role === "PRIMARY")) {
      setCourseUploadError("Select an approved primary instructor before saving this course.");
      return;
    }
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
        try { localStorage.removeItem(`aloskill:curriculum:${user?.id ?? ""}:${courseData.id ?? "new"}`); } catch {}
        redirect(adminMode ? "/dashboard/admin/courses" : "/dashboard/instructor/course");
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
        try { localStorage.removeItem(`aloskill:curriculum:${user?.id ?? ""}:${courseData.id ?? "new"}`); } catch {}
        redirect(adminMode ? "/dashboard/admin/courses" : "/dashboard/instructor/course");
      }
    }
    if (dataSaveMode === "update") {
      const backendData = await apiClient.patch(`/course/editOrUpdate-course`, {
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
        try { localStorage.removeItem(`aloskill:curriculum:${user?.id ?? ""}:${courseData.id ?? "new"}`); } catch {}
        redirect(adminMode ? "/dashboard/admin/courses" : "/dashboard/instructor/course");
      }
    }
    if (dataSaveMode === "updateAndPublish") {
      const backendData = await apiClient.patch(`/course/editOrUpdate-course`, {
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
        try { localStorage.removeItem(`aloskill:curriculum:${user?.id ?? ""}:${courseData.id ?? "new"}`); } catch {}
        redirect(adminMode ? "/dashboard/admin/courses" : "/dashboard/instructor/course");
      }
    }
    // console.log("courseData : ", courseData, "data : ", data);
  };

  // ── Derived display values ───────────────────────────────────────────────
  const priceText = watch("originalPrice");
  const discountText = watch("discountPrice");
  const welcomeText = watch("welcomeMessage") ?? courseData.welcomeMessage ?? "";
  const congratsText = watch("congratulationsMessage") ?? courseData.congratulationsMessage ?? "";
  const priceNumber = Number(priceText ?? courseData.originalPrice ?? 0);
  const discountNumber = Number(discountText ?? courseData.discountPrice ?? 0);
  const hasValidDiscount =
    showDiscount && priceNumber > 0 && discountNumber > 0 && discountNumber < priceNumber;
  const discountTooHigh = showDiscount && discountNumber > 0 && priceNumber > 0 && discountNumber >= priceNumber;
  const discountPercent = hasValidDiscount ? Math.round((1 - discountNumber / priceNumber) * 100) : 0;
  const discountEndText = watch("discountEndDate");

  const originalPriceField = register("originalPrice", {
    required: true,
    onChange: e => handlePriceChange("originalPrice", e.target.value),
  });
  const discountPriceField = register("discountPrice", {
    onChange: e => handlePriceChange("discountPrice", e.target.value),
  });

  const visibleResults = results.filter(r => !fields.some(f => f.instructorId === r.userId));
  const pickInstructor = (result: InstructorResult) => {
    handleAddInstructor(result.userId, result.displayName);
    setQuery("");
    setResults([]);
    setActiveResult(0);
    instructorInputRef.current?.focus();
  };

  return (
    <div className='w-full'>
      <StepHeader
        headingText='Pricing & publish'
        description='Set a price, add your teaching team, and write the messages students receive.'
      />
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        noValidate
      >
        {/* ── Pricing (change F) ── */}
        <FormSection
          title='Pricing'
          description='Prices are in Bangladeshi Taka (৳).'
        >
          <fieldset>
            <legend className='sr-only'>Course access</legend>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div>
                <input
                  type='radio'
                  id='pricing-paid'
                  name='pricing-mode'
                  className='peer sr-only'
                  checked={paymentSelection === "paid"}
                  onChange={selectPaid}
                />
                <label
                  htmlFor='pricing-paid'
                  className={choiceCardClass}
                >
                  <ChoiceDot />
                  <span className='flex-1'>
                    <span className='flex items-center gap-2 text-sm font-semibold text-gray-900'>
                      <Tag
                        className='h-4 w-4 text-gray-400'
                        aria-hidden='true'
                      />
                      Paid
                    </span>
                    <span className='mt-0.5 block text-xs text-gray-500'>Students pay once to enrol.</span>
                  </span>
                </label>
              </div>
              <div>
                <input
                  type='radio'
                  id='pricing-free'
                  name='pricing-mode'
                  className='peer sr-only'
                  checked={paymentSelection === "free"}
                  onChange={selectFree}
                />
                <label
                  htmlFor='pricing-free'
                  className={choiceCardClass}
                >
                  <ChoiceDot />
                  <span className='flex-1'>
                    <span className='flex items-center gap-2 text-sm font-semibold text-gray-900'>
                      <Gift
                        className='h-4 w-4 text-gray-400'
                        aria-hidden='true'
                      />
                      Free
                    </span>
                    <span className='mt-0.5 block text-xs text-gray-500'>Anyone can enrol at no cost.</span>
                  </span>
                </label>
              </div>
            </div>
          </fieldset>

          {paymentSelection === "paid" || courseData.originalPrice ? (
            <div className='space-y-5'>
              <Field
                label='Price'
                htmlFor='original-price'
                error={errors.originalPrice?.message as string | undefined}
                className='max-w-xs'
              >
                <div className='relative'>
                  <span
                    className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500'
                    aria-hidden='true'
                  >
                    ৳
                  </span>
                  <input
                    {...originalPriceField}
                    id='original-price'
                    type='number'
                    inputMode='decimal'
                    step='0.01'
                    placeholder='e.g. 1500'
                    defaultValue={courseData.originalPrice ? courseData.originalPrice.toString() : ""}
                    min={0}
                    max={9999.99}
                    aria-invalid={!!errors.originalPrice || undefined}
                    className={inputClass(!!errors.originalPrice, "pl-8 tabular-nums")}
                  />
                </div>
              </Field>

              <div className='rounded-xl border border-gray-200 p-4'>
                <Switch
                  id='discount-switch'
                  checked={showDiscount}
                  onChange={toggleDiscount}
                  label='Offer a discount'
                  description='Show a lower price for a limited time.'
                />

                {/* Kept mounted while hidden so the submitted values match the previous form. */}
                <div className={cx("mt-4 space-y-4 border-t border-gray-100 pt-4", !showDiscount && "hidden")}>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <Field
                      label='Discounted price'
                      htmlFor='discount-price'
                      error={errors.discountPrice?.message as string | undefined}
                      hint={discountTooHigh ? undefined : "What students pay while the discount runs."}
                    >
                      <div className='relative'>
                        <span
                          className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500'
                          aria-hidden='true'
                        >
                          ৳
                        </span>
                        <input
                          {...discountPriceField}
                          id='discount-price'
                          type='number'
                          inputMode='decimal'
                          step='0.01'
                          placeholder='e.g. 999'
                          defaultValue={
                            courseData.discountPrice ? courseData.discountPrice.toString() : ""
                          }
                          min={0}
                          max={9999.99}
                          aria-invalid={!!errors.discountPrice || undefined}
                          className={inputClass(!!errors.discountPrice || discountTooHigh, "pl-8 tabular-nums")}
                        />
                      </div>
                      {discountTooHigh && !errors.discountPrice && (
                        <p className='mt-1.5 text-xs text-amber-700'>
                          The discounted price must be lower than the regular price.
                        </p>
                      )}
                    </Field>

                    <Field
                      label='Discount ends on'
                      htmlFor='discount-end'
                      error={errors.discountEndDate?.message as string | undefined}
                      hint='The regular price returns after this date.'
                    >
                      <input
                        {...register("discountEndDate")}
                        id='discount-end'
                        type='date'
                        defaultValue={toDateInput(courseData.discountEndDate)}
                        min={new Date().toISOString().slice(0, 10)}
                        className={inputClass(!!errors.discountEndDate)}
                      />
                    </Field>
                  </div>

                  {hasValidDiscount && (
                    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-800'>
                      <span className='rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-bold text-white'>
                        −{discountPercent}%
                      </span>
                      <span>
                        Students pay <strong>{formatTaka(discountNumber)}</strong> instead of{" "}
                        <span className='line-through'>{formatTaka(priceNumber)}</span>
                        {discountEndText
                          ? ` until ${new Date(discountEndText).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                          : ""}
                        .
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Callout tone='success'>This course is free. Anyone can enrol without paying.</Callout>
          )}
        </FormSection>

        {/* ── Instructors (change H) ── */}
        <FormSection
          title={adminMode ? "Primary instructor and co-instructors" : "Co-instructors"}
          description={
            adminMode
              ? "The first instructor you add becomes the course owner and primary instructor."
              : "Add people who teach this course with you. They will be listed on the course page."
          }
        >
          <Field
            label='Search instructors'
            htmlFor='instructor-search'
            optional={!adminMode}
            error={errors.courseInstructors?.message}
          >
            <div className='relative max-w-md'>
              <Search
                className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
                aria-hidden='true'
              />
              <input
                ref={instructorInputRef}
                id='instructor-search'
                type='text'
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setInstructorMenuOpen(true);
                  setActiveResult(0);
                }}
                onFocus={() => setInstructorMenuOpen(true)}
                onBlur={() => setInstructorMenuOpen(false)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const picked = visibleResults[activeResult];
                    if (picked) pickInstructor(picked);
                  } else if (e.key === "ArrowDown" && visibleResults.length) {
                    e.preventDefault();
                    setActiveResult(i => (i + 1) % visibleResults.length);
                  } else if (e.key === "ArrowUp" && visibleResults.length) {
                    e.preventDefault();
                    setActiveResult(i => (i - 1 + visibleResults.length) % visibleResults.length);
                  } else if (e.key === "Escape") {
                    setInstructorMenuOpen(false);
                  }
                }}
                role='combobox'
                aria-expanded={instructorMenuOpen && visibleResults.length > 0}
                aria-controls={instructorListId}
                aria-autocomplete='list'
                autoComplete='off'
                placeholder='Type at least 2 letters of a name'
                className={inputClass(false, "pl-9")}
              />
              {instructorMenuOpen && query.trim().length >= 2 && (
                <ul
                  id={instructorListId}
                  role='listbox'
                  className='absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg'
                >
                  {visibleResults.length === 0 ? (
                    <li className='px-3 py-2.5 text-sm text-gray-500'>
                      {debouncedQuery !== query ? (
                        <span className='flex items-center gap-2'>
                          <Loader2
                            className='h-3.5 w-3.5 animate-spin'
                            aria-hidden='true'
                          />
                          Searching…
                        </span>
                      ) : (
                        "No approved instructors match that name."
                      )}
                    </li>
                  ) : (
                    visibleResults.map((result, i) => (
                      <li
                        key={result.userId}
                        role='option'
                        aria-selected={i === activeResult}
                        onMouseDown={e => e.preventDefault()}
                        onMouseEnter={() => setActiveResult(i)}
                        onClick={() => pickInstructor(result)}
                        className={cx(
                          "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm",
                          i === activeResult ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        )}
                      >
                        {result.avatarUrl ? (
                          <Image
                            src={result.avatarUrl}
                            alt=''
                            width={24}
                            height={24}
                            className='h-6 w-6 rounded-full object-cover'
                          />
                        ) : (
                          <UserCircleIcon
                            className='h-6 w-6 text-gray-400'
                            aria-hidden='true'
                          />
                        )}
                        <span className='truncate'>{result.displayName}</span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </Field>

          {fields.length > 0 ? (
            <ul className='divide-y divide-gray-100 rounded-xl border border-gray-200'>
              {fields.map((data, index) => (
                <li
                  key={data.id}
                  className='flex items-center gap-3 px-4 py-3'
                >
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600'>
                    {data.displayName.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-sm font-semibold text-gray-900'>
                      {data.displayName}
                    </span>
                    <span
                      className={cx(
                        "mt-0.5 inline-flex items-center gap-1 text-xs",
                        data.role === "PRIMARY" ? "font-semibold text-orange" : "text-gray-500"
                      )}
                    >
                      {data.role === "PRIMARY" && (
                        <Crown
                          className='h-3 w-3'
                          aria-hidden='true'
                        />
                      )}
                      {data.role === "PRIMARY" ? "Primary instructor" : "Co-instructor"}
                    </span>
                  </span>
                  {/* Bug 2 fix: type='button' so removing an instructor never submits (and saves) the course */}
                  <button
                    type='button'
                    onClick={() => remove(index)}
                    aria-label={`Remove ${data.displayName}`}
                    className='inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
                  >
                    <X
                      className='h-4 w-4'
                      aria-hidden='true'
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className='flex items-center gap-3 rounded-xl border border-dashed border-gray-200 px-4 py-4 text-sm text-gray-500'>
              <Users
                className='h-5 w-5 text-gray-300'
                aria-hidden='true'
              />
              {adminMode
                ? "No instructor selected yet. Search above to choose the primary instructor."
                : "You are the only instructor. Add co-instructors if others teach with you."}
            </div>
          )}
        </FormSection>

        {/* ── Messages ── */}
        <FormSection
          title='Student messages'
          description='Sent automatically. A short personal note goes a long way.'
        >
          <div className='grid gap-5 lg:grid-cols-2'>
            <Field
              label='Welcome message'
              htmlFor='welcome-message'
              optional
              counter={{ value: welcomeText.length, max: 1000 }}
              error={errors.welcomeMessage?.message as string | undefined}
              hint='Sent when a student enrols.'
            >
              <TextArea
                {...register("welcomeMessage", {
                  pattern: {
                    value: /^[^<>]*$/,
                    message: "Welcome Message must not contain any opening or closing HTML tags",
                  },
                })}
                id='welcome-message'
                rows={5}
                maxLength={1000}
                defaultValue={courseData.welcomeMessage}
                placeholder='Welcome! Here is how to get the most out of this course…'
                hasError={!!errors.welcomeMessage}
              />
            </Field>
            <Field
              label='Completion message'
              htmlFor='congrats-message'
              optional
              counter={{ value: congratsText.length, max: 1000 }}
              error={errors.congratulationsMessage?.message as string | undefined}
              hint='Sent when a student finishes the course.'
            >
              <TextArea
                {...register("congratulationsMessage", {
                  pattern: {
                    value: /^[^<>]*$/,
                    message: "Congratulations Message must not contain any opening or closing HTML tags",
                  },
                })}
                id='congrats-message'
                rows={5}
                maxLength={1000}
                defaultValue={courseData.congratulationsMessage}
                placeholder='Congratulations on finishing! Your next step could be…'
                hasError={!!errors.congratulationsMessage}
              />
            </Field>
          </div>
        </FormSection>

        <CourseFooter
          handlePrevious={handlePrevious}
          isSubmitting={isSubmitting}
          currentStep={currentStep}
          setDataSaveMode={setDataSaveMode}
          isParamsExisting={isParamsExisting}
          isDraft={courseData.status === "DRAFT" ? true : false}
        />
      </form>
    </div>
  );
};

export default FinalStep;
