"use client";

import {
  BookMarked,
  ChevronDown,
  ClipboardList,
  FileText, HelpCircle,
  Lock, Maximize2,
  Play,
  X,
} from "lucide-react";
import { useState } from "react";
import type { CourseDetail, CourseSection, Lesson } from "./Approvaldata";

// ── Lesson type config ────────────────────────────────────────────────────────
const LESSON_ICON: Record<Lesson["type"], React.ReactNode> = {
  video:      <Play size={12} />,
  article:    <FileText size={12} />,
  quiz:       <HelpCircle size={12} />,
  assignment: <ClipboardList size={12} />,
  resource:   <BookMarked size={12} />,
};
const LESSON_COLOR: Record<Lesson["type"], string> = {
  video:      "#4a9eff",
  article:    "#00e5a0",
  quiz:       "#ffc107",
  assignment: "#b47aff",
  resource:   "#da7c36",
};

// ── Lesson viewer modal ───────────────────────────────────────────────────────
function LessonModal({
  lesson,
  sectionTitle,
  onClose,
}: {
  lesson: Lesson;
  sectionTitle: string;
  onClose: () => void;
}) {
  const color = LESSON_COLOR[lesson.type];
  const isVideo = lesson.type === "video";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,13,26,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl border border-slate-800 overflow-hidden flex flex-col"
        style={{
          background: "#070f1e",
          maxWidth: isVideo ? 900 : 680,
          maxHeight: "90vh",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
            >
              {LESSON_ICON[lesson.type]}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-slate-100 truncate">{lesson.title}</div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                {sectionTitle} · {lesson.duration}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {lesson.isFree && (
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline"
                style={{ background: "rgba(0,229,160,0.1)", color: "#00e5a0", border: "1px solid rgba(0,229,160,0.2)" }}
              >
                Free Preview
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 transition-all"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* Video player */}
          {isVideo && lesson.videoUrl && (
            <div className="relative w-full" style={{ aspectRatio: "16/9", background: "#000" }}>
              <video src={lesson.videoUrl} controls className="w-full h-full" style={{ display: "block" }}>
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Content area */}
          {(lesson.content || lesson.description) && (
            <div className="p-6">
              {lesson.description && (
                <p
                  className="text-[13px] text-slate-400 leading-relaxed mb-5"
                  style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12 }}
                >
                  {lesson.description}
                </p>
              )}
              {lesson.content && (
                <div className="space-y-1 text-[13px] text-slate-300 leading-relaxed">
                  {lesson.content.split("\n").map((line, i) => {
                    if (line.startsWith("## "))
                      return (
                        <h2 key={i} className="text-[15px] font-bold text-slate-100 mt-5 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {line.replace("## ", "")}
                        </h2>
                      );
                    if (line.startsWith("### "))
                      return (
                        <h3 key={i} className="text-[13px] font-bold text-slate-200 mt-4 mb-1">
                          {line.replace("### ", "")}
                        </h3>
                      );
                    if (line.startsWith("```"))
                      return (
                        <div key={i} className="h-1" />
                      );
                    if (line.startsWith("    ") || line.includes("```"))
                      return (
                        <pre key={i} className="font-mono text-[12px] text-slate-300 bg-slate-950/70 px-3 py-0.5 rounded-md border border-slate-800/50">
                          {line.trim()}
                        </pre>
                      );
                    if (line.startsWith("- ") || line.startsWith("* "))
                      return (
                        <div key={i} className="flex items-start gap-2 mb-0.5">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                          <span>{line.replace(/^[-*] /, "")}</span>
                        </div>
                      );
                    if (line.startsWith("|"))
                      return (
                        <div key={i} className="font-mono text-[11px] text-slate-400 py-0.5 border-b border-slate-800/40">
                          {line}
                        </div>
                      );
                    if (/^\*\*Q\d+/.test(line))
                      return (
                        <div key={i} className="text-[13px] font-semibold text-slate-100 mt-4 mb-1">
                          {line.replace(/\*\*/g, "")}
                        </div>
                      );
                    if (line.includes("✓"))
                      return (
                        <div key={i} className="text-[13px] font-semibold mb-0.5" style={{ color: "#00e5a0" }}>
                          {line}
                        </div>
                      );
                    if (line.trim() === "")
                      return <div key={i} className="h-2" />;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Video-only: just description below video */}
          {isVideo && !lesson.content && lesson.description && (
            <div className="px-6 pb-6 pt-4">
              <p className="text-[13px] text-slate-400 leading-relaxed" style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12 }}>
                {lesson.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t border-slate-800 flex items-center justify-between shrink-0"
          style={{ background: "rgba(255,255,255,0.01)" }}
        >
          <span className="font-mono text-[11px] text-slate-600 uppercase tracking-wider">Admin Preview Mode</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Expandable section row ────────────────────────────────────────────────────
function SectionRow({
  section,
  index,
  onLessonClick,
}: {
  section: CourseSection;
  index: number;
  onLessonClick: (lesson: Lesson, sectionTitle: string) => void;
}) {
  const [open, setOpen] = useState(index === 0);
  const freeCount = section.lessons.filter(l => l.isFree).length;

  return (
    <div
      className="rounded-xl overflow-hidden border transition-colors"
      style={{
        borderColor: open ? "rgba(218,124,54,0.2)" : "rgba(255,255,255,0.05)",
        background: open ? "rgba(218,124,54,0.02)" : "rgba(255,255,255,0.01)",
      }}
    >
      {/* Section header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/3 transition-all cursor-pointer"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0 transition-all"
          style={{
            background: open ? "rgba(218,124,54,0.2)" : "rgba(255,255,255,0.06)",
            color: open ? "#da7c36" : "#7a9cc4",
          }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[13px] font-bold truncate transition-colors"
            style={{ color: open ? "#e8f0fe" : "#94a3b8" }}
          >
            {section.title}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="font-mono text-[10px] text-slate-500">{section.lessons.length} lessons</span>
            <span className="text-slate-700">·</span>
            <span className="font-mono text-[10px] text-slate-500">{section.duration}</span>
            {freeCount > 0 && (
              <>
                <span className="text-slate-700">·</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: "rgba(0,229,160,0.08)", color: "#00e5a0" }}>
                  {freeCount} free
                </span>
              </>
            )}
          </div>
        </div>
        <div
          className="shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", color: open ? "#da7c36" : "#3d5a80" }}
        >
          <ChevronDown size={16} />
        </div>
      </button>

      {/* Lessons */}
      {open && (
        <div className="border-t border-slate-800/40">
          {section.lessons.map((lesson, li) => {
            const color = LESSON_COLOR[lesson.type];
            const isClickable = !!(lesson.type === "video" || lesson.content);
            return (
              <div
                key={lesson.id}
                className="group flex items-center gap-3 px-4 py-3 border-b border-slate-800/20 last:border-0 transition-all"
                style={{ cursor: isClickable ? "pointer" : "default" }}
                onClick={() => isClickable && onLessonClick(lesson, section.title)}
                onMouseEnter={e => {
                  if (isClickable) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span className="font-mono text-[10px] text-slate-700 w-5 text-right shrink-0">{li + 1}</span>
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: `${color}15`, color }}
                >
                  {LESSON_ICON[lesson.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-semibold truncate"
                    style={{ color: isClickable ? "#e8f0fe" : "#475569" }}
                  >
                    {lesson.title}
                  </div>
                  {lesson.description && (
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">{lesson.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-mono text-[11px] text-slate-600">{lesson.duration}</span>
                  {lesson.isFree
                    ? <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider hidden sm:block" style={{ background: "rgba(0,229,160,0.08)", color: "#00e5a0", border: "1px solid rgba(0,229,160,0.15)" }}>Free</span>
                    : <Lock size={11} color="#3d5a80" />
                  }
                  {isClickable && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#da7c36" }}>
                      <Maximize2 size={12} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Static section wrapper ────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden" style={{ background: "#0d1f3c" }}>
      <div className="px-5 py-3.5 border-b border-slate-800" style={{ background: "rgba(255,255,255,0.02)" }}>
        <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-800/60 last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-[13px] font-semibold" style={{ color: accent ? "#da7c36" : "#e8f0fe" }}>{value}</span>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function CourseReviewDetail({ course }: { course: CourseDetail }) {
  const [activeLesson, setActiveLesson] = useState<{ lesson: Lesson; sectionTitle: string } | null>(null);
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <>
      <div className="space-y-4">
        {/* Hero */}
        <div
          className="rounded-2xl border border-slate-800 p-6"
          style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)" }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold" style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", color: "#4a9eff" }}>{course.category}</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold" style={{ background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.2)", color: "#ffc107" }}>{course.level}</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold" style={{ background: "rgba(122,156,196,0.08)", border: "1px solid rgba(122,156,196,0.15)", color: "#7a9cc4" }}>{course.language}</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-100 mb-2 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{course.title}</h2>
              <p className="text-[13px] text-slate-400 leading-relaxed">{course.description}</p>
            </div>
            <div className="rounded-xl p-4 text-center min-w-25 shrink-0" style={{ background: "rgba(218,124,54,0.08)", border: "1px solid rgba(218,124,54,0.2)" }}>
              <div className="text-2xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif", color: "#da7c36" }}>${course.price}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-1">Price</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { l: "Total Duration", v: course.totalDuration },
              { l: "Total Lessons", v: totalLessons },
              { l: "Videos", v: course.sections.length },
              { l: "Files", v: course.sections.length },
            ].map(s => (
              <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-lg font-bold text-slate-100" style={{ fontFamily: "'Syne', sans-serif" }}>{s.v}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructor */}
        <Section title="Instructor Info">
          <InfoRow label="Name" value={course.instructor} accent />
          <InfoRow label="Email" value={course.instructorEmail} />
          <InfoRow label="Phone" value={course.submittedAt} />
          <InfoRow label="Total Courses" value={course.submittedAt} />
          <InfoRow label="Total Students" value={course.submittedAt} />
          <InfoRow label="Others Instructors" value={course.submittedAt} />
          <InfoRow label="Submitted" value={course.submittedAt} />
        </Section>

        {/* Curriculum */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden" style={{ background: "#0d1f3c" }}>
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Curriculum</span>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-mono text-[10px] text-slate-600">{totalLessons} lessons · {course.sections.length} sections</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#da7c36", boxShadow: "0 0 6px rgba(218,124,54,0.5)" }} />
                <span className="font-mono text-[10px]" style={{ color: "#da7c36" }}>Click lesson to preview</span>
              </div>
            </div>
          </div>

          {/* Type legend */}
          <div className="px-5 py-2 flex items-center gap-4 border-b border-slate-800/40 flex-wrap" style={{ background: "rgba(255,255,255,0.01)" }}>
            {(Object.entries(LESSON_COLOR) as [Lesson["type"], string][]).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md flex items-center justify-center" style={{ background: `${color}18`, color }}>
                  {LESSON_ICON[type]}
                </div>
                <span className="font-mono text-[10px] capitalize text-slate-600">{type}</span>
              </div>
            ))}
          </div>

          <div className="p-4 space-y-2">
            {course.sections.map((section, i) => (
              <SectionRow
                key={i}
                section={section}
                index={i}
                onLessonClick={(lesson, sectionTitle) => setActiveLesson({ lesson, sectionTitle })}
              />
            ))}
          </div>
        </div>

        {/* Learning objectives */}
        <Section title="Learning Objectives">
          <ul className="space-y-2">
            {course.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(0,229,160,0.12)", border: "1px solid rgba(0,229,160,0.25)" }}>
                  <svg viewBox="0 0 24 24" width={9} height={9} fill="#00e5a0"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </div>
                <span className="text-[13px] text-slate-300">{obj}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Requirements */}
        <Section title="Requirements">
          <ul className="space-y-2">
            {course.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.2)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#ffc107" }} />
                </div>
                <span className="text-[13px] text-slate-300">{req}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Preview video — inline */}
        <Section title="Course Preview Video">
          <div className="rounded-xl overflow-hidden border border-slate-800" style={{ background: "#000", aspectRatio: "16/9" }}>
            <video src={course.previewVideo} controls className="w-full h-full" style={{ display: "block" }}>
              Your browser does not support the video tag.
            </video>
          </div>
        </Section>

        {/* Previous admin notes */}
        {course.previousNotes && (
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: "rgba(255,193,7,0.06)", border: "1px solid rgba(255,193,7,0.2)" }}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="#ffc107" className="shrink-0 mt-0.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-yellow-600 mb-1">Previous Admin Note</div>
              <div className="text-[12px] text-yellow-200/70 leading-relaxed">{course.previousNotes}</div>
            </div>
          </div>
        )}
      </div>

      {/* Lesson viewer modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson.lesson}
          sectionTitle={activeLesson.sectionTitle}
          onClose={() => setActiveLesson(null)}
        />
      )}
    </>
  );
}
