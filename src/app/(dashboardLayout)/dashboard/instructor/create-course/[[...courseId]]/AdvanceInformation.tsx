import { getFileIdFromUrl } from "@/lib/course/utils.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, ImageIcon, Loader, Play, Plus, Trash, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import * as tus from "tus-js-client";
import z from "zod";
import { apiClient } from "../../../../../../lib/api/client.ts";
import { useSessionContext } from "../../../../../contexts/SessionContext.tsx";
import CourseFooter from "./CourseFooter.tsx";
import { type CreateCourseData } from "./page.tsx";
import StepHeader from "./StepHeader.tsx";

// ── Types & schema (unchanged) ────────────────────────────────────────────────

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
  trailerUrl: z.url("Trailer Url is invalid. Please provide a valid URL.").optional(),
  objectives: z
    .string()
    .trim()
    .min(10, "Objectives must be at least 10 characters long")
    .max(100, "Objectives Cannot exceed 100 characters.")
    .regex(/^[^<>]*$/, "Objectives must not contain any opening or closing HTML tags"),
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
        .regex(/^[^<>]*$/, "whyThisCourse must not contain any opening or closing HTML tags")
    )
    .min(1, "You must define at least one teaching objective.")
    .max(5, "You can define a maximum of 5 teaching objectives."),
  whatYouTeach: z
    .array(
      z
        .string()
        .trim()
        .min(10, "Must be at least 10 characters long.")
        .max(120, "Cannot exceed 120 characters.")
        .regex(/^[^<>]*$/, "whatYouTeach must not contain any opening or closing HTML tags")
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
        .regex(/^[^<>]*$/, "targetAudience must not contain any opening or closing HTML tags")
    )
    .min(1, "You must define at least one teaching objective.")
    .max(5, "You can define a maximum of 5 teaching objectives."),
  requirements: z
    .array(
      z
        .string()
        .trim()
        .min(10, "Must be at least 10 characters long.")
        .max(120, "Cannot exceed 120 characters.")
        .regex(/^[^<>]*$/, "requirements must not contain any opening or closing HTML tags")
    )
    .min(1, "You must define at least one requirement.")
    .max(5, "You can define a maximum of 5 requirements."),
});

// ── Style utilities ───────────────────────────────────────────────────────────

const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(" ");

// ── FloatingTextarea ──────────────────────────────────────────────────────────
// Same peer-placeholder-shown pattern as FloatingInput in BasicInformaton.

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hasError?: boolean;
  error?: string;
  hint?: string;
}

const FloatingTextarea = ({
  id,
  label,
  hasError,
  error,
  hint,
  rows = 3,
  className,
  ...rest
}: FloatingTextareaProps) => (
  <div>
    <div className='relative'>
      <textarea
        id={id}
        placeholder=' '
        rows={rows}
        className={cx(
          "peer w-full px-3.5 pt-6 pb-3 text-sm text-gray-900 rounded-xl border",
          "outline-none resize-none transition-all duration-200 placeholder:text-gray-400",
          hasError
            ? "border-red-300 bg-red-50/40 focus:ring-2 focus:ring-red-100 focus:border-red-400"
            : "border-gray-200 bg-white hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100",
          className
        )}
        {...rest}
      />
      <label
        htmlFor={id}
        className={cx(
          "pointer-events-none absolute left-3.5 transition-all duration-200 select-none",
          // Floated (filled / focused)
          "top-[7px] text-[11px] font-medium",
          // Resting — input is empty, not focused
          "peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm",
          "peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-400",
          // Focus lifts label regardless
          hasError
            ? "text-red-400 peer-focus:text-red-500"
            : "text-gray-400 peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:text-gray-500"
        )}
      >
        {label}
      </label>
    </div>
    {error && (
      <p
        role='alert'
        className='mt-1.5 text-xs text-red-500'
      >
        {error}
      </p>
    )}
    {!error && hint && <p className='mt-1.5 text-xs text-gray-400'>{hint}</p>}
  </div>
);

// ── ListSection ───────────────────────────────────────────────────────────────
// Extracted from the 4 identical copy-paste blocks. All logic is passed in
// as props — nothing changed inside AdvanceInformation's handlers.

interface ListSectionProps {
  title: string;
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
  hasBorderBottom?: boolean;
}

const ListSection = ({
  title,
  fieldName,
  items,
  placeholder,
  errors,
  register,
  onAdd,
  onDelete,
  onChange,
  hasBorderBottom = true,
}: ListSectionProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldErrors = errors[fieldName] as any;

  return (
    <section className={cx("px-4 sm:px-6 py-6", hasBorderBottom && "border-b border-gray-100")}>
      {/* Section header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <h4 className='text-sm font-semibold text-gray-900'>{title}</h4>
          <span className='inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-semibold text-gray-400 bg-gray-100 rounded-full tabular-nums'>
            {items.length}/5
          </span>
        </div>
        <button
          type='button'
          onClick={onAdd}
          disabled={items.length >= 5}
          className={cx(
            "inline-flex items-center gap-1 text-xs font-semibold transition-colors",
            items.length >= 5
              ? "text-gray-300 cursor-not-allowed"
              : "text-orange-500 hover:text-orange-600 cursor-pointer"
          )}
        >
          <Plus className='w-3.5 h-3.5' />
          Add item
        </button>
      </div>

      {/* Item rows */}
      <div className='space-y-2.5'>
        {items.map((item, index) => (
          <div key={index}>
            <div className='flex items-center gap-2.5'>
              {/* Index badge */}
              <span className='shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-400 tabular-nums'>
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Input + counter + delete */}
              <div className='relative flex-1'>
                <input
                  {...register(`${fieldName}.${index}` as Parameters<typeof register>[0])}
                  type='text'
                  placeholder={placeholder}
                  value={item}
                  onChange={e => onChange(index, e.target.value)}
                  maxLength={120}
                  className={cx(
                    "w-full px-3.5 py-2.5 pr-20 text-sm border rounded-xl outline-none transition-all duration-200 placeholder:text-gray-400",
                    fieldErrors?.[index]
                      ? "border-red-300 bg-red-50/40 focus:ring-2 focus:ring-red-100 focus:border-red-400"
                      : "border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  )}
                />
                {/* Character counter */}
                <span className='pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-gray-300'>
                  {item.length}/120
                </span>
                {/* Delete button inline */}
                <button
                  type='button'
                  onClick={() => onDelete(index)}
                  aria-label={`Remove item ${index + 1}`}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors'
                >
                  <Trash className='w-3.5 h-3.5' />
                </button>
              </div>
            </div>

            {/* Per-item error */}
            {fieldErrors?.[index]?.message && (
              <p className='mt-1 ml-8 text-xs text-red-500'>{fieldErrors[index].message}</p>
            )}
          </div>
        ))}

        {/* Array-level error (min/max) */}
        {fieldErrors?.message && <p className='text-xs text-red-500 mt-1'>{fieldErrors.message}</p>}
      </div>
    </section>
  );
};

// ── Upload card ───────────────────────────────────────────────────────────────

const UploadCard = ({
  title,
  description,
  specs,
  uploadError,
  inputId,
  accept,
  buttonLabel,
  previewSlot,
  onChange,
}: {
  title: string;
  description: string;
  specs?: string;
  uploadError?: string;
  inputId: string;
  accept: string;
  buttonLabel: string;
  previewSlot: React.ReactNode;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className='flex flex-col gap-3'>
    <h4 className='text-sm font-semibold text-gray-900'>{title}</h4>

    {/* Preview area — aspect-video makes it fully responsive */}
    <div className='w-full aspect-video rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center'>
      {previewSlot}
    </div>

    {/* Description + upload button */}
    <div className='space-y-2'>
      {uploadError ? (
        <p className='text-xs text-red-500 font-medium'>{uploadError}</p>
      ) : (
        <>
          <p className='text-xs text-gray-500 leading-relaxed'>{description}</p>
          {specs && <p className='text-xs text-gray-400'>{specs}</p>}
        </>
      )}
      <label
        htmlFor={inputId}
        className='inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer'
      >
        <Upload className='w-3.5 h-3.5' />
        {buttonLabel}
      </label>
      <input
        type='file'
        id={inputId}
        onChange={onChange}
        hidden
        accept={accept}
      />
    </div>
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
  } = useForm<CourseDescriptionForm>({ resolver: zodResolver(CourseDescriptionSchema) });

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
        whyThisCourse: whyThisCourse.join("||"),
        whatYouTeach: whatYouTeach.join("||"),
        targetAudience: targetAudience.join("||"),
        requirements: requirements.join("||"),
      }),
      trailerUrl: data.trailerUrl,
    }));
    setCurrentStep(currentStep + 1);
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
    }
    if (field === "whatYouTeach") {
      unregister(`whatYouTeach.${index}`);
      setWhatYouTeach(prev => prev.filter((_, i) => i !== index));
    }
    if (field === "targetAudience") {
      unregister(`targetAudience.${index}`);
      setTargetAudience(prev => prev.filter((_, i) => i !== index));
    }
    if (field === "requirements") {
      unregister(`requirements.${index}`);
      setRequirements(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleArrayInputChange = (field: string, index: number, value: string) => {
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
    setUploadError("");
    setUploadPercentage("");
    if (!user?.id) {
      setUploadError("User not authenticated.");
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
              setUploadError("Failed to upload video. " + error.message);
              setLoading(false);
              setUploadPercentage("");
              reject(error);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
              setUploadError("");
              setUploadPercentage(`${((bytesUploaded / bytesTotal) * 100).toFixed(2)}%`);
              setLoading(false);
            },
            onSuccess: () => {
              setLoading(false);
              setUploadError("");
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
      setUploadError(error instanceof Error ? error.message : "An unknown error occurred.");
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
            setValue("trailerUrl", uploadResult.url);
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
  return (
    <div className='w-full bg-white'>
      <StepHeader headingText='Advance Information' />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* ── Media uploads ── */}
        <div className='px-4 sm:px-6 py-6 border-b border-gray-100'>
          {/* FIX: stacks to single column on mobile, 2 columns on lg+ */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Thumbnail */}
            <UploadCard
              title='Course Thumbnail'
              description='Upload your course thumbnail. A great thumbnail increases enrolment.'
              specs='1280 × 720 px · 16:9 ratio · .jpg, .jpeg or .png'
              uploadError={uploadError}
              inputId='imageUpload'
              accept='.jpg,.jpeg,.png'
              buttonLabel='Upload image'
              onChange={handleFileSelect}
              previewSlot={
                imageUploadLoading ? (
                  <Loader className='w-6 h-6 animate-spin text-gray-400' />
                ) : preview ? (
                  <Image
                    width={640}
                    height={360}
                    src={preview}
                    alt='Thumbnail Preview'
                    className='w-full h-full object-contain'
                  />
                ) : (
                  <div className='flex flex-col items-center gap-2 text-gray-300'>
                    <ImageIcon
                      size={48}
                      strokeWidth={1}
                    />
                    <span className='text-xs'>No thumbnail yet</span>
                  </div>
                )
              }
            />

            {/* Trailer */}
            <UploadCard
              title='Course Trailer'
              description='Students who watch a promo video are 5× more likely to enrol. Make it compelling.'
              inputId='thumbUpload'
              accept='.mp4,.mov,.webm'
              buttonLabel='Upload video'
              onChange={handleFileSelect}
              previewSlot={
                loading ? (
                  <Loader className='w-6 h-6 animate-spin text-gray-400' />
                ) : uploadPercentage ? (
                  <div className='flex flex-col items-center gap-3 px-6 w-full'>
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                      <CloudUpload className='w-4 h-4 animate-pulse text-orange-500' />
                      Uploading {uploadPercentage}
                    </div>
                    <div className='w-full h-1.5 bg-gray-200 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-orange-500 rounded-full transition-all duration-300'
                        style={{ width: uploadPercentage }}
                      />
                    </div>
                  </div>
                ) : videoData ? (
                  <iframe
                    className='w-full h-full'
                    src={`https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?token=${videoData.token}&expires=${videoData.expiresAt}&autoplay=false`}
                    allow='encrypted-media;'
                    allowFullScreen
                  />
                ) : videoPreview ? (
                  <video
                    src={videoPreview}
                    controls
                    className='w-full h-full rounded-xl'
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className='flex flex-col items-center gap-2 text-gray-300'>
                    <Play
                      size={48}
                      strokeWidth={1}
                    />
                    <span className='text-xs'>No trailer yet</span>
                  </div>
                )
              }
            />
          </div>

          {/* Hidden input for trailer URL — unchanged */}
          <input
            type='hidden'
            {...register("trailerUrl")}
            value={courseData.trailerUrl || ""}
          />
        </div>

        {/* ── Objectives & Description ── */}
        <section className='px-4 sm:px-6 py-6 border-b border-gray-100 space-y-4'>
          <h4 className='text-sm font-semibold text-gray-900'>Course Description & Objectives</h4>

          <FloatingTextarea
            {...register("objectives")}
            id='objectives'
            label='Course Objectives'
            defaultValue={courseDescriptionParsed.objectives || ""}
            rows={2}
            maxLength={100}
            hasError={!!errors.objectives}
            error={errors.objectives?.message}
            hint='Summarise what students will achieve. Max 100 characters.'
          />

          <FloatingTextarea
            {...register("description", { required: "Description is required" })}
            id='description'
            label='Course Description'
            defaultValue={courseDescriptionParsed.description || ""}
            rows={4}
            hasError={!!errors.description}
            error={errors.description?.message}
            hint='Give a detailed overview of your course content and outcomes.'
          />
        </section>

        {/* ── Why This Course ── */}
        <ListSection
          title='Why This Course?'
          fieldName='whyThisCourse'
          items={whyThisCourse}
          placeholder='e.g. Hands-on projects with real-world applications'
          errors={errors}
          register={register}
          onAdd={() => addNewItem("whyThisCourse")}
          onDelete={index => deleteItem("whyThisCourse", index)}
          onChange={(i, v) => handleArrayInputChange("whyThisCourse", i, v)}
        />

        {/* ── What You Will Teach ── */}
        <ListSection
          title='What You Will Teach'
          fieldName='whatYouTeach'
          items={whatYouTeach}
          placeholder='e.g. Build a full-stack app with Next.js and Postgres'
          errors={errors}
          register={register}
          onAdd={() => addNewItem("whatYouTeach")}
          onDelete={index => deleteItem("whatYouTeach", index)}
          onChange={(i, v) => handleArrayInputChange("whatYouTeach", i, v)}
        />

        {/* ── Target Audience ── */}
        <ListSection
          title='Target Audience'
          fieldName='targetAudience'
          items={targetAudience}
          placeholder='e.g. Developers who know basic JavaScript'
          errors={errors}
          register={register}
          onAdd={() => addNewItem("targetAudience")}
          onDelete={index => deleteItem("targetAudience", index)}
          onChange={(i, v) => handleArrayInputChange("targetAudience", i, v)}
        />

        {/* ── Requirements ── */}
        <ListSection
          title='Course Requirements'
          fieldName='requirements'
          items={requirements}
          placeholder='e.g. Basic understanding of HTML and CSS'
          errors={errors}
          register={register}
          onAdd={() => addNewItem("requirements")}
          onDelete={index => deleteItem("requirements", index)}
          onChange={(i, v) => handleArrayInputChange("requirements", i, v)}
          hasBorderBottom={false}
        />

        {/* ── Footer ── */}
        <div className='px-4 sm:px-6 py-6 border-t border-gray-100'>
          <CourseFooter
            handlePrevious={handlePrevious}
            isSubmitting={isSubmitting}
            currentStep={currentStep}
          />
        </div>
      </form>
    </div>
  );
}

export default AdvanceInformation;
