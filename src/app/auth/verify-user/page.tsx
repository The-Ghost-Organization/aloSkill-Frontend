"use client";

import BorderGradientButton from "@/components/buttons/BorderGradientButton.tsx";
import { apiClient } from "@/lib/api/client";
import { AlertCircle, CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type VerificationStatus = "loading" | "success" | "error" | "invalid";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  // Get id and token from URL query params
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    const verifyEmail = async () => {
      if (!id || !token) {
        setStatus("invalid");
        setMessage("Invalid verification link. Please check your email and try again.");
        return;
      }

      try {
        const response = await apiClient.post("/auth/verify-user", {
          id,
          token,
        });

        if (response.success) {
          setStatus("success");
          setMessage(response.message || "Your email has been verified successfully!");

          timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                router.push("/auth/signin");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setStatus("error");
          setMessage(
            response.message || "Verification failed. The link may have expired or is invalid."
          );
        }
      } catch (_error) {
        // console.error("Verification error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again or contact support.");
      }
    };

    verifyEmail();

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [id, token, router]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
          {/* Loading State */}
          {status === "loading" && (
            <>
              <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse'>
                <Loader2 className='w-10 h-10 text-blue-600 animate-spin' />
              </div>
              <h4 className='text-2xl font-bold text-gray-900 mb-3'>Verifying Your Email</h4>
              <p className='text-gray-600'>Please wait while we verify your email address...</p>
            </>
          )}

          {/* Success State */}
          {status === "success" && (
            <>
              <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce'>
                <CheckCircle2 className='w-10 h-10 text-green-600' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900 mb-3'>Email Verified! 🎉</h1>
              <p className='text-gray-600 mb-6'>{message}</p>

              <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6'>
                <p className='text-sm text-blue-800'>
                  Redirecting to sign in page in{" "}
                  <span className='font-bold text-blue-600'>{countdown}</span> seconds...
                </p>
              </div>

              <BorderGradientButton
                onClick={() => router.push("/auth/signin")}
                className='mt-4 w-full  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
              >
                Sign In Now
              </BorderGradientButton>
              {/* <button
                onClick={() => router.push("/auth/signin")}
                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg'
              >
                Sign In Now
              </button> */}
            </>
          )}

          {/* Error State */}
          {status === "error" && (
            <>
              <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <XCircle className='w-10 h-10 text-red-600' />
              </div>
              <h4 className='text-2xl font-bold text-gray-900 mb-3'>Verification Failed</h4>
              <p className='text-gray-600 mb-6'>{message}</p>

              <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5' />
                  <div className='text-left'>
                    <p className='text-sm font-semibold text-yellow-900 mb-1'>Possible reasons:</p>
                    <ul className='text-sm text-yellow-800 list-disc list-inside space-y-1'>
                      <li>Link has expired (valid for 24 hours)</li>
                      <li>Email already verified</li>
                      <li>Invalid verification token</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <BorderGradientButton
                  onClick={() => router.push("/auth/resend-verification")}
                  className='mt-4 w-full  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
                >
                  Resend Verification Email
                </BorderGradientButton>
                {/* <button
                  onClick={() => router.push("/auth/resend-verification")}
                  className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg'
                >
                  Resend Verification Email
                </button> */}

                <button
                  onClick={() => router.push("/auth/signin")}
                  className='w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all'
                >
                  Back to Sign In
                </button>
              </div>
            </>
          )}

          {/* Invalid Link State */}
          {status === "invalid" && (
            <>
              <div className='w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Mail className='w-10 h-10 text-orange-600' />
              </div>
              <h1 className='text-2xl font-bold text-gray-900 mb-3'>Invalid Link</h1>
              <p className='text-gray-600 mb-6'>{message}</p>

              <button
                onClick={() => router.push("/auth/signin")}
                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg'
              >
                Go to Sign In
              </button>
            </>
          )}

          {/* Footer */}
          <p className='mt-6 text-sm text-gray-500'>
            Need help?{" "}
            <a
              href='/support'
              className='text-blue-600 hover:text-blue-700 font-semibold'
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
