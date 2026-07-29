"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Space_Grotesk, Inter } from "next/font/google";
import { apiClient } from '../../../lib/api/client';

const AUTO_REDIRECT_SECONDS = 10;

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

type VerifyState =
  | { status: "verifying" }
  | { status: "success";  message: string }
  | { status: "failed"; message: string };

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function VerifyPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyState>({ status: "verifying" });
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);
  const invoiceId = searchParams.get("invoice_id");

  const verifyPayment = useCallback(async () => {
    setState({ status: "verifying" });

    if (!invoiceId) {
      setState({
        status: "failed",
        message: "We couldn't find payment reference.",
      });
      return;
    }

    try {
      const verifyPaymentInfo = await apiClient.get<{orderStatus:string}>(`/order/verify-payment?invoiceId=${invoiceId}`);

      if (!verifyPaymentInfo.success) {
        throw new Error(`Request failed for this order: ${invoiceId}`);
      }

      if (verifyPaymentInfo.data?.orderStatus !== "COMPLETED") {
        setState({
          status: "failed",
          message: verifyPaymentInfo.message ?? "This transaction could not be confirmed.",
        });
        return;
      }

      setState({
        status: "success",
        message: verifyPaymentInfo.message ?? "Your payment has been confirmed.",
      });
    } catch {
      setState({
        status: "failed",
        message: "Something went wrong while confirming your payment. Please don't try paying again before checking with support.",
      });
    }
  }, [invoiceId]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  // auto-redirect countdown, only while state is "success"
  useEffect(() => {
    if (state.status !== "success") return;

    setCountdown(AUTO_REDIRECT_SECONDS);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/dashboard/student");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, router]);

  return (
    <main
      className={`${spaceGrotesk.variable} ${inter.variable} relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#12163A_0%,#1B2050_50%,#241B4D_100%)] font-(family-name:--font-body) text-white`}
    >
      {/* ambient orbs, present in every state for visual continuity */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span
          className="absolute -top-8 -left-6 h-64 w-64 rounded-full bg-[#33D6C0] opacity-30 blur-3xl motion-safe:animate-[floatY_10s_ease-in-out_infinite] motion-reduce:hidden"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="absolute top-[62%] -left-4 h-52 w-52 rounded-full bg-[#5B6BFF] opacity-25 blur-3xl motion-safe:animate-[floatY_11s_ease-in-out_infinite] motion-reduce:hidden"
          style={{ animationDelay: "1.2s" }}
        />
        <span
          className="absolute -top-4 left-[78%] h-56 w-56 rounded-full bg-[#F2B84B] opacity-20 blur-3xl motion-safe:animate-[floatY_10s_ease-in-out_infinite] motion-reduce:hidden"
          style={{ animationDelay: "0.6s" }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center shadow-[0_30px_80px_-20px_#00000080] backdrop-blur-xl sm:px-12 sm:py-14">
          {state.status === "verifying" && (
            <div key="verifying">
              <div className="relative mx-auto mb-8 h-32 w-32">
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full motion-safe:animate-spin motion-reduce:animate-none [animation-duration:1.1s]"
                >
                  <circle cx="50" cy="50" r={RING_RADIUS} fill="none" stroke="#FFFFFF1A" strokeWidth="4" />
                  <circle
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="#33D6C0"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="70 210"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/70 motion-safe:animate-bounce motion-reduce:animate-none [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-white/70 motion-safe:animate-bounce motion-reduce:animate-none [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-white/70 motion-safe:animate-bounce motion-reduce:animate-none [animation-delay:300ms]" />
                </div>
              </div>
              <h1 className="mb-2 font-(family-name:--font-display) text-2xl font-bold sm:text-3xl">
                Confirming your payment
              </h1>
              <p className="text-sm text-white/60">
                This usually takes just a few seconds. Please don&apos;t
                close this tab.
              </p>
            </div>
          )}

          {state.status === "success" && (
            <div key="success">
              <div className="relative mx-auto mb-8 h-40 w-40 opacity-0 motion-safe:animate-[riseIn_0.6s_ease-out_0.05s_forwards] motion-reduce:opacity-100">
                <div className="absolute inset-0 motion-safe:animate-spin motion-reduce:hidden [animation-duration:7s]">
                  <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[#33D6C0] shadow-[0_0_8px_2px_#33D6C080]" />
                </div>
                <div className="absolute -inset-3 motion-safe:animate-spin motion-reduce:hidden [animation-duration:10s] [animation-direction:reverse]">
                  <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#F2B84B] shadow-[0_0_8px_2px_#F2B84B80]" />
                </div>

                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r={RING_RADIUS} fill="none" stroke="#FFFFFF1A" strokeWidth="4" />
                  <circle
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="#33D6C0"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: RING_CIRCUMFERENCE,
                      strokeDashoffset: RING_CIRCUMFERENCE,
                    }}
                    className="motion-safe:animate-[fillRing_1.1s_ease-out_0.3s_forwards] motion-reduce:[stroke-dashoffset:0]"
                  />
                </svg>

                <div className="absolute inset-5 flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#33D6C0_0%,#2A8CFF_100%)] shadow-[0_0_30px_4px_#33D6C050]">
                  <svg
                    viewBox="0 0 36 36"
                    className="h-9 w-9"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      d="M6 19 L14 27 L30 9"
                      style={{ strokeDasharray: 34, strokeDashoffset: 34 }}
                      className="motion-safe:animate-[draw_0.6s_ease-out_1.1s_forwards] motion-reduce:[stroke-dashoffset:0]"
                    />
                  </svg>
                </div>
              </div>

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#33D6C0] opacity-0 motion-safe:animate-[riseIn_0.6s_ease-out_0.2s_forwards] motion-reduce:opacity-100">
                Payment confirmed
              </p>
              <h1 className="mb-3 font-(family-name:--font-display) text-3xl font-bold leading-tight opacity-0 motion-safe:animate-[riseIn_0.6s_ease-out_0.3s_forwards] motion-reduce:opacity-100 sm:text-4xl">
                You&apos;re all set 🎉
              </h1>
              {/* <p className="mb-8 text-sm text-white/70 opacity-0 motion-safe:animate-[riseIn_0.6s_ease-out_0.4s_forwards] motion-reduce:opacity-100">
                You&apos;re enrolled in{" "}
                <span className="font-medium text-white">{state.courseTitle}</span>.
                A receipt has been emailed to you.
              </p> */}

              <div className="mb-9 flex flex-wrap items-center justify-center gap-2 opacity-0 motion-safe:animate-[riseIn_0.6s_ease-out_0.5s_forwards] motion-reduce:opacity-100">
                {/* <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
                  Order {state.orderId}
                </span> */}
                {/* {state.amount && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
                    {state.amount} paid
                  </span>
                )} */}
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
                  Access granted
                </span>
              </div>

              <div className="opacity-0 motion-safe:animate-[riseIn_0.6s_ease-out_0.6s_forwards] motion-reduce:opacity-100">
                <Link
                  href="/dashboard/student"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#33D6C0] px-5 py-3 text-sm font-semibold text-[#0F1229] transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                >
                  Go to dashboard now
                </Link>
                <p className="mt-4 text-xs text-white/40">
                  Redirecting automatically in {countdown}s…
                </p>
              </div>
            </div>
          )}

          {state.status === "failed" && (
            <div key="failed">
              <div className="relative mx-auto mb-8 h-32 w-32 opacity-0 motion-safe:animate-[riseIn_0.5s_ease-out_forwards] motion-reduce:opacity-100">
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#FF6B6B1A] ring-1 ring-inset ring-[#FF6B6B40]">
                  <svg viewBox="0 0 36 36" className="h-10 w-10" fill="none" stroke="#FF6B6B" strokeWidth="3.5" strokeLinecap="round">
                    <path
                      d="M11 11 L25 25"
                      style={{ strokeDasharray: 23, strokeDashoffset: 23 }}
                      className="motion-safe:animate-[draw_0.4s_ease-out_0.1s_forwards] motion-reduce:[stroke-dashoffset:0]"
                    />
                    <path
                      d="M25 11 L11 25"
                      style={{ strokeDasharray: 23, strokeDashoffset: 23 }}
                      className="motion-safe:animate-[draw_0.4s_ease-out_0.3s_forwards] motion-reduce:[stroke-dashoffset:0]"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="mb-3 font-(family-name:--font-display) text-3xl font-bold leading-tight">
                We couldn&apos;t confirm this payment
              </h1>
              <p className="mb-8 text-sm text-white/70">{state.message}</p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={verifyPayment}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0"
                >
                  Try again
                </button>
                <Link
                  href="/support"
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/5 active:translate-y-0"
                >
                  Contact support
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fillRing {
          to { stroke-dashoffset: 0; }
        }
        @keyframes floatY {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(14px, -18px); }
        }
      `}</style>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPayment />
    </Suspense>
  );
}
