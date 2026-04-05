"use client";

import { Eye } from "lucide-react";
import { type StudentForAdmin } from "./student.type";

export const StudentStatusFilter = ({
  changeFilter,
  filter,
}: {
  changeFilter: (value: string, filter: string) => void;
  filter: string;
}) => {
  return (
    <div className='flex gap-0.5 bg-slate-950 rounded-xl p-1 border border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide'>
      {["all", "active", "suspended"].map(f => (
        <button
          key={f}
          className={`px-4.5 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer font-['Outfit'] ${
            filter === f
              ? "bg-slate-900 text-orange-400 border border-orange-500/25 shadow-md"
              : "bg-transparent text-slate-500 hover:text-slate-300"
          }`}
          onClick={() => changeFilter(f, filter)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
};

export const StudentEyeViewButton = ({
  panel,
  student,
}: {
  panel: StudentForAdmin[0] | null;
  student: any;
}) => {
  return (
    <button
      className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer'
      onClick={() => (panel = student)}
    >
      <Eye size={13} />
    </button>
  );
};

export const StudentSearchInput = ({ search }: { search: string }) => {
  return (
    <input
      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3.5 text-[13.5px] text-slate-100 font-['Outfit'] outline-none transition-all placeholder:text-slate-600 focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10"
      placeholder='Search students...'
      value={search}
      onChange={e => (search = e.target.value)}
    />
  );
};
