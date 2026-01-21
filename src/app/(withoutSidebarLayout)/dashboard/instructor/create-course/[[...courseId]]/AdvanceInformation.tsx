import { zodResolver } from "@hookform/resolvers/zod";
import { CloudUpload, ImageIcon, Loader, Play, Plus, Trash, Upload } from "lucide-react";
// import { useSession } from "next-auth/react";
import { getFileIdFromUrl } from "@/lib/course/utils.tsx";
import Image from "next/image";
import { type ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as tus from "tus-js-client";
import z from "zod";
import { apiClient } from "../../../../../../lib/api/client.ts";
import { useSessionContext } from "../../../../../contexts/SessionContext.tsx";
import CourseFooter from "./CourseFooter.tsx";
import { type CreateCourseData } from "./page.tsx";
import StepHeader from "./StepHeader.tsx";

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
    )
    .min(1, "You must define at least one requirement.")
    .max(5, "You can define a maximum of 5 requirements."),
});

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
  // const { data: sessionData } = useSession();
  const { user } = useSessionContext();
  const {
    register,
    unregister,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CourseDescriptionForm>({ resolver: zodResolver(CourseDescriptionSchema) });

  useEffect(() => {
    if (!courseData.trailerUrl) {
      return;
    }
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
        if (!getVideoFromBunny.success) {
          return;
        }
        if (getVideoFromBunny.data) {
          setVideoData(getVideoFromBunny.data);
        }
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
      const updatedArray = [...whyThisCourse];
      updatedArray[index] = value;
      setWhyThisCourse(updatedArray);
    }
    if (field === "whatYouTeach") {
      const updatedArray = [...whatYouTeach];
      updatedArray[index] = value;
      setWhatYouTeach(updatedArray);
    }
    if (field === "targetAudience") {
      const updatedArray = [...targetAudience];
      updatedArray[index] = value;
      setTargetAudience(updatedArray);
    }
    if (field === "requirements") {
      const updatedArray = [...requirements];
      updatedArray[index] = value;
      setRequirements(updatedArray);
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

      if (!backendResponse.success || !backendResponse.data) {
        return { name: "", url: "" };
      }

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
            metadata: {
              filetype: file.type,
              title: file.name,
              collection: collectionId,
            },
            onError: function (error: Error) {
              setUploadError("Failed to upload video. " + error.message);
              setLoading(false);
              setUploadPercentage("");
              reject(error);
            },
            onProgress: function (bytesUploaded, bytesTotal) {
              setUploadError("");
              const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
              setUploadPercentage(`${percentage}%`);
              setLoading(false);
            },
            onSuccess: () => {
              setLoading(false);
              setUploadError("");
              setUploadPercentage("");
              const videoUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
              resolve({ name: file.name, url: videoUrl });
            },
          });

          upload.findPreviousUploads().then((previousUploads: tus.PreviousUpload[]) => {
            if (previousUploads.length > 0) {
              const previousUpload = previousUploads[0];
              if (previousUpload) {
                upload.resumeFromPreviousUpload(previousUpload);
              }
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
        if (img.naturalWidth < 1280) {
          resolve({ isValid: false, error: "Image is too small. Minimum width is 1280px." });
        } else if (!is16by9) {
          resolve({ isValid: false, error: "Image must have a 16:9 aspect ratio." });
        } else {
          resolve({ isValid: true, error: "" });
        }
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

      return {
        name: file.name,
        url: response.data,
      };
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
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (isVideo) {
          try {
            const uploadResult = await uploadVideoToBunny(file);
            if (uploadResult.url) {
              const objectUrl = URL.createObjectURL(file);
              setVideoPreview(objectUrl);
            }
            setValue("trailerUrl", uploadResult.url);
          } catch (_error) {
            // console.error("Error uploading video:", error);
          }
          return;
        }

        if (isImage) {
          try {
            const uploadResult = await uploadFileToBunny(file);
            if (uploadResult.url) {
              const objectUrl = URL.createObjectURL(file);
              setPreview(objectUrl);
            }
            setCourseData(prev => ({
              ...prev,
              thumbnailUrl: uploadResult.url,
            }));
          } catch (_error) {
            // console.error("Error uploading file:", error);
          }
          return;
        }
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };
  return (
    <div className='w-full bg-white'>
      {/* Header */}
      <StepHeader headingText='Advance Information' />
      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {/* Course Thumbnail and Trailer */}
          <div className='p-6 flex items-center gap-4 w-full h-[220px] border-b border-gray-200'>
            {/* Course Thumbnail */}
            <div className='w-full flex flex-col gap-3 h-full'>
              <h4 className='font-semibold text-gray-900'>Course Thumbnail</h4>
              <div className='flex items-center gap-2 h-full'>
                <div className='w-[55%] h-full p-2 rounded bg-gray-100 flex items-center justify-center'>
                  {imageUploadLoading ? (
                    <Loader className='w-4 h-4 animate-spin mx-auto my-auto' />
                  ) : (
                    <>
                      {preview ? (
                        <Image
                          width={200}
                          height={150}
                          src={preview}
                          alt='Thumbnail Preview'
                          className='w-full h-full object-contain overflow-hidden rounded'
                        />
                      ) : (
                        <ImageIcon
                          size={90}
                          strokeWidth={1}
                          className='text-gray-500'
                        />
                      )}
                    </>
                  )}
                </div>
                <div className='flex-1 h-full flex flex-col items-start justify-between'>
                  <p className='text-sm text-gray-600'>
                    Upload your course Thumbnail here.
                    <span className='font-semibold'>Important</span>
                  </p>
                  {uploadError ? (
                    <p className='text-sm text-red-600'>{uploadError}</p>
                  ) : (
                    <p className='text-sm text-gray-600'>
                      <span className='font-semibold'>guidelines:</span> 1280 x 720 pixels or 16:9
                      Ratio. Supported format:{" "}
                      <span className='font-semibold'>.jpg, .jpeg, or .png</span>
                    </p>
                  )}
                  <label
                    htmlFor='imageUpload'
                    className='flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange rounded font-medium hover:bg-orange-100 transition-colors cursor-pointer'
                  >
                    <Upload size={16} />
                    Upload Image
                  </label>
                  <input
                    type='file'
                    id='imageUpload'
                    onChange={e => handleFileSelect(e)}
                    hidden
                    accept='.jpg,.jpeg,.png'
                  />
                </div>
              </div>
            </div>

            {/* Course Trailer */}
            <div className='w-full flex flex-col gap-3 h-full'>
              <h4 className='font-semibold text-gray-900'>Course Trailer</h4>
              <div className='flex items-center gap-2 h-full'>
                <div className='w-[50%] h-full p-2 rounded bg-gray-100 flex items-center justify-center'>
                  {loading ? (
                    <Loader className='w-4 h-4 animate-spin mx-auto my-auto' />
                  ) : (
                    <>
                      {uploadPercentage ? (
                        <span className='flex items-center gap-2 text-sm'>
                          <CloudUpload className='animate-pulse mr-2 w-4 h-4' /> {uploadPercentage}
                        </span>
                      ) : (
                        <>
                          {videoData ? (
                            <>
                              <iframe
                                className='w-full h-full'
                                src={`https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?token=${videoData.token}&expires=${videoData.expiresAt}`}
                                allow='encrypted-media; autoplay'
                                allowFullScreen
                              />
                            </>
                          ) : (
                            <>
                              {videoPreview ? (
                                <>
                                  <video
                                    src={videoPreview}
                                    controls
                                    className='w-full h-full rounded'
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </>
                              ) : (
                                <Play
                                  size={90}
                                  strokeWidth={1}
                                  className='text-gray-500'
                                />
                              )}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className='flex-1'>
                  <p className='text-sm text-gray-600 mb-3'>
                    Students who watch a well-made promo video are 5X more likely to enroll in your
                    course. We&apos;ve seen that statistic go up to 10X for exceptionally awesome
                    videos.
                  </p>
                  <label
                    htmlFor='thumbUpload'
                    className='flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange rounded font-medium hover:bg-orange-100 transition-colors cursor-pointer w-fit'
                  >
                    <Upload size={16} />
                    Upload video
                  </label>
                  <input
                    type='file'
                    onChange={e => handleFileSelect(e)}
                    id='thumbUpload'
                    hidden
                    accept='.mp4,.mov,.webm'
                  />

                  {/* This input is only for holding trailer video url */}
                  <input
                    type='hidden'
                    {...register("trailerUrl")}
                    value={courseData.trailerUrl || ""}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Course Descriptions */}
          <div className='p-6 border-b border-gray-200'>
            <h4 className='font-semibold text-gray-900 mb-4'>Course Descriptions & Objectives</h4>
            {/* Objectives */}
            <div className=''>
              <label className='block text-xs font-medium text-gray-700 mb-2'>
                Course Objectives
              </label>
              <textarea
                {...register("objectives")}
                defaultValue={courseDescriptionParsed.objectives || ""}
                placeholder='Enter you course Objectives: This Course help you to skillUp in the Javascript language'
                rows={2}
                maxLength={100}
                className={`w-full px-4 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm resize-none ${errors.objectives ? "border-red-200 bg-red-50" : "border-gray-200"}`}
              />
              {errors.objectives && (
                <span className='text-xs! text-red-500 mt-1'>{errors.objectives.message}</span>
              )}
            </div>
            {/* Description */}
            <div className=''>
              <label className='block text-xs font-medium text-gray-700 mb-2'>Description</label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                defaultValue={courseDescriptionParsed.description || ""}
                placeholder='Enter you course descriptions'
                rows={4}
                className={`w-full px-4 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm resize-none ${errors.description ? "border-red-200 bg-red-50" : "border-gray-200"}`}
              />
              {errors.description && (
                <span className='text-xs! text-red-500 mt-1'>{errors.description.message}</span>
              )}
            </div>
          </div>

          {/* Why This Course? */}
          <div className='p-6 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='font-semibold text-gray-900'>
                Why This Course? ({whyThisCourse.length}/5)
              </h4>
              <button
                type='button'
                onClick={() => addNewItem("whyThisCourse")}
                className='flex items-center gap-1 text-orange-500 font-medium text-sm hover:text-orange transition-colors cursor-pointer'
              >
                <Plus size={16} />
                Add new
              </button>
            </div>
            <div className='space-y-4'>
              {whyThisCourse?.map((item, index) => (
                <div key={index}>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='block text-xs text-gray-600'>0{index + 1}</label>
                    <span
                      onClick={() => deleteItem("whyThisCourse", index)}
                      className='p-2 rounded-full hover:bg-gray-50 cursor-pointer'
                    >
                      <Trash className='w-4 h-4' />
                    </span>
                  </div>
                  <div className='relative'>
                    <input
                      {...register(`whyThisCourse.${index}`)}
                      type='text'
                      placeholder='Why This Course...'
                      value={item}
                      onChange={e => handleArrayInputChange("whyThisCourse", index, e.target.value)}
                      maxLength={120}
                      className={`w-full px-4 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm resize-none ${errors.whatYouTeach?.[index] ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors.whyThisCourse?.[index] && (
                      <p className='text-sm text-red-600'>{errors.whyThisCourse[index].message}</p>
                    )}
                    <span
                      className={`absolute right-4 ${errors.whyThisCourse?.[index] ? "top-[15%] bg-red-50" : "top-1/2 -translate-y-1/2 bg-white"} text-xs text-gray-400 pl-2`}
                    >
                      {item.length}/120
                    </span>
                  </div>
                </div>
              ))}
              {errors.whyThisCourse?.message && (
                <p className='text-sm text-red-600'>{errors.whyThisCourse.message}</p>
              )}
            </div>
          </div>

          {/* What you will teach */}
          <div className='p-6 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='font-semibold text-gray-900'>
                What you will teach in this course ({whatYouTeach.length}/5)
              </h4>
              <button
                type='button'
                onClick={() => addNewItem("whatYouTeach")}
                className='flex items-center gap-1 text-orange-500 font-medium text-sm hover:text-orange transition-colors cursor-pointer'
              >
                <Plus size={16} />
                Add new
              </button>
            </div>
            <div className='space-y-4'>
              {whatYouTeach?.map((item, index) => (
                <div key={index}>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='block text-xs text-gray-600'>0{index + 1}</label>
                    <span
                      onClick={() => deleteItem("whatYouTeach", index)}
                      className='p-2 rounded-full hover:bg-gray-50 cursor-pointer'
                    >
                      <Trash className='w-4 h-4' />
                    </span>
                  </div>
                  <div className='relative'>
                    <input
                      {...register(`whatYouTeach.${index}`)}
                      type='text'
                      placeholder='What you will teach in this course...'
                      value={item}
                      onChange={e => handleArrayInputChange("whatYouTeach", index, e.target.value)}
                      maxLength={120}
                      className={`w-full px-4 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm resize-none ${errors.whatYouTeach?.[index] ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors.whatYouTeach?.[index] && (
                      <p className='text-sm text-red-600'>{errors.whatYouTeach[index].message}</p>
                    )}
                    <span
                      className={`absolute right-4 ${errors.whatYouTeach?.[index] ? "top-[15%] bg-red-50" : "top-1/2 -translate-y-1/2 bg-white"} text-xs text-gray-400 pl-2`}
                    >
                      {item.length}/120
                    </span>
                  </div>
                </div>
              ))}
              {errors.whatYouTeach?.message && (
                <p className='text-sm text-red-600'>{errors.whatYouTeach.message}</p>
              )}
            </div>
          </div>

          {/* Target Audience */}
          <div className='p-6 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='font-semibold text-gray-900'>
                Target Audience ({targetAudience.length}/5)
              </h4>
              <button
                type='button'
                onClick={() => addNewItem("targetAudience")}
                className='flex items-center gap-1 text-orange-500 font-medium text-sm hover:text-orange transition-colors cursor-pointer'
              >
                <Plus size={16} />
                Add new
              </button>
            </div>
            <div className='space-y-4'>
              {targetAudience?.map((item, index) => (
                <div key={index}>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='block text-xs text-gray-600'>0{index + 1}</label>
                    <span
                      onClick={() => deleteItem("targetAudience", index)}
                      className='p-2 rounded-full hover:bg-gray-50 cursor-pointer'
                    >
                      <Trash className='w-4 h-4' />
                    </span>
                  </div>
                  <div className='relative'>
                    <input
                      {...register(`targetAudience.${index}`)}
                      type='text'
                      placeholder='Who this course is for...'
                      value={item}
                      onChange={e =>
                        handleArrayInputChange("targetAudience", index, e.target.value)
                      }
                      maxLength={120}
                      className={`w-full px-4 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm resize-none ${errors.targetAudience?.[index] ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors.targetAudience?.[index] && (
                      <p className='text-sm text-red-600'>{errors.targetAudience[index].message}</p>
                    )}
                    <span
                      className={`absolute right-4 ${errors.targetAudience?.[index] ? "top-[15%] bg-red-50" : "top-1/2 -translate-y-1/2 bg-white"} text-xs text-gray-400 pl-2`}
                    >
                      {item.length}/120
                    </span>
                  </div>
                </div>
              ))}
              {errors.targetAudience?.message && (
                <p className='text-sm text-red-600'>{errors.targetAudience.message}</p>
              )}
            </div>
          </div>

          {/* Course requirements */}
          <div className='p-6 pb-0'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='font-semibold text-gray-900'>
                Course requirements ({requirements.length}/5)
              </h4>
              <button
                type='button'
                onClick={() => addNewItem("requirements")}
                className='flex items-center gap-1 text-orange-500 font-medium text-sm hover:text-orange transition-colors cursor-pointer'
              >
                <Plus size={16} />
                Add new
              </button>
            </div>
            <div className='space-y-4'>
              {requirements?.map((item, index) => (
                <div key={index}>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='block text-xs text-gray-600'>0{index + 1}</label>
                    <span
                      onClick={() => deleteItem("requirements", index)}
                      className='p-2 rounded-full hover:bg-gray-50 cursor-pointer'
                    >
                      <Trash className='w-4 h-4' />
                    </span>
                  </div>
                  <div className='relative'>
                    <input
                      {...register(`requirements.${index}`)}
                      type='text'
                      placeholder='What is you course requirements...'
                      value={item}
                      onChange={e => handleArrayInputChange("requirements", index, e.target.value)}
                      maxLength={120}
                      className={`w-full px-4 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-light focus:border-transparent placeholder:text-sm resize-none ${errors.requirements?.[index] ? "border-red-200 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors.requirements?.[index] && (
                      <p className='text-sm text-red-600'>{errors.requirements[index].message}</p>
                    )}
                    <span
                      className={`absolute right-4 ${errors.requirements?.[index] ? "top-[15%] bg-red-50" : "top-1/2 -translate-y-1/2 bg-white"} text-xs text-gray-400 pl-2`}
                    >
                      {item.length}/120
                    </span>
                  </div>
                </div>
              ))}
              {errors.requirements?.message && (
                <p className='text-sm text-red-600'>{errors.requirements.message}</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className='p-6'>
            <CourseFooter
              handlePrevious={handlePrevious}
              isSubmitting={isSubmitting}
              currentStep={currentStep}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdvanceInformation;
