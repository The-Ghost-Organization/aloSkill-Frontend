"use client";

import { apiClient } from "@/lib/api/client";
import { Bell, CheckCheck, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRealtime } from "./RealtimeProvider";

type Notification = {
  id: string;
  title: string;
  message: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
  type: string;
};

export default function NotificationCenter() {
  const { status } = useSession();
  const { socket, connected } = useRealtime();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const unread = items.filter(item => !item.isRead).length;

  useEffect(() => {
    if (status !== "authenticated") return;
    void apiClient.get<{ items: Notification[] }>("/notifications?limit=30").then(response => {
      if (response.success && response.data) setItems(response.data.items);
    });
  }, [status]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (notification: Notification) =>
      setItems(current => [notification, ...current.filter(item => item.id !== notification.id)]);
    const onRead = ({ id }: { id: string }) =>
      setItems(current => current.map(item => (item.id === id ? { ...item, isRead: true } : item)));
    const onReadAll = () => setItems(current => current.map(item => ({ ...item, isRead: true })));
    socket.on("notification:new", onNew);
    socket.on("notification:read", onRead);
    socket.on("notification:read-all", onReadAll);
    return () => {
      socket.off("notification:new", onNew);
      socket.off("notification:read", onRead);
      socket.off("notification:read-all", onReadAll);
    };
  }, [socket]);

  if (status !== "authenticated") return null;
  const read = async (notification: Notification) => {
    if (!notification.isRead) {
      setItems(current =>
        current.map(item => (item.id === notification.id ? { ...item, isRead: true } : item))
      );
      await apiClient.patch(`/notifications/${notification.id}/read`);
    }
    setOpen(false);
  };
  const readAll = async () => {
    setItems(current => current.map(item => ({ ...item, isRead: true })));
    await apiClient.patch("/notifications/read-all");
  };
  return (
    <div className='fixed right-4 top-4 z-[100]'>
      <button
        onClick={() => setOpen(value => !value)}
        aria-label='Notifications'
        className='relative grid h-11 w-11 place-items-center rounded border border-slate-700 bg-[#0d1f3c] text-slate-200 shadow-xl'
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className='absolute -right-1 -top-1 min-w-5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white'>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
        <span
          className={`absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-slate-500"}`}
        />
      </button>
      {open && (
        <div className='absolute right-0 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-700 bg-[#0d1f3c] text-white shadow-2xl'>
          <header className='flex items-center justify-between border-b border-slate-700 px-4 py-3'>
            <div>
              <h2 className='font-semibold'>Notifications</h2>
              <p className='text-[10px] text-slate-500'>
                {connected ? "Live updates connected" : "Reconnecting…"}
              </p>
            </div>
            <div className='flex gap-1'>
              <button
                onClick={() => void readAll()}
                title='Mark all read'
                className='rounded-lg p-2 text-slate-400 hover:bg-white/5'
              >
                <CheckCheck size={17} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className='rounded-lg p-2 text-slate-400 hover:bg-white/5'
              >
                <X size={17} />
              </button>
            </div>
          </header>
          <div className='max-h-[70vh] overflow-y-auto'>
            {items.length ? (
              items.map(item => (
                <Link
                  onClick={() => void read(item)}
                  key={item.id}
                  href={item.actionUrl || "#"}
                  className={`block border-b border-slate-800 px-4 py-3 hover:bg-white/5 ${item.isRead ? "" : "bg-orange-500/[0.07]"}`}
                >
                  <div className='flex gap-3'>
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? "bg-slate-700" : "bg-orange-400"}`}
                    />
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold text-slate-100'>{item.title}</p>
                      {item.message && (
                        <p className='mt-1 line-clamp-2 text-xs text-slate-400'>{item.message}</p>
                      )}
                      <p className='mt-1 text-[10px] text-slate-600'>
                        {new Date(item.createdAt).toLocaleString("en-BD")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className='p-8 text-center text-sm text-slate-500'>No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
