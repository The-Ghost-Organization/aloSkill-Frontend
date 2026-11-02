import ChatPage from "@/components/chat/ChatPage";
import { Suspense } from "react";
export default function StudentMessagePage() {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-6 text-sm text-slate-600">
          Loading messages…
        </p>
      }
    >
      <ChatPage />
    </Suspense>
  );
}
