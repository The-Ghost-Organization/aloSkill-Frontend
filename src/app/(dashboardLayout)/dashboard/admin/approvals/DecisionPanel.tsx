"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { apiClient } from "../../../../../lib/api/client";
import { decideApproval, type ApprovalType } from "./action";
export default function DecisionPanel({
  type,
  id,
  title,
  proposedPrice,
}: {
  type: ApprovalType;
  id: string;
  title: string;
  proposedPrice?: string | number | null;
}) {
  const [price, setPrice] = useState(
    proposedPrice == null ? "" : String(proposedPrice),
  );
  const [rate, setRate] = useState("");
  const [source, setSource] = useState("");
  const [rateLoaded, setRateLoaded] = useState(type === "instructor");
  useEffect(() => {
    if (type === "instructor") return;
    let active = true;
    apiClient
      .get<{
        rate: string;
        source: string;
        approvedSource?: string;
      }>(`/finance/admin/products/${type}/${id}/commission`)
      .then((r) => {
        if (!active) return;
        if (r.success && r.data) {
          setRate(String(r.data.rate));
          setSource(r.data.source);
          setRateLoaded(true);
        } else
          setError(
            r.message ??
              "Could not load suggested commission. Refresh before approving.",
          );
      });
    return () => {
      active = false;
    };
  }, [type, id]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  function decide(decision: "APPROVE" | "REJECT") {
    if (decision === "REJECT" && note.trim().length < 5) {
      setError("Provide a reason of at least 5 characters.");
      return;
    }
    if (
      decision === "APPROVE" &&
      type !== "instructor" &&
      (!rateLoaded ||
        rate.trim() === "" ||
        !/^\d+(?:\.\d{1,2})?$/.test(rate) ||
        Number(rate) > 100)
    ) {
      setError("Confirm a commission rate between 0 and 100.");
      return;
    }
    if (
      decision === "APPROVE" &&
      type === "product" &&
      (!/^\d+(?:\.\d{1,2})?$/.test(price) ||
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0)
    ) {
      setError(
        "Confirm a positive selling price with at most two decimal places.",
      );
      return;
    }
    if (
      !window.confirm(
        `${decision === "APPROVE" ? "Approve" : "Reject"} ${title}?`,
      )
    )
      return;
    setError("");
    start(async () => {
      const result = await decideApproval(
        type,
        id,
        decision,
        note,
        type !== "instructor" && decision === "APPROVE" ? rate : undefined,
        type === "product" && decision === "APPROVE" ? price : undefined,
      );
      if (result.success) {
        router.push("/dashboard/admin/approvals");
        router.refresh();
      } else setError(result.message);
    });
  }
  return (
    <section className="rounded-2xl border border-[#1a3158] bg-[#0d1f3c] text-[#e8f0fe] p-5">
      <h2 className="text-lg font-semibold text-white">Review decision</h2>
      <p className="mt-2 text-sm text-slate-400">
        Read the submitted details before deciding. A reason is required to
        reject.
      </p>
      {type === "product" && (
        <label className="mt-4 block text-sm text-slate-300">
          Approved selling price (BDT)
          <input
            aria-label="Approved selling price in BDT"
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled={pending}
            className="mt-2 w-full rounded-lg border border-[#1a3158] bg-[#070f1e] p-3 text-white"
          />
          <span className="mt-1 block text-xs text-slate-400">
            Confirm the final customer price before approving.
          </span>
        </label>
      )}
      {type !== "instructor" && (
        <label className="mt-4 block text-sm text-slate-300">
          Commission (%) · suggested from {source || "loading"}
          <input
            aria-label="Commission percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="mt-2 w-full rounded-lg border border-[#1a3158] bg-[#070f1e] p-3 text-white"
          />
          <span className="mt-1 block text-xs text-slate-400">
            Confirming saves a product-specific rate for future sales.
          </span>
        </label>
      )}
      <label
        htmlFor="approval-note"
        className="mt-5 block text-sm text-slate-300"
      >
        Admin note / rejection reason
      </label>
      <textarea
        id="approval-note"
        rows={5}
        maxLength={500}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="mt-2 w-full rounded-lg border border-[#1a3158] bg-[#070f1e] p-3 text-sm text-white outline-none focus:border-orange-500"
        placeholder="Explain the decision for the submission record"
      />
      {error && (
        <p role="alert" className="my-3 text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => decide("APPROVE")}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => decide("REJECT")}
          className="rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-300 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </section>
  );
}
