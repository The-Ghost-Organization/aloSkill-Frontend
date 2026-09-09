"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`flex bg-[#070F1D]`}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className='flex flex-col flex-1 min-w-0'>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className={`animate-page-enter p-6`}>{children}</main>
      </div>
    </div>
  );
}
