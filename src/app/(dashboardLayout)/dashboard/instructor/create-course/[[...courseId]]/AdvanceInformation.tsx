import { getFileIdFromUrl } from "@/lib/course/utils.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, ImageIcon, Loader, Play, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import * as tus from "tus-js-client";
import z from "zod";
import { apiClient } from "../../../../../../lib/api/client.ts";
import { useSessionContext } from "../../../../../contexts/SessionContext.tsx";
import CourseFooter from "./CourseFooter.tsx";
import { cx, ErrorSummary, Field, FormSection, inputClass, TextArea, TextInput } from "./formUi.tsx";
import { type CreateCourseData } from "./page.tsx";
import StepHeader from "./StepHeader.tsx";

// ── Types & schema (rules unchanged; two copy-pasted error messages corrected) ─

type CourseDescriptionForm = {
  trailerUrl?: string;
  objectives: string;
  description: string;
  whyThisCourse: string[];
  whatYouTeach: string[];
  targetAudience: string[];
  requirements: string[];
};

const CourseDescriptionSchema = z.object({
  trailerUrl: z.url("Trailer URL is invalid. Please provide a valid URL.").or(z.literal("")).optional(),
  objectives: z
    .string()
    .trim()
    .min(10, "Short summary must be at least 10 characters long")
    .max(100, "Short summary cannot exceed 100 characters.")
    .regex(/^[^<>]*$/, "Short summary must not contain any opening or closing HTML tags"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long")
    .regex(/^[^<>]*$/, "Description must not contain any opening or closing HTML tags"),
  whyThisCourse: z
    .array(
      z
        .string()
        .trim()
        .min(10, "Must be at least 10 characters long.")
        .max(120, "Cannot exceed 120 characters.")
        .regex(/^[^<>]*$/, "Must not contain any opening or closing HTML tags")
    )
    .min(1, "Add at least one reason to take this course.")
    .max(5, "You can add a maximum of 5 reasons."),
  whatYouTeach: z
    .array(
      z
        .string()
        .trim()
        .min(10, "Must be at least 10 characters long.")
        .max(120, "Cannot exceed 120 characters.")
        .regex(/^[^<>]*$/, "Must not contain any opening or closing HTML tags")
    )
    .min(1, "You must define at least one teaching objective.")
    .max(5, "You can define a maximum of 5 teaching objectives."),
  targetAudience: z
    .array(
      z
        .string()
        .trim()
        .min(10, "Must be at least 10 characters long.")
        .max(120, "Cannot exceed 120 characters.")
        .regex(/^[^<>]*$/, "Must not contain any opening or closing HTML tags")
    )
    .min(1, "Describe at least one type of student this course is for.")
    .max(5, "You can add a maximum of 5 audience descriptions."),
  requirements: z
    .array(
      z
        .string()
        .trim()
        .min(10, "Must be at least 10 characters long.")
        .max(120, "Cannot exceed 120 characters.")
        .regex(/^[^<>]*$/, "Must not contain any opening or closing HTML tags")
    )
    .min(1, "You must define at least one requirement.")
    .max(5, "You can define a maximum of 5 requirements."),
});

function collectValidationMessages(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  if (typeof record.message === "string") return [record.message];
  return Object.entries(record)
    .filter(([key]) => !["ref", "type", "types"].includes(key))
    .flatMap(([, child]) => collectValidationMessages(child));
}

// ── ListSection ───────────────────────────────────────────────────────────────
// One editable list (max 5). All state changes go through the handlers passed in.

const MAX_ITEMS = 5;

interface ListSectionProps {
  title: string;
  description: string;
  fieldName: keyof Pick<
    CourseDescriptionForm,
    "whyThisCourse" | "whatYouTeach" | "targetAudience" | "requirements"
  >;
  items: string[];
  placeholder: string;
  errors: FieldErrors<CourseDescriptionForm>;
  register: UseFormRegister<CourseDescriptionForm>;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onChange: (index: number, value: string) => void;
}

const ListSection = ({
  title,
  description,
  fieldName,
  items,
  placeholder,
  errors,
  register,
  onAdd,
  onDelete,
  onChange,
}: ListSectionProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldErrors = errors[fieldName] as any;
  const listRef = useRef<HTMLOListElement>(null);
  const canAdd = items.length < MAX_ITEMS;

  const focusItem = (index: number) =>
    requestAnimationFrame(() =>
      listRef.current?.querySelector<HTMLInputElement>(`[data-item-index="${index}"]`)?.focus()
    );

  const addAndFocus = () => {
    if (!canAdd) return;
    onAdd();
    focusItem(items.length);
  };

  return (
    <FormSection
      title={title}
      description={description}
      aside={
        <span className='rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-gray-500'>
          {items.length} of {MAX_ITEMS}
        </span>
      }
    >
      <ol
        ref={listRef}
        className='space-y-2.5'
      >
        {items.map((item, index) => {
          const itemError = fieldErrors?.[index]?.message as string | undefined;
          return (
            <li key={index}>
              <div className='flex items-center gap-2'>
                <span
                  aria-hidden='true'
                  className='w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-400'
                >
                  {index + 1}.
                </span>
                <div className='relative min-w-0 flex-1'>
                  <input
                    {...register(`${fieldName}.${index}` as Parameters<typeof register>[0])}
                    data-item-index={index}
                    type='text'
                    aria-label={`${title} item ${index + 1}`}
                    placeholder={placeholder}
                    value={item}
                    onChange={e => onChange(index, e.target.value)}
                    onKeyDown={e => {
                      // Enter moves to a new line instead of submitting the step.
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (index === items.length - 1) addAndFocus();
                        else focusItem(index + 1);
                      }
                    }}
                    maxLength={120}
                    className={inputClass(!!itemError, "pr-16")}
                  />
                  <span
                    className={cx(
                      "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums",
                      item.length > 0 && item.trim().length < 10 ? "text-amber-600" : "text-gray-400"
                    )}
                  >
                    {item.length}/120
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => onDelete(index)}
                  aria-label={`Remove ${title} item ${index + 1}`}
                  className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
                >
                  <Trash2
                    className='h-4 w-4'
                    aria-hidden='true'
                  />
                </button>
              </div>
              {itemError && <p className='ml-7 mt-1 text-xs text-red-600'>{itemError}</p>}
            </li>
          );
        })}
      </ol>

      {fieldErrors?.message && <p className='text-xs text-red-600'>{fieldErrors.message}</p>}

      <button
        type='button'
        onClick={addAndFocus}
        disabled={!canAdd}
        className='ml-7 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-orange transition-colors hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent'
      >
        <Plus
          className='h-4 w-4'
          aria-hidden='true'
        />
        {canAdd ? "Add another" : "Maximum of 5 reached"}
      </button>
    </FormSection>
  );
};

// ── Media upload card ─────────────────────────────────────────────────────────

const MediaUpload = ({
  title,
  description,
  specs,
  uploadError,
  inputId,
  accept,
  hasMedia,
  busy,
  previewSlot,
  onChange,
}: {
  title: string;
  description: string;
  specs?: string;
  uploadError?: string;
  inputId: string;
  accept: string;
  hasMedia: boolean;
  busy: boolean;
  previewSlot: React.ReactNode;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className='flex flex-col gap-3'>
    <div>
      <h4 className='text-[13px] font-medium text-gray-800'>{title}</h4>
      <p className='mt-0.5 text-xs leading-relaxed text-gray-500'>{description}</p>
    </div>

    <label
      htmlFor={inputId}
      className={cx(
        "group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
        busy ? "cursor-wait" : "cursor-pointer",
        uploadError
          ? "border-red-200 bg-red-50"
          : hasMedia
            ? "border-gray-200 bg-gray-50"
            : "border-gray-200 bg-gray-50 hover:border-orange/60 hover:bg-orange-500/5"
      )}
    >
      {previewSlot}
    </label>
    <input
      type='file'
      id={inputId}
      // Reset the value afterwards so choosing the same file again still triggers onChange.
      onChange={e => {
        void onChange(e);
        e.currentTarget.value = "";
      }}
      disabled={busy}
      className='sr-only'
      accept={accept}
    />

    <div className='flex flex-wrap items-center justify-between gap-2'>
      {uploadError ? (
        <p
          role='alert'
          className='text-xs font-medium text-red-600'
        >
          {uploadError}
        </p>
      ) : (
        specs && <p className='text-xs text-gray-400'>{specs}</p>
      )}
      <label
        htmlFor={inputId}
        className={cx(
          "ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-500/10",
          busy ? "pointer-events-none opacity-50" : "cursor-pointer"
        )}
      >
        {hasMedia ? (
          <RefreshCw
            className='h-3.5 w-3.5'
            aria-hidden='true'
          />
        ) : (
          <Upload
            className='h-3.5 w-3.5'
            aria-hidden='true'
          />
        )}
        {hasMedia ? "Replace" : "Upload"}
      </label>
    </div>
  </div>
);

const EmptyMedia = ({ icon: Icon, text }: { icon: typeof ImageIcon; text: string }) => (
  <div className='flex flex-col items-center gap-2 px-4 text-center text-gray-400'>
    <Icon
      size={36}
      strokeWidth={1.25}
      aria-hidden='true'
    />
    <span className='text-sm font-medium text-gray-600'>{text}</span>
    <span className='text-xs'>Click to choose a file</span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

function AdvanceInformation({
  currentStep,
  setCurrentStep,
  courseData,
  setCourseData,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  courseData: CreateCourseData;
  setCourseData: React.Dispatch<React.SetStateAction<CreateCourseData>>;
}) {
  // ── Parsed description (unchanged) ───────────────────────────────────────
  const courseDescriptionParsed: {
    objectives: string;
    description: string;
    whyThisCourse: string[];
    whatYouTeach: string[];
    targetAudience: string[];
    requirements: string[];
  } = (() => {
    try {
      const parsedData = JSON.parse(courseData.description || "{}");
      return {
        objectives: parsedData.objectives || "",
        description: parsedData.description || "",
        whyThisCourse: parsedData.whyThisCourse ? parsedData.whyThisCourse.split("||") : [""],
        whatYouTeach: parsedData.whatYouTeach ? parsedData.whatYouTeach.split("||") : [""],
        targetAudience: parsedData.targetAudience ? parsedData.targetAudience.split("||") : [""],
        requirements: parsedData.requirements ? parsedData.requirements.split("||") : [""],
      };
    } catch {
      return {
        objectives: "",
        description: "",
        whyThisCourse: [""],
        whatYouTeach: [""],
        targetAudience: [""],
        requirements: [""],
      };
    }
  })();

  // ── State (unchanged) ────────────────────────────────────────────────────
  const [whyThisCourse, setWhyThisCourse] = useState<string[]>(
    courseDescriptionParsed.whyThisCourse || [""]
  );
  const [whatYouTeach, setWhatYouTeach] = useState<string[]>(
    courseDescriptionParsed.whatYouTeach || [""]
  );
  const [targetAudience, setTargetAudience] = useState<string[]>(
    courseDescriptionParsed.targetAudience || [""]
  );
  const [requirements, setRequirements] = useState<string[]>(
    courseDescriptionParsed.requirements || [""]
  );
  const [imageUploadLoading, setImageUploadLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  // Bug 10 fix: trailer errors are tracked separately from thumbnail errors.
  const [trailerUploadError, setTrailerUploadError] = useState<string>("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadPercentage, setUploadPercentage] = useState<string>("");
  const [preview, setPreview] = useState<string>(courseData.thumbnailUrl || "");
  const [videoPreview, setVideoPreview] = useState<string>(courseData.trailerUrl || "");
  const [videoData, setVideoData] = useState<{
    libraryId: string;
    token: string;
    expiresAt: number;
    videoId: string;
  } | null>(null);

  const { user } = useSessionContext();

  const {
    register,
    unregister,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CourseDescriptionForm>({
    resolver: zodResolver(CourseDescriptionSchema),
    defaultValues: { ...courseDescriptionParsed, trailerUrl: courseData.trailerUrl ?? '' },
  });

  // ── Effects & handlers (unchanged) ───────────────────────────────────────
  useEffect(() => {
    if (!courseData.trailerUrl) return;
    try {
      const getVideoData = async () => {
        const getVideoFromBunny = await apiClient.post<{
          libraryId: string;
          token: string;
          videoId: string;
          expiresAt: number;
        }>("/course/get-video-url", {
          filePath: getFileIdFromUrl(courseData.trailerUrl as string),
          duration: 10,
        });
        if (!getVideoFromBunny.success) return;
        if (getVideoFromBunny.data) setVideoData(getVideoFromBunny.data);
      };
      getVideoData();
    } catch (_error: unknown) {}
  }, [courseData.trailerUrl]);

  const onSubmit = (data: CourseDescriptionForm) => {
    const { objectives, description, whatYouTeach, targetAudience, requirements } = data;
    setCourseData(prev => ({
      ...prev,
      description: JSON.stringify({
        objectives,
        description,
        whyThisCourse: data.whyThisCourse.join("||"),
        whatYouTeach: whatYouTeach.join("||"),
        targetAudience: targetAudience.join("||"),
        requirements: requirements.join("||"),
      }),
      trailerUrl: data.trailerUrl?.trim() || undefined,
    }));
    setCurrentStep(currentStep + 1);
  };

  const onInvalid = () => {
    setSubmitAttempted(true);
    requestAnimationFrame(() => {
      errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      errorSummaryRef.current?.focus();
    });
  };

  const addNewItem = (field: string) => {
    if (field === "whyThisCourse") {
      if (whyThisCourse.length >= 5) return;
      setValue(`whyThisCourse.${whyThisCourse.length}`, "");
      setWhyThisCourse(prev => [...prev, ""]);
    }
    if (field === "whatYouTeach") {
      if (whatYouTeach.length >= 5) return;
      setValue(`whatYouTeach.${whatYouTeach.length}`, "");
      setWhatYouTeach(prev => [...prev, ""]);
    }
    if (field === "targetAudience") {
      if (targetAudience.length >= 5) return;
      setValue(`targetAudience.${targetAudience.length}`, "");
      setTargetAudience(prev => [...prev, ""]);
    }
    if (field === "requirements") {
      if (requirements.length >= 5) return;
      setValue(`requirements.${requirements.length}`, "");
      setRequirements(prev => [...prev, ""]);
    }
  };

  const deleteItem = (field: string, index: number) => {
    if (field === "whyThisCourse") {
      unregister(`whyThisCourse.${index}`);
      setWhyThisCourse(prev => prev.filter((_, i) => i !== index));
      setValue('whyThisCourse', whyThisCourse.filter((_, i) => i !== index), { shouldDirty: true, shouldValidate: true });
    }
    if (field === "whatYouTeach") {
      unregister(`whatYouTeach.${index}`);
      setWhatYouTeach(prev => prev.filter((_, i) => i !== index));
      setValue('whatYouTeach', whatYouTeach.filter((_, i) => i !== index), { shouldDirty: true, shouldValidate: true });
    }
    if (field === "targetAudience") {
      unregister(`targetAudience.${index}`);
      setTargetAudience(prev => prev.filter((_, i) => i !== index));
      setValue('targetAudience', targetAudience.filter((_, i) => i !== index), { shouldDirty: true, shouldValidate: true });
    }
    if (field === "requirements") {
      unregister(`requirements.${index}`);
      setRequirements(prev => prev.filter((_, i) => i !== index));
      setValue('requirements', requirements.filter((_, i) => i !== index), { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleArrayInputChange = (field: string, index: number, value: string) => {
    const fieldName = field as 'whyThisCourse' | 'whatYouTeach' | 'targetAudience' | 'requirements';
    setValue(`${fieldName}.${index}`, value, { shouldDirty: true, shouldValidate: true });
    if (field === "whyThisCourse") {
      const a = [...whyThisCourse];
      a[index] = value;
      setWhyThisCourse(a);
    }
    if (field === "whatYouTeach") {
      const a = [...whatYouTeach];
      a[index] = value;
      setWhatYouTeach(a);
    }
    if (field === "targetAudience") {
      const a = [...targetAudience];
      a[index] = value;
      setTargetAudience(a);
    }
    if (field === "requirements") {
      const a = [...requirements];
      a[index] = value;
      setRequirements(a);
    }
  };

  const uploadVideoToBunny = async (file: File): Promise<{ name: string; url: string }> => {
    setLoading(true);
    setTrailerUploadError("");
    setUploadPercentage("");
    if (!user?.id) {
      setTrailerUploadError("User not authenticated.");
      setUploadPercentage("");
      setLoading(false);
      return { name: "", url: "" };
    }
    try {
      const backendResponse = await apiClient.post<{
        videoId: string;
        token: string;
        expires: number;
        libraryId: string;
        collectionId: string;
      }>(`/course/bunny-signature?fileName=${file.name}&collectionName=${user?.id}`);
      if (!backendResponse.success || !backendResponse.data) return { name: "", url: "" };
      if (backendResponse.success && backendResponse.data) {
        const { videoId, token, expires, libraryId, collectionId } = backendResponse.data;
        return await new Promise((resolve, reject) => {
          const upload = new tus.Upload(file, {
            endpoint: "https://video.bunnycdn.com/tusupload",
            retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
            headers: {
              AuthorizationSignature: token,
              AuthorizationExpire: expires.toString(),
              VideoId: videoId,
              LibraryId: libraryId,
            },
            metadata: { filetype: file.type, title: file.name, collection: collectionId },
            onError: (error: Error) => {
              setTrailerUploadError("Failed to upload video. " + error.message);
              setLoading(false);
              setUploadPercentage("");
              reject(error);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
              setTrailerUploadError("");
              setUploadPercentage(`${((bytesUploaded / bytesTotal) * 100).toFixed(2)}%`);
              setLoading(false);
            },
            onSuccess: () => {
              setLoading(false);
              setTrailerUploadError("");
              setUploadPercentage("");
              resolve({
                name: file.name,
                url: `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
              });
            },
          });
          upload.findPreviousUploads().then((previousUploads: tus.PreviousUpload[]) => {
            if (previousUploads.length > 0) {
              const prev = previousUploads[0];
              if (prev) upload.resumeFromPreviousUpload(prev);
            }
            upload.start();
          });
        });
      }
      return { name: "", url: "" };
    } catch (error: unknown) {
      setTrailerUploadError(error instanceof Error ? error.message : "An unknown error occurred.");
      return { name: "", url: "" };
    } finally {
      setLoading(false);
      setUploadPercentage("");
    }
  };

  const validateImageRatio = (file: File): Promise<{ isValid: boolean; error: string }> => {
    return new Promise(resolve => {
      const img = document.createElement("img");
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const ratio = img.naturalWidth / img.naturalHeight;
        const is16by9 = ratio >= 1.77 && ratio <= 1.78;
        if (img.naturalWidth < 1280)
          resolve({ isValid: false, error: "Image is too small. Minimum width is 1280px." });
        else if (!is16by9)
          resolve({ isValid: false, error: "Image must have a 16:9 aspect ratio." });
        else resolve({ isValid: true, error: "" });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ isValid: false, error: "Failed to load image." });
      };
      img.src = objectUrl;
    });
  };

  const uploadFileToBunny = async (file: File): Promise<{ name: string; url: string }> => {
    setImageUploadLoading(true);
    setUploadError("");
    if (!user?.id) {
      setUploadError("User not authenticated.");
      setImageUploadLoading(false);
      return { name: "", url: "" };
    }
    try {
      const isValidRatio = await validateImageRatio(file);
      if (!isValidRatio.isValid) {
        setUploadError(isValidRatio.error);
        return { name: "", url: "" };
      }
      setUploadError("");
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.postFormData<string>(
        `/course/file-upload?folder=${user.id}`,
        formData
      );
      if (!response.success || !response.data) {
        setUploadError("Upload failed: try different Image or try again");
        return { name: "", url: "" };
      }
      return { name: file.name, url: response.data };
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : "An unknown error occurred.");
      return { name: "", url: "" };
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        if (file.type.startsWith("video/")) {
          try {
            const uploadResult = await uploadVideoToBunny(file);
            if (uploadResult.url) setVideoPreview(URL.createObjectURL(file));
            if (!uploadResult.url) return;
            setValue("trailerUrl", uploadResult.url, { shouldDirty: true, shouldValidate: true });
            setCourseData(prev => ({ ...prev, trailerUrl: uploadResult.url }));
          } catch (_error) {}
          return;
        }
        if (file.type.startsWith("image/")) {
          try {
            const uploadResult = await uploadFileToBunny(file);
            if (uploadResult.url) setPreview(URL.createObjectURL(file));
            setCourseData(prev => ({ ...prev, thumbnailUrl: uploadResult.url }));
          } catch (_error) {}
          return;
        }
      }
    }
  };

  const handlePrevious = () => setCurrentStep(currentStep - 1);

  // ── Render ───────────────────────────────────────────────────────────────
  const [objectivesValue, setObjectivesValue] = useState<string>(courseDescriptionParsed.objectives || "");
  const [descriptionValue, setDescriptionValue] = useState<string>(
    courseDescriptionParsed.description || ""
  );
  const objectivesField = register("objectives", {
    onChange: e => setObjectivesValue(e.target.value),
  });
  const descriptionField = register("description", {
    required: "Description is required",
    onChange: e => setDescriptionValue(e.target.value),
  });
  const trailerBusy = loading || Boolean(uploadPercentage);

  return (
    <div className='w-full'>
      <StepHeader
        headingText='Course details'
        description='This is what students see on your course page before they enrol.'
      />

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
      >
        {submitAttempted && Object.keys(errors).length > 0 && (
          <ErrorSummary
            ref={errorSummaryRef}
            messages={[...new Set(collectValidationMessages(errors))]}
          />
        )}

        {/* ── Media uploads ── */}
        <FormSection
          title='Thumbnail and trailer'
          description='A clear thumbnail and a short trailer make your course stand out in listings.'
        >
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <MediaUpload
              title='Thumbnail'
              description='Shown on course cards and at the top of the course page.'
              specs='At least 1280 × 720 px · 16:9 · JPG or PNG'
              uploadError={uploadError}
              inputId='imageUpload'
              accept='.jpg,.jpeg,.png'
              hasMedia={Boolean(preview)}
              busy={imageUploadLoading}
              onChange={handleFileSelect}
              previewSlot={
                imageUploadLoading ? (
                  <span className='flex flex-col items-center gap-2 text-sm text-gray-500'>
                    <Loader
                      className='h-6 w-6 animate-spin text-orange'
                      aria-hidden='true'
                    />
                    Uploading image…
                  </span>
                ) : preview ? (
                  <Image
                    width={640}
                    height={360}
                    src={preview}
                    alt='Course thumbnail preview'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <EmptyMedia
                    icon={ImageIcon}
                    text='Add a thumbnail'
                  />
                )
              }
            />

            <MediaUpload
              title='Trailer (optional)'
              description='A 1–2 minute preview that tells students what they will get.'
              specs='MP4, MOV or WebM'
              uploadError={trailerUploadError}
              inputId='thumbUpload'
              accept='.mp4,.mov,.webm'
              hasMedia={Boolean(videoData || videoPreview)}
              busy={trailerBusy}
              onChange={handleFileSelect}
              previewSlot={
                loading ? (
                  <span className='flex flex-col items-center gap-2 text-sm text-gray-500'>
                    <Loader
                      className='h-6 w-6 animate-spin text-orange'
                      aria-hidden='true'
                    />
                    Preparing upload…
                  </span>
                ) : uploadPercentage ? (
                  <span
                    className='flex w-full flex-col items-center gap-3 px-8'
                    role='status'
                  >
                    <span className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                      <CloudUpload
                        className='h-4 w-4 animate-pulse text-orange'
                        aria-hidden='true'
                      />
                      Uploading {uploadPercentage}
                    </span>
                    <span className='h-1.5 w-full overflow-hidden rounded-full bg-gray-200'>
                      <span
                        className='block h-full rounded-full bg-orange transition-all duration-300'
                        style={{ width: uploadPercentage }}
                      />
                    </span>
                    <span className='text-xs text-gray-400'>Keep this tab open until it finishes.</span>
                  </span>
                ) : videoData ? (
                  <iframe
                    title='Course trailer'
                    className='h-full w-full'
                    src={`https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?token=${videoData.token}&expires=${videoData.expiresAt}&autoplay=false`}
                    allow='encrypted-media;'
                    allowFullScreen
                  />
                ) : videoPreview ? (
                  <video
                    src={videoPreview}
                    controls
                    className='h-full w-full'
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <EmptyMedia
                    icon={Play}
                    text='Add a trailer'
                  />
                )
              }
            />
          </div>

          {/* Hidden input for trailer URL — unchanged */}
          <input
            type='hidden'
            {...register("trailerUrl")}
          />
          {errors.trailerUrl?.message && (
            <p
              role='alert'
              className='text-xs text-red-600'
            >
              {errors.trailerUrl.message}
            </p>
          )}
        </FormSection>

        {/* ── Summary & description ── */}
        <FormSection
          title='Summary and description'
          description='Start with a one-line promise, then explain the course in detail.'
        >
          {/* Change E: single-line "short summary" (stored as `objectives`) */}
          <Field
            label='Short summary'
            htmlFor='objectives'
            counter={{ value: objectivesValue.length, max: 100, min: 10 }}
            error={errors.objectives?.message}
            hint='Shown under the course title. Example: Build and deploy three real projects with Next.js.'
          >
            <TextInput
              {...objectivesField}
              id='objectives'
              type='text'
              defaultValue={courseDescriptionParsed.objectives || ""}
              maxLength={100}
              placeholder='One sentence about what students will achieve'
              hasError={!!errors.objectives}
              onKeyDown={e => {
                if (e.key === "Enter") e.preventDefault();
              }}
            />
          </Field>

          <Field
            label='Description'
            htmlFor='description'
            counter={{ value: descriptionValue.length, min: 10 }}
            error={errors.description?.message}
            hint='Cover what the course includes, how it is taught, and what students can do afterwards. Plain text only.'
          >
            <TextArea
              {...descriptionField}
              id='description'
              defaultValue={courseDescriptionParsed.description || ""}
              rows={7}
              placeholder='Describe your course…'
              hasError={!!errors.description}
            />
          </Field>
        </FormSection>

        <ListSection
          title='What students will learn'
          description='Concrete skills or results. Start each one with a verb.'
          fieldName='whatYouTeach'
          items={whatYouTeach}
          placeholder='e.g. Build a full-stack app with Next.js and PostgreSQL'
          errors={errors}
          register={register}
          onAdd={() => addNewItem("whatYouTeach")}
          onDelete={index => deleteItem("whatYouTeach", index)}
          onChange={(i, v) => handleArrayInputChange("whatYouTeach", i, v)}
        />

        <ListSection
          title='Why take this course'
          description='What makes your course different from others on the same topic.'
          fieldName='whyThisCourse'
          items={whyThisCourse}
          placeholder='e.g. Hands-on projects with real-world applications'
          errors={errors}
          register={register}
          onAdd={() => addNewItem("whyThisCourse")}
          onDelete={index => deleteItem("whyThisCourse", index)}
          onChange={(i, v) => handleArrayInputChange("whyThisCourse", i, v)}
        />

        <ListSection
          title='Who this course is for'
          description='Describe the students who will get the most out of it.'
          fieldName='targetAudience'
          items={targetAudience}
          placeholder='e.g. Developers who already know basic JavaScript'
          errors={errors}
          register={register}
          onAdd={() => addNewItem("targetAudience")}
          onDelete={index => deleteItem("targetAudience", index)}
          onChange={(i, v) => handleArrayInputChange("targetAudience", i, v)}
        />

        <ListSection
          title='Requirements'
          description='Tools, knowledge or equipment students need before starting.'
          fieldName='requirements'
          items={requirements}
          placeholder='e.g. A computer with internet access and basic HTML knowledge'
          errors={errors}
          register={register}
          onAdd={() => addNewItem("requirements")}
          onDelete={index => deleteItem("requirements", index)}
          onChange={(i, v) => handleArrayInputChange("requirements", i, v)}
        />

        <CourseFooter
          handlePrevious={handlePrevious}
          isSubmitting={isSubmitting || loading || imageUploadLoading || Boolean(uploadPercentage)}
          currentStep={currentStep}
        />
      </form>
    </div>
  );
}

export default AdvanceInformation;
