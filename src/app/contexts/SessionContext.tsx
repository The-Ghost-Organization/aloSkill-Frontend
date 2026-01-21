
"use client";

import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface SessionType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface SessionContextType extends SessionType {
  isCartUpdate?: boolean;
  setCartUpdate? : React.Dispatch<React.SetStateAction<boolean>>;
}

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

  useEffect(() => {
    setSessionValue({
      user: session?.user || null,
      isLoading: status === "loading",
      isAuthenticated: status === "authenticated",
    });
  }, [session, status]);

  const contextValue = {
    ...sessionValue,
    isCartUpdate,
    setCartUpdate: setIsCartUpdate,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
};
