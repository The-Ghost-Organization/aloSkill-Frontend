import { SectionHeader } from "../Components";
import InstructorsView from "./InstructorsView";
import { getAdminInstructors } from "./action";

export default async function InstructorsPage() {
  const response = await getAdminInstructors();
  return <div className='animate-slide-up'>
    <SectionHeader title='Instructor Management' sub='Profiles, courses, sales, and applications' />
    {!response.success || !response.data ? (
      <div role='alert' className='rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300'>Could not load instructors. Please refresh and try again.</div>
    ) : <InstructorsView instructors={response.data} />}
  </div>;
}
