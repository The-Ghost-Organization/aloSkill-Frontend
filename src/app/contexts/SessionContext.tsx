"use client";

import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../../lib/api/client";

interface SessionType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface SessionContextType extends SessionType {
  isCartUpdate?: boolean;
  setCartUpdate?: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[] | null;
}

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  children: {
    id: string;
    name: string;
  }[];
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SessionContextProvider>{children}</SessionContextProvider>
    </NextAuthSessionProvider>
  );
}

function SessionContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [sessionValue, setSessionValue] = useState<SessionType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [isCartUpdate, setIsCartUpdate] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await apiClient.get<Category[]>("/course/category");
        if (response.success && response.data) {
          setCategories(response.data);
          return;
        }
      } catch (_error) {
        return undefined;
      }
    };
    getCategories();
    setSessionValue({
      user: session?.user || null,
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated",
    });
  }, [session, status]);

  const contextValue = {
    ...sessionValue,
    isCartUpdate,
    categories,
    setCartUpdate: setIsCartUpdate,
  };

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
}

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
};
