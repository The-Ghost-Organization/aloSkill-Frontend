import { notFound } from "next/navigation";
import { Suspense } from "react";
import ApprovalActionPanel from "../Approvalactionpanel";
import { APPROVALS_DETAIL, getApprovalDetail } from "../Approvaldata";
import BackButton from "../Backbutton";
import BookReviewDetail from "../Bookreviewdetail";
import CourseReviewDetail from "../Coursereviewdetail";
import InstructorReviewDetail from "../Instructorreviewdetail";

// ── Skeleton shown while detail data streams in ───────────────────────────────
function DetailSkeleton() {
  return (
    <div className='space-y-4 animate-pulse'>
      <div className='h-48 rounded-2xl bg-slate-800/50' />
      <div className='h-32 rounded-2xl bg-slate-800/50' />
      <div className='h-48 rounded-2xl bg-slate-800/50' />
    </div>
  );
}

// ── Static params for build-time generation ───────────────────────────────────
export function generateStaticParams() {
  return APPROVALS_DETAIL.map(a => ({ id: a.id }));
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ApprovalReviewPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const approval = APPROVALS_DETAIL.find(a => a.id === id);
  if (!approval) notFound();

  const detail = await getApprovalDetail(id);
  if (!detail) notFound();

  const typeIcon: Record<string, string> = {
    "New Course": "📘",
    "New Instructor": "👤",
    "Book Approval": "📕",
    "Instructor KYC": "🔐",
    "Course Update": "✏️",
  };

  return (
    <div className='animate-page-enter'>
      {/* Page header */}
      <div className='flex items-center gap-4 mb-6 flex-wrap'>
        <BackButton />
        <div className='flex items-center gap-3 min-w-0'>
          <div
            className='w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0'
            style={{ background: "#0d1f3c", border: "1px solid #1a3158" }}
          >
            {typeIcon[approval.type]}
          </div>
          <div className='min-w-0'>
            <h1
              className='text-xl font-extrabold text-slate-100 leading-tight truncate'
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {approval.title}
            </h1>
            <div className='flex items-center gap-2 mt-0.5 flex-wrap'>
              <span
                className='inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold'
                style={{
                  background: "rgba(74,158,255,0.1)",
                  border: "1px solid rgba(74,158,255,0.2)",
                  color: "#4a9eff",
                }}
              >
                {approval.type}
              </span>
              {approval.priority === "High" && (
                <span
                  className='inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold'
                  style={{
                    background: "rgba(255,71,87,0.1)",
                    border: "1px solid rgba(255,71,87,0.2)",
                    color: "#ff4757",
                  }}
                >
                  🔴 High Priority
                </span>
              )}
              <span className='text-[11px] text-slate-500 font-mono'>
                {approval.by} · {approval.date} · {approval.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout: detail left, action panel right */}
      <div
        className='grid gap-6'
        style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}
      >
        {/* Left: detail panel — streamed */}
        <Suspense fallback={<DetailSkeleton />}>
          {detail.kind === "course" && <CourseReviewDetail course={detail.data} />}
          {detail.kind === "book" && <BookReviewDetail book={detail.data} />}
          {detail.kind === "instructor" && <InstructorReviewDetail instructor={detail.data} />}
        </Suspense>

        {/* Right: action panel — client */}
        <ApprovalActionPanel
          approval={approval}
        />
      </div>
    </div>
  );
}
