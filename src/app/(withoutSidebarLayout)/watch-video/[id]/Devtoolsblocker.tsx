"use client";

import { useCallback, useEffect } from "react";
import { useDevToolsProtection } from "./Usedevtoolsprotection.ts";

interface DevToolsBlockerProps {
  /**
   * Set true during local development so you aren't blocked yourself.
   * Recommended pattern:
   *   disabled={process.env.NODE_ENV === "development"}
   */
  disabled?: boolean;
  /** Optional callback to log the event to your backend */
  onDetected?: () => void;
}

/**
 * DevToolsBlocker
 *
 * Drop this once at the root of your protected page (e.g. the course-watch
 * layout). It renders a full-viewport fixed overlay the moment DevTools is
 * detected, completely obscuring the page content.
 *
 * The overlay:
 *  - Is `position: fixed` so it covers the full viewport regardless of scroll
 *  - Has `z-index: 9999` — above everything including modals
 *  - Blocks all pointer events so the user can't interact with anything beneath
 *  - Auto-dismisses as soon as DevTools is closed (no manual action needed)
 *  - Keyboard navigation is also disabled while the overlay is visible
 *
 * Usage (in your CoursePage or its layout):
 *
 *   import DevToolsBlocker from "@/components/DevToolsBlocker";
 *
 *   export default function CourseWatchLayout({ children }) {
 *     return (
 *       <>
 *         <DevToolsBlocker
 *           disabled={process.env.NODE_ENV === "development"}
 *           onDetected={() => apiClient.post("/security/event", { action: "devtools" })}
 *         />
 *         {children}
 *       </>
 *     );
 *   }
 */
export default function DevToolsBlocker({ disabled = false, onDetected }: DevToolsBlockerProps) {
  const handleChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) onDetected?.();
    },
    [onDetected]
  );

  const { isDevToolsOpen } = useDevToolsProtection({
    disabled,
    pollInterval: 800,
    sizeThreshold: 150,
    onChange: handleChange,
  });

  // Prevent keyboard interaction with the page while overlay is active
  useEffect(() => {
    if (!isDevToolsOpen) return;

    const blockKeys = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    window.addEventListener("keydown", blockKeys, true);
    return () => window.removeEventListener("keydown", blockKeys, true);
  }, [isDevToolsOpen]);

  if (!isDevToolsOpen) return null;

  return (
    <div
      role='alertdialog'
      aria-modal='true'
      aria-label='Content protected'
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Dark frosted overlay
        backgroundColor: "rgba(10, 10, 15, 0.97)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Subtle grid texture */}
      <div
        aria-hidden='true'
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          backgroundColor: "#111318",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "40px 48px",
          maxWidth: "420px",
          width: "calc(100% - 48px)",
          textAlign: "center",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Shield icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg
            width='28'
            height='28'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#ef4444'
            strokeWidth='1.75'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
            <line
              x1='12'
              y1='8'
              x2='12'
              y2='12'
            />
            <line
              x1='12'
              y1='16'
              x2='12.01'
              y2='16'
            />
          </svg>
        </div>

        {/* Heading */}
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: "20px",
            fontWeight: 600,
            color: "#f9fafb",
            letterSpacing: "-0.01em",
          }}
        >
          Content Protected
        </h2>

        {/* Body */}
        <p
          style={{
            margin: "0 0 28px",
            fontSize: "14px",
            lineHeight: 1.65,
            color: "#9ca3af",
          }}
        >
          Developer tools have been detected. Please close them to continue watching the lesson.
        </p>

        {/* Status pill — auto-updates when DevTools closes */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "99px",
            padding: "6px 16px",
          }}
        >
          {/* Pulsing red dot */}
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              display: "inline-block",
              animation: "devtools-pulse 1.4s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: "13px", color: "#fca5a5", fontWeight: 500 }}>
            Monitoring active
          </span>
        </div>

        {/* Keyframe for pulse — scoped inline so no global CSS needed */}
        <style>{`
          @keyframes devtools-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.4; transform: scale(0.85); }
          }
        `}</style>
      </div>
    </div>
  );
}
