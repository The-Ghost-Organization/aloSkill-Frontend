"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_MESSAGE = "Assalamu Alaikum, I need help with AloSkill.";

function normalizeWhatsAppNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 32 32'
      aria-hidden='true'
      className={className}
      fill='currentColor'
    >
      <path d='M16.04 3C8.86 3 3.02 8.73 3.02 15.78c0 2.25.6 4.45 1.75 6.38L3 28.58l6.62-1.72a13.12 13.12 0 0 0 6.41 1.66h.01c7.18 0 13.02-5.73 13.02-12.78C29.06 8.71 23.22 3 16.04 3Zm0 23.36h-.01a10.98 10.98 0 0 1-5.6-1.5l-.4-.23-3.93 1.02 1.05-3.76-.26-.39a10.5 10.5 0 0 1-1.7-5.72c0-5.87 4.87-10.64 10.86-10.64 2.9 0 5.62 1.11 7.66 3.12a10.45 10.45 0 0 1 3.18 7.5c0 5.86-4.87 10.63-10.85 10.63Zm5.96-7.96c-.33-.16-1.94-.94-2.24-1.05-.3-.11-.52-.16-.74.16-.22.33-.85 1.05-1.04 1.27-.19.22-.38.25-.71.08-.33-.16-1.38-.5-2.63-1.58a9.88 9.88 0 0 1-1.82-2.22c-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.05-.41-.03-.57-.08-.16-.74-1.75-1.01-2.4-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.33-1.15 1.1-1.15 2.68 0 1.58 1.18 3.11 1.34 3.32.16.22 2.31 3.46 5.6 4.85.78.33 1.39.53 1.87.68.79.24 1.5.21 2.07.13.63-.09 1.94-.78 2.21-1.53.27-.75.27-1.39.19-1.53-.08-.13-.3-.21-.63-.37Z' />
    </svg>
  );
}

export default function WhatsAppQuickContact() {
  const [showHint, setShowHint] = useState(true);
  const number = normalizeWhatsAppNumber(process.env["NEXT_PUBLIC_WHATSAPP_NUMBER"] ?? "");

  const href = useMemo(() => {
    if (!number) return "";
    const message = process.env["NEXT_PUBLIC_WHATSAPP_MESSAGE"]?.trim() || DEFAULT_MESSAGE;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }, [number]);

  // Do not render a broken contact action when the number is not configured.
  if (!href) return null;

  return (
    <div className='fixed bottom-5 right-4 z-[70] flex items-end gap-3 sm:bottom-7 sm:right-7'>
      {showHint && (
        <div className='relative hidden max-w-[240px] rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-9 shadow-xl sm:block'>
          <button
            type='button'
            onClick={() => setShowHint(false)}
            className='absolute right-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700'
            aria-label='Hide WhatsApp help message'
          >
            <X className='h-3.5 w-3.5' />
          </button>
          <p className='text-sm font-semibold text-slate-900'>Need quick help?</p>
          <p className='mt-0.5 text-xs leading-5 text-slate-500'>
            Chat with the AloSkill team on WhatsApp.
          </p>
        </div>
      )}

      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Chat with AloSkill on WhatsApp'
        title='Chat with us on WhatsApp'
        className='group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-4 ring-white/80 transition duration-200 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 sm:h-16 sm:w-16'
      >
        <span className='absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/25 motion-reduce:hidden' />
        <WhatsAppIcon className='h-8 w-8 sm:h-9 sm:w-9' />
      </a>
    </div>
  );
}
