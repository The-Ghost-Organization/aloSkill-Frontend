import { MessageSquare } from "lucide-react";
import Link from "next/link";
import DashboardState from "../components/DashboardState";

export default function MessagePage() {
  return (
    <DashboardState
      kind='empty'
      icon={MessageSquare}
      title='Direct messaging is not available yet'
      description='Use the discussion and comment tools inside your course lessons for course-related questions.'
      action={
        <Link href='/dashboard/student/courses' className='rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600'>
          Go to my courses
        </Link>
      }
    />
  );
}
