"use client";

import { CheckCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerificationSentPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
          {/* Icon */}
          <div className='w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2'>
            <Mail className='w-8 h-8 text-blue-600' />
          </div>

          {/* Title */}
          <h5 className='text-3xl font-bold text-gray-900 mb-2'>Check Your Email! 📧</h5>

          <p className='text-gray-600 mb-4 text-sm'>
            We have sent a verification link to your email address. Please check your inbox and
            click the link to verify your account.
          </p>

          {/* Instructions */}
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left'>
            <h5 className='font-semibold text-blue-900 mb-3 flex items-center gap-2'>
              <CheckCircle className='w-5 h-5' />
              Next Steps:
            </h5>
            <ol className='text-sm text-blue-800 space-y-2 list-decimal list-inside'>
              <li>Open your email inbox</li>
              <li>Find the email from Aloskill</li>
              <li>Click the verification link</li>
              <li>Sign in to your account</li>
            </ol>
          </div>

          {/* Tips */}
          <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left'>
            <p className='text-sm text-yellow-800'>
              <strong>💡 Tip:</strong> Cant find the email? Check your spam or junk folder. The
              email may take a few minutes to arrive.
            </p>
          </div>

          {/* Actions */}
          <div className='space-y-3'>
            <button
              onClick={() => router.push("/auth/resend-verification")}
              className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg'
            >
              Resend Verification Email
            </button>

            <button
              onClick={() => router.push("/auth/signin")}
              className='w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all'
            >
              Back to Sign In
            </button>
          </div>

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
