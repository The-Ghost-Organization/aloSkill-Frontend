"use client";

import { apiClient } from "@/lib/api/client";
import { Bell, CheckCheck, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
type Props = { theme?: "light" | "dark" };

export default function NotificationCenter(props: Props) {
  const { data: session, status } = useSession();
  if (status !== "authenticated") return null;
  // Remount on account change so another account's notifications cannot flash.
  return <NotificationBell key={session?.user?.id || session?.user?.email || "user"} {...props} />;
}

function NotificationBell({ theme = "light" }: Props) {
  const { socket, connected } = useRealtime();
  const pathname = usePathname();
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const mutationBusy = useRef(false);
  const [position, setPosition] = useState({ top: 64, left: 12, width: 380, maxHeight: 500 });
  const dark = theme === "dark";

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        apiClient.get<{ items: Notification[] }>("/notifications?limit=30"),
        apiClient.get<{ count: number }>("/notifications/unread-count"),
      ]);
      if (id !== requestId.current) return;
      if (!list.success || !list.data || !count.success || !count.data) {
        throw new Error("Could not load notifications. Please try again.");
      }
      setItems(list.data.items);
      setUnread(count.data.count);
      setError("");
    } catch {
      if (id === requestId.current) setError("Could not load notifications. Please try again.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => { ++requestId.current; };
  }, [refresh, connected]);

  useEffect(() => {
    if (!socket) return;
    const update = () => { void refresh(); };
    socket.on("notification:new", update);
    socket.on("notification:read", update);
    socket.on("notification:read-all", update);
    return () => {
      socket.off("notification:new", update);
      socket.off("notification:read", update);
      socket.off("notification:read-all", update);
    };
  }, [socket, refresh]);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(380, window.innerWidth - 24);
      const top = Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 160));
      setPosition({ top, width, left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)), maxHeight: Math.max(140, window.innerHeight - top - 12) });
    };
    reposition();
    panel.current?.focus();
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) setOpen(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open]);

  const markRead = async (id?: string) => {
    if (mutationBusy.current) return;
    mutationBusy.current = true;
    setBusy(true);
    try {
      const response = await apiClient.patch(id ? `/notifications/${id}/read` : "/notifications/read-all");
      if (!response.success) { setError("Could not mark notifications as read. Please try again."); return; }
      await refresh();
    } catch {
      setError("Could not mark notifications as read. Please try again.");
    } finally { mutationBusy.current = false; setBusy(false); }
  };
  const actionClass = `rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 ${dark ? "text-slate-300 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`;
  // Only internal site paths are valid notification destinations.
  const destination = (url: string | null) => url?.startsWith("/") && !url.startsWith("//") && !url.includes("\\") ? url : null;

  return (
    <div className='relative shrink-0'>
      <button
        ref={trigger}
        type='button'
        onClick={() => { setOpen(value => !value); if (!open) void refresh(); }}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={`relative grid h-11 w-11 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${dark ? "border border-[#1a3158] bg-[#070f1e] text-slate-300 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100 hover:text-orange-600"}`}
      >
        <Bell size={21} aria-hidden='true' />
        {unread > 0 && <span aria-hidden='true' className='absolute -right-1 -top-1 min-w-5 rounded-full bg-orange-600 px-1 py-0.5 text-[10px] font-bold text-white'>{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && createPortal(
        <div ref={panel} id={panelId} tabIndex={-1} role='region' aria-label='Notifications' style={position} className={`fixed z-[100] flex flex-col overflow-hidden rounded-xl border shadow-2xl ${dark ? "border-slate-700 bg-[#0d1f3c] text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}>
          <header className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${dark ? "border-slate-700" : "border-gray-100"}`}>
            <div>
              <h2 className='text-sm font-semibold'>Notifications</h2>
              <p className={`mt-0.5 text-xs ${dark ? "text-slate-300" : "text-gray-600"}`}>{unread} unread · Latest 30 updates</p>
            </div>
            <div className='flex gap-1'>
              <button type='button' onClick={() => void markRead()} disabled={busy || !unread} aria-label='Mark all notifications as read' title='Mark all as read' className={actionClass}><CheckCheck size={18} /></button>
              <button type='button' onClick={() => { setOpen(false); trigger.current?.focus(); }} aria-label='Close notifications' className={actionClass}><X size={18} /></button>
            </div>
          </header>
          {error && <div role='alert' className={`px-4 py-3 text-sm ${dark ? "bg-red-950/30 text-red-200" : "bg-red-50 text-red-700"}`}>{error} <button type='button' onClick={() => void refresh()} className='underline focus-visible:ring-2 focus-visible:ring-orange-500'>Retry</button></div>}
          <div className='min-h-0 overflow-y-auto overscroll-contain' aria-busy={loading}>
            {loading && !items.length ? <p role='status' className='flex items-center justify-center gap-2 p-8 text-sm'><Loader2 size={18} className='animate-spin' />Loading notifications…</p> : !items.length && !error ? <p className={`p-8 text-center text-sm ${dark ? "text-slate-300" : "text-gray-600"}`}>No notifications yet.</p> : items.map(item => {
              const href = destination(item.actionUrl);
              const content = <div className='flex gap-3'><span aria-hidden='true' className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? (dark ? "bg-slate-600" : "bg-gray-300") : "bg-orange-500"}`} /><div className='min-w-0'><p className='text-sm font-semibold'>{item.title}{!item.isRead && <span className='sr-only'> (Unread)</span>}</p>{item.message && <p className={`mt-1 line-clamp-2 text-xs ${dark ? "text-slate-300" : "text-gray-600"}`}>{item.message}</p>}<time dateTime={item.createdAt} className={`mt-1 block text-xs ${dark ? "text-slate-400" : "text-gray-500"}`}>{new Date(item.createdAt).toLocaleString("en-BD")}</time></div></div>;
              const className = `block w-full border-b px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 ${dark ? "border-slate-700 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"} ${!item.isRead ? (dark ? "bg-orange-500/10" : "bg-orange-50/60") : ""}`;
              return href ? <Link key={item.id} href={href} className={className} onClick={() => { if (!item.isRead) void markRead(item.id); setOpen(false); }}>{content}</Link> : <button key={item.id} type='button' className={className} disabled={busy} onClick={() => { if (!item.isRead) void markRead(item.id); }}>{content}</button>;
            })}
          </div>
        </div>, document.body
      )}
    </div>
  );
}
