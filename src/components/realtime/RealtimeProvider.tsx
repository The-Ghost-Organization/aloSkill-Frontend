"use client";

import { config } from "@/config/env";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";

type RealtimeContextValue = { socket: Socket | null; connected: boolean };
const RealtimeContext = createContext<RealtimeContextValue>({ socket: null, connected: false });

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return;
    const baseUrl = config.NEXT_PUBLIC_BACKEND_BASE_URL || config.NEXT_PUBLIC_BACKEND_API_URL.replace(/\/api\/v1\/?$/, "");
    const connection = io(baseUrl, {
      path: "/socket.io",
      auth: { token: session.accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelayMax: 5000,
    });
    setSocket(connection);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    connection.on("connect", onConnect);
    connection.on("disconnect", onDisconnect);
    return () => {
      connection.off("connect", onConnect);
      connection.off("disconnect", onDisconnect);
      connection.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [session?.accessToken, status]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export const useRealtime = () => useContext(RealtimeContext);
