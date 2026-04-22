"use client";

import {
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Eye,
  Search,
  ShieldCheck,
  ShieldOff,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, Badge, ProgressBar, SlidePanel } from "../Components";
import type { StudentForAdmin } from "./student.type";

const badgeVariant: Record<string, string> = { Platinum: "purple", Gold: "gold", None: "gray" };

// ─── Manual Enroll Modal ────────────────────────────────────────────────────
function ManualEnrollModal({
  student,
  onClose,
}: {
  student: StudentForAdmin[0];
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock course list — replace with real data from props/fetch
  const courses = [
    {
      id: "c1",
      title: "Full-Stack Web Dev Bootcamp",
      instructor: "James Carter",
      price: 29,
      cat: "Development",
    },
    {
      id: "c2",
      title: "UI/UX Design Masterclass",
      instructor: "Sofia Lin",
      price: 24,
      cat: "Design",
    },
    {
      id: "c3",
      title: "Python for Data Science",
      instructor: "Ravi Patel",
      price: 19,
      cat: "Data",
    },
    {
      id: "c4",
      title: "Digital Marketing Pro",
      instructor: "Emma Walsh",
      price: 34,
      cat: "Marketing",
    },
    {
      id: "c5",
      title: "React Native for Beginners",
      instructor: "James Carter",
      price: 22,
      cat: "Development",
    },
    {
      id: "c6",
      title: "Financial Modeling Excel",
      instructor: "Omar Sheikh",
      price: 29,
      cat: "Business",
    },
  ];

  const filtered = courses.filter(
    c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()) ||
      c.cat.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCourse = courses.find(c => c.id === selected);

  const handleEnroll = async () => {
    if (!selected) return;
    setLoading(true);
    // Replace with your actual enroll API call:
    // await enrollStudent({ studentId: student.id, courseId: selected, note })
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div
      className='fixed inset-0 z-110 flex items-center justify-center'
      style={{ background: "rgba(5,13,26,0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className='w-full max-w-lg mx-4 rounded-xl border border-slate-800 overflow-hidden'
        style={{ background: "#070f1e" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-800'>
          <div className='flex items-center gap-3'>
            <div
              className='w-8 h-8 rounded-lg flex items-center justify-center'
              style={{ background: "rgba(218,124,54,0.15)" }}
            >
              <BookOpen
                size={15}
                color='#da7c36'
              />
            </div>
            <div>
              <div className="font-['Syne'] font-bold text-slate-100 text-[15px]">
                Manual Enrollment
              </div>
              <div className='text-[11px] text-slate-500 font-mono uppercase tracking-wider'>
                {student.studentProfile?.displayName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all'
          >
            <X size={15} />
          </button>
        </div>

        <div className='p-6 space-y-4 max-h-[70vh] overflow-y-auto'>
          {success ? (
            <div className='flex flex-col items-center justify-center py-8 gap-3'>
              <div
                className='w-14 h-14 rounded-full flex items-center justify-center'
                style={{
                  background: "rgba(0,229,160,0.1)",
                  border: "1px solid rgba(0,229,160,0.3)",
                }}
              >
                <Check
                  size={24}
                  color='#00e5a0'
                />
              </div>
              <div className="font-['Syne'] font-bold text-slate-100 text-[15px]">
                Enrolled Successfully
              </div>
              <div className='text-[12px] text-slate-500'>
                {student.studentProfile?.displayName} has been enrolled in {selectedCourse?.title}
              </div>
            </div>
          ) : (
            <>
              {/* Search courses */}
              <div>
                <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block'>
                  Select Course
                </label>
                <div className='relative mb-2'>
                  <Search
                    size={13}
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
                  />
                  <input
                    className='w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-8 pr-3 text-[13px] text-slate-100 outline-none focus:border-orange-500 transition-all placeholder:text-slate-600'
                    placeholder='Search by title, instructor or category...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div
                  className='rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60'
                  style={{ maxHeight: 240, overflowY: "auto" }}
                >
                  {filtered.length === 0 ? (
                    <div className='px-4 py-6 text-center text-[13px] text-slate-500'>
                      No courses found
                    </div>
                  ) : (
                    filtered.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelected(c.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all cursor-pointer ${
                          selected === c.id
                            ? "bg-orange-500/10 border-l-2 border-orange-500"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        <div>
                          <div
                            className={`text-[13px] font-semibold ${selected === c.id ? "text-orange-400" : "text-slate-200"}`}
                          >
                            {c.title}
                          </div>
                          <div className='text-[11px] text-slate-500 mt-0.5'>
                            {c.instructor} &middot; <span className='text-slate-600'>{c.cat}</span>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 flex-shrink-0 ml-3'>
                          <span className='font-mono text-[12px] font-bold text-emerald-400'>
                            ${c.price}
                          </span>
                          {selected === c.id && (
                            <Check
                              size={14}
                              color='#da7c36'
                            />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Enrollment type */}
              <div>
                <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block'>
                  Enrollment Type
                </label>
                <div className='relative'>
                  <select className='w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-3.5 pr-8 text-[13px] text-slate-100 outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer'>
                    <option value='free'>Free (Admin Override)</option>
                    <option value='paid'>Paid — Mark as Paid</option>
                    <option value='scholarship'>Scholarship</option>
                    <option value='gift'>Gift / Promotional</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
                  />
                </div>
              </div>

              {/* Access expiry */}
              <div>
                <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block'>
                  Access Expiry{" "}
                  <span className='text-slate-600 normal-case tracking-normal'>
                    (leave blank = lifetime)
                  </span>
                </label>
                <input
                  type='date'
                  className='w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3.5 text-[13px] text-slate-100 outline-none focus:border-orange-500 transition-all'
                  style={{ colorScheme: "dark" }}
                />
              </div>

              {/* Admin note */}
              <div>
                <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block'>
                  Internal Note{" "}
                  <span className='text-slate-600 normal-case tracking-normal'>(optional)</span>
                </label>
                <textarea
                  className='w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-[13px] text-slate-100 outline-none focus:border-orange-500 transition-all resize-none placeholder:text-slate-600'
                  rows={2}
                  placeholder='Reason for manual enrollment...'
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              {/* Selected summary */}
              {selectedCourse && (
                <div
                  className='rounded-xl p-3.5 flex items-center gap-3'
                  style={{
                    background: "rgba(218,124,54,0.08)",
                    border: "1px solid rgba(218,124,54,0.2)",
                  }}
                >
                  <BookOpen
                    size={15}
                    color='#da7c36'
                  />
                  <div className='flex-1 min-w-0'>
                    <div className='text-[13px] font-semibold text-orange-400 truncate'>
                      {selectedCourse.title}
                    </div>
                    <div className='text-[11px] text-slate-500'>{selectedCourse.instructor}</div>
                  </div>
                  <span className='font-mono text-[12px] font-bold text-emerald-400 flex-shrink-0'>
                    ${selectedCourse.price}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className='px-6 py-4 border-t border-slate-800 flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 py-2.5 rounded-lg border border-slate-800 text-slate-400 text-[13px] font-semibold hover:bg-slate-800 hover:text-slate-100 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={!selected || loading}
              className='flex-1 py-2.5 rounded-lg text-white text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              style={{
                background: "linear-gradient(135deg, #da7c36, #d15100)",
                boxShadow: selected ? "0 4px 14px rgba(218,124,54,0.3)" : "none",
              }}
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin'
                    width={14}
                    height={14}
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='white'
                      strokeWidth='3'
                      strokeOpacity='0.3'
                    />
                    <path
                      d='M12 2a10 10 0 0 1 10 10'
                      stroke='white'
                      strokeWidth='3'
                      strokeLinecap='round'
                    />
                  </svg>
                  Enrolling...
                </>
              ) : (
                "Confirm Enrollment"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Badge Assignment Modal ─────────────────────────────────────────────────
const BADGES = [
  {
    id: "None",
    label: "No Badge",
    color: "#7a9cc4",
    bg: "rgba(122,156,196,0.08)",
    border: "rgba(122,156,196,0.15)",
    icon: "—",
    criteria: "Default — no badge assigned",
  },
  {
    id: "Gold",
    label: "Gold",
    color: "#ffc107",
    bg: "rgba(255,193,7,0.08)",
    border: "rgba(255,193,7,0.2)",
    icon: "🥇",
    criteria: "Rating ≥ 4.5 · 5+ courses · Completion ≥ 70%",
  },
  {
    id: "Platinum",
    label: "Platinum",
    color: "#b47aff",
    bg: "rgba(180,122,255,0.08)",
    border: "rgba(180,122,255,0.2)",
    icon: "💎",
    criteria: "Rating ≥ 4.8 · 10+ courses · Completion ≥ 85%",
  },
  {
    id: "Premium",
    label: "Premium",
    color: "#da7c36",
    bg: "rgba(218,124,54,0.08)",
    border: "rgba(218,124,54,0.2)",
    icon: "⭐",
    criteria: "Manual admin assignment only",
  },
];

function BadgeAssignModal({
  student,
  onClose,
}: {
  student: StudentForAdmin[0];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string>(student.badge ?? "None");
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const changed = selected !== (student.badge ?? "None");
  const selectedBadge = BADGES.find(b => b.id === selected)!;

  const handleAssign = async () => {
    if (!changed) return;
    setLoading(true);
    // Replace with your actual badge API call:
    // await assignBadge({ studentId: student.id, badge: selected, reason, notify })
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div
      className='fixed inset-0 z-110 flex items-center justify-center'
      style={{ background: "rgba(5,13,26,0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className='w-full max-w-md mx-4 h-[calc(100vh-4rem)] rounded-xl border border-slate-800 overflow-hidden overflow-y-auto'
        style={{ background: "#070f1e" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-800'>
          <div className='flex items-center gap-3'>
            <div
              className='w-8 h-8 rounded-lg flex items-center justify-center'
              style={{ background: "rgba(180,122,255,0.15)" }}
            >
              <Award
                size={15}
                color='#b47aff'
              />
            </div>
            <div>
              <div className="font-['Syne'] font-bold text-slate-100 text-[15px]">Assign Badge</div>
              <div className='text-[11px] text-slate-500 font-mono uppercase tracking-wider'>
                {student.studentProfile?.displayName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all'
          >
            <X size={15} />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          {success ? (
            <div className='flex flex-col items-center justify-center py-8 gap-3'>
              <div
                className='w-14 h-14 rounded-full flex items-center justify-center text-3xl'
                style={{
                  background: selectedBadge.bg,
                  border: `1px solid ${selectedBadge.border}`,
                }}
              >
                {selectedBadge.icon}
              </div>
              <div className="font-['Syne'] font-bold text-slate-100 text-[15px]">
                Badge Updated
              </div>
              <div className='text-[12px] text-slate-500'>
                {student.studentProfile?.displayName} is now{" "}
                <span style={{ color: selectedBadge.color }}>{selectedBadge.label}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Current badge */}
              <div
                className='rounded-xl p-3.5 flex items-center justify-between'
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <div className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1'>
                    Current Badge
                  </div>
                  <div className='text-[13px] font-semibold text-slate-300'>
                    {BADGES.find(b => b.id === (student.badge ?? "None"))?.icon}{" "}
                    {student.badge ?? "No Badge"}
                  </div>
                </div>
                <div className='text-2xl opacity-50'>→</div>
                <div className='text-right'>
                  <div className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1'>
                    New Badge
                  </div>
                  <div
                    className='text-[13px] font-semibold'
                    style={{ color: selectedBadge.color }}
                  >
                    {selectedBadge.icon} {selectedBadge.label}
                  </div>
                </div>
              </div>

              {/* Badge options */}
              <div>
                <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block'>
                  Select Badge
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {BADGES.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelected(b.id)}
                      className='rounded-xl p-3.5 text-left transition-all cursor-pointer relative'
                      style={{
                        background: selected === b.id ? b.bg : "rgba(255,255,255,0.02)",
                        border: `1px solid ${selected === b.id ? b.border : "rgba(255,255,255,0.06)"}`,
                        boxShadow: selected === b.id ? `0 0 16px ${b.bg}` : "none",
                      }}
                    >
                      {selected === b.id && (
                        <div
                          className='absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center'
                          style={{ background: b.border }}
                        >
                          <Check
                            size={10}
                            color={b.color}
                          />
                        </div>
                      )}
                      <div className='text-xl mb-1.5'>{b.icon}</div>
                      <div
                        className='text-[13px] font-semibold'
                        style={{ color: selected === b.id ? b.color : "#e8f0fe" }}
                      >
                        {b.label}
                      </div>
                      <div className='text-[10px] text-slate-500 mt-1 leading-tight'>
                        {b.criteria}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block'>
                  Reason for Override{" "}
                  <span className='text-slate-600 normal-case tracking-normal'>(optional)</span>
                </label>
                <textarea
                  className='w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-[13px] text-slate-100 outline-none focus:border-orange-500 transition-all resize-none placeholder:text-slate-600'
                  rows={2}
                  placeholder='e.g. Exceptional contribution to the community...'
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
              </div>

              {/* Notify toggle */}
              <div
                className='flex items-center justify-between rounded-xl p-3.5'
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <div className='text-[13px] font-semibold text-slate-200'>Notify Student</div>
                  <div className='text-[11px] text-slate-500 mt-0.5'>
                    Send email notification about badge change
                  </div>
                </div>
                <button
                  onClick={() => setNotify(!notify)}
                  className='w-10 h-[22px] rounded-full relative transition-all flex-shrink-0'
                  style={{ background: notify ? "#da7c36" : "#1a3158" }}
                >
                  <div
                    className='w-4 h-4 rounded-full bg-white absolute top-[3px] transition-all shadow-md'
                    style={{ left: notify ? 22 : 3 }}
                  />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className='px-6 py-4 border-t border-slate-800 flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 py-2.5 rounded-lg border border-slate-800 text-slate-400 text-[13px] font-semibold hover:bg-slate-800 hover:text-slate-100 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!changed || loading}
              className='flex-1 py-2.5 rounded-lg text-white text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              style={{
                background: "linear-gradient(135deg, #da7c36, #d15100)",
                boxShadow: changed ? "0 4px 14px rgba(218,124,54,0.3)" : "none",
              }}
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin'
                    width={14}
                    height={14}
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='white'
                      strokeWidth='3'
                      strokeOpacity='0.3'
                    />
                    <path
                      d='M12 2a10 10 0 0 1 10 10'
                      stroke='white'
                      strokeWidth='3'
                      strokeLinecap='round'
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Confirm Assignment"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Suspend / Activate Modal ───────────────────────────────────────────────
function SuspendModal({ student, onClose }: { student: StudentForAdmin[0]; onClose: () => void }) {
  const isSuspended = student.status === "Suspended";
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isActivating = isSuspended;
  const reasonRequired = !isActivating && reason.trim().length === 0;

  const handleSubmit = async () => {
    if (reasonRequired) return;
    setLoading(true);
    // Replace with your actual API call:
    // await updateStudentStatus({ studentId: student.id, status: isActivating ? "Active" : "Suspended", reason, notify })
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
    setTimeout(onClose, 1600);
  };

  return (
    <div
      className='fixed inset-0 z-110 flex items-center justify-center'
      style={{ background: "rgba(5,13,26,0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className='w-full max-w-md mx-4 h-[calc(100vh-4rem)] rounded-xl border overflow-hidden overflow-y-auto'
        style={{
          background: "#070f1e",
          borderColor: isActivating ? "rgba(0,229,160,0.2)" : "rgba(255,71,87,0.2)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className='flex items-center justify-between px-6 py-4 border-b'
          style={{ borderColor: isActivating ? "rgba(0,229,160,0.12)" : "rgba(255,71,87,0.12)" }}
        >
          <div className='flex items-center gap-3'>
            <div
              className='w-8 h-8 rounded-lg flex items-center justify-center'
              style={{
                background: isActivating ? "rgba(0,229,160,0.12)" : "rgba(255,71,87,0.12)",
              }}
            >
              {isActivating ? (
                <ShieldCheck
                  size={15}
                  color='#00e5a0'
                />
              ) : (
                <ShieldOff
                  size={15}
                  color='#ff4757'
                />
              )}
            </div>
            <div>
              <div className="font-['Syne'] font-bold text-slate-100 text-[15px]">
                {isActivating ? "Activate Account" : "Suspend Account"}
              </div>
              <div className='text-[11px] text-slate-500 font-mono uppercase tracking-wider'>
                {student.studentProfile?.displayName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all'
          >
            <X size={15} />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          {success ? (
            <div className='flex flex-col items-center justify-center py-8 gap-3'>
              <div
                className='w-14 h-14 rounded-full flex items-center justify-center'
                style={{
                  background: isActivating ? "rgba(0,229,160,0.1)" : "rgba(255,71,87,0.1)",
                  border: `1px solid ${isActivating ? "rgba(0,229,160,0.3)" : "rgba(255,71,87,0.3)"}`,
                }}
              >
                <Check
                  size={24}
                  color={isActivating ? "#00e5a0" : "#ff4757"}
                />
              </div>
              <div className="font-['Syne'] font-bold text-slate-100 text-[15px]">
                {isActivating ? "Account Activated" : "Account Suspended"}
              </div>
              <div className='text-[12px] text-slate-500 text-center'>
                {student.studentProfile?.displayName}&apos;s account has been{" "}
                <span style={{ color: isActivating ? "#00e5a0" : "#ff4757" }}>
                  {isActivating ? "activated" : "suspended"}
                </span>
                {notify && " and they have been notified by email."}
              </div>
            </div>
          ) : (
            <>
              {/* Warning / info banner */}
              <div
                className='rounded-xl p-4 flex gap-3 items-start'
                style={{
                  background: isActivating ? "rgba(0,229,160,0.06)" : "rgba(255,71,87,0.06)",
                  border: `1px solid ${isActivating ? "rgba(0,229,160,0.15)" : "rgba(255,71,87,0.15)"}`,
                }}
              >
                <div className='text-lg leading-none mt-0.5'>{isActivating ? "✅" : "⚠️"}</div>
                <div>
                  <div
                    className='text-[13px] font-semibold mb-1'
                    style={{ color: isActivating ? "#00e5a0" : "#ff4757" }}
                  >
                    {isActivating ? "Restore full access" : "This will block all access"}
                  </div>
                  <div className='text-[12px] text-slate-500 leading-relaxed'>
                    {isActivating
                      ? "The student will regain access to all their enrolled courses, purchases, and platform features immediately."
                      : "The student will be logged out and unable to access any courses, content, or make purchases until reactivated."}
                  </div>
                </div>
              </div>

              {/* Student summary */}
              <div
                className='rounded-xl p-3.5 flex items-center gap-3'
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className='flex-1 min-w-0 divide-y divide-slate-800/60'>
                  {[
                    ["Email", student.email],
                    ["Current Status", student.status],
                    ["Enrolled Courses", String(student._count.enrollments)],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className='flex justify-between py-1.5 first:pt-0 last:pb-0'
                    >
                      <span className='font-mono text-[10px] uppercase tracking-wider text-slate-500'>
                        {k}
                      </span>
                      <span
                        className='text-[12px] font-medium'
                        style={{
                          color:
                            k === "Current Status"
                              ? student.status === "Active"
                                ? "#00e5a0"
                                : "#ff4757"
                              : "#e8f0fe",
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason textarea — required for suspend, optional for activate */}
              <div>
                <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5'>
                  {isActivating ? "Reason for Reactivation" : "Reason for Suspension"}
                  {!isActivating && (
                    <span className='text-red-500 normal-case tracking-normal font-sans text-[10px]'>
                      * required
                    </span>
                  )}
                  {isActivating && (
                    <span className='text-slate-600 normal-case tracking-normal font-sans text-[10px]'>
                      (optional)
                    </span>
                  )}
                </label>
                <textarea
                  className={`w-full bg-slate-950 border rounded-lg p-3.5 text-[13px] text-slate-100 outline-none transition-all resize-none placeholder:text-slate-600 ${
                    !isActivating && reason.trim().length === 0
                      ? "border-slate-800 focus:border-red-500/60"
                      : "border-slate-800 focus:border-orange-500"
                  }`}
                  rows={3}
                  placeholder={
                    isActivating
                      ? "e.g. Issue resolved, account reinstated after review..."
                      : "e.g. Violation of terms of service — repeated spam in reviews..."
                  }
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
                {!isActivating && reason.trim().length === 0 && (
                  <p className='text-[11px] text-red-400/70 mt-1.5'>
                    A reason is required before suspending an account.
                  </p>
                )}
              </div>

              {/* Duration (suspend only) */}
              {!isActivating && (
                <div>
                  <label className='font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2 block'>
                    Suspension Duration{" "}
                    <span className='text-slate-600 normal-case tracking-normal font-sans'>
                      (leave blank = indefinite)
                    </span>
                  </label>
                  <div className='relative'>
                    <select className='w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-3.5 pr-8 text-[13px] text-slate-100 outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer'>
                      <option value=''>Indefinite</option>
                      <option value='1d'>1 Day</option>
                      <option value='3d'>3 Days</option>
                      <option value='7d'>7 Days</option>
                      <option value='14d'>14 Days</option>
                      <option value='30d'>30 Days</option>
                      <option value='custom'>Custom Date</option>
                    </select>
                    <ChevronDown
                      size={13}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
                    />
                  </div>
                </div>
              )}

              {/* Notify toggle */}
              <div
                className='flex items-center justify-between rounded-xl p-3.5'
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <div className='text-[13px] font-semibold text-slate-200'>
                    Notify Student by Email
                  </div>
                  <div className='text-[11px] text-slate-500 mt-0.5'>
                    {isActivating
                      ? "Send a reactivation confirmation to the student"
                      : "Send a suspension notice with the reason to the student"}
                  </div>
                </div>
                <button
                  onClick={() => setNotify(!notify)}
                  className='w-10 h-[22px] rounded-full relative transition-all flex-shrink-0 ml-4'
                  style={{ background: notify ? "#da7c36" : "#1a3158" }}
                >
                  <div
                    className='w-4 h-4 rounded-full bg-white absolute top-[3px] transition-all shadow-md'
                    style={{ left: notify ? 22 : 3 }}
                  />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div
            className='px-6 py-4 border-t flex gap-3'
            style={{ borderColor: isActivating ? "rgba(0,229,160,0.12)" : "rgba(255,71,87,0.12)" }}
          >
            <button
              onClick={onClose}
              className='flex-1 py-2.5 rounded-lg border border-slate-800 text-slate-400 text-[13px] font-semibold hover:bg-slate-800 hover:text-slate-100 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={reasonRequired || loading}
              className='flex-1 py-2.5 rounded-lg text-white text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              style={{
                background: isActivating
                  ? "linear-gradient(135deg, #00e5a0, #00b87a)"
                  : "linear-gradient(135deg, #ff4757, #c0392b)",
                boxShadow: !reasonRequired
                  ? isActivating
                    ? "0 4px 14px rgba(0,229,160,0.25)"
                    : "0 4px 14px rgba(255,71,87,0.25)"
                  : "none",
              }}
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin'
                    width={14}
                    height={14}
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='white'
                      strokeWidth='3'
                      strokeOpacity='0.3'
                    />
                    <path
                      d='M12 2a10 10 0 0 1 10 10'
                      stroke='white'
                      strokeWidth='3'
                      strokeLinecap='round'
                    />
                  </svg>
                  {isActivating ? "Activating..." : "Suspending..."}
                </>
              ) : (
                <>
                  {isActivating ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                  {isActivating ? "Confirm Activation" : "Confirm Suspension"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function StudentsTableClient({
  initialStudents,
}: {
  initialStudents: StudentForAdmin;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [panel, setPanel] = useState<StudentForAdmin[0] | null>(null);
  const [enrollModal, setEnrollModal] = useState(false);
  const [badgeModal, setBadgeModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);

  const filtered = useMemo(() => {
    return initialStudents.filter(s => {
      const matchesSearch =
        s.studentProfile?.displayName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.studentProfile?.encryptedPhone.toLowerCase().includes(search.toLowerCase());

      if (filter === "active") return matchesSearch && s.status === "Active";
      if (filter === "suspended") return matchesSearch && s.status === "Suspended";
      return matchesSearch;
    });
  }, [search, filter, initialStudents]);

  return (
    <>
      {/* Filters */}
      <div className='flex gap-3 mb-5 items-center flex-wrap'>
        <div className='relative flex-1 max-w-90'>
          <Search
            size={14}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
          />
          <input
            className='w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3.5 text-[13.5px] text-slate-100 outline-none focus:border-orange-500'
            placeholder='Search students...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className='flex gap-0.5 bg-slate-950 rounded-xl p-1 border border-slate-800 overflow-x-auto'>
          {["all", "active", "suspended"].map(f => (
            <button
              key={f}
              className={`px-4.5 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                filter === f
                  ? "bg-slate-900 text-orange-400 border border-orange-500/25"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className='bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-bottom border-slate-800'>
                {[
                  "Student",
                  "Phone",
                  "Courses",
                  "Spend",
                  "Badge",
                  "Status",
                  "Joined",
                  "Actions",
                ].map(h => (
                  <th
                    key={h}
                    className='bg-slate-950/50 text-slate-500 text-[11px] font-semibold uppercase p-3.5 px-4 text-left border-b border-slate-800'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800/50'>
              {filtered.map((s, i) => (
                <tr
                  key={i}
                  className='transition-colors hover:bg-slate-800/40'
                >
                  <td className='p-4 px-4.5'>
                    <div className='flex items-center gap-3'>
                      <Avatar
                        name={s.studentProfile?.displayName as string}
                        size={34}
                      />
                      <div>
                        <div className='font-semibold text-slate-100'>
                          {s.studentProfile?.displayName}
                        </div>
                        <div className='text-xs text-slate-500'>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className='p-4 px-4.5 text-xs text-slate-400'>
                    {s.studentProfile?.encryptedPhone}
                  </td>
                  <td className='p-4 px-4.5'>
                    <Badge variant='blue'>{s._count.enrollments}</Badge>
                  </td>
                  <td className='p-4 px-4.5 text-emerald-400 font-semibold'>{s.orders.length}</td>
                  <td className='p-4 px-4.5'>
                    <Badge variant={badgeVariant[s.badge]}>{s.badge}</Badge>
                  </td>
                  <td className='p-4 px-4.5'>
                    <Badge variant={s.status === "Active" ? "green" : "red"}>{s.status}</Badge>
                  </td>
                  <td className='p-4 px-4.5 text-slate-500'>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className='p-4 px-4.5'>
                    <button
                      onClick={() => setPanel(s)}
                      className='p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400'
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Panel */}
      {panel && (
        <SlidePanel
          onClose={() => setPanel(null)}
          title='Student Profile'
        >
          <div className='flex gap-4 mb-6'>
            <Avatar
              name={panel.studentProfile?.displayName as string}
              size={56}
            />
            <div>
              <div className="font-bold text-lg text-slate-100 font-['Syne']">
                {panel.studentProfile?.displayName}
              </div>
              <div className='text-[13px] text-slate-500'>{panel.email}</div>
              <div className='flex gap-2 mt-2'>
                <Badge variant={panel.status === "Active" ? "green" : "red"}>{panel.status}</Badge>
                <Badge variant={badgeVariant[panel.badge]}>{panel.badge}</Badge>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-2.5 mb-5'>
            {[
              { l: "Courses", v: panel._count.enrollments },
              { l: "Total Spend", v: panel.orders.length },
              { l: "Completion", v: `${10}%` },
            ].map(s => (
              <div
                key={s.l}
                className='bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center'
              >
                <div className="font-['Syne'] text-xl font-bold text-orange-500">{s.v}</div>
                <div className='font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-1'>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div className='mb-5'>
            <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-2'>
              Completion Progress
            </div>
            <ProgressBar value={panel.pct} />
          </div>

          <div className='bg-slate-900 rounded-xl border border-slate-800 p-4 mb-5 divide-y divide-slate-800'>
            {[
              ["Phone", panel.studentProfile?.encryptedPhone || "N/A"],
              ["Joined", panel.createdAt.slice(0, 10)],
              ["Badge", panel.badge],
            ].map(([k, v]) => (
              <div
                key={k}
                className='flex justify-between py-2 first:pt-0 last:pb-0'
              >
                <span className='font-mono text-[11px] uppercase tracking-wider text-slate-500'>
                  {k}
                </span>
                <span className='text-[13px] text-slate-100 font-medium'>{v}</span>
              </div>
            ))}
          </div>

          <div className='grid grid-cols-2 gap-2 mb-3'>
            <button
              onClick={() => setEnrollModal(true)}
              className="flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-['Outfit'] font-semibold text-[13px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all cursor-pointer"
            >
              <BookOpen size={13} />
              Manual Enroll
            </button>
            <button
              onClick={() => setBadgeModal(true)}
              className='flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100 transition-all cursor-pointer'
            >
              <Award size={13} />
              Assign Badge
            </button>
            <button
              onClick={() => setSuspendModal(true)}
              className='flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer'
            >
              {panel.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
            </button>
            <button className='flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg bg-transparent text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100 transition-all cursor-pointer'>
              Trigger Refund
            </button>
          </div>

          <div className='mt-5'>
            <div className='font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-2'>
              Admin Note (Private)
            </div>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-[13.5px] text-slate-100 font-['Outfit'] outline-none focus:border-orange-500 transition-all resize-none"
              rows={3}
              placeholder='Add internal note...'
            />
            <button className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-linear-to-br from-orange-500 to-orange-700 text-white font-['Outfit'] font-semibold text-[13px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all cursor-pointer">
              Save Note
            </button>
          </div>
        </SlidePanel>
      )}

      {/* Modals — rendered outside SlidePanel so they sit above it */}
      {panel && enrollModal && (
        <ManualEnrollModal
          student={panel}
          onClose={() => setEnrollModal(false)}
        />
      )}
      {panel && badgeModal && (
        <BadgeAssignModal
          student={panel}
          onClose={() => setBadgeModal(false)}
        />
      )}
      {panel && suspendModal && (
        <SuspendModal
          student={panel}
          onClose={() => setSuspendModal(false)}
        />
      )}
    </>
  );
}
