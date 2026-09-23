"use client";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "../../../lib/api/client";
import {
  bookDraftStorage,
  checkoutDataStorage,
  courseDraftStorage,
} from "../../../lib/storage/courseDraftStorage";
import { useSessionContext } from "../../contexts/SessionContext";

type ExpectedOutcome = "success" | "fail" | "cancel";

type Result = {
  paymentStatus: "PAID" | "PENDING" | "FAILED" | "CANCELLED";
  orderId: string;
  orderStatus: string;
  amount: number;
  currency: string;
  message?: string;
};

type ViewState =
  | { kind: "verifying" }
  | { kind: "result"; data: Result }
  | { kind: "error"; message: string };

const initialCopy = {
  success: {
    label: "Payment verification",
    title: "Confirming your payment",
    description: "Please wait while we securely verify your transaction with EPS.",
  },
  fail: {
    label: "Payment verification",
    title: "Checking your payment",
    description: "We are confirming the final transaction status with EPS.",
  },
  cancel: {
    label: "Payment verification",
    title: "Checking your cancellation",
    description: "We are confirming the final transaction status with EPS.",
  },
} as const;

export default function EPSPaymentResult({
  expectedOutcome,
}: {
  expectedOutcome: ExpectedOutcome;
}) {
  const searchParams = useSearchParams();
  const { setCartUpdate } = useSessionContext();
  const cartCleared = useRef(false);
  const [state, setState] = useState<ViewState>({ kind: "verifying" });

  const merchantTransactionId =
    searchParams.get("merchantTransactionId") ??
    searchParams.get("MerchantTransactionId") ??
    searchParams.get("merchant_transaction_id");

  const verify = useCallback(async () => {
    if (!merchantTransactionId) {
      setState({ kind: "error", message: "EPS did not return a merchant transaction reference." });
      return;
    }

    setState({ kind: "verifying" });

    try {
      const response = await apiClient.post<Result>("/order/eps/verify", {
        merchantTransactionId,
        expectedOutcome,
      });

      if (!response.success || !response.data) {
        setState({
          kind: "error",
          message:
            response.message ??
            "We could not verify this payment. Check your orders before paying again.",
        });
        return;
      }

      setState({ kind: "result", data: response.data });
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "The payment verification service is temporarily unavailable.",
      });
    }
  }, [expectedOutcome, merchantTransactionId]);

  useEffect(() => {
    void verify();
  }, [verify]);

  const status = state.kind === "result" ? state.data.paymentStatus : null;
  const paid = status === "PAID";
  const pending = status === "PENDING";
  const cancelled = status === "CANCELLED";
  const failed = status === "FAILED";

  useEffect(() => {
    if (!paid || cartCleared.current) return;

    // Clear cart data only after the backend verifies the payment as PAID.
    courseDraftStorage.clear();
    bookDraftStorage.clear();
    checkoutDataStorage.clear();
    cartCleared.current = true;
    setCartUpdate?.(previous => !previous);
  }, [paid, setCartUpdate]);

  const heading = paid
    ? "Payment successful"
    : pending
      ? "Payment is processing"
      : cancelled
        ? "Payment cancelled"
        : failed
          ? "Payment failed"
          : state.kind === "error"
            ? "Unable to verify payment"
            : initialCopy[expectedOutcome].title;

  const description =
    state.kind === "verifying"
      ? initialCopy[expectedOutcome].description
      : state.kind === "error"
        ? state.message
        : paid
          ? "Thank you! EPS confirmed your payment and your purchase is ready."
          : pending
            ? (state.data.message ?? "EPS has not returned a final status yet. Please check again.")
            : cancelled
              ? "The transaction was cancelled. Your reserved stock has been released."
              : "The transaction was not completed. No paid access has been granted.";

  const tone = paid
    ? {
        icon: "bg-emerald-500 text-white shadow-emerald-500/30",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      }
    : pending || state.kind === "verifying"
      ? {
          icon: "bg-amber-500 text-white shadow-amber-500/30",
          badge: "border-amber-200 bg-amber-50 text-amber-700",
        }
      : {
          icon: "bg-rose-500 text-white shadow-rose-500/30",
          badge: "border-rose-200 bg-rose-50 text-rose-700",
        };

  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl' />

      <section className='relative grid w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_-30px_rgba(15,23,42,0.28)] lg:grid-cols-[0.82fr_1.18fr]'>
        <div className='relative overflow-hidden bg-[#0d1f3c] p-7 text-white sm:p-10'>
          <div className='absolute -right-16 -top-14 h-48 w-48 rounded-full border-[28px] border-white/5' />
          <div className='absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-orange-500/10' />

          <div className='relative flex h-full min-h-64 flex-col'>
            <div className='flex items-center gap-2 text-sm font-semibold'>
              <span className='grid h-9 w-9 place-items-center rounded-xl bg-orange-500'>A</span>
              <span>AloSkill</span>
            </div>

            <div className='my-auto py-12'>
              <p className='text-xs font-semibold uppercase tracking-[0.22em] text-orange-400'>
                {initialCopy[expectedOutcome].label}
              </p>
              <h2 className='mt-4 text-3xl font-bold leading-tight'>
                A secure checkout from start to finish.
              </h2>
              <p className='mt-4 max-w-sm text-sm leading-6 text-slate-300'>
                Your payment status is verified directly with EPS before your order is completed.
              </p>
            </div>

            <div className='flex items-center gap-2 text-xs text-slate-400'>
              <LockKeyhole className='h-4 w-4 text-emerald-400' />
              Secure payment verification
            </div>
          </div>
        </div>

        <div className='flex flex-col justify-center p-6 sm:p-10 lg:p-12'>
          <div className={`grid h-20 w-20 place-items-center rounded-3xl shadow-lg ${tone.icon}`}>
            {state.kind === "verifying" && <LoaderCircle className='h-10 w-10 animate-spin' />}
            {paid && <CheckCircle2 className='h-11 w-11' />}
            {pending && <Clock3 className='h-11 w-11' />}
            {(failed || cancelled) && <XCircle className='h-11 w-11' />}
            {state.kind === "error" && <AlertTriangle className='h-11 w-11' />}
          </div>

          <span
            className={`mt-6 w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${tone.badge}`}
          >
            {state.kind === "verifying" ? "Verifying" : (status ?? "Verification error")}
          </span>

          <h1 className='mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl'>
            {heading}
          </h1>
          <p className='mt-3 max-w-xl leading-7 text-slate-600'>{description}</p>

          {state.kind === "verifying" && (
            <div className='mt-7 space-y-3'>
              {["Contacting EPS", "Confirming transaction", "Preparing your order"].map(
                (item, index) => (
                  <div
                    key={item}
                    className='flex items-center gap-3 text-sm text-slate-500'
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full ${index === 0 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      {index === 0 ? (
                        <LoaderCircle className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        index + 1
                      )}
                    </span>
                    {item}
                  </div>
                )
              )}
            </div>
          )}

          {state.kind === "result" && (
            <dl className='mt-7 grid gap-x-6 gap-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-slate-500'>Order ID</dt>
                <dd
                  className='mt-1 truncate font-semibold text-slate-900'
                  title={state.data.orderId}
                >
                  {state.data.orderId}
                </dd>
              </div>
              <div>
                <dt className='text-slate-500'>Amount paid</dt>
                <dd className='mt-1 font-semibold text-slate-900'>
                  {state.data.currency} {Number(state.data.amount).toLocaleString("en-BD")}
                </dd>
              </div>
              <div>
                <dt className='text-slate-500'>Payment status</dt>
                <dd className='mt-1 flex items-center gap-1.5 font-semibold text-slate-900'>
                  {paid && <Check className='h-4 w-4 text-emerald-600' />}
                  {state.data.paymentStatus}
                </dd>
              </div>
              <div>
                <dt className='text-slate-500'>EPS reference</dt>
                <dd
                  className='mt-1 truncate font-semibold text-slate-900'
                  title={merchantTransactionId ?? undefined}
                >
                  {merchantTransactionId}
                </dd>
              </div>
            </dl>
          )}

          <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
            {(pending || state.kind === "error") && (
              <button
                type='button'
                onClick={() => void verify()}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200'
              >
                <RefreshCw className='h-4 w-4' />
                Check again
              </button>
            )}

            {state.kind === "result" && (
              <Link
                href={`/dashboard/student/orders/${state.data.orderId}`}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d1f3c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#132b50] focus:outline-none focus:ring-4 focus:ring-slate-200'
              >
                <ShoppingBag className='h-4 w-4' />
                View order
              </Link>
            )}

            <Link
              href={paid ? "/dashboard/student" : "/checkout"}
              className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100'
            >
              {paid ? "Go to dashboard" : "Return to checkout"}
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>

          <p className='mt-6 text-xs leading-5 text-slate-400'>
            This page shows the verified EPS transaction status, not only the redirect result.
          </p>
        </div>
      </section>
    </main>
  );
}
