"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SlidePanel } from "../Components";
import { updateBookStatus } from "./action";
import type { BookState } from "./books.types";

export function BookActionButtonApprove({
  bookId,
  bookData,
}: {
  bookId: string;
  bookData: BookState | undefined;
}) {
  const [updateStatusLoading, setUpdateStatusLoading] = useState<boolean>(false);

  const handleUpdateStatus = async () => {
    setUpdateStatusLoading(true);
    const updateBookRes = await updateBookStatus(bookId);
    if (!updateBookRes?.success) {
      setUpdateStatusLoading(false);
      return;
    }
    const findUpdatedBook = bookData?.bookBreakdown.find(b => b.id === bookId);
    if (findUpdatedBook) {
      findUpdatedBook.status = "APPROVED";
    }
    setUpdateStatusLoading(false);
  };

  return (
    <button
      className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer text-xs! font-semibold font-['Outfit']"
      onClick={handleUpdateStatus}
      disabled={updateStatusLoading}
    >
      {updateStatusLoading ? "Updating" : "Approve"}
    </button>
  );
}

export function BookActionButtonView() {
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  return (
    <>
      <button
        className='inline-flex items-center px-2 py-1 rounded-lg bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer'
        onClick={() => setPanelOpen(true)}
      >
        <Eye size={13} />
      </button>
      <Link href={"/dashboard/admin/books/upload-books"}>
        <button className="px-2 py-1 rounded bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer text-xs! font-semibold font-['Outfit']">
          Edit
        </button>
      </Link>
      {panelOpen && (
        <SlidePanel
          onClose={() => setPanelOpen(false)}
          title='Edit Book'
        >
          <div className='flex gap-4 mb-6'></div>
        </SlidePanel>
      )}
    </>
  );
}
