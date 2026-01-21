import { type ReactNode } from "react";

export type ErrorType =
  | "network"
  | "auth"
  | "forbidden"
  | "notFound"
  | "server"
  | "maintenance"
  | "timeout"
  | "default";

export type ColorScheme = "blue" | "red" | "orange" | "purple" | "yellow" | "indigo";

export interface ErrorConfig {
  icon: ReactNode;
  title: string;
  message: string;
  color: ColorScheme;
}

export interface ColorSchemeConfig {
  gradient: string;
  button: string;
  text: string;
  border: string;
  bg: string;
}

export interface ErrorLogData {
  statusCode: number;
  errorType: ErrorType;
  title: string;
  message: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorPageProps {
  statusCode?: number;
  errorType?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
  showSupport?: boolean;
  trackError?: boolean;
  metadata?: Record<string, unknown>;
}
