"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface VideoProtectionWrapperProps {
  children: React.ReactNode;
  /** Callback fired when a suspicious action is detected */
  onSuspiciousActivity?: (action: string) => void;
  /** Show a visual watermark with user info to deter screen recording */
  watermarkText?: string;
  /** Disable the DevTools detection warning */
  disableDevToolsDetection?: boolean;
}

/**
 * VideoProtectionWrapper
 *
 * Wraps video/media content with multiple layers of client-side protection:
 *  1. Disables right-click context menu
 *  2. Blocks common keyboard shortcuts (DevTools, Save, View Source, Screenshot)
 *  3. Transparent overlay to prevent iframe drag and direct interaction
 *  4. Floating watermark to deter screen recording
 *  5. Visibility change detection (tab switching)
 *  6. DevTools open detection
 *  7. CSS-level text/drag-and-drop protection
 *
 * ⚠️  Important: No client-side protection is absolute. Pair this with:
 *    - Server-side signed & expiring video tokens (e.g. Bunny.net token auth)
 *    - CORS restrictions on your CDN/video host
 *    - Short token TTLs (10–30 minutes)
 */
export default function VideoProtectionWrapper({
  children,
  onSuspiciousActivity,
  watermarkText,
  disableDevToolsDetection = false,
}: VideoProtectionWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const devToolsCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  const reportActivity = useCallback(
    (action: string) => {
      console.warn(`[VideoProtection] Suspicious activity detected: ${action}`);
      onSuspiciousActivity?.(action);
    },
    [onSuspiciousActivity]
  );

  // ── 1. Right-click prevention ──────────────────────────────────────────────
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const wrapper = wrapperRef.current;
      if (wrapper && wrapper.contains(target)) {
        e.preventDefault();
        e.stopPropagation();
        reportActivity("right-click");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, true);
    return () => document.removeEventListener("contextmenu", handleContextMenu, true);
  }, [reportActivity]);

  // ── 2. Keyboard shortcut blocking ─────────────────────────────────────────
  useEffect(() => {
    const BLOCKED_COMBOS: { ctrl?: boolean; shift?: boolean; keys: string[] }[] = [
      { ctrl: true, keys: ["s", "S"] }, // Save page
      { ctrl: true, keys: ["u", "U"] }, // View source
      { ctrl: true, keys: ["p", "P"] }, // Print
      { ctrl: true, shift: true, keys: ["i", "I"] }, // DevTools (Chrome/Edge)
      { ctrl: true, shift: true, keys: ["j", "J"] }, // DevTools Console
      { ctrl: true, shift: true, keys: ["c", "C"] }, // DevTools Inspector
      { ctrl: true, shift: true, keys: ["k", "K"] }, // DevTools Console (Firefox)
      { ctrl: true, keys: ["a", "A"] }, // Select all (inside wrapper)
    ];

    const BLOCKED_KEYS = new Set(["F12", "PrintScreen"]);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12 and PrintScreen globally
      if (BLOCKED_KEYS.has(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        reportActivity(`key-${e.key}`);
        return;
      }

      // Block ctrl/cmd combos
      const isCtrl = e.ctrlKey || e.metaKey;
      for (const combo of BLOCKED_COMBOS) {
        const ctrlMatch = !combo.ctrl || isCtrl;
        const shiftMatch = !combo.shift || e.shiftKey;
        const keyMatch = combo.keys.includes(e.key);
        if (ctrlMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          e.stopPropagation();
          reportActivity(`shortcut-${e.key}`);
          return;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [reportActivity]);

  // ── 3. Drag prevention on the wrapper ─────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      reportActivity("drag-attempt");
    };

    wrapper.addEventListener("dragstart", prevent, true);
    wrapper.addEventListener("drop", prevent, true);
    return () => {
      wrapper.removeEventListener("dragstart", prevent, true);
      wrapper.removeEventListener("drop", prevent, true);
    };
  }, [reportActivity]);

  // ── 4. Visibility change (tab switching) detection ─────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportActivity("tab-hidden");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [reportActivity]);

  // ── 5. DevTools open detection ─────────────────────────────────────────────
  useEffect(() => {
    if (disableDevToolsDetection) return;

    const THRESHOLD = 160;

    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth > THRESHOLD;
      const heightDiff = window.outerHeight - window.innerHeight > THRESHOLD;
      const isOpen = widthDiff || heightDiff;

      if (isOpen && !devToolsOpen) {
        setDevToolsOpen(true);
        reportActivity("devtools-opened");
      } else if (!isOpen && devToolsOpen) {
        setDevToolsOpen(false);
      }
    };

    devToolsCheckRef.current = setInterval(checkDevTools, 1000);
    return () => {
      if (devToolsCheckRef.current) clearInterval(devToolsCheckRef.current);
    };
  }, [devToolsOpen, disableDevToolsDetection, reportActivity]);

  // ── 6. Cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (devToolsCheckRef.current) clearInterval(devToolsCheckRef.current);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className='relative w-full h-full'
      style={{
        // Prevent text selection inside the video area
        userSelect: "none",
        WebkitUserSelect: "none",
        // Prevent pointer events on nested elements (the overlay handles this)
      }}
    >
      {/* ── Actual video content ─────────────────────────────────────────── */}
      {children}

      {/* ── Transparent overlay: blocks right-click on iframe & drag ───────
           pointer-events: none allows click-through for play/pause controls,
           but the onContextMenu + keydown handlers on document still fire.
           We use a very thin z-index overlay specifically for drag prevention. */}
      <div
        aria-hidden='true'
        onContextMenu={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragStart={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className='absolute inset-0 z-10'
        style={{
          // Allow interaction to pass through to the video player
          pointerEvents: "none",
          // Belt-and-suspenders: block user selection
          userSelect: "none",
          WebkitUserSelect: "none",
          // Prevent drag visuals
          WebkitTouchCallout: "none",
        }}
      />

      {/* ── Floating watermark (deter screen recording) ─────────────────── */}
      {watermarkText && (
        <div
          aria-hidden='true'
          className='absolute inset-0 z-20 pointer-events-none overflow-hidden'
        >
          {/* Diagonal repeating watermark pattern */}
          <div
            className='absolute inset-0 flex flex-wrap gap-0 opacity-[0.06]'
            style={{ transform: "rotate(-30deg) scale(1.5)", transformOrigin: "center" }}
          >
            {Array.from({ length: 60 }).map((_, i) => (
              <span
                key={i}
                className='text-xs font-semibold text-gray-900 whitespace-nowrap px-8 py-6'
                style={{ fontSize: "11px", letterSpacing: "0.05em" }}
              >
                {watermarkText}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── DevTools warning overlay ─────────────────────────────────────── */}
      {devToolsOpen && !disableDevToolsDetection && (
        <div
          className='absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm'
          aria-live='assertive'
        >
          <div className='bg-white rounded-lg p-6 max-w-sm mx-4 text-center shadow-xl'>
            <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-6 h-6 text-red-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Content Protected</h3>
            <p className='text-sm text-gray-600'>
              Developer tools detected. Please close them to continue watching.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
