import { apiClient } from "@/lib/api/client.ts";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  CloudUpload,
  FileText,
  Film,
  HelpCircle,
  ListChecks,
  Loader2,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Repeat,
  ShieldCheck,
  Trash2,
  Upload,
  Youtube,
} from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { getUpload, uploadLessonVideo, progressFromJob, formatVideoBytes, type HostingPolicy } from "@/lib/course/videoHosting";
import { useSessionContext } from "../../../../../contexts/SessionContext.tsx";
import CourseFooter from "./CourseFooter.tsx";
import { validateCurriculum } from "./curriculumValidation";
import {
  Callout,
  ChoiceDot,
  choiceCardClass,
  cx,
  ErrorSummary,
  Field,
  iconBtn,
  iconBtnDanger,
  inputClass,
  SelectInput,
  TextArea,
} from "./formUi.tsx";
import StepHeader from "./StepHeader.tsx";
import { type CourseLesson, type CourseModule, type CreateCourseData } from "./page.tsx";

type ExtendedCourseLesson = CourseLesson & {
  expanded?: boolean;
  lessonTypeSelection?: boolean;
};

type LessonType = "VIDEO" | "ARTICLE" | "QUIZ";
type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SINGLE_CHOICE";

// ── Static config ─────────────────────────────────────────────────────────────

const LESSON_TYPES: { value: LessonType; label: string; hint: string; icon: typeof Film }[] = [
  { value: "VIDEO", label: "Video", hint: "Upload a recorded lesson", icon: Film },
  { value: "ARTICLE", label: "Article", hint: "Written lesson with files", icon: FileText },
  { value: "QUIZ", label: "Quiz", hint: "Check what students learned", icon: HelpCircle },
];

// Change J: readable question type names (stored values unchanged).
const QUESTION_TYPES: { value: QuestionType; label: string; hint: string }[] = [
  { value: "SINGLE_CHOICE", label: "One answer", hint: "4 options, 1 correct" },
  { value: "MULTIPLE_CHOICE", label: "Multiple answers", hint: "4 options, up to 3 correct" },
  { value: "TRUE_FALSE", label: "True / False", hint: "A statement to judge" },
];
const questionTypeLabel = (type: QuestionType) =>
  QUESTION_TYPES.find(t => t.value === type)?.label ?? type;

const ATTACHMENT_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx";
const ATTACHMENT_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const isAttachmentFile = (file: File) =>
  ATTACHMENT_MIME.has(file.type) || /\.(pdf|docx?|pptx?)$/i.test(file.name);

const formatDuration = (totalSeconds: number) => {
  if (!totalSeconds) return "0 min";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  return h ? `${h} h ${m} min` : `${Math.max(1, m)} min`;
};

const ISSUE_PREFIX = /^(Module \d+(, lesson \d+)?|Curriculum): /;
const stripIssuePrefix = (message: string) => message.replace(ISSUE_PREFIX, "");

// Turns generic schema messages ("Too small: expected number to be >0") into
// plain language with the field name. Display only; the rules are unchanged.
const FIELD_LABELS: [RegExp, string][] = [
  [/_quiz_duration$/, "Time limit"],
  [/_quiz_passingScore$/, "Pass mark"],
  [/_quiz_attemptsAllowed$/, "Attempts"],
  [/_points$/, "Points"],
  [/_duration$/, "Duration"],
  [/_position$/, "Position"],
];
const friendlyIssue = (key: string, message: string, keepPrefix = false) => {
  const prefix = keepPrefix ? (message.match(ISSUE_PREFIX)?.[0] ?? "") : "";
  let text = stripIssuePrefix(message);
  const label = FIELD_LABELS.find(([re]) => re.test(key))?.[1];
  const small = text.match(/^Too small: expected number to be (>=?)(\d+)/);
  const big = text.match(/^Too big: expected number to be (<=?)(\d+)/);
  if (small) text = `must be at least ${small[1] === ">" ? Number(small[2]) + 1 : small[2]}`;
  else if (big) text = `must be ${big[1] === "<" ? Number(big[2]) - 1 : big[2]} or less`;
  else if (/^Invalid input: expected number/.test(text)) text = "must be a number";
  if ((small || big || text === "must be a number") && label) text = `${label} ${text}`;
  return prefix + text.charAt(0).toUpperCase() + text.slice(1);
};

// ── Inline title editor (change G: replaces the rename pop-up) ─────────────────

const InlineTitle = ({
  value,
  onCommit,
  label,
  min = 5,
  max = 150,
  className,
}: {
  value: string;
  onCommit: (value: string) => void;
  label: string;
  min?: number;
  max?: number;
  className?: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== value) onCommit(next);
    setEditing(false);
  };

  const tooShort = value.trim().length < min;

  if (editing) {
    return (
      <div className='min-w-0 flex-1'>
        <input
          ref={inputRef}
          value={draft}
          maxLength={max}
          aria-label={label}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              setDraft(value);
              setEditing(false);
            }
          }}
          className={inputClass(draft.trim().length > 0 && draft.trim().length < min, "py-1.5")}
        />
        <p className='mt-1 text-[11px] text-gray-400'>
          Enter to save · Esc to cancel · {draft.trim().length}/{max}
          {draft.trim().length < min && ` · at least ${min} characters`}
        </p>
      </div>
    );
  }

  return (
    <button
      type='button'
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title={`Rename: ${value}`}
      className={cx(
        "group/title flex min-w-0 items-center gap-2 rounded-md px-1 py-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange",
        className
      )}
    >
      <span className={cx("truncate", tooShort ? "text-red-600" : "text-gray-900")}>{value || "Untitled"}</span>
      <Pencil
        className='h-3.5 w-3.5 shrink-0 text-gray-300 transition-colors group-hover/title:text-gray-500'
        aria-hidden='true'
      />
      <span className='sr-only'>Rename {label}</span>
    </button>
  );
};

// ── Status badge ─────────────────────────────────────────────────────────────

type Status = { tone: "ready" | "warning" | "neutral" | "progress" | "error"; label: string };

const StatusBadge = ({ status }: { status: Status }) => {
  const styles = {
    ready: "bg-emerald-500/10 text-emerald-700",
    warning: "bg-amber-500/10 text-amber-700",
    neutral: "bg-gray-100 text-gray-500",
    progress: "bg-blue-500/10 text-blue-600",
    error: "bg-red-500/10 text-red-600",
  }[status.tone];
  const Icon =
    status.tone === "ready"
      ? CheckCircle2
      : status.tone === "progress"
        ? Loader2
        : status.tone === "neutral"
          ? CircleDashed
          : AlertTriangle;
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        styles
      )}
    >
      <Icon
        className={cx("h-3 w-3", status.tone === "progress" && "animate-spin")}
        aria-hidden='true'
      />
      {status.label}
    </span>
  );
};

// ── Attachments ──────────────────────────────────────────────────────────────

const Attachments = ({
  inputId,
  files,
  busy,
  onSelect,
  onRemove,
}: {
  inputId: string;
  files: { name: string; url: string }[];
  busy: boolean;
  onSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (name: string) => void;
}) => (
  <div>
    <div className='mb-1.5 flex items-center justify-between gap-3'>
      <p className='text-[13px] font-medium text-gray-800'>
        Downloadable files <span className='font-normal text-gray-400'>(optional)</span>
      </p>
      <span className='text-xs text-gray-400'>PDF, Word or PowerPoint</span>
    </div>
    {files.length > 0 && (
      <ul className='mb-2 divide-y divide-gray-100 rounded-lg border border-gray-200'>
        {files.map((file, index) => (
          <li
            key={`${file.name}-${index}`}
            className='flex items-center gap-2.5 px-3 py-2'
          >
            <Paperclip
              className='h-4 w-4 shrink-0 text-gray-400'
              aria-hidden='true'
            />
            <span className='min-w-0 flex-1 truncate text-sm text-gray-700'>{file.name}</span>
            <button
              type='button'
              onClick={() => onRemove(file.name)}
              aria-label={`Remove ${file.name}`}
              className={iconBtnDanger}
            >
              <Trash2
                className='h-4 w-4'
                aria-hidden='true'
              />
            </button>
          </li>
        ))}
      </ul>
    )}
    {/* Bug 1 fix: every lesson gets its own input id, so files land on the right lesson. */}
    <label
      htmlFor={inputId}
      className={cx(
        "flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-sm font-medium text-gray-600 transition-colors",
        busy ? "cursor-wait opacity-60" : "cursor-pointer hover:border-orange/60 hover:bg-orange-500/5 hover:text-gray-900"
      )}
    >
      {busy ? (
        <Loader2
          className='h-4 w-4 animate-spin'
          aria-hidden='true'
        />
      ) : (
        <Upload
          className='h-4 w-4'
          aria-hidden='true'
        />
      )}
      {busy ? "Uploading…" : files.length ? "Add more files" : "Attach files"}
    </label>
    <input
      onChange={onSelect}
      id={inputId}
      multiple
      type='file'
      accept={ATTACHMENT_ACCEPT}
      disabled={busy}
      className='sr-only'
    />
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────

export default function CourseCurriculum({
  currentStep,
  setCurrentStep,
  courseData,
  setCourseData,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  courseData: CreateCourseData;
  setCourseData: React.Dispatch<React.SetStateAction<CreateCourseData>>;
}) {
  const [uploadError, setUploadError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fileLoading, setFileLoading] = useState<boolean>(false);

  // UI-only state
  const [uploadErrorKey, setUploadErrorKey] = useState<string>("");
  // Bug 7 fix: these used to be shared by every quiz on the page.
  const [addQuestionFor, setAddQuestionFor] = useState<string | null>(null);
  const [questionNotice, setQuestionNotice] = useState<Record<string, string>>({});

  const { user } = useSessionContext();

  const [policy, setPolicy] = useState<HostingPolicy | null>(null);
  const [policyError, setPolicyError] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const draftKey = `aloskill:curriculum:${user?.id ?? ""}:${courseData.id ?? "new"}`;
  useEffect(() => {
    void apiClient.get<HostingPolicy>("/course/video/policy").then(response => {
      if (response.success && response.data) {
        setPolicy(response.data);
        setPolicyError('');
      } else setPolicyError(response.message ?? 'Video hosting availability could not be loaded. Reload this page to retry.');
    });
  }, []);
  useEffect(() => {
    if (!user?.id) return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved) as { modules: CourseModule[]; defaultHosting?: "FREE" | "PREMIUM" };
        if (Array.isArray(draft.modules)) setCourseData(prev => ({ ...prev, ...draft }));
      }
    } catch { /* Preserve server state if local storage is unavailable. */ }
    setDraftLoaded(true);
  }, [draftKey, user?.id, setCourseData]);
  useEffect(() => {
    if (!draftLoaded) return;
    try { localStorage.setItem(draftKey, JSON.stringify({ modules: courseData.modules, defaultHosting: courseData.defaultHosting })); } catch { /* Storage full. */ }
  }, [courseData.modules, courseData.defaultHosting, draftKey, draftLoaded]);
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const pending = courseData.modules.flatMap(m => m.lessons).filter(l => l.pendingVideoUploadJobId);
      for (const lesson of pending) {
        try {
          const job = await getUpload(lesson.pendingVideoUploadJobId!);
          if (cancelled) return;
          setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => ({ ...m, lessons: m.lessons.map(l => {
            if (l.pendingVideoUploadJobId !== job.id) return l;
            if (job.status === "READY" && job.contentUrl) return { ...l, hostingType: l.pendingHostingType,
              videoUploadJobId: job.id, pendingVideoUploadJobId: undefined, pendingHostingType: undefined,
              contentUrl: { name: job.fileName, url: job.contentUrl }, duration: job.duration, uploadMessage: "Video ready", uploadProgress: progressFromJob(job) };
            // Do not overwrite in-flight browser byte progress with the last
            // committed chunk offset returned by background polling.
            if (job.status === 'STAGING' && loading) return l;
            return { ...l, uploadMessage: job.statusMessage ?? 'Upload status updated', uploadProgress: progressFromJob(job) };
          }) })) }));
        } catch { /* Retry status after a temporary connection failure. */ }
      }
    };
    const timer = setInterval(() => void poll(), 3000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [courseData.modules, setCourseData, loading]);

  const validationSummary = useRef<HTMLDivElement>(null);
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    // Validate the same draft used by FinalStep. Mounted controls can be stale,
    // and successful background uploads intentionally clear the file picker.
    resolver: values => {
      const errors = validateCurriculum(courseData.modules);
      if (loading || fileLoading) errors.upload = {
        type: 'validate', message: 'Wait for the current file upload to finish before continuing.',
      };
      if (Object.keys(errors).length) return { values: {}, errors };
      return { values, errors: {} };
    },
    shouldFocusError: false,
    reValidateMode: 'onSubmit',
  });

  const addSection = () => {
    setCourseData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          position:
            prev.modules.length > 0 ? Math.max(...prev.modules.map(m => m.position)) + 1 : 1,
          title: `Module ${prev.modules.length + 1}`,
          lessons: [
            {
              position: 1,
              title: "Lesson 1",
              description: "",
              notes: "",
              type: null,
              contentUrl: { name: "", url: "" },
              files: [] as { name: string; url: string }[],
              duration: null,
              expanded: false,
              lessonTypeSelection: true,
            },
          ],
        },
      ],
    }));
  };

  const addLesson = (moduleId: number) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position === moduleId) {
          return {
            ...module,
            lessons: [
              ...module.lessons,
              {
                position:
                  module.lessons.length > 0
                    ? Math.max(...module.lessons.map(l => l.position)) + 1
                    : 1,
                title: `Lesson ${module.lessons.length + 1}`,
                description: "",
                notes: "",
                type: null,
                contentUrl: { name: "", url: "" },
                files: [] as { name: string; url: string }[],
                duration: null,
                expanded: false,
                lessonTypeSelection: true,
              },
            ],
          };
        }
        return module;
      }),
    }));
  };

  const toggleLectureAndType = (
    sectionId: number,
    lectureId: number,
    field: "expanded" | "lessonTypeSelection",
    lectureType?: "VIDEO" | "ARTICLE" | "QUIZ"
  ) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position === sectionId) {
          return {
            ...module,
            lessons: module.lessons.map(lecture => {
              if (lecture.position === lectureId) {
                if (lectureType) {
                  if (lectureType === "QUIZ") {
                    return {
                      ...lecture,
                      type: lectureType,
                      [field]: !lecture[field as keyof ExtendedCourseLesson],
                      quiz: {
                        title: "",
                        description: "",
                        duration: 0,
                        passingScore: 0,
                        attemptsAllowed: 1,
                        questions: [],
                      },
                    };
                  } else {
                    return {
                      ...lecture,
                      type: lectureType,
                      [field]: !lecture[field as keyof ExtendedCourseLesson],
                    };
                  }
                }
                if (field) {
                  return { ...lecture, [field]: !lecture[field as keyof ExtendedCourseLesson] };
                }
              }
              return lecture;
            }),
          };
        }
        return module;
      }),
    }));
  };

  const deleteSection = (moduleId: number) => {
    const confirmPrompt = window.confirm(
      "Are you sure you want to delete this section? All lectures within this section will also be deleted."
    );
    if (confirmPrompt) {
      setCourseData(prev => ({
        ...prev,
        modules: prev.modules.filter(module => module.position !== moduleId),
      }));
    }
  };

  const handleTextValueChange = (
    sectionId: number,
    lectureId: number,
    type: string,
    value: string
  ) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position === sectionId) {
          return {
            ...module,
            lessons: module.lessons.map(lesson => {
              if (lesson.position === lectureId) {
                if (type === "notes") {
                  return { ...lesson, notes: value };
                }
                if (type === "description") {
                  return { ...lesson, description: value };
                }
              }
              return lesson;
            }),
          };
        }
        return module;
      }),
    }));
  };

  const handleQuestionInputChange = (
    moduleId: number,
    lessonId: number,
    questionId: number,
    field: "text" | "points" | "title",
    value: string
  ) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map(lesson => {
              if (lesson.position === lessonId) {
                return {
                  ...lesson,
                  quiz: lesson.quiz
                    ? {
                        ...lesson.quiz,
                        questions: lesson.quiz.questions.map(question => {
                          if (question.position === questionId) {
                            if (field === "text") {
                              return {
                                ...question,
                                text: value,
                              };
                            }
                            if (field === "points") {
                              return {
                                ...question,
                                points: Number(value),
                              };
                            }
                          }
                          return question;
                        }),
                      }
                    : lesson.quiz,
                };
              }
              return lesson;
            }),
          };
        }
        return module;
      }),
    }));
  };

  const handleQuizInputChange = (
    moduleId: number,
    lessonId: number,
    field: "title" | "description" | "duration" | "passingScore" | "attemptsAllowed",
    value: string | number
  ) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map(lesson => {
              if (lesson.position === lessonId) {
                return {
                  ...lesson,
                  quiz: lesson.quiz
                    ? {
                        ...lesson.quiz,
                        [field]: value,
                      }
                    : lesson.quiz,
                };
              }
              return lesson;
            }),
          };
        }
        return module;
      }),
    }));
  };

  const deleteLecture = (moduleId: number, lessonId: number) => {
    const confirmPrompt = window.confirm("Are you sure you want to delete this Lesson?");
    if (!confirmPrompt) {
      return;
    }
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position === moduleId) {
          return {
            ...module,
            lessons: module.lessons.filter(lesson => lesson.position !== lessonId),
          };
        }
        return module;
      }),
    }));
  };

  const uploadFileToBunny = async (file: File[]): Promise<Array<{ name: string; url: string }>> => {
    setFileLoading(true);
    setUploadError("");
    if (!user?.id) {
      setUploadError("User not authenticated.");
      setFileLoading(false);
      return [{ name: "", url: "" }];
    }

    try {
      const results = await Promise.allSettled(
        file.map(async f => {
          const formData = new FormData();
          formData.append("file", f);

          const response = await apiClient.postFormData<string>(
            `/course/file-upload?folder=${user?.id}`,
            formData
          );

          if (!response.success || !response.data) {
            throw new Error("Upload failed");
          }

          return {
            name: f.name,
            url: response.data as string,
          };
        })
      );
      return results.map(result => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          return { name: "", url: "" };
        }
      });
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : "An unknown error occurred.");
      return [{ name: "", url: "" }];
    } finally {
      setFileLoading(false);
    }
  };

  const getVideoDuration = (file: File): Promise<{ duration: number }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          duration: Math.round(video.duration),
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject("Could not load video metadata");
      };

      video.src = url;
    });
  };

  const handleFileSelect = async (
    e: ChangeEvent<HTMLInputElement>,
    sectionId: number,
    lectureId: number
  ) => {
    setUploadErrorKey(`${sectionId}-${lectureId}`);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file) {
        const isVideo = file.type.startsWith("video/");
        // Bug 11 fix: every type the picker accepts (PDF, Word, PowerPoint) is now handled.
        const isPDF = isAttachmentFile(file);

        if (isVideo) {
          if (loading) return;
          const lesson = courseData.modules.find(m => m.position === sectionId)?.lessons.find(l => l.position === lectureId);
          if (!lesson) return;
          const hostingType = lesson.requestedHostingType ?? lesson.hostingType ?? courseData.defaultHosting ?? (courseData.originalPrice > 0 ? "PREMIUM" : policy?.defaultHosting) ?? "PREMIUM";
          if (hostingType === "FREE" && (!lesson.youtubeDisclosureAccepted || (courseData.originalPrice > 0 && !lesson.freeHostingAcknowledged))) {
            setUploadError("Accept the upload disclosure and limited protection acknowledgement before uploading."); return;
          }
          setLoading(true); setUploadError("");
          let pendingId = "";
          try {
            const job = await uploadLessonVideo(file, {
              hostingType, courseId: courseData.id, title: lesson.title, description: lesson.description,
              acknowledged: Boolean(lesson.freeHostingAcknowledged), youtubeDisclosureAccepted: Boolean(lesson.youtubeDisclosureAccepted),
              key: `${draftKey}:${lesson.id ?? `${sectionId}-${lectureId}`}`,
              onProgress: progress => setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => ({ ...m, lessons: m.lessons.map(l =>
                l.pendingVideoUploadJobId === pendingId ? { ...l, uploadProgress: progress, uploadMessage: progress.message } : l) })) })),
              onJob: id => {
                pendingId = id;
                setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => ({ ...m, lessons: m.lessons.map(l =>
                  m.position === sectionId && l.position === lectureId ? { ...l, pendingVideoUploadJobId: id, pendingHostingType: hostingType } : l) })) }));
              },
            });
            if (job.status !== "READY" || !job.contentUrl) return;
            setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => ({ ...m, lessons: m.lessons.map(l =>
              l.pendingVideoUploadJobId === pendingId ? { ...l, hostingType, videoUploadJobId: job.id,
                pendingVideoUploadJobId: undefined, pendingHostingType: undefined, contentUrl: { name: file.name, url: job.contentUrl! },
                duration: job.duration, uploadMessage: "Video ready", uploadProgress: progressFromJob(job) } : l) })) }));
          } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Video upload failed. Select the same file to retry.");
          } finally { setLoading(false); e.target.value = ""; }
          return;
        }

        if (isPDF) {
          const documents = Array.from(e.target.files ?? []).filter(isAttachmentFile);
          e.target.value = "";
          try {
            const uploadResult = await uploadFileToBunny(documents);
            const uploaded = uploadResult.filter(item => item.url);
            if (uploaded.length < documents.length) {
              setUploadError(
                uploaded.length === 0
                  ? "The file could not be uploaded. Try again."
                  : `${documents.length - uploaded.length} of ${documents.length} files could not be uploaded. Try those again.`
              );
            }
            if (uploaded.length === 0) return;
            setCourseData(prev => ({
              ...prev,
              modules: prev.modules.map(module => {
                if (module.position === sectionId) {
                  return {
                    ...module,
                    lessons: module.lessons.map(lesson => {
                      if (lesson.position === lectureId) {
                        return {
                          ...lesson,
                          files: [...(lesson.files ?? []), ...uploaded],
                          // Reading time (5 min per document) only applies to article lessons;
                          // a video lesson keeps the duration of its video.
                          duration:
                            lesson.type === "ARTICLE"
                              ? (lesson.duration ?? 0) + uploaded.length * 5 * 60
                              : lesson.duration,
                        };
                      }
                      return lesson;
                    }),
                  };
                }
                return module;
              }),
            }));
          } catch (_error) {
            setUploadError("The file could not be uploaded. Try again.");
          }
          return;
        }
      }
    }
  };

  const addQuizQuestion = (
    moduleId: number,
    lessonId: number,
    quizType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SINGLE_CHOICE"
  ) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map(lesson => {
              if (lesson.position === lessonId) {
                if (lesson.quiz) {
                  return {
                    ...lesson,
                    quiz: {
                      ...lesson.quiz,
                      questions: [
                        ...lesson.quiz.questions,
                        {
                          position:
                            lesson.quiz.questions.length > 0
                              ? Math.max(...lesson.quiz.questions.map(q => q.position)) + 1
                              : 1,
                          text: `Question ${lesson.quiz.questions.length + 1}`,
                          type: quizType,
                          points: 1,
                          options:
                            quizType === "TRUE_FALSE"
                              ? [
                                  {
                                    position: 1,
                                    text: "true",
                                    isCorrect: false,
                                  },
                                  {
                                    position: 2,
                                    text: "false",
                                    isCorrect: false,
                                  },
                                ]
                              : [
                                  {
                                    position: 1,
                                    text: "",
                                    isCorrect: false,
                                  },
                                  {
                                    position: 2,
                                    text: "",
                                    isCorrect: false,
                                  },
                                  {
                                    position: 3,
                                    text: "",
                                    isCorrect: false,
                                  },
                                  {
                                    position: 4,
                                    text: "",
                                    isCorrect: false,
                                  },
                                ],
                        },
                      ],
                    },
                  };
                }
              }
              return lesson;
            }),
          };
        }
        return module;
      }),
    }));
    setAddQuestionFor(null);
  };

  const addQuizOption = (
    moduleId: number,
    lessonId: number,
    questionId: number,
    optionId: number,
    value: string
  ) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position !== moduleId) return module;

        return {
          ...module,
          lessons: module.lessons.map(lesson => {
            if (lesson.position !== lessonId || !lesson.quiz) return lesson;

            return {
              ...lesson,
              quiz: {
                ...lesson.quiz,
                questions: lesson.quiz.questions.map(question => {
                  if (question.position !== questionId) return question;
                  const updatedOptions = question.options.map(option =>
                    option.position === optionId ? { ...option, text: value } : option
                  );
                  return {
                    ...question,
                    options: updatedOptions,
                  };
                }),
              },
            };
          }),
        };
      }),
    }));
  };

  // Bug 8 fix: a real radio (one answer / true-false) or checkbox (multiple answers).
  // Picking a different radio option now moves the correct answer instead of
  // showing alert(); the limits enforced by validation are unchanged.
  const updateQuizOptionCorrectAnswere = (
    moduleId: number,
    lessonId: number,
    questionId: number,
    optionId: number
  ) => {
    const noticeKey = `${moduleId}-${lessonId}-${questionId}`;
    const question = courseData.modules
      .find(m => m.position === moduleId)
      ?.lessons.find(l => l.position === lessonId)
      ?.quiz?.questions.find(q => q.position === questionId);
    if (!question) return;
    const target = question.options.find(o => o.position === optionId);
    if (!target) return;

    if (question.type === "MULTIPLE_CHOICE" && !target.isCorrect) {
      if (question.options.filter(o => o.isCorrect).length >= 3) {
        setQuestionNotice(prev => ({
          ...prev,
          [noticeKey]: "You can mark up to 3 correct answers. Unmark one first.",
        }));
        return;
      }
    }
    setQuestionNotice(prev => ({ ...prev, [noticeKey]: "" }));

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position !== moduleId) return module;
        return {
          ...module,
          lessons: module.lessons.map(lesson => {
            if (lesson.position !== lessonId || !lesson.quiz) return lesson;
            return {
              ...lesson,
              quiz: {
                ...lesson.quiz,
                questions: lesson.quiz.questions.map(q => {
                  if (q.position !== questionId) return q;
                  return {
                    ...q,
                    options: q.options.map(option =>
                      q.type === "MULTIPLE_CHOICE"
                        ? option.position === optionId
                          ? { ...option, isCorrect: !option.isCorrect }
                          : option
                        : { ...option, isCorrect: option.position === optionId }
                    ),
                  };
                }),
              },
            };
          }),
        };
      }),
    }));
  };

  const deleteLectureFile = async (
    sectionId: number,
    lectureId: number,
    fileName?: string,
    type?: string
  ) => {
    const selectedModule = courseData.modules.find(m => m.position === sectionId);
    const lesson = selectedModule?.lessons.find(l => l.position === lectureId);
    if (type === "video") {
      if (!window.confirm("Remove this video from the draft? Save the course to apply the change.")) return;
      setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => ({ ...m, lessons: m.lessons.map(l =>
        m.position === sectionId && l.position === lectureId ? { ...l, contentUrl: null, videoUploadJobId: null,
          pendingVideoUploadJobId: undefined, hostingType: undefined, uploadMessage: "Video removed from draft. Save to apply." } : l) })) }));
      return;
    }

    const lessonFile = lesson?.files?.find(file => file.name === fileName);

    if (lessonFile) {
      const deletedResult = await apiClient.delete("/course/delete-file", {
        fileUrl: lessonFile.url,
      });

      if (!deletedResult.success) {
        return;
      }
      if (deletedResult.success) {
        setCourseData(prev => ({
          ...prev,
          modules: prev.modules.map(module => {
            if (module.position === sectionId) {
              return {
                ...module,
                lessons: module.lessons.map(lesson => {
                  if (lesson.position === lectureId) {
                    if (type === "video") {
                      return { ...lesson, contentUrl: { name: "", url: "" } };
                    }
                    return {
                      ...lesson,
                      files: lesson.files && lesson.files.filter(file => file.name !== fileName),
                    };
                  }
                  return lesson;
                }),
              };
            }
            return module;
          }),
        }));
      }
    }
  };

  const handleDeleteQuiz = (moduleId: number, lessonId: number, questionId: number) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.position === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map(lesson => {
              if (lesson.position === lessonId) {
                if (lesson.quiz) {
                  return {
                    ...lesson,
                    quiz: {
                      ...lesson.quiz,
                      questions: lesson.quiz?.questions.filter(q => q.position !== questionId),
                    },
                  };
                }
              }
              return lesson;
            }),
          };
        }
        return module;
      }),
    }));
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmitHandler = (_data: unknown) => {
    setCurrentStep(currentStep + 1);
  };

  // ── UI helpers (no change to how data is stored) ───────────────────────────

  const patchLesson = (moduleId: number, lessonId: number, patch: Partial<CourseLesson>) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l =>
          m.position === moduleId && l.position === lessonId ? { ...l, ...patch } : l
        ),
      })),
    }));
  };

  // Change G: inline rename (same update the rename pop-up made, applied on save).
  const renameModule = (moduleId: number, title: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module => (module.position === moduleId ? { ...module, title } : module)),
    }));
  };
  const renameLesson = (moduleId: number, lessonId: number, title: string) =>
    patchLesson(moduleId, lessonId, { title });

  const pickLessonType = (moduleId: number, lesson: CourseLesson, type: LessonType) => {
    toggleLectureAndType(moduleId, lesson.position, "lessonTypeSelection", type);
    if (!lesson.expanded) toggleLectureAndType(moduleId, lesson.position, "expanded");
  };

  // Bug 9 fix: a lesson's type can be changed after it was picked.
  const resetLessonType = (moduleId: number, lesson: CourseLesson) => {
    const ok = window.confirm(
      "Change this lesson's type? The video or quiz you added for the current type will be removed from the draft. Notes, text and files are kept."
    );
    if (!ok) return;
    patchLesson(moduleId, lesson.position, {
      type: null,
      lessonTypeSelection: true,
      expanded: true,
      quiz: undefined,
      contentUrl: { name: "", url: "" },
      videoUploadJobId: null,
      hostingType: undefined,
      requestedHostingType: undefined,
      uploadProgress: undefined,
      uploadMessage: undefined,
      duration: null,
    });
  };

  const hostingFor = (lesson: CourseLesson) =>
    lesson.requestedHostingType ?? lesson.hostingType ?? courseData.defaultHosting ?? (courseData.originalPrice > 0 ? 'PREMIUM' : policy?.defaultHosting) ?? 'PREMIUM';

  // Live check of the same rules the server applies, used for badges and hints.
  const liveIssues = useMemo(() => validateCurriculum(courseData.modules), [courseData.modules]);
  const issueEntries = (prefix: string) =>
    Object.entries(liveIssues)
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, error]) => [key, friendlyIssue(key, String(error?.message ?? ""))] as const);
  const issuesWithPrefix = (prefix: string) => issueEntries(prefix).map(([, message]) => message);

  const lessonStatus = (lesson: CourseLesson, issueCount: number): Status => {
    if (lesson.pendingVideoUploadJobId) {
      const stage = lesson.uploadProgress?.stage;
      if (stage === "FAILED") return { tone: "error", label: "Upload failed" };
      const pct = lesson.uploadProgress?.percent;
      if (stage === "PROCESSING" || stage === "QUEUED") return { tone: "progress", label: "Processing" };
      return { tone: "progress", label: pct !== null && pct !== undefined ? `Uploading ${Math.round(pct)}%` : "Uploading" };
    }
    if (lesson.type === null) return { tone: "neutral", label: "Choose type" };
    if (issueCount > 0) return { tone: "warning", label: `${issueCount} to fix` };
    return { tone: "ready", label: "Ready" };
  };

  const nodeTone: Record<Status["tone"], string> = {
    ready: "border-emerald-500 text-emerald-600",
    warning: "border-amber-400 text-amber-600",
    neutral: "border-gray-300 text-gray-400",
    progress: "border-blue-400 text-blue-500",
    error: "border-red-400 text-red-600",
  };

  const allLessons = courseData.modules.flatMap(m => m.lessons);
  const totalSeconds = allLessons.reduce((sum, l) => sum + (Number(l.duration) || 0), 0);

  // ── Editors ────────────────────────────────────────────────────────────────

  const renderTypePicker = (moduleId: number, lesson: CourseLesson) => (
    <fieldset>
      <legend className='mb-2 text-[13px] font-medium text-gray-800'>What kind of lesson is this?</legend>
      <div className='grid gap-2.5 sm:grid-cols-3'>
        {LESSON_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              type='button'
              onClick={() => pickLessonType(moduleId, lesson, type.value)}
              className='flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3.5 text-left transition-colors hover:border-orange hover:bg-orange-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange'
            >
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600'>
                <Icon
                  className='h-4 w-4'
                  aria-hidden='true'
                />
              </span>
              <span>
                <span className='block text-sm font-semibold text-gray-900'>{type.label}</span>
                <span className='mt-0.5 block text-xs text-gray-500'>{type.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  const renderVideoEditor = (moduleId: number, lesson: CourseLesson) => {
    const key = `${moduleId}-${lesson.position}`;
    const hosting = hostingFor(lesson);
    const videoInputId = `lessonVideo-${moduleId}-${lesson.position}`;
    const startingHere = loading && uploadErrorKey === key;
    const busyElsewhere = loading && !startingHere && !lesson.pendingVideoUploadJobId;
    const progress = lesson.uploadProgress;

    return (
      <div className='space-y-5'>
        {/* Hosting */}
        <fieldset disabled={loading}>
          <legend className='mb-2 text-[13px] font-medium text-gray-800'>Video hosting</legend>
          <div className='grid gap-2.5 sm:grid-cols-2'>
            {([['FREE', 'Free hosting', 'Standard hosting. Suits free lessons that do not need extra protection.', Youtube],
              ['PREMIUM', 'Premium hosting', 'Protected hosting with stronger access security.', ShieldCheck]] as const).map(([value, label, description, Icon]) => {
              const id = `hosting-${moduleId}-${lesson.position}-${value}`;
              return (
                <div key={value}>
                  <input
                    type='radio'
                    id={id}
                    name={`hosting-${moduleId}-${lesson.position}`}
                    value={value}
                    className='peer sr-only'
                    checked={hosting === value}
                    disabled={value === 'FREE' ? !policy?.freeEnabled || (courseData.originalPrice > 0 && !policy.allowFreePaid) : policy ? !policy.premiumEnabled : false}
                    onChange={() => patchLesson(moduleId, lesson.position, { requestedHostingType: value, youtubeDisclosureAccepted: false })}
                  />
                  <label
                    htmlFor={id}
                    className={choiceCardClass}
                  >
                    <ChoiceDot />
                    <span className='flex-1'>
                      <span className='flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-900'>
                        <Icon
                          className='h-4 w-4 text-gray-400'
                          aria-hidden='true'
                        />
                        {label}
                        {value === 'PREMIUM' && courseData.originalPrice > 0 && (
                          <span className='rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700'>
                            Recommended
                          </span>
                        )}
                      </span>
                      <span className='mt-0.5 block text-xs leading-snug text-gray-500'>{description}</span>
                    </span>
                  </label>
                </div>
              );
            })}
          </div>

          {hosting === 'FREE' && (
            <div className='mt-3 space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-800'>
              <p>
                Upload destination: the central ALOSKILL YouTube channel. Privacy: Unlisted; embedding enabled. Title: <strong>{lesson.title}</strong>. Description: {lesson.description || '(empty)'}. A private course playlist organizes these videos. Anyone with a video link may share it.
              </p>
              <label className='flex items-start gap-2.5 text-gray-800'>
                <input
                  type='checkbox'
                  className='mt-0.5 h-4 w-4 shrink-0 accent-orange'
                  checked={Boolean(lesson.youtubeDisclosureAccepted)}
                  onChange={e => patchLesson(moduleId, lesson.position, { youtubeDisclosureAccepted: e.target.checked })}
                />
                <span>
                  I authorize this upload to YouTube as Unlisted and agree to the{" "}
                  <a className='font-semibold underline' href='https://www.youtube.com/t/terms' target='_blank' rel='noreferrer'>YouTube Terms</a> and{" "}
                  <a className='font-semibold underline' href='https://policies.google.com/privacy' target='_blank' rel='noreferrer'>Google Privacy Policy</a>.
                </span>
              </label>
              {courseData.originalPrice > 0 && (
                <label className='flex items-start gap-2.5 text-gray-800'>
                  <input
                    type='checkbox'
                    className='mt-0.5 h-4 w-4 shrink-0 accent-orange'
                    checked={Boolean(lesson.freeHostingAcknowledged)}
                    onChange={e => patchLesson(moduleId, lesson.position, { freeHostingAcknowledged: e.target.checked })}
                  />
                  <span>I understand that paid content links can be shared and access protection is limited.</span>
                </label>
              )}
            </div>
          )}
        </fieldset>

        {/* Video file */}
        <div>
          <p className='mb-1.5 text-[13px] font-medium text-gray-800'>Video file</p>
          {lesson.contentUrl?.name ? (
            <div className='flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500'>
                <Film
                  className='h-4 w-4'
                  aria-hidden='true'
                />
              </span>
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-sm font-medium text-gray-900'>{lesson.contentUrl.name}</span>
                <span className='text-xs text-gray-500'>
                  {lesson.duration ? formatDuration(lesson.duration) : "Duration available after processing"}
                  {lesson.hostingType ? ` · ${lesson.hostingType === "FREE" ? "Free" : "Premium"} hosting` : ""}
                </span>
              </span>
              <label
                htmlFor={videoInputId}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-500/10",
                  loading ? "pointer-events-none opacity-50" : "cursor-pointer"
                )}
              >
                <RefreshCw
                  className='h-3.5 w-3.5'
                  aria-hidden='true'
                />
                Replace
              </label>
              <button
                type='button'
                onClick={() => deleteLectureFile(moduleId, lesson.position, undefined, "video")}
                aria-label='Remove video'
                className={iconBtnDanger}
              >
                <Trash2
                  className='h-4 w-4'
                  aria-hidden='true'
                />
              </button>
            </div>
          ) : (
            <label
              htmlFor={videoInputId}
              className={cx(
                "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors",
                errors[`section_${moduleId}_lecture_${lesson.position}_video`] && !lesson.pendingVideoUploadJobId
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-gray-50",
                loading ? "cursor-not-allowed" : "cursor-pointer hover:border-orange/60 hover:bg-orange-500/5"
              )}
            >
              {startingHere ? (
                <>
                  <Loader2
                    className='h-6 w-6 animate-spin text-orange'
                    aria-hidden='true'
                  />
                  <span className='text-sm font-medium text-gray-700'>Starting upload…</span>
                </>
              ) : (
                <>
                  <CloudUpload
                    className='h-7 w-7 text-gray-400'
                    aria-hidden='true'
                  />
                  <span className='text-sm font-semibold text-gray-800'>
                    {lesson.pendingVideoUploadJobId ? "Select the same file to retry" : "Upload video"}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {busyElsewhere
                      ? "Another video is uploading. Wait for it to finish."
                      : `MP4, MOV or WebM${policy ? ` · up to ${formatVideoBytes(policy.maxUploadBytes)}` : ""}`}
                  </span>
                </>
              )}
            </label>
          )}
          <input
            id={videoInputId}
            type='file'
            accept='.mp4,.mov,.webm'
            className='sr-only'
            disabled={loading}
            onChange={e => void handleFileSelect(e, moduleId, lesson.position)}
          />
        </div>

        {/* Upload progress */}
        {progress ? (
          <div
            className='space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3'
            role='status'
            aria-live='polite'
          >
            <div className='flex flex-wrap justify-between gap-2 text-sm text-gray-700'>
              <span>{progress.message}</span>
              {progress.percent !== null && <strong className='tabular-nums'>{progress.percent.toFixed(1)}%</strong>}
            </div>
            {progress.percent !== null ? (
              <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                <div
                  className={cx(
                    "h-full rounded-full transition-all duration-300",
                    progress.stage === "FAILED" ? "bg-red-500" : progress.stage === "READY" ? "bg-emerald-500" : "bg-orange"
                  )}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            ) : (
              <p className='text-xs text-gray-500'>Upload progress and video processing are separate stages. Your draft is saved.</p>
            )}
            {['SOURCE', 'TRANSFER'].includes(progress.stage) && (
              <p className='text-xs tabular-nums text-gray-500'>
                {formatVideoBytes(progress.bytes)} / {formatVideoBytes(progress.total)}
                {progress.bytesPerSecond ? ` · ${formatVideoBytes(progress.bytesPerSecond)}/s` : ''}
                {progress.remainingSeconds !== undefined ? ` · About ${Math.ceil(progress.remainingSeconds / 60)} min remaining` : ''}
              </p>
            )}
          </div>
        ) : (
          lesson.uploadMessage && (
            <p
              role='status'
              className='text-xs text-gray-600'
            >
              {lesson.uploadMessage}
            </p>
          )
        )}

        {uploadError && uploadErrorKey === key && (
          <Callout
            tone='error'
            role='alert'
          >
            {uploadError}
          </Callout>
        )}

        <Attachments
          inputId={`lessonFile-${moduleId}-${lesson.position}`}
          files={lesson.files ?? []}
          busy={fileLoading && uploadErrorKey === key}
          onSelect={e => void handleFileSelect(e, moduleId, lesson.position)}
          onRemove={name => deleteLectureFile(moduleId, lesson.position, name)}
        />

        <div className='grid gap-5 lg:grid-cols-2'>
          <Field
            label='Lesson description'
            htmlFor={`desc-${key}`}
            optional
            counter={{ value: lesson.description?.length ?? 0, min: 20 }}
            hint='What this lesson covers. At least 20 characters if you add one.'
          >
            <TextArea
              id={`desc-${key}`}
              onChange={e => handleTextValueChange(moduleId, lesson.position, "description", e.target.value)}
              defaultValue={lesson.description}
              placeholder='In this lesson you will…'
              rows={5}
            />
          </Field>
          <Field
            label='Lesson notes'
            htmlFor={`notes-${key}`}
            optional
            counter={{ value: lesson.notes?.length ?? 0, max: 1000, min: 20 }}
            hint='Key points, links or code students can read alongside the video.'
          >
            <TextArea
              id={`notes-${key}`}
              onChange={e => handleTextValueChange(moduleId, lesson.position, "notes", e.target.value)}
              defaultValue={lesson.notes}
              placeholder='Summary, commands, links…'
              rows={5}
              maxLength={1000}
            />
          </Field>
        </div>
      </div>
    );
  };

  const renderArticleEditor = (moduleId: number, lesson: CourseLesson) => {
    const key = `${moduleId}-${lesson.position}`;
    return (
      <div className='space-y-5'>
        <Field
          label='Article'
          htmlFor={`article-${key}`}
          counter={{ value: lesson.description?.length ?? 0, min: 20 }}
          hint='Plain text. Use blank lines to separate paragraphs.'
        >
          <TextArea
            id={`article-${key}`}
            onChange={e => handleTextValueChange(moduleId, lesson.position, "description", e.target.value)}
            placeholder='Write the lesson here…'
            defaultValue={lesson.description}
            rows={10}
          />
        </Field>
        {uploadError && uploadErrorKey === key && (
          <Callout
            tone='error'
            role='alert'
          >
            {uploadError}
          </Callout>
        )}
        <Attachments
          inputId={`lessonFile-${moduleId}-${lesson.position}`}
          files={lesson.files ?? []}
          busy={fileLoading && uploadErrorKey === key}
          onSelect={e => void handleFileSelect(e, moduleId, lesson.position)}
          onRemove={name => deleteLectureFile(moduleId, lesson.position, name)}
        />
      </div>
    );
  };

  const renderQuizEditor = (moduleId: number, lesson: CourseLesson) => {
    const key = `${moduleId}-${lesson.position}`;
    const quiz = lesson.quiz;
    if (!quiz) {
      return (
        <Callout
          tone='warning'
          title='This quiz has no settings yet'
        >
          <button
            type='button'
            onClick={() =>
              patchLesson(moduleId, lesson.position, {
                quiz: { title: "", description: "", duration: 0, passingScore: 0, attemptsAllowed: 1, questions: [] },
              })
            }
            className='mt-1 font-semibold underline'
          >
            Set up this quiz
          </button>
        </Callout>
      );
    }
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    const pickerOpen = addQuestionFor === key;

    return (
      <div className='space-y-5'>
        {/* Settings */}
        <div className='space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4'>
          <p className='text-[13px] font-semibold text-gray-800'>Quiz settings</p>
          <Field
            label='Quiz title'
            htmlFor={`quiz-title-${key}`}
            counter={{ value: quiz.title?.length ?? 0, max: 500, min: 20 }}
          >
            <input
              id={`quiz-title-${key}`}
              type='text'
              maxLength={500}
              onChange={e => handleQuizInputChange(moduleId, lesson.position, "title", e.target.value)}
              value={quiz.title || ""}
              placeholder='e.g. Check your understanding of React state'
              className={inputClass(false)}
            />
          </Field>
          <Field
            label='Instructions'
            htmlFor={`quiz-desc-${key}`}
            counter={{ value: quiz.description?.length ?? 0, min: 20 }}
            hint='Tell students what the quiz covers and how it is scored.'
          >
            <TextArea
              id={`quiz-desc-${key}`}
              rows={3}
              onChange={e => handleQuizInputChange(moduleId, lesson.position, "description", e.target.value)}
              value={quiz.description || ""}
              placeholder='Answer all questions. You need the pass mark to complete this lesson.'
            />
          </Field>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Field
              label='Time limit'
              htmlFor={`quiz-duration-${key}`}
              hint='Between 1 and 60 minutes.'
            >
              <div className='relative'>
                <input
                  id={`quiz-duration-${key}`}
                  type='number'
                  min={1}
                  max={60}
                  onChange={e => handleQuizInputChange(moduleId, lesson.position, "duration", Number(e.target.value))}
                  value={quiz.duration || ""}
                  placeholder='e.g. 15'
                  className={inputClass(false, "pr-14 tabular-nums")}
                />
                <span className='pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400'>min</span>
              </div>
            </Field>
            <Field
              label='Pass mark'
              htmlFor={`quiz-score-${key}`}
              hint='Score needed to pass, 1–100%.'
            >
              <div className='relative'>
                <input
                  id={`quiz-score-${key}`}
                  type='number'
                  min={1}
                  max={100}
                  onChange={e => handleQuizInputChange(moduleId, lesson.position, "passingScore", Number(e.target.value))}
                  value={quiz.passingScore || ""}
                  placeholder='e.g. 70'
                  className={inputClass(false, "pr-10 tabular-nums")}
                />
                <span className='pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400'>%</span>
              </div>
            </Field>
          </div>
        </div>

        {/* Questions */}
        <div>
          <div className='mb-3 flex flex-wrap items-baseline justify-between gap-2'>
            <p className='text-[13px] font-semibold text-gray-800'>
              Questions <span className='font-normal text-gray-400'>({quiz.questions.length})</span>
            </p>
            {quiz.questions.length > 0 && (
              <span className='text-xs tabular-nums text-gray-500'>
                {totalPoints} {totalPoints === 1 ? "point" : "points"} in total
              </span>
            )}
          </div>

          {quiz.questions.length === 0 && (
            <p className='mb-3 rounded-lg border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-500'>
              No questions yet. Add the first one below.
            </p>
          )}

          <ol className='space-y-4'>
            {quiz.questions.map((question, qIndex) => {
              const qKey = `${moduleId}-${lesson.position}-${question.position}`;
              const qIssues = issuesWithPrefix(`section_${moduleId}_lecture_${lesson.position}_quiz_questions_${qIndex}_`);
              const isMulti = question.type === "MULTIPLE_CHOICE";
              const isTrueFalse = question.type === "TRUE_FALSE";
              const texts = question.options.map(o => o.text.trim().toLowerCase()).filter(Boolean);
              const hasDuplicate = texts.length !== new Set(texts).size;
              const notice = questionNotice[qKey];

              return (
                <li
                  key={question.position}
                  className='rounded-xl border border-gray-200 bg-white p-4'
                >
                  <div className='mb-3 flex flex-wrap items-center gap-2'>
                    <span className='text-sm font-semibold text-gray-900'>Question {qIndex + 1}</span>
                    <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600'>
                      {questionTypeLabel(question.type)}
                    </span>
                    <label className='ml-auto flex items-center gap-2 text-xs text-gray-500'>
                      Points
                      <input
                        type='number'
                        min={1}
                        max={10}
                        onChange={e => handleQuestionInputChange(moduleId, lesson.position, question.position, "points", e.target.value)}
                        value={question.points || ""}
                        aria-label={`Points for question ${qIndex + 1}`}
                        className={inputClass(false, "w-16 px-2 py-1.5 text-center tabular-nums")}
                      />
                    </label>
                    <button
                      type='button'
                      onClick={() => handleDeleteQuiz(moduleId, lesson.position, question.position)}
                      aria-label={`Delete question ${qIndex + 1}`}
                      className={iconBtnDanger}
                    >
                      <Trash2
                        className='h-4 w-4'
                        aria-hidden='true'
                      />
                    </button>
                  </div>

                  <Field
                    label='Question'
                    htmlFor={`q-text-${qKey}`}
                    counter={{ value: question.text.length, max: 200, min: 10 }}
                  >
                    <TextArea
                      id={`q-text-${qKey}`}
                      onChange={e => handleQuestionInputChange(moduleId, lesson.position, question.position, "text", e.target.value)}
                      placeholder={isTrueFalse ? "Write a statement students mark as true or false" : "Write your question"}
                      value={question.text}
                      rows={2}
                      maxLength={200}
                    />
                  </Field>

                  <fieldset className='mt-4'>
                    <legend className='mb-2 text-[13px] font-medium text-gray-800'>
                      Answers
                      <span className='ml-1.5 font-normal text-gray-500'>
                        {isMulti ? "— tick every correct answer (up to 3)" : "— select the correct answer"}
                      </span>
                    </legend>
                    <div className={cx("grid gap-2", !isTrueFalse && "sm:grid-cols-2")}>
                      {question.options.map((option, oIndex) => {
                        const inputId = `q-${qKey}-opt-${option.position}`;
                        return (
                          <div
                            key={option.position}
                            className={cx(
                              "flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors",
                              option.isCorrect ? "border-emerald-500/60 bg-emerald-500/10" : "border-gray-200 bg-white"
                            )}
                          >
                            <input
                              id={inputId}
                              type={isMulti ? "checkbox" : "radio"}
                              name={`correct-${qKey}`}
                              checked={option.isCorrect}
                              onChange={() => updateQuizOptionCorrectAnswere(moduleId, lesson.position, question.position, option.position)}
                              aria-label={`Mark ${isTrueFalse ? option.text : `option ${oIndex + 1}`} as correct`}
                              className='h-4 w-4 shrink-0 cursor-pointer accent-emerald-600'
                            />
                            {isTrueFalse ? (
                              <label
                                htmlFor={inputId}
                                className='flex-1 cursor-pointer py-1 text-sm font-medium capitalize text-gray-800'
                              >
                                {option.text}
                              </label>
                            ) : (
                              <input
                                type='text'
                                value={option.text}
                                onChange={e => addQuizOption(moduleId, lesson.position, question.position, option.position, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                aria-label={`Option ${oIndex + 1} text`}
                                maxLength={50}
                                className='bare-input min-w-0 flex-1 border-0 bg-transparent py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400'
                              />
                            )}
                            {option.isCorrect && (
                              <span className='shrink-0 text-[11px] font-semibold text-emerald-700'>Correct</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>

                  {(hasDuplicate || notice || qIssues.length > 0) && (
                    <ul className='mt-3 space-y-1 text-xs text-amber-700'>
                      {hasDuplicate && <li>Two options have the same text. Make each option different.</li>}
                      {notice && <li>{notice}</li>}
                      {[...new Set(qIssues)].filter(m => !(hasDuplicate && m === "Option texts must be unique")).map(message => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Add question */}
          <div className='mt-4'>
            {pickerOpen ? (
              <div className='rounded-xl border border-gray-200 bg-gray-50 p-3'>
                <div className='mb-2 flex items-center justify-between'>
                  <p className='text-[13px] font-medium text-gray-800'>Choose a question type</p>
                  <button
                    type='button'
                    onClick={() => setAddQuestionFor(null)}
                    className='text-xs font-semibold text-gray-500 hover:text-gray-800'
                  >
                    Cancel
                  </button>
                </div>
                <div className='grid gap-2 sm:grid-cols-3'>
                  {QUESTION_TYPES.map(type => (
                    <button
                      key={type.value}
                      type='button'
                      onClick={() => addQuizQuestion(moduleId, lesson.position, type.value)}
                      className='rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-orange hover:bg-orange-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange'
                    >
                      <span className='block text-sm font-semibold text-gray-900'>{type.label}</span>
                      <span className='block text-xs text-gray-500'>{type.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => setAddQuestionFor(key)}
                className='flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-orange/60 hover:bg-orange-500/5 hover:text-gray-900'
              >
                <Plus
                  className='h-4 w-4'
                  aria-hidden='true'
                />
                Add question
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const defaultHostingValue = courseData.defaultHosting ?? (courseData.originalPrice > 0 ? 'PREMIUM' : policy?.defaultHosting) ?? 'PREMIUM';

  return (
    <div className='w-full'>
      <StepHeader
        headingText='Curriculum'
        description='Group lessons into modules. Click any title to rename it.'
        aside={
          <div className='flex flex-wrap gap-2 text-xs font-medium text-gray-600'>
            <span className='rounded-full bg-gray-100 px-2.5 py-1 tabular-nums'>
              {courseData.modules.length} {courseData.modules.length === 1 ? "module" : "modules"}
            </span>
            <span className='rounded-full bg-gray-100 px-2.5 py-1 tabular-nums'>
              {allLessons.length} {allLessons.length === 1 ? "lesson" : "lessons"}
            </span>
            {totalSeconds > 0 && (
              <span className='rounded-full bg-gray-100 px-2.5 py-1 tabular-nums'>{formatDuration(totalSeconds)}</span>
            )}
          </div>
        }
      />

      <form
        noValidate
        onSubmit={handleSubmit(onSubmitHandler, () => {
          requestAnimationFrame(() => {
            validationSummary.current?.focus();
            validationSummary.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        })}
      >
        {Object.keys(errors).length > 0 && (
          <ErrorSummary
            ref={validationSummary}
            title='Fix these lessons before continuing'
            messages={[...new Set(Object.entries(errors).map(([key, error]) => friendlyIssue(key, String(error?.message ?? 'Check this lesson.'), true)))]}
          />
        )}

        {/* ── Default hosting ── */}
        <section className='border-b border-gray-100 px-4 py-5 sm:px-8'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div className='max-w-prose'>
              <h3 className='text-[15px] font-semibold text-gray-900'>Default video hosting</h3>
              <p className='mt-1 text-sm text-gray-500'>
                Used for new video uploads. You can choose differently for any lesson.
                {policy && ` Maximum file size ${formatVideoBytes(policy.maxUploadBytes)}; large files upload in resumable chunks.`}
              </p>
            </div>
            <SelectInput
              aria-label='Default video hosting'
              value={defaultHostingValue}
              className='sm:!w-60'
              onChange={e => setCourseData(prev => ({ ...prev, defaultHosting: e.target.value as "FREE" | "PREMIUM" }))}
            >
              <option value='FREE' disabled={!policy?.freeEnabled || (courseData.originalPrice > 0 && !policy.allowFreePaid)}>Free hosting</option>
              <option value='PREMIUM' disabled={policy ? !policy.premiumEnabled : false}>Premium hosting</option>
            </SelectInput>
          </div>
          <div className='mt-3 space-y-2'>
            {policy?.workerAvailable === false && (
              <Callout tone='error' role='alert'>
                The video worker is offline. Ask the administrator to start it before uploading. Existing uploaded files are saved.
              </Callout>
            )}
            {policyError ? (
              <Callout tone='error' role='alert'>{policyError}</Callout>
            ) : !policy ? (
              <p role='status' className='flex items-center gap-2 text-xs text-gray-500'>
                <Loader2 className='h-3.5 w-3.5 animate-spin' aria-hidden='true' />
                Checking video hosting availability…
              </p>
            ) : !policy.freeEnabled ? (
              <p role='status' className='text-xs text-gray-500'>
                {policy.freeUnavailableReason ?? 'Free Hosting is currently unavailable. Ask an administrator to check Video Hosting settings.'}
              </p>
            ) : courseData.originalPrice > 0 && !policy.allowFreePaid ? (
              <p role='status' className='text-xs text-gray-500'>Free Hosting is disabled for paid lessons by the administrator.</p>
            ) : null}
          </div>
        </section>

        {/* ── Modules ── */}
        <div className='space-y-5 px-4 py-6 sm:px-8'>
          {courseData.modules.length === 0 && (
            <div className='rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center'>
              <ListChecks className='mx-auto h-8 w-8 text-gray-300' aria-hidden='true' />
              <p className='mt-2 text-sm font-semibold text-gray-800'>No modules yet</p>
              <p className='mt-1 text-sm text-gray-500'>Add a module to start building your curriculum.</p>
            </div>
          )}

          {courseData.modules.map((module, moduleIndex) => {
            const moduleIssue = liveIssues[`section_${module.position}`];
            const moduleSeconds = module.lessons.reduce((sum, l) => sum + (Number(l.duration) || 0), 0);

            return (
              <section
                key={module.position}
                aria-label={`Module ${moduleIndex + 1}: ${module.title}`}
                className='rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-5'
              >
                <div className='flex items-start gap-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='px-1 text-xs font-semibold text-orange'>Module {moduleIndex + 1}</p>
                    <InlineTitle
                      value={module.title}
                      onCommit={title => renameModule(module.position, title)}
                      label={`module ${moduleIndex + 1}`}
                      className='text-base font-semibold'
                    />
                    <p className='mt-0.5 px-1 text-xs text-gray-500'>
                      {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
                      {moduleSeconds > 0 && ` · ${formatDuration(moduleSeconds)}`}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => deleteSection(module.position)}
                    aria-label={`Delete module ${moduleIndex + 1}`}
                    className={iconBtnDanger}
                  >
                    <Trash2 className='h-4 w-4' aria-hidden='true' />
                  </button>
                </div>

                {moduleIssue && (
                  <p className='mt-2 px-1 text-xs text-amber-700'>
                    {friendlyIssue(`section_${module.position}`, String(moduleIssue.message ?? ""))}
                  </p>
                )}

                {/* Lessons — change K: no fake drag handles */}
                <ol className='mt-4 space-y-3'>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const issues = issueEntries(`section_${module.position}_lecture_${lesson.position}_`);
                    // Question-level issues are shown on each question card instead.
                    const lessonOnlyIssues = issues
                      .filter(([key]) => !key.includes("_quiz_questions_"))
                      .map(([, message]) => message);
                    const status = lessonStatus(lesson, issues.length);
                    const typeMeta = LESSON_TYPES.find(t => t.value === lesson.type);
                    const TypeIcon = typeMeta?.icon ?? CircleDashed;
                    const open = lesson.expanded || lesson.type === null;
                    const isLast = lessonIndex === module.lessons.length - 1;

                    return (
                      <li
                        key={lesson.position}
                        className='relative sm:pl-11'
                      >
                        {!isLast && (
                          <span
                            aria-hidden='true'
                            className='absolute -bottom-3 left-[15px] top-11 hidden w-0.5 bg-gray-200 sm:block'
                          />
                        )}
                        <span
                          aria-hidden='true'
                          className={cx(
                            "absolute left-0 top-2.5 hidden h-8 w-8 items-center sm:flex justify-center rounded-full border-2 bg-white",
                            nodeTone[status.tone]
                          )}
                        >
                          <TypeIcon className='h-4 w-4' />
                        </span>

                        <div className='rounded-xl border border-gray-200 bg-white shadow-sm'>
                          <div className='flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2.5 sm:px-4'>
                            <span className='shrink-0 text-xs font-semibold tabular-nums text-gray-400'>
                              {moduleIndex + 1}.{lessonIndex + 1}
                            </span>
                            <div className='min-w-0 flex-1'>
                              <InlineTitle
                                value={lesson.title}
                                onCommit={title => renameLesson(module.position, lesson.position, title)}
                                label={`lesson ${moduleIndex + 1}.${lessonIndex + 1}`}
                                className='text-sm font-medium'
                              />
                            </div>
                            {typeMeta && (
                              <span className='hidden text-xs text-gray-400 sm:inline'>{typeMeta.label}</span>
                            )}
                            <StatusBadge status={status} />
                            {lesson.type !== null && (
                              <button
                                type='button'
                                onClick={() => toggleLectureAndType(module.position, lesson.position, "expanded")}
                                aria-expanded={Boolean(lesson.expanded)}
                                aria-label={lesson.expanded ? "Collapse lesson" : "Edit lesson content"}
                                className={iconBtn}
                              >
                                <ChevronDown
                                  className={cx("h-4 w-4 transition-transform", lesson.expanded && "rotate-180")}
                                  aria-hidden='true'
                                />
                              </button>
                            )}
                            <button
                              type='button'
                              onClick={() => deleteLecture(module.position, lesson.position)}
                              aria-label={`Delete lesson ${moduleIndex + 1}.${lessonIndex + 1}`}
                              className={iconBtnDanger}
                            >
                              <Trash2 className='h-4 w-4' aria-hidden='true' />
                            </button>
                          </div>

                          {open && (
                            <div className='space-y-5 border-t border-gray-100 px-3 py-4 sm:px-5 sm:py-5'>
                              {lesson.type === null ? (
                                renderTypePicker(module.position, lesson)
                              ) : (
                                <>
                                  <div className='flex flex-wrap items-center justify-between gap-2'>
                                    <span className='inline-flex items-center gap-2 text-xs font-semibold text-gray-600'>
                                      <TypeIcon className='h-3.5 w-3.5' aria-hidden='true' />
                                      {typeMeta?.label} lesson
                                    </span>
                                    <button
                                      type='button'
                                      onClick={() => resetLessonType(module.position, lesson)}
                                      disabled={Boolean(lesson.pendingVideoUploadJobId) || (loading && uploadErrorKey === `${module.position}-${lesson.position}`)}
                                      title={lesson.pendingVideoUploadJobId ? "Wait for the video upload to finish first" : undefined}
                                      className='inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-500/10 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40'
                                    >
                                      <Repeat className='h-3.5 w-3.5' aria-hidden='true' />
                                      Change type
                                    </button>
                                  </div>
                                  {lesson.type === "VIDEO" && renderVideoEditor(module.position, lesson)}
                                  {lesson.type === "ARTICLE" && renderArticleEditor(module.position, lesson)}
                                  {lesson.type === "QUIZ" && renderQuizEditor(module.position, lesson)}
                                </>
                              )}

                              {lesson.type !== null && lessonOnlyIssues.length > 0 && !lesson.pendingVideoUploadJobId && (
                                <Callout tone='warning' title='To finish this lesson'>
                                  <ul className='list-disc space-y-0.5 pl-4'>
                                    {lessonOnlyIssues.map((message, i) => (
                                      <li key={i}>{message}</li>
                                    ))}
                                  </ul>
                                </Callout>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <div className='mt-3 sm:pl-11'>
                  <button
                    type='button'
                    onClick={() => addLesson(module.position)}
                    className='flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-orange/60 hover:bg-orange-500/5 hover:text-gray-900'
                  >
                    <Plus className='h-4 w-4' aria-hidden='true' />
                    Add lesson
                  </button>
                </div>
              </section>
            );
          })}

          <button
            type='button'
            onClick={addSection}
            className='flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-orange/40 bg-orange-500/5 py-4 text-sm font-semibold text-orange transition-colors hover:border-orange hover:bg-orange-500/10'
          >
            <Plus className='h-4 w-4' aria-hidden='true' />
            Add module
          </button>
        </div>

        <CourseFooter
          handlePrevious={handlePrevious}
          isSubmitting={isSubmitting}
          currentStep={currentStep}
        />
      </form>
    </div>
  );
}
