"use client";

import { useEffect, useRef, useState } from "react";
import { useDevToolsProtection } from "./Usedevtoolsprotection.ts";

interface BunnyVideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  lastPosition: number;
  handleUpdateProgress: (updateData: {
    lessonId: string;
    lastPosition: number;
    progressValue: number;
    isFinished: boolean;
  }) => void;
  watermarkText?: string;
  /** Pass process.env.NODE_ENV === "development" to disable in local dev */
  disableProtection?: boolean;
  width?: string;
  height?: string;
}

function seededPosition(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

export default function BunnyVideoPlayer({
  videoUrl,
  lessonId,
  lastPosition,
  handleUpdateProgress,
  watermarkText,
  disableProtection = false,
  width = "100%",
  height = "100%",
}: BunnyVideoPlayerProps) {
  const iframeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tracks live video state for progress saving
  const progressRef = useRef({
    lessonId: null as string | null,
    duration: 0,
    currentTime: 0,
    progressValue: 0,
    hasEnded: false,
    isSeeking: false,
    src: "",
  });

  // Survives iframe teardown so playback resumes at the right position
  const resumePositionRef = useRef<number>(lastPosition ?? 0);

  // Watermark floating position
  const [positionSeed, setPositionSeed] = useState(1);
  useEffect(() => {
    if (!watermarkText) return;
    const id = setInterval(() => setPositionSeed(p => p + 1), 8000);
    return () => clearInterval(id);
  }, [watermarkText]);
  const wmLeft = seededPosition(positionSeed * 7.3, 5, 75);
  const wmTop = seededPosition(positionSeed * 3.7, 5, 80);

  // ── DevTools detection ────────────────────────────────────────────────────
  const { isDevToolsOpen } = useDevToolsProtection({
    disabled: disableProtection,
    pollInterval: 800,
    sizeThreshold: 150,
  });

  // ── Player bootstrap ──────────────────────────────────────────────────────
  // `isDevToolsOpen` is intentionally in the dep array:
  //   • true  → bail out immediately, wipe the iframe DOM
  //   • false → (re)build the full player, seeking to resumePositionRef
  useEffect(() => {
    // ── DevTools OPEN: destroy iframe, freeze progress ─────────────────────
    if (isDevToolsOpen) {
      // Capture current position before destroying so we can resume later
      if (progressRef.current.currentTime > 0) {
        resumePositionRef.current = progressRef.current.currentTime;
      }
      if (iframeRef.current) {
        iframeRef.current.innerHTML = "";
      }
      return;
    }

    // ── DevTools CLOSED (or first mount): build the player ────────────────
    const bootPosition = resumePositionRef.current;

    progressRef.current = {
      lessonId,
      duration: 0,
      currentTime: bootPosition,
      progressValue: 0,
      hasEnded: false,
      isSeeking: false,
      src: videoUrl,
    };

    const script = document.createElement("script");
    script.src = "//assets.mediadelivery.net/playerjs/playerjs-latest.min.js";
    script.async = true;
    const currentRef = iframeRef.current;

    script.onload = () => {
      if (!currentRef) return;

      // Clear any leftover DOM before mounting fresh iframe
      currentRef.innerHTML = "";

      const iframe = document.createElement("iframe");
      iframe.src = videoUrl;
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.style.border = "0";
      currentRef.appendChild(iframe);

      const player = new (window as any).playerjs.Player(iframe);

      player.on("ready", () => {
        // timeupdate — keep resumePositionRef live while watching
        player.on("timeupdate", (tv: { seconds: number; duration: number }) => {
          if (progressRef.current.isSeeking || tv.seconds < bootPosition) return;
          progressRef.current.currentTime = tv.seconds;
          resumePositionRef.current = tv.seconds; // ← kept live for teardown
          if (progressRef.current.duration > 0) {
            progressRef.current.progressValue = (tv.seconds / progressRef.current.duration) * 100;
          }
        });

        // getDuration → seek to resume position
        player.getDuration((duration: number) => {
          progressRef.current.duration = duration;

          if (!bootPosition) {
            player.setCurrentTime(0);
            return;
          }
          if (bootPosition >= duration * 0.95) {
            progressRef.current.progressValue = 100;
          } else if (bootPosition > 0 && bootPosition < duration * 0.9) {
            progressRef.current.isSeeking = true;
            player.setCurrentTime(bootPosition);
            setTimeout(() => {
              progressRef.current.isSeeking = false;
            }, 3000);
          }
        });

        // ended
        player.on("ended", () => {
          if (!progressRef.current.hasEnded) {
            progressRef.current.hasEnded = true;
            handleUpdateProgress({
              lessonId: progressRef.current.lessonId as string,
              lastPosition: 0,
              progressValue: 100,
              isFinished: true,
            });
          }
        });

        if (player.supports("method", "mute")) player.mute();
      });
    };

    document.body.appendChild(script);

    // ── Cleanup: fires on lesson change, DevTools open, or unmount ─────────
    return () => {
      const finalPercent = progressRef.current.progressValue;

      if (
        progressRef.current.lessonId &&
        finalPercent > 0 &&
        progressRef.current.currentTime > 0 &&
        finalPercent !== 100
      ) {
        handleUpdateProgress(
          finalPercent >= 90
            ? {
                lessonId: progressRef.current.lessonId as string,
                lastPosition: 0,
                progressValue: 100,
                isFinished: true,
              }
            : {
                lessonId: progressRef.current.lessonId as string,
                lastPosition: Math.floor((finalPercent / 100) * progressRef.current.duration),
                progressValue: finalPercent,
                isFinished: false,
              }
        );
      }

      if (document.body.contains(script)) document.body.removeChild(script);
      if (currentRef) currentRef.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, lessonId, isDevToolsOpen]);

  return (
    <div
      ref={containerRef}
      style={{ width, height, position: "relative" }}
    >
      {/* ── Iframe mount point ─────────────────────────────────────────────── */}
      <div
        ref={iframeRef}
        style={{ width: "100%", height: "100%" }}
      />

      {/* ── DevTools blocking overlay ──────────────────────────────────────── */}
      {isDevToolsOpen && !disableProtection && (
        <div
          role='alertdialog'
          aria-modal='true'
          aria-label='Content protected'
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(10, 10, 15, 0.97)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {/* Grid texture */}
          <div
            aria-hidden='true'
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)," +
                "linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
              pointerEvents: "none",
            }}
          />

          {/* Card */}
          <div
            style={{
              position: "relative",
              backgroundColor: "#111318",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "32px 40px",
              maxWidth: "380px",
              width: "calc(100% - 32px)",
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Shield icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg
                width='26'
                height='26'
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

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "18px",
                fontWeight: 600,
                color: "#f9fafb",
                letterSpacing: "-0.01em",
              }}
            >
              Content Protected
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "13px",
                lineHeight: 1.65,
                color: "#9ca3af",
              }}
            >
              Developer tools detected. Close them to resume the lesson — your progress has been
              saved.
            </p>

            {/* Pulsing status pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "99px",
                padding: "5px 14px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  display: "inline-block",
                  animation: "_dt_pulse 1.4s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: "12px", color: "#fca5a5", fontWeight: 500 }}>
                Monitoring active
              </span>
            </div>

            <style>{`
              @keyframes _dt_pulse {
                0%,100% { opacity:1; transform:scale(1); }
                50%     { opacity:0.4; transform:scale(0.85); }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* ── Floating watermark (hidden while DevTools overlay is shown) ────── */}
      {watermarkText && !isDevToolsOpen && (
        <div
          aria-hidden='true'
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${wmLeft}%`,
              top: `${wmTop}%`,
              transition: "left 1.2s ease-in-out, top 1.2s ease-in-out",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "rgba(255,255,255,0.35)",
              textShadow: "0 1px 3px rgba(0,0,0,0.6),0 0 8px rgba(0,0,0,0.3)",
              fontFamily: "monospace",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            <svg
              width='12'
              height='12'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <rect
                x='3'
                y='11'
                width='18'
                height='11'
                rx='2'
                ry='2'
              />
              <path d='M7 11V7a5 5 0 0 1 10 0v4' />
            </svg>
            {watermarkText}
          </div>
        </div>
      )}
    </div>
  );
}
