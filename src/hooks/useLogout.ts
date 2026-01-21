
"use client";

import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogoutOptions {
  logoutAll?: boolean;
  callbackUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  const logout = async (options: LogoutOptions = {}) => {
    const { logoutAll = false, callbackUrl = "/auth/signin", onSuccess, onError } = options;

    setIsLoggingOut(true);

    try {
      const session = await getSession();

      // Check for session errors
      if (session?.error) {
        const errorMessage = session.error;
        setToast({
          message: errorMessage,
          type: "error",
        });
        onError?.(errorMessage);
        await signOut({ callbackUrl, redirect: false });
        router.push(callbackUrl);
        setIsLoggingOut(false);
        return;
      }

      // Check if user is logged in
      if (!session?.accessToken) {
        const errorMessage = "You are not logged in.";
        setToast({
          message: errorMessage,
          type: "error",
        });
        onError?.(errorMessage);
        router.push(callbackUrl);
        setIsLoggingOut(false);
        return;
      }

      // Call logout API
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoutAll }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful logout
        await signOut({ callbackUrl, redirect: false });
        setToast({ message: "You have been logged out!", type: "success" });
        onSuccess?.();
        router.push(callbackUrl);
      } else {
        // API logout failed, but clear local session anyway
        await signOut({ callbackUrl, redirect: false });
        const errorMessage = data.message || "Logout failed, but local session cleared.";
        setToast({
          message: errorMessage,
          type: "error",
        });
        onError?.(errorMessage);
        router.push(callbackUrl);
      }
    } catch (error) {
      // Error during logout process
      await signOut({ callbackUrl, redirect: false });
      const errorMessage = "Error while logging out.";
      setToast({
        message: errorMessage,
        type: "error",
      });
      onError?.(errorMessage);
      router.push(callbackUrl);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    logout,
    isLoggingOut,
    toast,
    setToast,
  };
};
