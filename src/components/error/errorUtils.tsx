import {
  type ColorScheme,
  type ColorSchemeConfig,
  type ErrorConfig,
  type ErrorLogData,
  type ErrorType,
} from "@/types/error.types";
import { type ReactNode } from "react";

// Define your icons inline or import SVG components
type IconsType = {
  network: ReactNode;
  auth: ReactNode;
  forbidden: ReactNode;
  notFound: ReactNode;
  server: ReactNode;
  maintenance: ReactNode;
  timeout: ReactNode;
  default: ReactNode;
};
const icons: IconsType = {
  network: (
    <svg
      className='w-24 h-24'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414'
      />
    </svg>
  ),

  auth: (
    <svg
      className='w-24 h-24'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
      />
    </svg>
  ),

  forbidden: (
    <svg
      className='w-24 h-24'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
      />
    </svg>
  ),

  notFound: (
    <svg
      className='w-24 h-24'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  ),

  server: (
    <svg
      className='w-24 h-24'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01'
      />
    </svg>
  ),

  maintenance: (
    <svg
      className='w-24 h-24'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
      />
    </svg>
  ),

  timeout: (
    <svg
      className='w-24 h-24'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  ),

  default: (
    <svg
      className='w-24 h-24'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
      />
    </svg>
  ),
};

// ERROR TYPES configuration
export const ERROR_TYPES: Record<ErrorType, ErrorConfig> = {
  network: {
    icon: icons.network,
    title: "Network Error",
    message:
      "Unable to connect to the server. Please check your internet connection and try again.",
    color: "orange",
  },
  auth: {
    icon: icons.auth,
    title: "Authentication Required",
    message: "You need to be logged in to access this page. Please sign in to continue.",
    color: "red",
  },
  forbidden: {
    icon: icons.forbidden,
    title: "Access Denied",
    message:
      "You don't have permission to access this resource. Contact your administrator if you believe this is an error.",
    color: "red",
  },
  notFound: {
    icon: icons.notFound,
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist. It may have been moved or deleted.",
    color: "blue",
  },
  server: {
    icon: icons.server,
    title: "Server Error",
    message: "Something went wrong on our end. Our team has been notified and is working on a fix.",
    color: "purple",
  },
  maintenance: {
    icon: icons.maintenance,
    title: "Under Maintenance",
    message: "We're currently performing scheduled maintenance. We'll be back shortly.",
    color: "yellow",
  },
  timeout: {
    icon: icons.timeout,
    title: "Request Timeout",
    message: "The request took too long to complete. Please try again.",
    color: "orange",
  },
  default: {
    icon: icons.default,
    title: "Something went wrong",
    message: "We're sorry, but something unexpected happened. Please try again later.",
    color: "indigo",
  },
};

// Color scheme definitions
export const COLOR_SCHEMES: Record<ColorScheme, ColorSchemeConfig> = {
  blue: {
    gradient: "from-blue-600 to-indigo-600",
    button: "from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600",
    text: "text-blue-600",
    border: "border-blue-600",
    bg: "bg-blue-600",
  },
  red: {
    gradient: "from-red-600 to-rose-600",
    button: "from-red-600 to-rose-600 hover:from-rose-600 hover:to-red-600",
    text: "text-red-600",
    border: "border-red-600",
    bg: "bg-red-600",
  },
  orange: {
    gradient: "from-orange-600 to-amber-600",
    button: "from-orange-600 to-amber-600 hover:from-amber-600 hover:to-orange-600",
    text: "text-orange-600",
    border: "border-orange-600",
    bg: "bg-orange-600",
  },
  purple: {
    gradient: "from-purple-600 to-violet-600",
    button: "from-purple-600 to-violet-600 hover:from-violet-600 hover:to-purple-600",
    text: "text-purple-600",
    border: "border-purple-600",
    bg: "bg-purple-600",
  },
  yellow: {
    gradient: "from-yellow-600 to-orange-500",
    button: "from-yellow-600 to-orange-500 hover:from-orange-500 hover:to-yellow-600",
    text: "text-yellow-600",
    border: "border-yellow-600",
    bg: "bg-yellow-600",
  },
  indigo: {
    gradient: "from-indigo-600 to-blue-600",
    button: "from-indigo-600 to-blue-600 hover:from-blue-600 hover:to-indigo-600",
    text: "text-indigo-600",
    border: "border-indigo-600",
    bg: "bg-indigo-600",
  },
};

// Determine error type from status code
export function getErrorTypeFromStatus(code: number, overrideType?: ErrorType): ErrorType {
  if (overrideType && overrideType !== "default") {
    return overrideType;
  }
  switch (code) {
    case 401:
      return "auth";
    case 403:
      return "forbidden";
    case 404:
      return "notFound";
    case 408:
      return "timeout";
    case 503:
      return "maintenance";
    case 500:
    case 502:
    case 504:
      return "server";
    default:
      return "default";
  }
}

// Error logging utility
export async function logError(errorData: ErrorLogData): Promise<void> {
  try {
    const res = await fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...errorData,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
      }),
    });
    if (!res.ok) {
      // console.error("Failed to log error:", res.statusText);
    }
  } catch (_err) {
    // console.error("Error logging failed:", err);
  }
}
