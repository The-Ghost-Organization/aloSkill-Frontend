"use client";

import { type ErrorPageProps } from "@/types/error.types.ts";
import { useEffect, useState } from "react";
import { COLOR_SCHEMES, ERROR_TYPES, getErrorTypeFromStatus, logError } from "./errorUtils";

export default function ErrorPage({
  statusCode = 500,
  errorType = "default",
  title,
  message,
  onRetry,
  showRetry = true,
  showHome = true,
  showSupport = true,
  trackError = true,
  metadata = {},
}: ErrorPageProps) {
  const [mounted, setMounted] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const currentErrorType = getErrorTypeFromStatus(statusCode, errorType);
  const errorConfig = ERROR_TYPES[currentErrorType];
  const colorScheme = COLOR_SCHEMES[errorConfig.color];

  const finalTitle = title ?? errorConfig.title;
  const finalMessage = message ?? errorConfig.message;

  useEffect(() => {
    setMounted(true);

    if (trackError && !isLogging) {
      setIsLogging(true);
      logError({
        statusCode,
        errorType: currentErrorType,
        title: finalTitle,
        message: finalMessage,
        metadata,
      });
    }
  }, [statusCode, currentErrorType, finalTitle, finalMessage, trackError, metadata, isLogging]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleSupport = () => {
    window.location.href = "/support";
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 overflow-hidden'>
      {/* Animated background blobs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob' />
        <div className='absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000' />
        <div className='absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000' />
      </div>

      {/* Main content card */}
      <div
        className={`relative z-10 max-w-2xl w-full transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className='bg-white rounded-2xl shadow-2xl p-8 md:p-12 backdrop-blur-sm bg-opacity-95'>
          {/* Error Code */}
          <div className='text-center mb-6'>
            <div
              className={`inline-flex items-center justify-center transition-all duration-700 ${
                mounted ? "scale-100 rotate-0" : "scale-0 -rotate-180"
              }`}
            >
              <div className='relative'>
                <div
                  className={`text-3xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${colorScheme.gradient}`}
                >
                  {statusCode}
                </div>
                <div
                  className={`absolute inset-0 text-3xl md:text-3xl font-bold ${colorScheme.text} opacity-20 animate-pulse`}
                >
                  {statusCode}
                </div>
              </div>
            </div>
          </div>

          {/* Icon */}
          <div
            className={`flex justify-center mb-6 transition-all duration-500 delay-300 ${
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          >
            <div className='relative'>
              <div className={`${colorScheme.text} animate-bounce-slow`}>{errorConfig.icon}</div>
              <div
                className={`absolute inset-0 w-24 h-24 border-4 ${colorScheme.border} border-opacity-20 rounded-full animate-ping opacity-30`}
              />
            </div>
          </div>

          {/* Title & message */}
          <div
            className={`text-center space-y-4 mb-8 transition-all overflow-hidden duration-500 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h3 className=' '>{finalTitle}</h3>
            <p className='text-sm mx-auto'>{finalMessage}</p>
          </div>

          {/* Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-500 delay-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {showRetry && (
              <button
                onClick={handleRetry}
                className={`group relative px-8 py-3 bg-gradient-to-r ${colorScheme.button} text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden`}
              >
                <span className='relative z-10 flex items-center justify-center gap-2'>
                  <svg
                    className='w-5 h-5 group-hover:rotate-180 transition-transform duration-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                  Try Again
                </span>
              </button>
            )}

            {showHome && (
              <button
                onClick={handleGoHome}
                className={`px-8 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-300 hover:${colorScheme.border} hover:${colorScheme.text} transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg`}
              >
                <span className='flex items-center justify-center gap-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                    />
                  </svg>
                  Go Home
                </span>
              </button>
            )}

            {showSupport && (
              <button
                onClick={handleSupport}
                className={`px-8 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-300 hover:${colorScheme.border} hover:${colorScheme.text} transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg`}
              >
                <span className='flex items-center justify-center gap-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
                    />
                  </svg>
                  Get Help
                </span>
              </button>
            )}
          </div>

          {/* Support text */}
          {showSupport && (
            <div
              className={`mt-8 text-center transition-all duration-500 delay-1000 ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className='text-sm text-gray-500'>
                Need assistance? Contact our{" "}
                <a
                  href='/support'
                  className={`${colorScheme.text} hover:underline transition-colors font-medium`}
                >
                  support team
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
