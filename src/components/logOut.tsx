"use client";

import { getSession, signOut } from "next-auth/react";
import { useState } from "react";
import Toast from "./toast/successToast.tsx";
import { redirect } from "next/navigation";

export default function LogoutButton() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleLogout = async () => {
    const session = await getSession();

    try {
      if (session?.error) {
        setToast({
          message: session.error,
          type: "error",
        });
        redirect("/auth/signin");
      }
      if (!session?.accessToken) {
        setToast({
          message: "You are not logged in.",
          type: "error",
        });
        redirect("/auth/signin");
      }

      const response = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoutAll: false }),
      });

      const data = await response.json();

      if (response.ok) {
        await signOut({ callbackUrl: "/auth/signin" });
        setToast({ message: "You have been logged out!", type: "success" });
        redirect("/auth/signin");
      } else {
        await signOut({ callbackUrl: "/auth/signin" });
        setToast({
          message: data.message || "Logout failed, but local session cleared.",
          type: "error",
        });
      }
    } catch (_err) {
      await signOut({ callbackUrl: "/auth/signin" });
      setToast({
        message: "Error while logging out.",
        type: "error",
      });
    }
  };

  return (
    <>
      <button
        onClick={handleLogout}
        className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
      >
        Logout
      </button>

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
