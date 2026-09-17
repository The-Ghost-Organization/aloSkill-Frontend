import { apiClient } from "@/lib/api/client.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { useSessionContext } from "../../contexts/SessionContext.tsx";
import InstructorRegistrationFooterAction from "./InstructorRegistrationFooterAction.tsx";
import type { FormData } from "./page.tsx";

type registerForm = {
  email: string;
  password: string | undefined;
  confirmPassword: string | undefined;
};

const InstructorStep0 = ({
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
  const { user } = useSessionContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isLoggedIn = !!user?.email;

  // ── Schema — unchanged ──────────────────────────────────────────────────────
  const InstructorRegisterSchema = z
    .object({
      email: z.email({ message: "Invalid email format." }),
      password: isLoggedIn
        ? z.string().optional()
        : z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[a-z]/, "Must contain at least one lowercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
      confirmPassword: isLoggedIn
        ? z.string().optional()
        : z.string().min(1, "Confirm your password"),
    })
    .refine(
      async data => {
        if (!data.email) return true;
        try {
          const response = await apiClient.get(`/user/${data.email}`);
          if (!response?.success) return false;
          const userData = response?.data as { result: { canProceed: boolean } };
          return userData?.result?.canProceed;
        } catch (_error) {
          return true;
        }
      },
      {
        message: "This email is already registered.Please enter a new Email",
        path: ["email"],
      }
    )
    .refine(data => isLoggedIn || (data.password && data.password === data.confirmPassword), {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<registerForm>({ resolver: zodResolver(InstructorRegisterSchema) });

  useEffect(() => {
    setValue("email", instructorData.email);
  }, [instructorData?.email, setValue]);

  // ── Handlers — unchanged ────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<registerForm> = async data => {
    setInstructorData({
      ...instructorData,
      email: data.email,
      password: isLoggedIn ? instructorData.password : data.password,
    });

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCancel = () => {
    confirm("Are you sure you want to cancel? Unsaved changes will be lost.");
  };

  // ── Shared input class helpers ──────────────────────────────────────────────
  const inputBase =
    "w-full min-w-0 text-sm px-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 focus:outline-none transition-all placeholder:text-gray-400 placeholder:text-sm bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed";

  const inputError = "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400";
  const inputNormal = "border-gray-200";

  return (
    <div className='space-y-5'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-5'
      >
        {/* ── Section header ── */}
        <div className='mb-1'>
          <h2 className='text-lg font-extrabold text-gray-900 sm:text-xl'>Login Information</h2>
          <p className='mt-0.5 text-xs text-gray-400'>
            {isLoggedIn
              ? "You're already signed in — your email is pre-filled."
              : "Create your instructor account credentials."}
          </p>
        </div>

        {/* ── Fields ── */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* Email — full width on all sizes */}
          <div className='col-span-1 sm:col-span-2'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Email <span className='text-orange-500'>*</span>
            </label>
            <input
              {...register("email")}
              disabled={!!user?.email}
              type='text'
              defaultValue={instructorData.email}
              placeholder='you@example.com'
              className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
            />
            {errors.email && (
              <p className='mt-1.5 flex items-center gap-1 text-xs text-red-500'>
                <span className='inline-block h-1 w-1 shrink-0 rounded-full bg-red-400' />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className='col-span-1 min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Password{!isLoggedIn && <span className='text-orange-500'> *</span>}
            </label>
            <div className='relative'>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                disabled={!!user?.email}
                placeholder='••••••••'
                className={`${inputBase} pr-10 ${errors.password ? inputError : inputNormal}`}
              />
              <button
                type='button'
                onClick={() => setShowPassword(v => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600'
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
            {errors.password && (
              <p className='mt-1.5 flex items-center gap-1 text-xs text-red-500'>
                <span className='inline-block h-1 w-1 shrink-0 rounded-full bg-red-400' />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className='col-span-1 min-w-0'>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
              Confirm Password{!isLoggedIn && <span className='text-orange-500'> *</span>}
            </label>
            <div className='relative'>
              <input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                disabled={!!user?.email}
                placeholder='••••••••'
                className={`${inputBase} pr-10 ${errors.confirmPassword ? inputError : inputNormal}`}
              />
              <button
                type='button'
                onClick={() => setShowConfirm(v => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600'
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className='mt-1.5 flex items-center gap-1 text-xs text-red-500'>
                <span className='inline-block h-1 w-1 shrink-0 rounded-full bg-red-400' />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* ── Password hint (only shown when not logged in) ── */}
        {!isLoggedIn && (
          <div className='rounded-lg border border-orange-100 bg-orange-50 px-3.5 py-3'>
            <p className='text-xs font-semibold text-orange-700'>Password requirements:</p>
            <ul className='mt-1.5 space-y-0.5 text-xs text-orange-600'>
              <li className='flex items-center gap-1.5'>
                <span className='h-1 w-1 shrink-0 rounded-full bg-orange-400' />
                At least 8 characters
              </li>
              <li className='flex items-center gap-1.5'>
                <span className='h-1 w-1 shrink-0 rounded-full bg-orange-400' />
                One uppercase &amp; one lowercase letter
              </li>
              <li className='flex items-center gap-1.5'>
                <span className='h-1 w-1 shrink-0 rounded-full bg-orange-400' />
                At least one number
              </li>
            </ul>
          </div>
        )}

        {/* ── Footer actions — unchanged component ── */}
        <InstructorRegistrationFooterAction
          handleCancel={handleCancel}
          isSubmitting={isSubmitting}
          currentStep={currentStep}
        />
      </form>
    </div>
  );
};

export default InstructorStep0;
