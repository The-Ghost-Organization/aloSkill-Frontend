import { redirect } from "next/navigation";

export default function LegacyStudentWatchVideoPage() {
  redirect("/dashboard/student/courses");
}
