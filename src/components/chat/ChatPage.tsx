"use client";

import { useRealtime } from "@/components/realtime/RealtimeProvider";
import { apiClient } from "@/lib/api/client";
import { LoaderCircle, MessageSquare, Plus, Search, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

type Person = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  roles: string[];
};
type Message = {
  id: string;
  clientId?: string | null;
  conversationId: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: Person;
};
type Conversation = {
  id: string;
  participant: Person | null;
  lastMessageAt: string | null;
  lastMessage: { content: string; createdAt: string } | null;
  unreadCount: number;
};

export default function ChatPage() {
  const { data: session } = useSession();
  const { socket, connected } = useRealtime();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Person[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const myId = session?.user?.id;

  const loadConversations = async () => {
    const response = await apiClient.get<Conversation[]>("/chat/conversations");
    if (response.success && response.data) {
      const data = response.data;
      setConversations(data);
      const requested =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("conversation")
          : null;
      setSelectedId(
        current =>
          current ??
          (requested && data.some(item => item.id === requested)
            ? requested
            : (data[0]?.id ?? null))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    void Promise.all([
      loadConversations(),
      apiClient
        .get<Person[]>("/chat/contacts")
        .then(response =>
          response.success && response.data ? setContacts(response.data) : undefined
        ),
    ]);
  }, []);
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    void apiClient
      .get<{ items: Message[] }>(`/chat/conversations/${selectedId}/messages?limit=50`)
      .then(response => {
        if (response.success && response.data) setMessages(response.data.items);
      });
    void apiClient
      .patch(`/chat/conversations/${selectedId}/read`)
      .then(() =>
        setConversations(current =>
          current.map(item => (item.id === selectedId ? { ...item, unreadCount: 0 } : item))
        )
      );
  }, [selectedId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (!socket) return;
    const onMessage = (message: Message) => {
      if (message.conversationId === selectedId) {
        setMessages(current =>
          current.some(
            item =>
              item.id === message.id || (message.clientId && item.clientId === message.clientId)
          )
            ? current.map(item => (item.clientId === message.clientId ? message : item))
            : [...current, message]
        );
        void apiClient.patch(`/chat/conversations/${message.conversationId}/read`);
      }
      void loadConversations();
    };
    socket.on("message:new", onMessage);
    return () => {
      socket.off("message:new", onMessage);
    };
  }, [socket, selectedId]);

  const filtered = useMemo(
    () =>
      conversations.filter(item =>
        `${item.participant?.displayName} ${item.participant?.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [conversations, search]
  );
  const selected = conversations.find(item => item.id === selectedId);
  const unusedContacts = contacts.filter(
    contact => !conversations.some(item => item.participant?.id === contact.id)
  );
  const startConversation = async (participantId: string) => {
    const response = await apiClient.post<{ id: string }>("/chat/conversations", { participantId });
    if (response.success && response.data) {
      await loadConversations();
      setSelectedId(response.data.id);
    }
  };
  const send = async () => {
    const content = text.trim();
    if (!content || !selectedId || sending) return;
    const clientId = crypto.randomUUID();
    setText("");
    setSending(true);
    const response = await apiClient.post<Message>(`/chat/conversations/${selectedId}/messages`, {
      content,
      clientId,
    });
    if (!response.success) setText(content);
    setSending(false);
  };

  return (
    <div className='overflow-hidden rounded border border-slate-200 bg-white shadow-sm'>
      <div className='grid min-h-[70vh] md:grid-cols-[320px_1fr]'>
        <aside
          className={`${selectedId ? "hidden md:flex" : "flex"} min-h-0 flex-col border-r border-slate-200`}
        >
          <header className='border-b border-slate-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='font-bold text-slate-900'>Messages</h1>
                <p className='text-xs text-slate-500'>
                  {connected ? "Connected" : "Reconnecting…"}
                </p>
              </div>
              <MessageSquare
                className='text-orange-500'
                size={20}
              />
            </div>
            <label className='relative mt-3 block'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                size={15}
              />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder='Search conversations'
                className='w-full rounded border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400'
              />
            </label>
          </header>
          {unusedContacts.length > 0 && (
            <div className='border-b border-slate-200 p-3'>
              <p className='mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                Start a conversation
              </p>
              <select
                defaultValue=''
                onChange={event => {
                  if (event.target.value) void startConversation(event.target.value);
                  event.currentTarget.value = "";
                }}
                className='w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs'
              >
                <option
                  value=''
                  disabled
                >
                  <Plus size={12} /> Select eligible contact
                </option>
                {unusedContacts.map(contact => (
                  <option
                    key={contact.id}
                    value={contact.id}
                  >
                    {contact.displayName} · {contact.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <LoaderCircle className='mx-auto mt-10 animate-spin text-orange-500' />
            ) : filtered.length ? (
              filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${selectedId === item.id ? "bg-orange-50" : ""}`}
                >
                  <div className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-600'>
                    {item.participant?.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex justify-between gap-2'>
                      <p className='truncate text-sm font-semibold text-slate-800'>
                        {item.participant?.displayName}
                      </p>
                      {item.unreadCount > 0 && (
                        <span className='rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white'>
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className='mt-1 truncate text-xs text-slate-500'>
                      {item.lastMessage?.content || "Start the conversation"}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className='p-8 text-center text-sm text-slate-500'>
                No conversations yet. You can message instructors or students connected through an
                enrollment.
              </p>
            )}
          </div>
        </aside>
        <main className={`${selectedId ? "flex" : "hidden md:flex"} min-h-0 flex-col bg-slate-50`}>
          {selected ? (
            <>
              <header className='flex items-center gap-3 border-b border-slate-200 bg-white p-4'>
                <button
                  onClick={() => setSelectedId(null)}
                  className='rounded border border-slate-200 px-2 py-1 text-xs md:hidden'
                >
                  Back
                </button>
                <div>
                  <p className='font-semibold text-slate-900'>
                    {selected.participant?.displayName}
                  </p>
                  <p className='text-xs text-slate-500'>{selected.participant?.roles.join(", ")}</p>
                </div>
              </header>
              <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
                <div className='mx-auto max-w-3xl space-y-3'>
                  {messages.map(message => {
                    const mine = message.senderId === myId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[82%] rounded px-4 py-3 ${mine ? "rounded-br-md bg-orange-500 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}
                        >
                          <p className='whitespace-pre-wrap break-words text-sm'>
                            {message.content}
                          </p>
                          <p
                            className={`mt-1 text-[9px] ${mine ? "text-orange-100" : "text-slate-400"}`}
                          >
                            {new Date(message.createdAt).toLocaleString("en-BD")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </div>
              <footer className='border-t border-slate-200 bg-white p-4'>
                <div className='mx-auto flex max-w-3xl gap-2'>
                  <textarea
                    value={text}
                    onChange={event => setText(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                    rows={1}
                    maxLength={5000}
                    placeholder='Write a message…'
                    className='min-h-11 flex-1 resize-none rounded border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400'
                  />
                  <button
                    onClick={() => void send()}
                    disabled={!text.trim() || sending}
                    className='grid h-11 w-11 place-items-center rounded bg-orange-500 text-white disabled:opacity-50'
                  >
                    {sending ? (
                      <LoaderCircle
                        className='animate-spin'
                        size={18}
                      />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className='grid flex-1 place-items-center p-8 text-center'>
              <div>
                <MessageSquare
                  className='mx-auto text-slate-300'
                  size={44}
                />
                <p className='mt-3 font-semibold text-slate-700'>Select a conversation</p>
                <p className='mt-1 text-sm text-slate-500'>
                  Your messages are saved and delivered in real time.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
