"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideApproval, type ApprovalType } from "./action";
export default function DecisionPanel({ type, id, title }: { type: ApprovalType; id: string; title: string }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  function decide(decision: "APPROVE" | "REJECT") {
    if (decision === "REJECT" && note.trim().length < 5) { setError("Provide a reason of at least 5 characters."); return; }
    if (!window.confirm(`${decision === "APPROVE" ? "Approve" : "Reject"} ${title}?`)) return;
    setError("");
    start(async () => { const result = await decideApproval(type, id, decision, note); if (result.success) { router.push("/dashboard/admin/approvals"); router.refresh(); } else setError(result.message); });
  }
  return <section className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="text-lg font-semibold text-white">Review decision</h2><p className="mt-2 text-sm text-slate-400">Read the submitted details before deciding. A reason is required to reject.</p><label htmlFor="approval-note" className="mt-5 block text-sm text-slate-300">Admin note / rejection reason</label><textarea id="approval-note" rows={5} maxLength={500} value={note} onChange={e => setNote(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-orange-500" placeholder="Explain the decision for the submission record" />{error && <p role="alert" className="my-3 text-sm text-red-400">{error}</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={pending} onClick={() => decide("APPROVE")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : "Approve"}</button><button type="button" disabled={pending} onClick={() => decide("REJECT")} className="rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-300 disabled:opacity-50">Reject</button></div></section>;
}
