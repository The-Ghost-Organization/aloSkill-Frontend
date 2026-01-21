import { apiClient } from "@/lib/api/client.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
// import { useSession } from "next-auth/react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import InstructorRegistrationFooterAction from "./InstructorRegistrationFooterAction.tsx";
import type { FormData } from "./page.tsx";
import { useSessionContext } from '../../contexts/SessionContext.tsx';

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
  // const { data } = useSession();
  const { user } = useSessionContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isLoggedIn = !!user?.email;

  const InstructorRegisterSchema = z
    .object({
      email: z.string().email({ message: "Invalid email format." }),
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
    formState: { errors, isSubmitting },
  } = useForm<registerForm>({ resolver: zodResolver(InstructorRegisterSchema) });

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

  return (
    <div className='space-y-4'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-4'
      >
        <h2 className='mb-4'>Login Information</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {/* Email */}
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Email *</span>
            </label>
            <input
              {...register("email")}
              disabled={user?.email ? true : false}
              type='text'
              defaultValue={instructorData.email}
              placeholder='Enter Your Email'
              className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.email ? "border-red-200 bg-red-50" : "border-gray-200"}`}
            />
            {errors.email && (
              <span className='text-xs text-red-500 mt-1'>{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Password{!isLoggedIn ? " *" : ""}</span>
            </label>
            <div className='relative'>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                disabled={user?.email ? true : false}
                placeholder='••••••••'
                className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.password ? "border-red-200 bg-red-50" : "border-gray-200"}`}
              />
              <button
                type='button'
                onClick={() => setShowPassword(value => !value)}
                className='absolute top-1/2 -translate-1/2 right-0 text-gray-400'
              >
                {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {errors.password && (
              <span className='text-xs text-red-500 mt-1'>{errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              <span className=''>Confirm Password{!isLoggedIn ? " *" : ""}</span>
            </label>
            <div className='relative'>
              <input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                disabled={user?.email ? true : false}
                placeholder='••••••••'
                className={`w-full text-sm px-3 py-2 rounded border focus:ring-1 focus:ring-orange focus:border-transparent focus:outline-none transition placeholder:text-sm resize-none ${errors.confirmPassword ? "border-red-200 bg-red-50" : "border-gray-200"}`}
              />
              <button
                type='button'
                onClick={() => setShowConfirm(value => !value)}
                className='absolute top-1/2 -translate-1/2 right-0 text-gray-400'
              >
                {showConfirm ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className='text-xs text-red-500 mt-1'>{errors.confirmPassword.message}</span>
            )}
          </div>
        </div>
        {/* Footer Actions */}
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
