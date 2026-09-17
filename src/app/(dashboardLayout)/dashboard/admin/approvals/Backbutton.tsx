"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/approvals")}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all shrink-0"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid #1a3158",
        color: "#7a9cc4",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "#0d1f3c";
        (e.currentTarget as HTMLElement).style.color = "#e8f0fe";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        (e.currentTarget as HTMLElement).style.color = "#7a9cc4";
      }}
    >
      <ArrowLeft size={14} />
      Approvals
    </button>
  );
}
