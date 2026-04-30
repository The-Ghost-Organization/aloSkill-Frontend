"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function QuickRejectButton({ approvalId }: { approvalId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handleClick = async () => {
    if (state !== "idle") return;
    const reason = window.prompt("Enter rejection reason (required):");
    if (!reason?.trim()) return;
    setState("loading");
    // Replace with real API call:
    // await rejectItem({ approvalId, reason })
    await new Promise(r => setTimeout(r, 800));
    setState("done");
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading" || state === "done"}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-[12px] font-semibold transition-all disabled:cursor-default"
      style={{
        background: state === "done" ? "rgba(255,71,87,0.15)" : "rgba(255,71,87,0.1)",
        border: `1px solid ${state === "done" ? "rgba(255,71,87,0.4)" : "rgba(255,71,87,0.2)"}`,
        color: "#ff4757",
      }}
    >
      {state === "loading" ? (
        <svg className="animate-spin" width={12} height={12} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#ff4757" strokeWidth="3" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#ff4757" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <X size={12} />
      )}
      {state === "done" ? "Rejected" : "Reject"}
    </button>
  );
}
