"use client";

import { AlertTriangle, Check, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApprovalItem } from "./Approvaldata";

type Props = {
  approval: ApprovalItem;
};

export default function ApprovalActionPanel({ approval }: Props) {
  const [view, setView] = useState<"idle" | "note" | "reject-confirm" | "approved" | "noted">(
    "idle"
  );
  const [noteText, setNoteText] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [notifyUser, setNotifyUser] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const REJECT_REASONS: Record<string, string[]> = {
    "New Course": [
      "Content quality below standard",
      "Insufficient lesson depth",
      "Missing learning objectives",
      "Poor audio/video quality",
      "Duplicate course already exists",
      "Other",
    ],
    "Course Update": [
      "Changes introduce inaccurate information",
      "Updated content below quality bar",
      "Missing required sections",
      "Other",
    ],
    "Book Approval": [
      "Content quality below standard",
      "Formatting/layout issues",
      "Insufficient content depth",
      "Copyright concerns",
      "Other",
    ],
    "New Instructor": [
      "Incomplete profile information",
      "KYC documents not verified",
      "Insufficient credentials",
      "Does not meet platform standards",
      "Other",
    ],
    "Instructor KYC": [
      "ID document unclear/unreadable",
      "Address proof not matching",
      "Tax form incomplete",
      "Suspected fraudulent document",
      "Other",
    ],
  };

  const reasons = REJECT_REASONS[approval.type] ?? ["Does not meet standards", "Other"];
  const [selectedReason, setSelectedReason] = useState("");
  const [reasonOther, setReasonOther] = useState("");

  const finalRejectNote = selectedReason === "Other" ? reasonOther.trim() : selectedReason;

  // ── Approve ─────────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    setLoading(true);
    // Replace with real API call:
    // await approveItem({ approvalId: approval.id, type: approval.type, refId: approval.refId })
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setView("approved");
  };

  // ── Send note ────────────────────────────────────────────────────────────────
  const handleSendNote = async () => {
    if (!noteText.trim()) return;
    setLoading(true);
    // Replace with real API call:
    // await sendApprovalNote({ approvalId: approval.id, note: noteText, notify: notifyUser })
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setView("noted");
  };

  // ── Reject ───────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!finalRejectNote) return;
    setLoading(true);
    // Replace with real API call:
    // await rejectItem({ approvalId: approval.id, type: approval.type, reason: finalRejectNote, notify: notifyUser })
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setView("noted");
  };

  const handleBack = () => {
    router.back(); // or router.push('/dashboard/admin/approvals')
  };

  // ── Approved success state ────────────────────────────────────────────────
  if (view === "approved") {
    return (
      <div
        className='rounded-2xl border p-8 flex flex-col items-center text-center gap-4'
        style={{ background: "#0d1f3c", borderColor: "rgba(0,229,160,0.25)" }}
      >
        <div
          className='w-16 h-16 rounded-full flex items-center justify-center'
          style={{ background: "rgba(0,229,160,0.12)", border: "2px solid rgba(0,229,160,0.3)" }}
        >
          <Check
            size={28}
            color='#00e5a0'
          />
        </div>
        <div>
          <div
            className='text-lg font-extrabold text-slate-100 mb-1'
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Approved Successfully
          </div>
          <div className='text-[13px] text-slate-400'>
            <span className='text-emerald-400 font-semibold'>{approval.title}</span> has been
            approved and is now live.
          </div>
        </div>
        <button
          onClick={handleBack}
          className='mt-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all'
        >
          ← Back to Approvals
        </button>
      </div>
    );
  }

  // ── Note sent success state ───────────────────────────────────────────────
  if (view === "noted") {
    return (
      <div
        className='rounded-2xl border p-8 flex flex-col items-center text-center gap-4'
        style={{ background: "#0d1f3c", borderColor: "rgba(74,158,255,0.25)" }}
      >
        <div
          className='w-16 h-16 rounded-full flex items-center justify-center'
          style={{ background: "rgba(74,158,255,0.12)", border: "2px solid rgba(74,158,255,0.3)" }}
        >
          <Send
            size={24}
            color='#4a9eff'
          />
        </div>
        <div>
          <div
            className='text-lg font-extrabold text-slate-100 mb-1'
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Message Sent
          </div>
          <div className='text-[13px] text-slate-400'>
            {notifyUser
              ? `${approval.by} has been notified with your feedback.`
              : "Note saved internally. No email was sent."}
          </div>
        </div>
        <button
          onClick={handleBack}
          className='mt-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all'
        >
          ← Back to Approvals
        </button>
      </div>
    );
  }

  return (
    <div
      className='rounded-2xl border border-slate-800 overflow-hidden sticky top-20'
      style={{ background: "#0d1f3c" }}
    >
      {/* Header */}
      <div
        className='px-5 py-4 border-b border-slate-800'
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-0.5'>
          Admin Decision
        </div>
        <div
          className='text-[14px] font-bold text-slate-100'
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {approval.title}
        </div>
        <div className='text-[11px] text-slate-500 mt-1'>
          {approval.type} · {approval.date} · {approval.id}
        </div>
      </div>

      <div className='p-5 space-y-4'>
        {/* ── Idle: two action buttons ── */}
        {view === "idle" && (
          <>
            <button
              onClick={handleApprove}
              disabled={loading}
              className='w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-[13px] font-semibold transition-all disabled:opacity-50'
              style={{
                background: "linear-gradient(135deg, #00e5a0, #00b87a)",
                boxShadow: "0 4px 16px rgba(0,229,160,0.2)",
              }}
            >
              {loading ? (
                <svg
                  className='animate-spin'
                  width={14}
                  height={14}
                  viewBox='0 0 24 24'
                  fill='none'
                >
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='white'
                    strokeWidth='3'
                    strokeOpacity='0.3'
                  />
                  <path
                    d='M12 2a10 10 0 0 1 10 10'
                    stroke='white'
                    strokeWidth='3'
                    strokeLinecap='round'
                  />
                </svg>
              ) : (
                <Check size={15} />
              )}
              Approve {approval.type}
            </button>

            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => setView("note")}
                className='flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all'
                style={{
                  background: "rgba(74,158,255,0.1)",
                  border: "1px solid rgba(74,158,255,0.2)",
                  color: "#4a9eff",
                }}
              >
                <Send size={13} />
                Send Note
              </button>
              <button
                onClick={() => setView("reject-confirm")}
                className='flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all'
                style={{
                  background: "rgba(255,71,87,0.1)",
                  border: "1px solid rgba(255,71,87,0.2)",
                  color: "#ff4757",
                }}
              >
                <X size={13} />
                Reject
              </button>
            </div>

            <p className='text-[11px] text-slate-600 text-center leading-relaxed'>
              Use <span className='text-blue-400'>Send Note</span> to ask for changes without
              rejecting. Use <span className='text-red-400'>Reject</span> to decline with a reason
              sent to the submitter.
            </p>
          </>
        )}

        {/* ── Send note view ── */}
        {view === "note" && (
          <>
            <div>
              <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block'>
                Feedback / Change Request
              </label>
              <textarea
                className='w-full rounded-xl p-3.5 text-[13px] text-slate-100 outline-none transition-all resize-none placeholder:text-slate-600'
                style={{
                  background: "#070f1e",
                  border: "1px solid #1a3158",
                }}
                rows={5}
                placeholder={`e.g. "The introduction section needs more depth. Please add at least 2 more lessons covering the fundamentals before diving into advanced topics."`}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                autoFocus
                onFocus={e => (e.target.style.borderColor = "#da7c36")}
                onBlur={e => (e.target.style.borderColor = "#1a3158")}
              />
              <div className='flex justify-end mt-1'>
                <span className='font-mono text-[10px] text-slate-600'>
                  {noteText.length} chars
                </span>
              </div>
            </div>

            {/* Notify toggle */}
            <div
              className='flex items-center justify-between rounded-xl p-3.5'
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <div className='text-[13px] font-semibold text-slate-200'>Notify {approval.by}</div>
                <div className='text-[11px] text-slate-500 mt-0.5'>Send feedback by email</div>
              </div>
              <button
                onClick={() => setNotifyUser(!notifyUser)}
                className='w-10 h-5.5 rounded-full relative transition-all shrink-0'
                style={{ background: notifyUser ? "#da7c36" : "#1a3158" }}
              >
                <div
                  className='w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-md'
                  style={{ left: notifyUser ? 22 : 3 }}
                />
              </button>
            </div>

            <div className='flex gap-2'>
              <button
                onClick={() => setView("idle")}
                className='flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-[13px] font-semibold hover:bg-slate-800 transition-all'
              >
                Cancel
              </button>
              <button
                onClick={handleSendNote}
                disabled={!noteText.trim() || loading}
                className='flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2'
                style={{
                  background: "linear-gradient(135deg, #4a9eff, #1a6fd4)",
                  boxShadow: noteText.trim() ? "0 4px 14px rgba(74,158,255,0.2)" : "none",
                }}
              >
                {loading ? (
                  <svg
                    className='animate-spin'
                    width={13}
                    height={13}
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='white'
                      strokeWidth='3'
                      strokeOpacity='0.3'
                    />
                    <path
                      d='M12 2a10 10 0 0 1 10 10'
                      stroke='white'
                      strokeWidth='3'
                      strokeLinecap='round'
                    />
                  </svg>
                ) : (
                  <Send size={13} />
                )}
                Send Note
              </button>
            </div>
          </>
        )}

        {/* ── Reject view ── */}
        {view === "reject-confirm" && (
          <>
            <div
              className='rounded-xl p-3.5 flex gap-2.5 items-start'
              style={{
                background: "rgba(255,71,87,0.06)",
                border: "1px solid rgba(255,71,87,0.15)",
              }}
            >
              <AlertTriangle
                size={14}
                color='#ff4757'
                className='shrink-0 mt-0.5'
              />
              <div className='text-[11px] text-red-300/80 leading-relaxed'>
                Rejection will notify the submitter and move this item to the rejected queue. This
                action can be reversed by an admin.
              </div>
            </div>

            {/* Reason selection */}
            <div>
              <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block'>
                Reason for Rejection <span className='text-red-500'>*</span>
              </label>
              <div className='space-y-1.5'>
                {reasons.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedReason(r)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-[12px] font-medium transition-all cursor-pointer ${
                      selectedReason === r ? "text-red-400" : "text-slate-400 hover:text-slate-200"
                    }`}
                    style={{
                      background:
                        selectedReason === r ? "rgba(255,71,87,0.08)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${selectedReason === r ? "rgba(255,71,87,0.25)" : "rgba(255,255,255,0.05)"}`,
                    }}
                  >
                    {r}
                    {selectedReason === r && (
                      <X
                        size={12}
                        color='#ff4757'
                      />
                    )}
                  </button>
                ))}
              </div>

              {selectedReason === "Other" && (
                <textarea
                  className='mt-2 w-full rounded-xl p-3.5 text-[13px] text-slate-100 outline-none transition-all resize-none placeholder:text-slate-600'
                  style={{ background: "#070f1e", border: "1px solid #1a3158" }}
                  rows={3}
                  placeholder='Describe the reason...'
                  value={reasonOther}
                  onChange={e => setReasonOther(e.target.value)}
                  autoFocus
                  onFocus={e => (e.target.style.borderColor = "#ff4757")}
                  onBlur={e => (e.target.style.borderColor = "#1a3158")}
                />
              )}
            </div>

            {/* Notify toggle */}
            <div
              className='flex items-center justify-between rounded-xl p-3.5'
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <div className='text-[13px] font-semibold text-slate-200'>Notify {approval.by}</div>
                <div className='text-[11px] text-slate-500 mt-0.5'>
                  Send rejection reason by email
                </div>
              </div>
              <button
                onClick={() => setNotifyUser(!notifyUser)}
                className='w-10 h-5.5 rounded-full relative transition-all shrink-0'
                style={{ background: notifyUser ? "#da7c36" : "#1a3158" }}
              >
                <div
                  className='w-4 h-4 rounded-full bg-white absolute top-0.75 transition-all shadow-md'
                  style={{ left: notifyUser ? 22 : 3 }}
                />
              </button>
            </div>

            <div className='flex gap-2'>
              <button
                onClick={() => setView("idle")}
                className='flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-[13px] font-semibold hover:bg-slate-800 transition-all'
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!finalRejectNote || loading}
                className='flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2'
                style={{
                  background: "linear-gradient(135deg, #ff4757, #c0392b)",
                  boxShadow: finalRejectNote ? "0 4px 14px rgba(255,71,87,0.25)" : "none",
                }}
              >
                {loading ? (
                  <svg
                    className='animate-spin'
                    width={13}
                    height={13}
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='white'
                      strokeWidth='3'
                      strokeOpacity='0.3'
                    />
                    <path
                      d='M12 2a10 10 0 0 1 10 10'
                      stroke='white'
                      strokeWidth='3'
                      strokeLinecap='round'
                    />
                  </svg>
                ) : (
                  <X size={13} />
                )}
                Confirm Rejection
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
