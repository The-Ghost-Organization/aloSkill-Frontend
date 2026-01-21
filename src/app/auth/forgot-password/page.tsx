
"use client";

import { authService } from "@/lib/api/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
// import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email").toLowerCase(),
});
type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  //   const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotForm) => {
    setApiError(null);
    try {
      const res = await authService.forgotPassword({ email: data.email });
      // Standard approach: backend returns silent message (not revealing existence)
      if (res?.success ?? true) {
        setIsSent(true);
      } else {
        setApiError(res?.message || "Failed to send password reset email.");
      }
    } catch (err: any) {
      // console.error("forgot password error:", err);
      setApiError(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-white'>
      <div className='w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-lg'>
        <div className='text-center mb-6'>
          <div className='w-14 h-14 rounded-xl bg-linear-to-br from-orange-400 to-orange-700 mx-auto flex items-center justify-center mb-3 shadow-orange-800 shadow-md'>
            <Mail className='w-6 h-6 text-white' />
          </div>
          <h4 className=' font-bold'>Forgot Password</h4>
          <p className='text-sm text-gray-600'>Enter your email and we will send a reset link.</p>
        </div>

        {apiError && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
            <AlertCircle className='w-5 h-5 text-red-600' />
            <div className='text-sm text-red-800'>{apiError}</div>
          </div>
        )}

        {isSent ? (
          <div className='p-4 bg-green-50 border border-green-200 rounded-lg text-sm flex items-start gap-3'>
            <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
              <CheckCircle2 className='w-5 h-5 text-green-600' />
            </div>
            <div>
              <p className='font-semibold text-gray-900'>
                If an account exists, we sent a reset link.
              </p>
              <p className='text-sm text-gray-600'>
                Check your inbox (or spam). The link will expire in 1 hour.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='email'
                  {...register("email")}
                  placeholder='you@example.com'
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none transition ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  } bg-white/60`}
                />
              </div>
              {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email.message}</p>}
            </div>

            {/* <AuthButton
              type='submit'
              disabled={isSubmitting}
              className='mt-4 w-full  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin mr-2' /> Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </AuthButton> */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin mr-2' /> Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        <p className='text-center text-sm text-gray-600 mt-4'>
          Remembered password?{" "}
          <a
            className='text-blue-600 font-semibold'
            href='/auth/signin'
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
