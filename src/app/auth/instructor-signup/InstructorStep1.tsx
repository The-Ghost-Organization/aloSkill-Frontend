import { useSessionContext } from "@/app/contexts/SessionContext.tsx";
import { apiClient } from "@/lib/api/client.ts";
import { Loader, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import InstructorRegistrationFooterAction from "./InstructorRegistrationFooterAction.tsx";
import type { FormData } from "./page.tsx";

type Inputs = {
  displayName: string;
  profileImage: string | null;
  DOB: string;
  gender: string;
  nationality: string;
  phoneNumber: string;
  city: string;
  address: string;
};

const InstructorStep1 = ({
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
    setValue,
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

  const { user } = useSessionContext();
  const [imageUploadLoading, setImageUploadLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<string>("");

  useEffect(() => {
    if (user?.name) {
      setValue("displayName", user?.name);
    }
  }, [user, setValue]);

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const isEighteenOrOlder = (selectedValue: string) => {
    if (!selectedValue) return false;
    const dob = new Date(selectedValue);
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return dob.getTime() <= today.getTime();
  };

  const validateImageRatio = (file: File): Promise<{ isValid: boolean; error: string }> => {
    return new Promise(resolve => {
      const img = document.createElement("img");
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const isSquare = width === height;
        const isLargeEnough = width >= 800 && height >= 800;
        if (!isSquare) {
          resolve({ isValid: false, error: "Image must be a perfect square (1:1 ratio)." });
        } else if (!isLargeEnough) {
          resolve({
            isValid: false,
            error: `Image is too small. Minimum size is 800x800px (Current: ${width}x${height}px).`,
          });
        } else {
          resolve({ isValid: true, error: "" });
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ isValid: false, error: "Failed to load image file." });
      };
      img.src = objectUrl;
    });
  };

  const uploadFileToBunny = async (file: File): Promise<{ name: string; url: string }> => {
    setImageUploadLoading(true);
    setUploadError("");
    if (!instructorData?.email) {
      setUploadError("Follow Registration Process and Fill the Email!");
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
        `/course/instructor-file-upload?folder=${instructorData?.email}`,
        formData
      );
      if (!response.success || !response.data) {
        setUploadError(response.message || "Upload failed: try different Image or try again");
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
        const isImage = file.type.startsWith("image/");
        if (isImage) {
          try {
            const uploadResult = await uploadFileToBunny(file);
            if (uploadResult.url) {
              setValue("profileImage", uploadResult.url, {
                shouldDirty: true,
                shouldValidate: true,
              });
              const imagePreview = URL.createObjectURL(file);
              setUploadFile(imagePreview);
            }
          } catch (_error) {
            // silent
          }
          return;
        }
      }
    }
  };

  // ── Shared input style helpers ──────────────────────────────────────────────
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
          <h2 className='text-lg font-extrabold text-gray-900 sm:text-xl'>Personal Information</h2>
          <p className='mt-0.5 text-xs text-gray-400'>
            Tell us a bit about yourself so students can get to know you.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* ── Profile Image — full width on all sizes ── */}
          <div className='col-span-1 sm:col-span-2'>
            <label className='mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Profile Image <span className='text-orange-500'>*</span>
            </label>

            {/* Upload zone — responsive square, max 160px */}
            <div className='w-32 h-32 sm:w-40 sm:h-40'>
              {imageUploadLoading ? (
                /* Loading state */
                <div className='flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-orange-200 bg-orange-50'>
                  <Loader className='h-7 w-7 animate-spin text-orange-400' />
                </div>
              ) : uploadFile ? (
                /* Preview state — tap/click to re-upload on mobile */
                <label
                  htmlFor='imageUpload'
                  className='group relative block h-full w-full cursor-pointer overflow-hidden rounded-xl border-2 border-orange-300'
                >
                  <Image
                    width={160}
                    height={160}
                    src={uploadFile}
                    alt='Profile image preview'
                    className='h-full w-full object-cover'
                  />
                  {/* Overlay — always visible on mobile (no hover dependency), fades on desktop */}
                  <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100'>
                    <Upload className='h-6 w-6 text-white' />
                  </div>
                  <input
                    type='file'
                    id='imageUpload'
                    onChange={handleFileSelect}
                    hidden
                    accept='.jpg,.jpeg,.png'
                  />
                </label>
              ) : (
                /* Empty state */
                <label
                  htmlFor='imageUpload'
                  className='flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-orange-300 hover:bg-orange-50'
                >
                  <div className='flex h-9 w-9 items-center justify-center rounded-full bg-orange-100'>
                    <Upload className='h-4 w-4 text-orange-500' />
                  </div>
                  <span className='text-center text-xs font-semibold text-gray-500 leading-tight'>
                    Tap to upload
                  </span>
                  <span className='text-center text-[10px] text-gray-400 leading-tight px-2'>
                    JPG or PNG · 800×800px min · 1:1 ratio
                  </span>
                  <input
                    type='file'
                    id='imageUpload'
                    onChange={handleFileSelect}
                    hidden
                    accept='.jpg,.jpeg,.png'
                  />
                </label>
              )}
            </div>

            {errors.profileImage && <ErrorMsg msg={errors.profileImage.message as string} />}
            {uploadError && <ErrorMsg msg={uploadError} />}
          </div>

          {/* ── Display Name ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Display Name <span className='text-orange-500'>*</span>
            </label>
            <input
              {...register("displayName", {
                required: "Enter your full name. Do not use pattern or numbers",
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Your name can only contain letters and spaces.",
                },
                minLength: 3,
                maxLength: 40,
              })}
              type='text'
              defaultValue={instructorData.displayName || user?.name}
              placeholder='Your Full Name'
              className={`${inputBase} ${errors.displayName ? inputError : inputNormal}`}
            />
            {errors.displayName && <ErrorMsg msg={errors.displayName.message!} />}
          </div>

          {/* ── Date of Birth ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Date of Birth <span className='text-orange-500'>*</span>
            </label>
            <input
              {...register("DOB", {
                required: "Enter your Date of Birth",
                validate: value => isEighteenOrOlder(value) || "You must be at least 18 years old.",
              })}
              type='date'
              defaultValue={instructorData.DOB}
              max={new Date().toISOString().split("T")[0]}
              className={`${inputBase} ${errors.DOB ? inputError : inputNormal}`}
            />
            {errors.DOB && <ErrorMsg msg={errors.DOB.message!} />}
          </div>

          {/* ── Gender ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Gender <span className='text-orange-500'>*</span>
            </label>
            <select
              {...register("gender", { required: "Select your gender." })}
              defaultValue={instructorData.gender}
              className={`${inputBase} ${errors.gender ? inputError : inputNormal}`}
            >
              <option value=''>Select Gender</option>
              <option value='MALE'>Male</option>
              <option value='FEMALE'>Female</option>
            </select>
            {errors.gender && <ErrorMsg msg={errors.gender.message!} />}
          </div>

          {/* ── Nationality ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Nationality <span className='text-orange-500'>*</span>
            </label>
            <input
              {...register("nationality", {
                required:
                  "Enter your nationality as placeholder example: Bangladeshi, British etc...",
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Nationality can only contain letters and spaces.",
                },
                minLength: 2,
                maxLength: 20,
              })}
              type='text'
              defaultValue={instructorData.nationality}
              placeholder='e.g., Bangladeshi, British'
              className={`${inputBase} ${errors.nationality ? inputError : inputNormal}`}
            />
            {errors.nationality && <ErrorMsg msg={errors.nationality.message!} />}
          </div>

          {/* ── Phone Number ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Phone Number <span className='text-orange-500'>*</span>
            </label>
            <input
              {...register("phoneNumber", {
                required: "Enter your Phone Number. Do not use pattern or text",
                pattern: {
                  value: /^\+?[1-9][0-9]{10,14}$/,
                  message: "Phone must be this format (+8801345678945)",
                },
                minLength: 11,
                maxLength: 14,
              })}
              type='tel'
              inputMode='tel'
              defaultValue={instructorData.phoneNumber}
              placeholder='+880 1X XX XXX XXX'
              className={`${inputBase} ${errors.phoneNumber ? inputError : inputNormal}`}
            />
            {errors.phoneNumber && <ErrorMsg msg={errors.phoneNumber.message!} />}
          </div>

          {/* ── City ── */}
          <div className='min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              City <span className='text-orange-500'>*</span>
            </label>
            <input
              {...register("city", {
                required: "Enter your City",
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "City name can contain letters and spaces only.",
                },
                minLength: 2,
                maxLength: 20,
              })}
              type='text'
              defaultValue={instructorData.city}
              placeholder='e.g., Chattogram, Dhaka'
              className={`${inputBase} ${errors.city ? inputError : inputNormal}`}
            />
            {errors.city && <ErrorMsg msg={errors.city.message!} />}
          </div>

          {/* ── Address — full width on all sizes ── */}
          <div className='col-span-1 min-w-0 sm:col-span-2'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Address <span className='text-orange-500'>*</span>
            </label>
            <textarea
              {...register("address", {
                required: "Enter your Address",
                pattern: {
                  value: /^[A-Za-z0-9#\-,\s\.\/]+$/,
                  message:
                    "Address can only contain letters, numbers, commas, dots, hyphens, underscores, forwardSlash and spaces.",
                },
                minLength: 10,
                maxLength: 255,
              })}
              rows={3}
              defaultValue={instructorData.address}
              placeholder='House #, Road, Area, District'
              className={`${inputBase} resize-none ${errors.address ? inputError : inputNormal}`}
            />
            {errors.address && <ErrorMsg msg={errors.address.message!} />}
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

export default InstructorStep1;
