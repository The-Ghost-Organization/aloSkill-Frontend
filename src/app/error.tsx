"use client";
import ErrorPage from "@/components/error/ErrorPage";

interface GlobalErrorProps {
  error: Error & { status?: number };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  // console.error(error);

  return (
    <ErrorPage
      statusCode={error?.status ?? 500}
      title={error.message}
      message={error.stack}
      onRetry={reset}
      showHome={true}
      showSupport={true}
      trackError={true}
      metadata={{ source: "GlobalErrorBoundary" }}
    />
  );
}
