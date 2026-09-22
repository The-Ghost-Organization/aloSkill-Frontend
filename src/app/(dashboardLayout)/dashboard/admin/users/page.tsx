import { Plus } from "lucide-react";
import { SectionHeader } from "../Components";
import { getAllStudents } from "./action";
import StudentsTableClient from "./StudentsTableClient";

export default async function UsersPage() {
  const users = await getAllStudents();

  if (!users) {
    return <div className='text-red-500 p-10'>Failed to load users.</div>;
  }

  return (
    <div className='animate-[pageEnter_0.3s_ease-out]'>
      <SectionHeader
        title='User Management'
        sub={`${users.length} registered users`}
        action={
          <button className='inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-semibold text-[13px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all cursor-pointer border-none'>
            <Plus
              size={14}
              color='white'
            />
            Add User
          </button>
        }
      />
      <StudentsTableClient initialStudents={users} />
    </div>
  );
}
