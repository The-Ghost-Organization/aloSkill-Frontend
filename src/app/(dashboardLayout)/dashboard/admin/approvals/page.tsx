import ApprovalQueue from "./ApprovalQueue";
import { getAllApprovals } from "./action";
export const dynamic = "force-dynamic";
export default async function ApprovalsPage() {
  try {
    const data = await getAllApprovals();
    return <ApprovalQueue books={data.pendingBooks ?? []} courses={data.pendingCourses ?? []} instructors={data.pendingInstructors ?? []} />;
  } catch (error) {
    return <div role="alert" className="rounded-2xl border border-red-800 bg-red-950/30 p-6 text-red-200">{error instanceof Error ? error.message : "Could not load approvals."}</div>;
  }
}
