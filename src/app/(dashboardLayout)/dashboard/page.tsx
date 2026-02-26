import { authOptions } from "@/app/api/auth/[...nextauth]/route.ts";
import LogoutButton from "@/components/logOut.tsx";
import LogoutAllDevicesButton from "@/components/logoutAll.tsx";
import { getServerSession } from "next-auth";

const Dashboard = async () => {
  const user = await getServerSession(authOptions);
  return (
    <div className='flex flex-col items-center justify-center h-screen '>
      <h3>hello I am Dashboard page {user?.user.role}</h3>
      <LogoutButton />
      <LogoutAllDevicesButton />
    </div>
  );
};

export default Dashboard;
