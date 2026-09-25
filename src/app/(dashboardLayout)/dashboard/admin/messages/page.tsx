"use client";

import { apiClient } from "@/lib/api/client";
import { Eye, LoaderCircle, Search, ShieldCheck, X } from "lucide-react";
import { type FormEvent, useState } from "react";

type Person = { id: string; displayName: string; email: string };
type SearchResult = {
  id: string;
  content: string;
  createdAt: string;
  conversationId: string;
  sender: Person;
  participants: Person[];
};
type Conversation = {
  id: string;
  participants: Person[];
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender: Person;
  }>;
};

export default function AdminMessageSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState("");
  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setBusy(true);
    setError("");
    const response = await apiClient.get<{ items: SearchResult[]; total: number }>(
      `/chat/admin/search?q=${encodeURIComponent(query.trim())}&limit=50`
    );
    if (response.success && response.data) {
      setResults(response.data.items);
      setTotal(response.data.total);
    } else setError(response.message || "Search failed.");
    setBusy(false);
  };
  const open = async (conversationId: string) => {
    const response = await apiClient.get<Conversation>(
      `/chat/admin/conversations/${conversationId}`
    );
    if (response.success && response.data) setConversation(response.data);
  };
  return (
    <div className='space-y-5 text-slate-100'>
      <header>
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-orange-400'>
          Safety & oversight
        </p>
        <h1 className='mt-2 text-2xl font-bold'>Message search</h1>
        <p className='mt-1 max-w-3xl text-sm text-slate-500'>
          Search private message text for support, safety, or investigation. Every search and
          conversation view is recorded in the audit log.
        </p>
      </header>
      <form
        onSubmit={search}
        className='flex gap-2 rounded border border-[#1a3158] bg-[#0d1f3c] p-4'
      >
        <label className='relative flex-1'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
            size={16}
          />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            minLength={2}
            maxLength={100}
            placeholder='Search message keyword…'
            className='w-full rounded border border-[#1a3158] bg-[#071426] py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-500'
          />
        </label>
        <button
          disabled={busy || query.trim().length < 2}
          className='rounded bg-orange-500 px-5 text-sm font-semibold text-white disabled:opacity-50'
        >
          {busy ? (
            <LoaderCircle
              className='animate-spin'
              size={18}
            />
          ) : (
            "Search"
          )}
        </button>
      </form>
      {error && (
        <p className='rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300'>
          {error}
        </p>
      )}
      <section className='overflow-hidden rounded border border-[#1a3158] bg-[#0d1f3c]'>
        <div className='flex items-center justify-between border-b border-[#1a3158] px-5 py-4'>
          <h2 className='font-semibold'>Matches</h2>
          <span className='text-xs text-slate-500'>{total} results</span>
        </div>
        <div className='divide-y divide-[#1a3158]'>
          {results.length ? (
            results.map(item => (
              <article
                key={item.id}
                className='grid gap-3 p-5 md:grid-cols-[180px_1fr_auto] md:items-center'
              >
                <div>
                  <p className='truncate text-sm font-semibold'>{item.sender.displayName}</p>
                  <p className='truncate text-xs text-slate-500'>{item.sender.email}</p>
                </div>
                <div>
                  <p className='break-words text-sm text-slate-300'>{item.content}</p>
                  <p className='mt-1 text-[10px] text-slate-600'>
                    {new Date(item.createdAt).toLocaleString("en-BD")} ·{" "}
                    {item.participants.map(person => person.displayName).join(" ↔ ")}
                  </p>
                </div>
                <button
                  onClick={() => void open(item.conversationId)}
                  className='inline-flex items-center justify-center gap-2 rounded border border-[#1a3158] px-3 py-2 text-xs text-slate-300 hover:border-orange-500'
                >
                  <Eye size={14} />
                  Context
                </button>
              </article>
            ))
          ) : (
            <div className='p-12 text-center'>
              <ShieldCheck className='mx-auto text-slate-700' />
              <p className='mt-3 text-sm text-slate-500'>
                Enter a keyword to search stored messages.
              </p>
            </div>
          )}
        </div>
      </section>
      {conversation && (
        <div
          className='fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-sm'
          onMouseDown={() => setConversation(null)}
        >
          <aside
            onMouseDown={event => event.stopPropagation()}
            className='ml-auto flex h-dvh w-full max-w-2xl flex-col border-l border-[#1a3158] bg-[#071426]'
          >
            <header className='flex items-center justify-between border-b border-[#1a3158] p-5'>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-orange-400'>
                  Audited conversation view
                </p>
                <h2 className='mt-1 font-semibold'>
                  {conversation.participants.map(person => person.displayName).join(" and ")}
                </h2>
              </div>
              <button
                onClick={() => setConversation(null)}
                className='rounded p-2 text-slate-400 hover:bg-white/5'
              >
                <X size={18} />
              </button>
            </header>
            <div className='flex-1 space-y-3 overflow-y-auto p-5'>
              {conversation.messages.map(message => (
                <div
                  key={message.id}
                  className='rounded border border-[#1a3158] bg-[#0d1f3c] p-4'
                >
                  <div className='flex justify-between gap-3'>
                    <p className='text-xs font-semibold text-orange-300'>
                      {message.sender.displayName}
                    </p>
                    <p className='text-[10px] text-slate-600'>
                      {new Date(message.createdAt).toLocaleString("en-BD")}
                    </p>
                  </div>
                  <p className='mt-2 whitespace-pre-wrap break-words text-sm text-slate-300'>
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
