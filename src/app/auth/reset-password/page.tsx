
"use client";

import { authService } from "@/lib/api/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const search = useSearchParams();
  const router = useRouter();
  const id = search.get("id");
  const token = search.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!id || !token) {
      setApiError("Invalid or missing reset link.");
    }
  }, [id, token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetForm) => {
    setApiError(null);
    try {
      if (!id || !token) throw new Error("Missing reset link data");
      const res = await authService.resetPassword({
        id,
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (res?.success ?? true) {
        setIsSuccess(true);
        setTimeout(() => router.push("/auth/signin"), 1500);
      } else {
        setApiError(res?.message || "Failed to reset password");
      }
    } catch (err: any) {
      // console.error("reset error:", err);
      setApiError(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-white'>
      <div className='w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-lg'>
        <div className='text-center mb-6'>
          <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-700 mx-auto flex items-center justify-center mb-3 shadow-orange-800 shadow-md'>
            <Lock className='w-6 h-6 text-white' />
          </div>
          <h4 className='text-2xl font-bold'>Reset Password</h4>
          <p className='text-sm text-gray-600'>Set a new password for your account.</p>
        </div>

        {apiError && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
            <AlertCircle className='w-5 h-5 text-red-600' />
            <div className='text-sm text-red-800'>{apiError}</div>
          </div>
        )}

        {isSuccess ? (
          <div className='p-4 bg-green-50 border border-green-200 rounded-lg text-sm flex items-start gap-3'>
            <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
              <CheckCircle2 className='w-5 h-5 text-green-600' />
            </div>
            <div>
              <p className='font-semibold text-gray-900'>Password reset successful!</p>
              <p className='text-sm text-gray-600'>Redirecting to sign in...</p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>New Password</label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder='••••••••'
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 outline-none transition ${errors.password ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(v => !v)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'
                >
                  {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
              {errors.password && (
                <p className='mt-1 text-sm text-red-600'>{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Confirm Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder='••••••••'
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 outline-none transition ${errors.confirmPassword ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirm(v => !v)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'
                >
                  {showConfirm ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin mr-2' /> Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        <p className='text-center text-sm text-gray-600 mt-4'>
          <a
            className='text-blue-600 font-semibold'
            href='/auth/signin'
          >
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
