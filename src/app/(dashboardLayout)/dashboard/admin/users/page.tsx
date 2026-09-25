import { getAdminUsers } from "./action";
import StudentsTableClient from "./StudentsTableClient";

export default async function UsersPage() {
  const users = await getAdminUsers();
  if (!users) return <div className='p-10 text-red-400'>Failed to load users.</div>;
  return <StudentsTableClient initialUsers={users} />;
}
