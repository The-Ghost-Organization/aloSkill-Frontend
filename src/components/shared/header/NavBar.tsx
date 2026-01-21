"use client";

import Toast from "@/components/toast/successToast.tsx";
import { useLogout } from "@/hooks/useLogout.ts";
import {
  Bell,
  BookOpen,
  ChevronDown,
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingCart,
} from "lucide-react";
// import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSessionContext } from "../../../app/contexts/SessionContext.tsx";
import { courseDraftStorage } from "../../../lib/storage/courseDraftStorage.ts";
import Logo from "./Logo.tsx";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function NavBar({ onMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeRole, setActiveRole] = useState<string>("STUDENT");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // NextAuth session
  // const { data: session, status } = useSession();
  // const isLoading = status === "loading";
  // const isAuthenticated = status === "authenticated";
  // const user = session?.user;

  const { isCartUpdate, user, isLoading, isAuthenticated } = useSessionContext();
  const { logout, isLoggingOut, toast, setToast } = useLogout();

  useEffect(() => {
    if (user) {
      const roles = (user as any).role || [];
      const roleArray = Array.isArray(roles) ? roles : [roles];
      const normalizedRoles = roleArray.map((r: string) => r.toUpperCase());

      const savedRole = localStorage.getItem("activeRole");

      if (savedRole && normalizedRoles.includes(savedRole)) {
        setActiveRole(savedRole);
      } else {
        const defaultRole = normalizedRoles.includes("INSTRUCTOR") ? "INSTRUCTOR" : "STUDENT";
        setActiveRole(defaultRole);
        localStorage.setItem("activeRole", defaultRole);
      }
    }
    const getLocalData = courseDraftStorage.get<{ courseId: string; quantity: number }[]>();
    setCartCount(getLocalData?.length || 0);
  }, [user, isCartUpdate]);

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handleLogout = async () => {
    localStorage.removeItem("activeRole");

    await logout({
      callbackUrl: "/",
      onSuccess: () => {
        setIsDropdownOpen(false);
        // console.log("Logged out successfully");
      },
      onError: _error => {
        // console.error("Logout error:", error);
        setIsDropdownOpen(false);
      },
    });
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDropdownOpen(false);
  };

  // Get user's roles as normalized array
  const getUserRoles = () => {
    if (!user) return [];
    const roles = (user as any).role || [];
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.map((r: string) => r.toUpperCase());
  };

  // Check if user has multiple roles
  const hasMultipleRoles = () => {
    const roles = getUserRoles();
    return roles.length > 1;
  };

  // Switch role handler
  const handleRoleSwitch = (newRole: string) => {
    setActiveRole(newRole);
    localStorage.setItem("activeRole", newRole);

    // Navigate to the appropriate dashboard
    const path = newRole === "INSTRUCTOR" ? "/dashboard/instructor" : "/dashboard/student";
    router.push(path);
    setIsDropdownOpen(false);
  };

  // Get dashboard path based on active role
  const getDashboardPath = () => {
    if (!user) return "/dashboard";

    const roles = getUserRoles();

    // If user doesn't have the active role, default to their first role
    if (!roles.includes(activeRole)) {
      const defaultRole = roles.includes("INSTRUCTOR") ? "INSTRUCTOR" : "STUDENT";
      return defaultRole === "INSTRUCTOR" ? "/dashboard/instructor" : "/dashboard/student";
    }

    return activeRole === "INSTRUCTOR" ? "/dashboard/instructor" : "/dashboard/student";
  };

  // Get display role label
  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      STUDENT: "Student",
      INSTRUCTOR: "Instructor",
      ADMIN: "Admin",
    };
    return labels[role] || role;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Keyboard navigation - ESC to close dropdown
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className='flex items-center gap-2 p-1.5 animate-pulse'>
      <div className='w-9 h-9 rounded-full bg-gray-300'></div>
      <div className='hidden lg:flex flex-col gap-1.5'>
        <div className='w-20 h-3 bg-gray-300 rounded'></div>
        <div className='w-16 h-2.5 bg-gray-200 rounded'></div>
      </div>
    </div>
  );

  return (
    <>
      <header className='w-full bg-transparent backdrop-blur-md border-b border-gray-200/50 shadow-sm'>
        <div className='flex items-center justify-between px-4 md:px-6 py-3 max-w-full mx-auto'>
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className='lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0'
            aria-label='Toggle menu'
          >
            <Menu className='w-6 h-6 text-gray-700' />
          </button>

          {/* Logo */}
          <div className='flex-shrink-0 relative z-40'>
            <Logo />
          </div>

          {/* Category Button */}
          {/* <button className='hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-full hover:from-orange-700 hover:to-orange-500 transition-all duration-300 shadow-md hover:shadow-lg'>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
            <span className='text-sm font-medium'>Category</span>
          </button> */}

          {/* Search Bar */}
          <div className='flex-1 max-w-xl mx-4 hidden md:block'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                placeholder='Search courses, books, or topics...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className='flex items-center gap-3'>
            {/* Shopping Cart */}
            <Link href='/cart'>
              <button className='relative p-2 hover:bg-gray-100 rounded-lg transition-colors group'>
                <ShoppingCart className='w-6 h-6 text-gray-700 group-hover:text-orange-500 transition-colors' />
                {cartCount > 0 && (
                  <span className='absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Wishlist */}
            <button className='hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors group'>
              <Heart className='w-6 h-6 text-gray-700 group-hover:text-orange-500 transition-colors' />
            </button>

            {/* Notification Icon */}
            <button className='relative p-2 hover:bg-gray-100 rounded-lg transition-colors group'>
              <Bell className='w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors' />
              {(user as any)?.unreadNotifications && (user as any).unreadNotifications > 0 ? (
                <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
                  {(user as any).unreadNotifications > 9 ? "9+" : (user as any).unreadNotifications}
                </span>
              ) : (
                <span className='absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full'></span>
              )}
            </button>

            {/* User Profile, Skeleton, or Login Button */}
            {isLoading ? (
              <SkeletonLoader />
            ) : isAuthenticated && user ? (
              <div
                className='relative'
                ref={dropdownRef}
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className='flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors'
                  aria-label='User menu'
                  aria-expanded={isDropdownOpen}
                  aria-haspopup='true'
                >
                  {/* User Avatar */}
                  <div className='relative'>
                    {user && user.image ? (
                      <Image
                        width={50}
                        height={50}
                        src={user.image}
                        alt={user.name || "User"}
                        className='w-9 h-9 rounded-full object-cover border-2 border-orange-500'
                      />
                    ) : (
                      <div className='w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-semibold text-sm border-2 border-orange-500'>
                        {getInitials(user.name || "User")}
                      </div>
                    )}
                    <span className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white'></span>
                  </div>

                  {/* User Name & Role - Hidden on mobile */}
                  <div className='hidden lg:flex flex-col items-start'>
                    <span className='text-sm font-medium text-gray-900 leading-tight'>
                      {user.name}
                    </span>
                    <span className='text-xs text-gray-500 leading-tight capitalize'>
                      {getRoleLabel(activeRole)}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 hidden lg:block ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200'
                    role='menu'
                    aria-orientation='vertical'
                  >
                    {/* User Info - Mobile Only */}
                    <div className='lg:hidden px-4 py-3 border-b border-gray-100'>
                      <p className='text-sm font-medium text-gray-900'>{user.name}</p>
                      <p className='text-xs text-gray-500'>{user.email}</p>
                      <p className='text-xs text-orange-600 mt-1 capitalize'>
                        {getRoleLabel(activeRole)}
                      </p>
                    </div>

                    {/* Role Switcher - Only show if user has multiple roles */}
                    {hasMultipleRoles() && (
                      <>
                        <div className='px-4 py-2'>
                          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                            Switch Role
                          </p>
                          <div className='space-y-1'>
                            {getUserRoles().map(role => (
                              <button
                                key={role}
                                onClick={() => handleRoleSwitch(role)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                                  activeRole === role
                                    ? "bg-orange-50 text-orange-700 font-medium"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <span>{getRoleLabel(role)}</span>
                                {activeRole === role && (
                                  <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className='border-t border-gray-100 my-1'></div>
                      </>
                    )}

                    {/* Menu Items */}
                    <button
                      onClick={() => handleNavigate(getDashboardPath())}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                      role='menuitem'
                    >
                      <LayoutDashboard className='w-4 h-4' />
                      <span>Dashboard</span>
                    </button>

                    {/* Show My Courses based on active role */}
                    {activeRole === "INSTRUCTOR" && (
                      <button
                        onClick={() => handleNavigate("/dashboard/instructor/course")}
                        className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                        role='menuitem'
                      >
                        <BookOpen className='w-4 h-4' />
                        <span>My Courses</span>
                      </button>
                    )}

                    {activeRole === "STUDENT" && (
                      <button
                        onClick={() => handleNavigate("/dashboard/student/course")}
                        className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                        role='menuitem'
                      >
                        <BookOpen className='w-4 h-4' />
                        <span>My Courses</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigate("/dashboard/instructor/settings")}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                      role='menuitem'
                    >
                      <Settings className='w-4 h-4' />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => handleNavigate("/notifications")}
                      className='w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                      role='menuitem'
                    >
                      <div className='flex items-center gap-3'>
                        <Bell className='w-4 h-4' />
                        <span>Notifications</span>
                      </div>
                      {(user as any)?.unreadNotifications &&
                        (user as any).unreadNotifications > 0 && (
                          <span className='px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full'>
                            {(user as any).unreadNotifications > 99
                              ? "99+"
                              : (user as any).unreadNotifications}
                          </span>
                        )}
                    </button>

                    <div className='border-t border-gray-100 my-1'></div>

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      role='menuitem'
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className='w-4 h-4 animate-spin' />
                          <span>Logging out...</span>
                        </>
                      ) : (
                        <>
                          <LogOut className='w-4 h-4' />
                          <span>Logout</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className='px-4 md:px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-full hover:from-orange-700 hover:to-orange-500 transition-all duration-300 shadow-md hover:shadow-lg font-medium text-sm'
              >
                Login account
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className='md:hidden px-4 pb-3'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
          </div>
        </div>
      </header>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
