"use client";

import { useRealtime } from "@/components/realtime/RealtimeProvider";
import { apiClient } from "@/lib/api/client";
import {
  ArrowDown,
  ArrowLeft,
  Check,
  CheckCheck,
  LoaderCircle,
  MessageSquare,
  Mic,
  MoreVertical,
  PanelRight,
  Paperclip,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Smile,
  Star,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  dayLabel,
  inboxTime,
  initials,
  mergeMessages,
  personRole,
  timeLabel,
  type Conversation,
  type DeletedMessage,
  type Message,
  type MessagePage,
  type Person,
} from "./chat.utils";

function Avatar({ person, small = false }: { person?: Person | null; small?: boolean }) {
  return (
    <span
      className={`grid ${small ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-sm"} shrink-0 place-items-center overflow-hidden rounded-full bg-violet-100 font-semibold text-violet-700 ring-2 ring-white`}
    >
      {person?.avatarUrl ? (
        <img
          src={person.avatarUrl}
          alt=''
          width={40}
          height={40}
          className='h-full w-full object-cover'
        />
      ) : (
        initials(person?.displayName || "Unknown")
      )}
    </span>
  );
}
const action =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:opacity-50";
const iconBtn =
  "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-violet-600 focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const { socket, connected } = useRealtime();
  const params = useSearchParams();
  const targetConversation = params.get("conversation"),
    targetParticipant = params.get("participant");
  const myId = session?.user?.id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Person[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [outgoing, setOutgoing] = useState<Record<string, Message[]>>({});
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"students" | "instructors">("students");
  const [showSearch, setShowSearch] = useState(false);
  const [starred, setStarred] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [earlierLoading, setEarlierLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [inboxError, setInboxError] = useState("");
  const [threadError, setThreadError] = useState("");
  const [contactsError, setContactsError] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [newMessages, setNewMessages] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const selectedRef = useRef(selectedId),
    accountRef = useRef(myId),
    deleteRef = useRef(deleteTarget);
  selectedRef.current = selectedId;
  accountRef.current = myId;
  deleteRef.current = deleteTarget;
  const threadVersion = useRef(0),
    inboxVersion = useRef(0);
  const deletedIds = useRef(new Set<string>()),
    inFlight = useRef(new Set<string>());
  const readIds = useRef(new Map<string, string>());
  const loadedThread = useRef<string | null>(null),
    liveSequence = useRef(0),
    liveArrivals = useRef(new Map<string, number>());
  const scroller = useRef<HTMLDivElement>(null),
    composer = useRef<HTMLTextAreaElement>(null);
  const atBottom = useRef(true),
    scrollToBottom = useRef(false);
  const olderScroll = useRef<{ top: number; height: number } | null>(null);
  const contactsDialog = useRef<HTMLDialogElement>(null),
    deleteDialog = useRef<HTMLDialogElement>(null);
  const contactInput = useRef<HTMLInputElement>(null),
    cancelDelete = useRef<HTMLButtonElement>(null);

  const refreshInbox = useCallback(async () => {
    if (!myId) return null;
    const version = ++inboxVersion.current;
    const response = await apiClient.get<Conversation[]>("/chat/conversations");
    if (accountRef.current !== myId) return null;
    if (response.success && response.data) {
      if (version === inboxVersion.current) {
        setConversations(current =>
          response.data!.map(item => {
            const previous = current.find(row => row.id === item.id)?.participantLastReadAt;
            return previous &&
              (!item.participantLastReadAt || previous > item.participantLastReadAt)
              ? { ...item, participantLastReadAt: previous }
              : item;
          })
        );
        setInboxError("");
      }
      return response.data;
    }
    if (version === inboxVersion.current)
      setInboxError(response.message || "Conversations could not be loaded. Please retry.");
    return null;
  }, [myId]);

  const refreshContacts = useCallback(async () => {
    if (!myId) return;
    setContactsLoading(true);
    const response = await apiClient.get<Person[]>("/chat/contacts");
    if (accountRef.current !== myId) return;
    setContactsLoading(false);
    if (response.success && response.data) {
      setContacts(response.data);
      setContactsError("");
    } else setContactsError(response.message || "Contacts could not be loaded.");
  }, [myId]);

  const fetchThread = useCallback(
    async (id: string, before?: string, replace = false) => {
      const version = ++threadVersion.current,
        liveAtRequest = liveSequence.current;
      if (before) setEarlierLoading(true);
      else setThreadLoading(true);
      const response = await apiClient.get<MessagePage>(
        `/chat/conversations/${id}/messages?limit=50${before ? `&before=${encodeURIComponent(before)}` : ""}`
      );
      if (
        accountRef.current !== myId ||
        selectedRef.current !== id ||
        version !== threadVersion.current
      )
        return;
      setThreadLoading(false);
      setEarlierLoading(false);
      if (!response.success || !response.data) {
        setThreadError(response.message || "Messages could not be loaded. Please retry.");
        return;
      }
      const page = response.data;
      if (before && scroller.current)
        olderScroll.current = {
          top: scroller.current.scrollTop,
          height: scroller.current.scrollHeight,
        };
      if (!before) scrollToBottom.current = atBottom.current;
      setMessages(current => {
        const retained = replace
          ? current.filter(item => (liveArrivals.current.get(item.id) || 0) > liveAtRequest)
          : current;
        return mergeMessages(retained, page.items, deletedIds.current);
      });
      loadedThread.current = id;
      setCursor(page.nextCursor);
      setThreadError("");
    },
    [myId]
  );

  const markRead = useCallback(
    async (message: Message | undefined) => {
      const id = selectedRef.current;
      if (
        !id ||
        loadedThread.current !== id ||
        !message ||
        message.state ||
        message.conversationId !== id ||
        document.visibilityState !== "visible" ||
        !document.hasFocus() ||
        !atBottom.current ||
        readIds.current.get(id) === message.id
      )
        return;
      readIds.current.set(id, message.id);
      const response = await apiClient.patch(`/chat/conversations/${id}/read`, {
        messageId: message.id,
      });
      if (accountRef.current !== myId) return;
      if (response.success) void refreshInbox();
      else if (readIds.current.get(id) === message.id) readIds.current.delete(id);
    },
    [myId, refreshInbox]
  );

  useEffect(() => {
    setConversations([]);
    setContacts([]);
    setSelectedId(null);
    setMessages([]);
    setDrafts({});
    setOutgoing({});
    setDeleteTarget(null);
    setContactDialogOpen(false);
    setContactSearch("");
    setInboxError("");
    setThreadError("");
    setContactsError("");
    setDeleteError("");
    setStarting(false);
    setDeleting(false);
    setContactsLoading(false);
    setThreadLoading(false);
    setEarlierLoading(false);
    setNewMessages(false);
    loadedThread.current = null;
    liveArrivals.current.clear();
    deletedIds.current.clear();
    readIds.current.clear();
    inFlight.current.clear();
    return () => {
      threadVersion.current++;
      inboxVersion.current++;
    };
  }, [myId]);

  useEffect(() => {
    if (!myId) {
      setLoading(status === "loading");
      return;
    }
    let active = true;
    setLoading(true);
    void refreshContacts();
    void (async () => {
      const rows = await refreshInbox();
      if (!active || !rows) {
        if (active) setLoading(false);
        return;
      }
      if (targetConversation) {
        if (rows.some(row => row.id === targetConversation)) setSelectedId(targetConversation);
        else {
          setSelectedId(null);
          setInboxError("That conversation is unavailable for this account.");
        }
      } else if (targetParticipant) {
        const existing = rows.find(row => row.participant?.id === targetParticipant);
        if (existing) setSelectedId(existing.id);
        else {
          const response = await apiClient.post<{ id: string }>("/chat/conversations", {
            participantId: targetParticipant,
          });
          if (!active) return;
          if (response.success && response.data) {
            await refreshInbox();
            if (active) setSelectedId(response.data.id);
          } else setInboxError(response.message || "The conversation could not be started.");
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [myId, status, targetConversation, targetParticipant, refreshInbox, refreshContacts]);

  useEffect(() => {
    setMessages([]);
    setCursor(null);
    setThreadError("");
    setNewMessages(false);
    loadedThread.current = null;
    liveArrivals.current.clear();
    olderScroll.current = null;
    atBottom.current = true;
    scrollToBottom.current = true;
    if (selectedId) void fetchThread(selectedId);
    else {
      setThreadLoading(false);
      setEarlierLoading(false);
    }
    return () => {
      threadVersion.current++;
    };
  }, [selectedId, fetchThread]);

  const visibleMessages = useMemo(
    () =>
      mergeMessages(
        messages.filter(message => message.conversationId === selectedId),
        selectedId ? outgoing[selectedId] || [] : [],
        deletedIds.current
      ),
    [messages, outgoing, selectedId]
  );
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    if (olderScroll.current) {
      element.scrollTop =
        olderScroll.current.top + element.scrollHeight - olderScroll.current.height;
      olderScroll.current = null;
    } else if (scrollToBottom.current) {
      element.scrollTop = element.scrollHeight;
      atBottom.current = true;
      setNewMessages(false);
      scrollToBottom.current = false;
    }
    void markRead(visibleMessages.filter(message => !message.state).at(-1));
  }, [visibleMessages, markRead]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible")
        void markRead(visibleMessages.filter(message => !message.state).at(-1));
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [visibleMessages, markRead]);

  const removeMessage = useCallback(
    (message: DeletedMessage) => {
      deletedIds.current.add(`${message.conversationId}:${message.id}`);
      if (selectedRef.current === message.conversationId)
        setMessages(current => current.filter(item => item.id !== message.id));
      if (deleteRef.current?.id === message.id) setDeleteTarget(null);
      void refreshInbox();
    },
    [refreshInbox]
  );

  useEffect(() => {
    if (!socket || !myId) return;
    const onMessage = (message: Message) => {
      if (message.conversationId === selectedRef.current) {
        liveArrivals.current.set(message.id, ++liveSequence.current);
        scrollToBottom.current = atBottom.current;
        if (!scrollToBottom.current) setNewMessages(true);
        setMessages(current => mergeMessages(current, [message], deletedIds.current));
      }
      setOutgoing(current => ({
        ...current,
        [message.conversationId]: (current[message.conversationId] || []).filter(
          item =>
            !(
              item.clientId &&
              item.clientId === message.clientId &&
              item.senderId === message.senderId
            )
        ),
      }));
      void refreshInbox();
    };
    const onRead = (event: { conversationId: string; userId: string; readAt: string | null }) => {
      const readAt = event.readAt;
      if (!readAt) return;
      if (event.userId === myId) {
        void refreshInbox();
        return;
      }
      setConversations(current =>
        current.map(item =>
          item.id === event.conversationId &&
          (!item.participantLastReadAt || readAt > item.participantLastReadAt)
            ? { ...item, participantLastReadAt: readAt }
            : item
        )
      );
    };
    socket.on("message:new", onMessage);
    socket.on("message:deleted", removeMessage);
    socket.on("conversation:read", onRead);
    return () => {
      socket.off("message:new", onMessage);
      socket.off("message:deleted", removeMessage);
      socket.off("conversation:read", onRead);
    };
  }, [socket, myId, refreshInbox, fetchThread, removeMessage]);

  useEffect(() => {
    if (!connected || !myId) return;
    void refreshInbox();
    if (selectedRef.current) void fetchThread(selectedRef.current, undefined, true);
  }, [connected, myId, refreshInbox, fetchThread]);

  useEffect(() => {
    const dialog = contactsDialog.current;
    if (contactDialogOpen) {
      dialog?.showModal();
      contactInput.current?.focus();
    } else dialog?.close();
  }, [contactDialogOpen]);
  useEffect(() => {
    if (deleteTarget) {
      setDeleteError("");
      deleteDialog.current?.showModal();
      cancelDelete.current?.focus();
    } else deleteDialog.current?.close();
  }, [deleteTarget]);

  const starKey = `chat:starred:${myId}`;
  useEffect(() => {
    try {
      setStarred(myId ? JSON.parse(localStorage.getItem(starKey) || "[]") : []);
    } catch {
      setStarred([]);
    }
  }, [myId, starKey]);
  const toggleStar = (id: string) =>
    setStarred(current => {
      const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
      try {
        localStorage.setItem(starKey, JSON.stringify(next));
      } catch {}
      return next;
    });

  const startConversation = async (person: Person) => {
    if (starting) return;
    setStarting(true);
    setContactsError("");
    const existing = conversations.find(item => item.participant?.id === person.id);
    const response = existing
      ? { success: true, data: { id: existing.id }, message: "" }
      : await apiClient.post<{ id: string }>("/chat/conversations", {
          participantId: person.id,
        });
    if (accountRef.current !== myId) return;
    setStarting(false);
    if (response.success && response.data) {
      const id = response.data.id;
      if (!existing)
        setConversations(current => [
          {
            id,
            participant: person,
            unreadCount: 0,
            lastMessageAt: null,
            lastMessage: null,
          },
          ...current,
        ]);
      setSelectedId(id);
      setContactDialogOpen(false);
      setContactSearch("");
      void refreshInbox();
    } else setContactsError(response.message || "Conversation could not be started.");
  };

  const sendMessage = async (message: Message) => {
    const id = message.conversationId;
    if (inFlight.current.has(id) || !myId) return;
    inFlight.current.add(id);
    setOutgoing(current => ({
      ...current,
      [id]: mergeMessages(
        (current[id] || []).filter(item => item.clientId !== message.clientId),
        [{ ...message, state: "sending", error: undefined }]
      ),
    }));
    if (selectedRef.current === id) scrollToBottom.current = true;
    const response = await apiClient.post<Message>(`/chat/conversations/${id}/messages`, {
      content: message.content,
      clientId: message.clientId,
    });
    if (accountRef.current !== myId) return;
    inFlight.current.delete(id);
    if (response.success && response.data?.conversationId === id) {
      liveArrivals.current.set(response.data.id, ++liveSequence.current);
      if (selectedRef.current === id) {
        scrollToBottom.current = atBottom.current;
        setMessages(current => mergeMessages(current, [response.data!], deletedIds.current));
      }
      setOutgoing(current => ({
        ...current,
        [id]: (current[id] || []).filter(item => item.clientId !== message.clientId),
      }));
      void refreshInbox();
    } else
      setOutgoing(current => ({
        ...current,
        [id]: (current[id] || []).map(item =>
          item.clientId === message.clientId
            ? {
                ...item,
                state: "failed",
                error: response.message || "Message could not be sent.",
              }
            : item
        ),
      }));
  };
  const send = () => {
    const content = (selectedId ? drafts[selectedId] || "" : "").trim();
    if (!selectedId || !myId || !content || inFlight.current.has(selectedId)) return;
    if (/[<>]/.test(content)) {
      setThreadError("Please send plain text without < or > characters.");
      return;
    }
    const clientId = crypto.randomUUID();
    const sender: Person = {
      id: myId,
      displayName: session?.user?.name || "You",
      email: session?.user?.email || "",
      avatarUrl: session?.user?.image || null,
      roles: [],
    };
    setDrafts(current => ({ ...current, [selectedId]: "" }));
    setThreadError("");
    void sendMessage({
      id: `pending:${clientId}`,
      clientId,
      conversationId: selectedId,
      senderId: myId,
      sender,
      content,
      createdAt: new Date().toISOString(),
      state: "sending",
    });
  };
  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError("");
    const response = await apiClient.delete<DeletedMessage>(
      `/chat/conversations/${deleteTarget.conversationId}/messages/${deleteTarget.id}`
    );
    if (accountRef.current !== myId) return;
    setDeleting(false);
    if (response.success && response.data) {
      removeMessage(response.data);
      setDeleteTarget(null);
      composer.current?.focus();
    } else setDeleteError(response.message || "Message could not be deleted. Please retry.");
  };

  const selected = conversations.find(item => item.id === selectedId);
  const tabOf = (item: Conversation) =>
    /instructor/i.test(personRole(item.participant)) ? "instructors" : "students";
  const filtered = conversations
    .filter(
      item =>
        tabOf(item) === tab &&
        `${item.participant?.displayName} ${item.participant?.email}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
    )
    .sort((a, b) => Number(starred.includes(b.id)) - Number(starred.includes(a.id)));
  const unreadByTab = conversations.reduce(
    (total, item) => ({ ...total, [tabOf(item)]: total[tabOf(item)] + item.unreadCount }),
    { students: 0, instructors: 0 }
  );
  const eligible = contacts.filter(person =>
    `${person.displayName} ${person.email}`
      .toLowerCase()
      .includes(contactSearch.trim().toLowerCase())
  );
  const draft = selectedId ? drafts[selectedId] || "" : "";
  const sending = selectedId
    ? (outgoing[selectedId] || []).some(item => item.state === "sending")
    : false;

  return (
    <section
      aria-label='Instructor and student messages'
      style={{
        height: "calc(100dvh - 11rem)",
        minHeight: 0,
        flexShrink: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
      className='flex h-[calc(100dvh-11rem)] min-h-0 w-full min-w-0 gap-5 overflow-hidden rounded-xl bg-[#f7f8fc] p-0 text-slate-800 md:p-4'
    >
      {/* Inbox */}
      <aside
        style={{ flex: "3 1 0px", minWidth: 0, minHeight: 0, height: "100%" }}
        className={`${selectedId ? "hidden md:flex" : "flex"} min-h-0 flex-col overflow-hidden rounded-xl bg-white`}
      >
        <header className='shrink-0 p-5 pb-3'>
          <div className='flex items-center justify-between'>
            <h1 className='text-lg font-semibold text-slate-900'>Messages</h1>
            <div className='flex items-center'>
              <button
                type='button'
                aria-label='Search conversations'
                aria-expanded={showSearch}
                onClick={() => {
                  setShowSearch(open => !open);
                  setSearch("");
                }}
                className={iconBtn}
              >
                {showSearch ? <X size={18} /> : <Search size={18} />}
              </button>
              <button
                type='button'
                aria-label='New message'
                title='New message'
                disabled={!myId || loading}
                onClick={() => setContactDialogOpen(true)}
                className={iconBtn}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          {showSearch && (
            <input
              autoFocus
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder='Search by name or email'
              aria-label='Search conversations'
              className='mt-3 w-full rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400'
            />
          )}
          <div
            role='tablist'
            className='mt-4 grid grid-cols-2 rounded-lg bg-slate-50 p-1'
          >
            {(["students", "instructors"] as const).map(t => (
              <button
                key={t}
                role='tab'
                type='button'
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-md py-2 text-sm capitalize transition-colors ${tab === t ? "bg-white font-medium text-violet-600 shadow-sm" : "text-slate-600 hover:text-violet-600"}`}
              >
                {t}
                {unreadByTab[t] > 0 && (
                  <span className='ml-1.5 rounded-full bg-violet-500 px-1.5 text-[10px] font-semibold text-white'>
                    {unreadByTab[t]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </header>

        {inboxError && (
          <div
            role='alert'
            className='shrink-0 mx-3 mb-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900'
          >
            {inboxError}
            <button
              type='button'
              className='ml-2 font-semibold underline'
              onClick={() => {
                setLoading(true);
                void refreshInbox().finally(() => setLoading(false));
              }}
            >
              Retry
            </button>
          </div>
        )}

        <ul
          style={{
            flex: "1 1 0px",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehaviorY: "contain",
          }}
          className='min-h-0 flex-1 overflow-y-auto px-2 pb-2'
        >
          {loading ? (
            <li
              role='status'
              className='flex items-center justify-center gap-2 p-8 text-sm text-slate-500'
            >
              <LoaderCircle
                className='animate-spin'
                size={17}
              />
              Loading conversations…
            </li>
          ) : !myId ? (
            <li className='p-6 text-sm text-slate-500'>Sign in to view your messages.</li>
          ) : filtered.length ? (
            filtered.map(item => {
              const isStarred = starred.includes(item.id);
              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-3.5 transition ${selectedId === item.id ? "bg-white shadow-[0_6px_20px_-8px_rgba(91,33,182,0.25)]" : "hover:bg-slate-50"}`}
                >
                  <button
                    type='button'
                    onClick={() => setSelectedId(item.id)}
                    aria-current={selectedId === item.id || undefined}
                    className='flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500'
                  >
                    <Avatar person={item.participant} />
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm font-medium text-slate-900'>
                        {item.participant?.displayName || "Unavailable account"}
                      </span>
                      <span
                        className={`block truncate text-xs ${item.unreadCount ? "font-medium text-slate-800" : "text-slate-500"}`}
                      >
                        {item.lastMessage
                          ? `${item.lastMessage.senderId === myId ? "You: " : ""}${item.lastMessage.content}`
                          : "No messages yet"}
                      </span>
                    </span>
                  </button>
                  <span className='flex shrink-0 flex-col items-end gap-1.5'>
                    <button
                      type='button'
                      onClick={() => toggleStar(item.id)}
                      aria-pressed={isStarred}
                      aria-label={isStarred ? "Unstar conversation" : "Star conversation"}
                      className='rounded focus-visible:outline-2 focus-visible:outline-violet-500'
                    >
                      <Star
                        size={16}
                        className={
                          isStarred
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 hover:text-amber-400"
                        }
                      />
                    </button>
                    {item.unreadCount > 0 ? (
                      <span
                        aria-label={`${item.unreadCount} unread`}
                        className='grid min-w-5 place-items-center rounded-full bg-violet-500 px-1.5 text-[10px] font-semibold text-white'
                      >
                        {item.unreadCount > 99 ? "99+" : item.unreadCount}
                      </span>
                    ) : (
                      <time className='text-[10px] text-slate-400'>
                        {inboxTime(item.lastMessageAt)}
                      </time>
                    )}
                  </span>
                </li>
              );
            })
          ) : (
            <li className='px-6 py-10 text-center'>
              <MessageSquare
                className='mx-auto mb-3 text-slate-300'
                size={30}
              />
              <p className='text-sm font-semibold text-slate-800'>
                {search ? "No matching conversations" : `No ${tab} conversations yet`}
              </p>
              <p className='mt-2 text-xs leading-5 text-slate-500'>
                {search
                  ? "Try another name or email address."
                  : "Message someone connected through an enrolled course."}
              </p>
              {!search && (
                <button
                  type='button'
                  onClick={() => setContactDialogOpen(true)}
                  className={`${action} mt-4 bg-violet-50 text-violet-700`}
                >
                  New message
                </button>
              )}
            </li>
          )}
        </ul>
      </aside>

      {/* Thread */}
      <div
        style={{ flex: "7 1 0px", minWidth: 0, minHeight: 0, height: "100%" }}
        className={`${selectedId ? "flex" : "hidden md:flex"} min-h-0 flex-col overflow-hidden rounded-xl bg-white`}
      >
        {selectedId ? (
          <>
            <header className='flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5'>
              <div className='flex min-w-0 items-center gap-3'>
                <button
                  type='button'
                  aria-label='Back to conversations'
                  onClick={() => setSelectedId(null)}
                  className={`${iconBtn} -ml-2 md:hidden`}
                >
                  <ArrowLeft size={18} />
                </button>
                <Avatar
                  person={selected?.participant}
                  small
                />
                <h2 className='truncate text-base font-semibold text-slate-900'>
                  {selected?.participant?.displayName || "Conversation"}
                </h2>
              </div>
              <div className='flex items-center'>
                <button
                  type='button'
                  disabled
                  title='Coming soon'
                  aria-label='Video call'
                  className={iconBtn}
                >
                  <Video size={18} />
                </button>
                <button
                  type='button'
                  disabled
                  title='Coming soon'
                  aria-label='Voice call'
                  className={iconBtn}
                >
                  <Phone size={18} />
                </button>
                <button
                  type='button'
                  title='Refresh messages'
                  aria-label='Refresh messages'
                  disabled={threadLoading}
                  onClick={() => {
                    void refreshInbox();
                    void fetchThread(selectedId, undefined, true);
                  }}
                  className={`${iconBtn} hidden sm:grid`}
                >
                  <RefreshCw
                    size={17}
                    className={threadLoading ? "animate-spin" : ""}
                  />
                </button>
                <button
                  type='button'
                  disabled
                  title='Coming soon'
                  aria-label='More'
                  className={`${iconBtn} hidden sm:grid`}
                >
                  <MoreVertical size={18} />
                </button>
                <button
                  type='button'
                  disabled
                  title='Coming soon'
                  aria-label='Details'
                  className={`${iconBtn} hidden sm:grid`}
                >
                  <PanelRight size={18} />
                </button>
              </div>
            </header>

            {!connected && (
              <p
                role='status'
                className='shrink-0 bg-amber-50 px-4 py-2 text-xs text-amber-900'
              >
                Live updates are paused. You can still send messages or refresh this conversation.
              </p>
            )}
            {threadError && (
              <div
                role='alert'
                className='shrink-0 bg-red-50 px-4 py-2 text-xs text-red-800'
              >
                {threadError}
                <button
                  type='button'
                  className='ml-2 font-semibold underline'
                  onClick={() => void fetchThread(selectedId, undefined, true)}
                >
                  Reload messages
                </button>
              </div>
            )}

            <div
              ref={scroller}
              onScroll={() => {
                const element = scroller.current;
                if (!element) return;
                atBottom.current =
                  element.scrollHeight - element.scrollTop - element.clientHeight < 80;
                if (atBottom.current) {
                  setNewMessages(false);
                  void markRead(visibleMessages.filter(message => !message.state).at(-1));
                }
              }}
              aria-label='Message history'
              style={{
                flex: "1 1 0px",
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                overscrollBehaviorY: "contain",
              }}
              className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6'
            >
              {cursor && (
                <div className='mb-5 text-center'>
                  <button
                    type='button'
                    disabled={earlierLoading}
                    onClick={() => void fetchThread(selectedId, cursor)}
                    className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-600 hover:border-violet-300 hover:text-violet-600 disabled:opacity-50'
                  >
                    {earlierLoading && (
                      <LoaderCircle
                        className='animate-spin'
                        size={14}
                      />
                    )}
                    {earlierLoading ? "Loading…" : "Load earlier messages"}
                  </button>
                </div>
              )}
              {threadLoading && (
                <p
                  role='status'
                  className='mb-5 flex items-center justify-center gap-2 text-xs text-slate-500'
                >
                  <LoaderCircle
                    className='animate-spin'
                    size={15}
                  />
                  Loading messages…
                </p>
              )}
              {!threadLoading && !visibleMessages.length && !threadError && (
                <div className='py-12 text-center'>
                  <MessageSquare
                    className='mx-auto text-violet-300'
                    size={32}
                  />
                  <h3 className='mt-3 text-sm font-semibold text-slate-800'>
                    Say hello to {selected?.participant?.displayName || "your course contact"}
                  </h3>
                  <p className='mt-2 text-xs text-slate-500'>
                    Ask a question, share an update, or follow up on a lesson.
                  </p>
                </div>
              )}

              {visibleMessages.map((message, index) => {
                const mine = message.senderId === myId,
                  previous = visibleMessages[index - 1];
                const read =
                  mine &&
                  !message.state &&
                  selected?.participantLastReadAt &&
                  new Date(message.createdAt) <= new Date(selected.participantLastReadAt);
                return (
                  <Fragment key={message.id}>
                    {(!previous ||
                      dayLabel(previous.createdAt) !== dayLabel(message.createdAt)) && (
                      <p className='my-5 text-center text-[10px] font-medium uppercase tracking-wide text-slate-400'>
                        {dayLabel(message.createdAt)}
                      </p>
                    )}
                    <div
                      className={`group mb-5 flex items-end gap-3 ${mine ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar
                        person={message.sender}
                        small
                      />
                      <div
                        className={`flex min-w-0 max-w-[calc(100%-3rem)] flex-col sm:max-w-[75%] ${mine ? "items-end" : "items-start"}`}
                      >
                        <div className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                          <p
                            className={`whitespace-pre-wrap break-words rounded-lg px-4 py-2.5 text-sm leading-6 text-slate-800 [overflow-wrap:anywhere] ${mine ? "bg-violet-50" : "bg-slate-50"}`}
                          >
                            {message.content}
                          </p>
                          <span className='flex shrink-0 items-center gap-1 pb-1 text-[11px] text-slate-400'>
                            <time title={new Date(message.createdAt).toLocaleString("en-BD")}>
                              {timeLabel(message.createdAt)}
                            </time>
                            {mine &&
                              (message.state === "sending" ? (
                                <LoaderCircle
                                  className='animate-spin'
                                  size={12}
                                  aria-label='Sending'
                                />
                              ) : message.state === "failed" ? (
                                <span className='font-semibold text-red-600'>Not sent</span>
                              ) : read ? (
                                <CheckCheck
                                  size={13}
                                  className='text-violet-500'
                                  aria-label='Read'
                                />
                              ) : (
                                <Check
                                  size={13}
                                  aria-label='Sent'
                                />
                              ))}
                            {mine && !message.state && (
                              <button
                                type='button'
                                onClick={() => setDeleteTarget(message)}
                                aria-label='Delete your message'
                                title='Delete your message'
                                className='grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </span>
                        </div>
                        {message.state === "failed" && (
                          <div className='mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800'>
                            <p>{message.error || "Your message was not sent."}</p>
                            <div className='mt-2 flex gap-4'>
                              <button
                                type='button'
                                className='font-semibold underline'
                                disabled={sending}
                                onClick={() => void sendMessage(message)}
                              >
                                Retry
                              </button>
                              <button
                                type='button'
                                className='underline'
                                onClick={() =>
                                  setOutgoing(current => ({
                                    ...current,
                                    [message.conversationId]: (
                                      current[message.conversationId] || []
                                    ).filter(item => item.id !== message.id),
                                  }))
                                }
                              >
                                Discard unsent message
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>

            {newMessages && (
              <button
                type='button'
                onClick={() => {
                  if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
                  atBottom.current = true;
                  setNewMessages(false);
                  void markRead(visibleMessages.filter(message => !message.state).at(-1));
                }}
                className='shrink-0 mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full bg-violet-500 px-4 py-1.5 text-xs font-medium text-white shadow-md hover:bg-violet-600'
              >
                <ArrowDown size={14} />
                New messages
              </button>
            )}

            <footer className='flex shrink-0 items-center gap-2 border-t border-slate-100 px-3 py-3 sm:px-5'>
              <button
                type='button'
                disabled
                title='Coming soon'
                aria-label='Emoji'
                className={iconBtn}
              >
                <Smile size={18} />
              </button>
              <button
                type='button'
                disabled
                title='Coming soon'
                aria-label='Attach file'
                className={iconBtn}
              >
                <Paperclip size={18} />
              </button>
              <span className='mx-1 h-6 w-px bg-slate-200' />
              <textarea
                ref={composer}
                value={draft}
                onChange={event =>
                  setDrafts(current => ({ ...current, [selectedId]: event.target.value }))
                }
                onKeyDown={event => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    send();
                  }
                }}
                maxLength={5000}
                rows={1}
                placeholder='Type your message'
                aria-label='Type your message'
                className='max-h-32 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none [field-sizing:content] placeholder:text-slate-400'
              />
              <button
                type='button'
                disabled
                title='Coming soon'
                aria-label='Voice message'
                className={iconBtn}
              >
                <Mic size={18} />
              </button>
              <button
                type='button'
                onClick={send}
                disabled={!draft.trim() || sending || !myId}
                aria-label='Send message'
                className='inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-violet-500 px-4 text-sm font-medium text-white hover:bg-violet-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:bg-slate-300'
              >
                {sending ? (
                  <LoaderCircle
                    className='animate-spin'
                    size={15}
                  />
                ) : (
                  <Send size={15} />
                )}
                <span className='hidden sm:inline'>Send</span>
              </button>
            </footer>
          </>
        ) : (
          <div className='grid min-h-0 flex-1 overflow-y-auto place-items-center p-8 text-center'>
            <div className='max-w-xs'>
              <span className='mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-50 text-violet-500'>
                <MessageSquare size={30} />
              </span>
              <p className='mt-5 text-sm text-slate-500'>
                Select a conversation to start messaging.
              </p>
              <button
                type='button'
                disabled={!myId || loading}
                onClick={() => setContactDialogOpen(true)}
                className={`${action} mt-5 bg-violet-500 text-white hover:bg-violet-600`}
              >
                <Plus size={16} />
                New message
              </button>
            </div>
          </div>
        )}
      </div>
      <dialog
        ref={contactsDialog}
        onCancel={() => setContactDialogOpen(false)}
        onClose={() => setContactDialogOpen(false)}
        aria-labelledby='chat-contacts-title'
        className='fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/40 '
      >
        <header className='flex items-start justify-between gap-3 border-b border-slate-200 p-5'>
          <div>
            <h2
              id='chat-contacts-title'
              className='text-lg font-bold'
            >
              New message
            </h2>
            <p className='mt-1 text-xs leading-5 text-slate-600'>
              Instructors and students connected through an enrolled course.
            </p>
          </div>
          <button
            type='button'
            aria-label='Close contacts'
            onClick={() => setContactDialogOpen(false)}
            className='rounded-md p-2 focus-visible:outline-2 focus-visible:outline-violet-500'
          >
            <X size={18} />
          </button>
        </header>
        <div className='p-4'>
          <label className='relative block'>
            <span className='sr-only'>Search eligible contacts</span>
            <Search
              size={16}
              className='absolute left-3 top-3 text-slate-400'
            />
            <input
              ref={contactInput}
              value={contactSearch}
              onChange={event => setContactSearch(event.target.value)}
              placeholder='Search by name or email'
              className='w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-500'
            />
          </label>
        </div>
        <div className='max-h-[50dvh] overflow-y-auto px-2 pb-3'>
          {contactsLoading ? (
            <p
              role='status'
              className='p-6 text-center text-sm text-slate-600'
            >
              Loading contacts…
            </p>
          ) : contactsError ? (
            <p
              role='alert'
              className='p-4 text-sm text-red-700'
            >
              {contactsError}
              <button
                type='button'
                onClick={() => void refreshContacts()}
                className='ml-2 underline'
              >
                Retry
              </button>
            </p>
          ) : !eligible.length ? (
            <p className='p-6 text-center text-sm leading-6 text-slate-600'>
              {contactSearch
                ? "No contacts match your search."
                : "No eligible contacts yet. Conversations become available through course enrollment."}
            </p>
          ) : (
            eligible.slice(0, 30).map(person => (
              <button
                type='button'
                key={person.id}
                disabled={starting}
                onClick={() => void startConversation(person)}
                className='flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-50'
              >
                <Avatar person={person} />
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-semibold'>{person.displayName}</span>
                  <span className='block truncate text-xs text-slate-500'>
                    {personRole(person)} · {person.email}
                  </span>
                </span>
                <MessageSquare
                  size={16}
                  className='text-violet-500'
                />
              </button>
            ))
          )}
          {eligible.length > 30 && (
            <p className='px-3 pt-2 text-xs text-slate-500'>
              Showing 30 contacts. Refine your search to find someone.
            </p>
          )}
        </div>
      </dialog>
      <dialog
        ref={deleteDialog}
        onCancel={event => {
          if (deleting) event.preventDefault();
          else setDeleteTarget(null);
        }}
        aria-labelledby='chat-delete-title'
        aria-describedby='chat-delete-description'
        className='fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl backdrop:bg-slate-950/40'
      >
        <h2
          id='chat-delete-title'
          className='text-lg font-bold'
        >
          Delete this message?
        </h2>
        <p
          id='chat-delete-description'
          className='mt-2 text-sm leading-6 text-slate-600'
        >
          This removes your message from the conversation for everyone. This cannot be undone.
        </p>
        {deleteError && (
          <p
            role='alert'
            className='mt-3 text-sm text-red-700'
          >
            {deleteError}
          </p>
        )}
        <div className='mt-5 flex justify-end gap-2'>
          <button
            type='button'
            ref={cancelDelete}
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
            className={`${action} border border-slate-200 text-slate-700`}
          >
            Cancel
          </button>
          <button
            type='button'
            disabled={deleting}
            onClick={() => void confirmDelete()}
            className={`${action} bg-red-600 text-white hover:bg-red-700`}
          >
            {deleting ? "Deleting…" : "Delete message"}
          </button>
        </div>
      </dialog>
    </section>
  );
}
