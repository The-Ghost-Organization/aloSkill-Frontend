"use client";

import { apiClient } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type ResendFormData = z.infer<typeof resendSchema>;

export default function ResendVerificationPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
  });

  const onSubmit = async (data: ResendFormData) => {
    setApiError(null);

    try {
      // Call backend to resend verification email
      const response = await apiClient.post("/auth/resend-verification", {
        email: data.email,
      });

      if (response.success) {
        setIsSuccess(true);
      } else {
        setApiError(response.message || "Failed to resend verification email. Please try again.");
      }
    } catch (_error) {
      // console.error("Resend verification error:", error);
      setApiError("An unexpected error occurred. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
        <div className='max-w-md w-full'>
          <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <CheckCircle2 className='w-10 h-10 text-green-600' />
            </div>
            <h4 className='text-2xl font-bold text-gray-900 mb-3'>Email Sent! 📧</h4>
            <p className='text-gray-600 mb-6 text-sm'>
              We have sent a new verification link to your email address. Please check your inbox
              and spam folder.
            </p>

            <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6'>
              <p className='text-sm text-blue-800'>
                The verification link will expire in 24 hours.
              </p>
            </div>
            {/* <AuthButton
              onClick={() => router.push("/auth/signin")}
              className='mt-4 w-full shadow-lg'
            >
              Back to Sign In
            </AuthButton> */}
            <button
              onClick={() => router.push("/auth/signin")}
              className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg'
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Mail className='w-8 h-8 text-blue-600' />
            </div>
            <h4 className='text-3xl font-bold text-gray-900 mb-2'>Resend Verification</h4>
            <p className='text-gray-600 text-sm'>
              Enter your email to receive a new verification link
            </p>
          </div>

          {/* Error Alert */}
          {apiError && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 text-red-600 shrink-0 mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm text-red-800 font-medium'>{apiError}</p>
              </div>
              <button
                onClick={() => setApiError(null)}
                className='text-red-400 hover:text-red-600 text-lg leading-none'
              >
                ×
              </button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-5'
          >
            {/* Email Input */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-semibold text-gray-700 mb-2'
              >
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
                <input
                  id='email'
                  type='email'
                  {...register("email")}
                  placeholder='you@example.com'
                  className={`w-full pl-10 pr-4 py-3 bg-white/50 border-2 rounded-xl outline-none transition-all ${
                    errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  }`}
                />
              </div>
              {errors.email && (
                <p className='mt-1.5 text-sm text-red-600 font-medium'>{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            {/* <AuthButton
              type='submit'
              disabled={isSubmitting}
              className='mt-4 w-full  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Sending...
                </span>
              ) : (
                "Send Verification Email"
              )}
            </AuthButton> */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Sending...
                </span>
              ) : (
                "Send Verification Email"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className='mt-6 text-center space-y-2'>
            <p className='text-sm text-gray-600'>
              Remember your credentials?{" "}
              <button
                onClick={() => router.push("/auth/signin")}
                className='text-blue-600 hover:text-blue-700 font-semibold'
              >
                Sign In
              </button>
            </p>
            <p className='text-sm text-gray-600'>
              Dont have an account?{" "}
              <button
                onClick={() => router.push("/auth/signup")}
                className='text-blue-600 hover:text-blue-700 font-semibold'
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
