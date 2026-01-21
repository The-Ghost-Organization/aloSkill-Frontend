"use client";
import { useState } from "react";
import AnnouncementBar from "./AnnouncementBar.tsx";
import NavBar from "./NavBar.tsx";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='fixed top-0 w-full z-50  backdrop-blur-md border-b border-gray-200/50 shadow-sm bg-transparent'>
      <AnnouncementBar />
      <NavBar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />
    </div>
  );
};

export default Header;
