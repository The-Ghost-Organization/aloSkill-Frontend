"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateBookStatus } from "../books/action";

export default function QuickApproveButton({
  approvalId,
  title,
  bookId,
}: {
  approvalId: string;
  title: string;
  bookId?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const router = useRouter();

  const handleClick = async () => {
    if (state !== "idle") return;
    setState("loading");
    if (bookId) {
      const result = await updateBookStatus(bookId);
      if (!result?.success) {
        setState("idle");
        return;
      }
      router.refresh();
    } else {
      await new Promise(r => setTimeout(r, 800));
    }
    setState("done");
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading" || state === "done"}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-[12px] font-semibold transition-all disabled:cursor-default"
      style={{
        background: state === "done" ? "rgba(0,229,160,0.15)" : "rgba(0,229,160,0.1)",
        border: `1px solid ${state === "done" ? "rgba(0,229,160,0.4)" : "rgba(0,229,160,0.2)"}`,
        color: "#00e5a0",
      }}
      title={`Quick-approve: ${title}`}
    >
      {state === "loading" ? (
        <svg className="animate-spin" width={12} height={12} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#00e5a0" strokeWidth="3" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#00e5a0" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <Check size={12} />
      )}
      {state === "done" ? "Approved" : "Approve"}
    </button>
  );
}
