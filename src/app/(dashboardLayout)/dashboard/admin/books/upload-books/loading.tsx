import { Loader } from "lucide-react";

export default function LoadingBookEditor() {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-slate-300' role='status' aria-live='polite'>
      <Loader size={32} className='animate-spin text-orange-500' />
      <p className='text-sm font-medium'>Opening book editor…</p>
    </div>
  );
}
