import { apiClient } from "@/lib/api/client.ts";
import { getUpload, uploadLessonVideo, type HostingPolicy } from "@/lib/course/videoHosting";
import {
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Loader,
  Menu,
  Pencil,
  Plus,
  Trash,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useSessionContext } from "../../../../../contexts/SessionContext.tsx";
import CourseFooter from "./CourseFooter.tsx";
import CourseModal from "./CourseModal.tsx";
import StepHeader from "./StepHeader.tsx";
import { type CourseLesson, type CourseModule, type CreateCourseData } from "./page.tsx";

type ExtendedCourseLesson = CourseLesson & {
  expanded?: boolean;
  lessonTypeSelection?: boolean;
};

type ExtendedCourseModule = CourseModule & {
  lessons: ExtendedCourseLesson[];
};
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
  const [openModal, setOpeModal] = useState<{
    type: string;
    sectionId?: number;
    lectureId?: number;
  }>({
    type: "",
    sectionId: undefined,
    lectureId: undefined,
  });
  const [uploadError, setUploadError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [uploadPercentage, setUploadPercentage] = useState<string>("");
  const { user } = useSessionContext();

  const [policy, setPolicy] = useState<HostingPolicy | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const draftKey = `aloskill:curriculum:${user?.id ?? ""}:${courseData.id ?? "new"}`;
  useEffect(() => {
    void apiClient.get<HostingPolicy>("/course/video/policy").then(response => {
      if (response.data) setPolicy(response.data);
    });
  }, []);
  useEffect(() => {
    if (!user?.id) return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved) as {
          modules: CourseModule[];
          defaultHosting?: "FREE" | "PREMIUM";
        };
        if (Array.isArray(draft.modules)) setCourseData(prev => ({ ...prev, ...draft }));
      }
    } catch {
      /* Preserve server state if local storage is unavailable. */
    }
    setDraftLoaded(true);
  }, [draftKey, user?.id, setCourseData]);
  useEffect(() => {
    if (!draftLoaded) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ modules: courseData.modules, defaultHosting: courseData.defaultHosting })
      );
    } catch {
      /* Storage full. */
    }
  }, [courseData.modules, courseData.defaultHosting, draftKey, draftLoaded]);
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const pending = courseData.modules
        .flatMap(m => m.lessons)
        .filter(l => l.pendingVideoUploadJobId);
      for (const lesson of pending) {
        try {
          const job = await getUpload(lesson.pendingVideoUploadJobId!);
          if (cancelled) return;
          setCourseData(prev => ({
            ...prev,
            modules: prev.modules.map(m => ({
              ...m,
              lessons: m.lessons.map(l => {
                if (l.pendingVideoUploadJobId !== job.id) return l;
                if (job.status === "READY" && job.contentUrl)
                  return {
                    ...l,
                    hostingType: l.pendingHostingType,
                    videoUploadJobId: job.id,
                    pendingVideoUploadJobId: undefined,
                    pendingHostingType: undefined,
                    contentUrl: { name: job.fileName, url: job.contentUrl },
                    duration: job.duration,
                    uploadMessage: "Video ready",
                  };
                return {
                  ...l,
                  uploadMessage:
                    job.status === "FAILED"
                      ? (job.uploadError ?? "Upload failed. Select the same file to retry.")
                      : job.status === "STAGING"
                        ? "Upload paused. Select the same file to resume."
                        : "Processing video…",
                };
              }),
            })),
          }));
        } catch {
          /* Retry status after a temporary connection failure. */
        }
      }
    };
    const timer = setInterval(() => void poll(), 10_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [courseData.modules, setCourseData]);

  const [sections, setSections] = useState<ExtendedCourseModule[]>([
    {
      position: 1,
      title: "Module 1",
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
  ]);
  const [showAddQuestions, setShowAddQuestions] = useState<boolean>(false);
  const [quizOptionError, setQuizOptionError] = useState<string>("");
  const {
    register,
    unregister,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

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
              title: "Lecture 1",
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
      setSections(sections.filter(section => section.position !== moduleId));
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
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file) {
        const isVideo = file.type.startsWith("video/");
        const isPDF = file.type.startsWith("application/pdf");

        if (isVideo) {
          if (loading) return;
          const lesson = courseData.modules
            .find(m => m.position === sectionId)
            ?.lessons.find(l => l.position === lectureId);
          if (!lesson) return;
          const hostingType =
            lesson.requestedHostingType ??
            lesson.hostingType ??
            courseData.defaultHosting ??
            (courseData.originalPrice > 0 ? "PREMIUM" : policy?.defaultHosting) ??
            "PREMIUM";
          if (
            hostingType === "FREE" &&
            (!lesson.youtubeDisclosureAccepted ||
              (courseData.originalPrice > 0 && !lesson.freeHostingAcknowledged))
          ) {
            setUploadError(
              "Accept the upload disclosure and limited protection acknowledgement before uploading."
            );
            return;
          }
          setLoading(true);
          setUploadError("");
          let pendingId = "";
          try {
            const job = await uploadLessonVideo(file, {
              hostingType,
              courseId: courseData.id,
              title: lesson.title,
              description: lesson.description,
              acknowledged: Boolean(lesson.freeHostingAcknowledged),
              youtubeDisclosureAccepted: Boolean(lesson.youtubeDisclosureAccepted),
              key: `${draftKey}:${lesson.id ?? `${sectionId}-${lectureId}`}`,
              onProgress: setUploadPercentage,
              onJob: id => {
                pendingId = id;
                setCourseData(prev => ({
                  ...prev,
                  modules: prev.modules.map(m => ({
                    ...m,
                    lessons: m.lessons.map(l =>
                      m.position === sectionId && l.position === lectureId
                        ? { ...l, pendingVideoUploadJobId: id, pendingHostingType: hostingType }
                        : l
                    ),
                  })),
                }));
              },
            });
            if (!job.contentUrl) throw new Error("Video is not ready yet.");
            setCourseData(prev => ({
              ...prev,
              modules: prev.modules.map(m => ({
                ...m,
                lessons: m.lessons.map(l =>
                  l.pendingVideoUploadJobId === pendingId
                    ? {
                        ...l,
                        hostingType,
                        videoUploadJobId: job.id,
                        pendingVideoUploadJobId: undefined,
                        pendingHostingType: undefined,
                        contentUrl: { name: file.name, url: job.contentUrl! },
                        duration: job.duration,
                        uploadMessage: "Video ready",
                      }
                    : l
                ),
              })),
            }));
          } catch (error) {
            setUploadError(
              error instanceof Error
                ? error.message
                : "Video upload failed. Select the same file to retry."
            );
          } finally {
            setLoading(false);
            setUploadPercentage("");
            e.target.value = "";
          }
          return;
        }

        if (isPDF) {
          try {
            const uploadResult = await uploadFileToBunny(Array.from(e.target.files ?? []));
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
                          files: uploadResult,
                          duration:
                            lesson.type === "ARTICLE" && lesson.duration
                              ? lesson.duration + uploadResult.length * 5 * 60
                              : uploadResult.length * 5 * 60,
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
            // console.error("Error uploading file:", error);
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
    setShowAddQuestions(false);
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
                  const normalizedValue = value.trim().toLowerCase();
                  const isDuplicate =
                    normalizedValue &&
                    updatedOptions.some(
                      option =>
                        option.position !== optionId &&
                        option.text.trim().toLowerCase() === normalizedValue
                    );
                  setQuizOptionError(
                    isDuplicate
                      ? "This option already exists. Please enter a different option."
                      : ""
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

  const updateQuizOptionCorrectAnswere = (
    moduleId: number,
    lessonId: number,
    questionId: number,
    optionId: number
  ) => {
    setSections(
      sections.map(section => {
        if (section.position === moduleId) {
          return {
            ...section,
            lessons: section.lessons.map(lesson => {
              if (lesson.position === lessonId) {
                if (lesson.quiz) {
                  return {
                    ...lesson,
                    quiz: {
                      ...lesson.quiz,
                      questions: lesson.quiz?.questions.map(question => {
                        if (question.position === questionId) {
                          return {
                            ...question,
                            options: question.options.map(option => {
                              if (option.position === optionId) {
                                if (option.isCorrect) {
                                  return { ...option, isCorrect: false };
                                } else {
                                  if (question.type === "MULTIPLE_CHOICE") {
                                    if (question.options.filter(o => o.isCorrect).length >= 3) {
                                      alert(
                                        "You can select maximum three correct answer for multiple choice questions."
                                      );
                                    } else {
                                      return { ...option, isCorrect: true };
                                    }
                                  } else if (question.type === "SINGLE_CHOICE") {
                                    if (question.options.filter(o => o.isCorrect).length >= 1) {
                                      alert(
                                        "You can only select one correct answer for single choice questions."
                                      );
                                    } else {
                                      return { ...option, isCorrect: true };
                                    }
                                  } else {
                                    if (question.options.filter(o => o.isCorrect).length >= 1) {
                                      alert(
                                        "You can only select one correct answer for true false questions."
                                      );
                                    } else {
                                      return { ...option, isCorrect: true };
                                    }
                                  }
                                }
                              }
                              return option;
                            }),
                          };
                        }
                        return question;
                      }),
                    },
                  };
                }
              }
              return lesson;
            }),
          };
        }
        return section;
      })
    );
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
                      questions: lesson.quiz?.questions.map(question => {
                        if (question.position === questionId) {
                          return {
                            ...question,
                            options: question.options.map(option => {
                              if (option.position === optionId) {
                                if (option.isCorrect) {
                                  return { ...option, isCorrect: false };
                                } else {
                                  if (question.type === "MULTIPLE_CHOICE") {
                                    if (question.options.filter(o => o.isCorrect).length >= 3) {
                                      alert(
                                        "You can select maximum three correct answer for multiple choice questions."
                                      );
                                    } else {
                                      return { ...option, isCorrect: true };
                                    }
                                  } else if (question.type === "SINGLE_CHOICE") {
                                    if (question.options.filter(o => o.isCorrect).length >= 1) {
                                      alert(
                                        "You can only select one correct answer for single choice questions."
                                      );
                                    } else {
                                      return { ...option, isCorrect: true };
                                    }
                                  } else {
                                    if (question.options.filter(o => o.isCorrect).length >= 1) {
                                      alert(
                                        "You can only select one correct answer for true false questions."
                                      );
                                    } else {
                                      return { ...option, isCorrect: true };
                                    }
                                  }
                                }
                              }
                              return option;
                            }),
                          };
                        }
                        return question;
                      }),
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

  const deleteLectureFile = async (
    sectionId: number,
    lectureId: number,
    fileName?: string,
    type?: string
  ) => {
    const selectedModule = courseData.modules.find(m => m.position === sectionId);
    const lesson = selectedModule?.lessons.find(l => l.position === lectureId);
    if (type === "video") {
      if (!window.confirm("Remove this video from the draft? Save the course to apply the change."))
        return;
      setCourseData(prev => ({
        ...prev,
        modules: prev.modules.map(m => ({
          ...m,
          lessons: m.lessons.map(l =>
            m.position === sectionId && l.position === lectureId
              ? {
                  ...l,
                  contentUrl: null,
                  videoUploadJobId: null,
                  pendingVideoUploadJobId: undefined,
                  hostingType: undefined,
                  uploadMessage: "Video removed from draft. Save to apply.",
                }
              : l
          ),
        })),
      }));
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
    unregister(`section_${moduleId}_lecture_${lessonId}_quiz_question_${questionId}`);
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

  const loadModalComponent = (type: string) => {
    return (
      <CourseModal
        modalType={type}
        sections={sections}
        setSections={setSections}
        setOpeModal={setOpeModal}
        sectionId={openModal.sectionId}
        lectureId={openModal.lectureId}
        courseData={courseData}
        setCourseData={setCourseData}
      />
    );
  };

  return (
    <div className='w-full bg-white'>
      {/* Header */}
      <StepHeader headingText='Course Curriculum' />
      {/* Form Content */}
      <form
        onSubmit={handleSubmit(onSubmitHandler)}
        className='p-6'
      >
        {/* Sections */}
        <div className='space-y-4'>
          <label className='mb-4 block text-sm font-medium'>
            Default video hosting
            <select
              value={
                courseData.defaultHosting ??
                (courseData.originalPrice > 0 ? "PREMIUM" : policy?.defaultHosting) ??
                "PREMIUM"
              }
              className='ml-2 rounded border p-2'
              onChange={e =>
                setCourseData(prev => ({
                  ...prev,
                  defaultHosting: e.target.value as "FREE" | "PREMIUM",
                }))
              }
            >
              <option
                value='FREE'
                disabled={!policy?.freeEnabled}
              >
                Free Hosting
              </option>
              <option
                value='PREMIUM'
                disabled={policy ? !policy.premiumEnabled : false}
              >
                Premium Hosting
              </option>
            </select>
          </label>
          {courseData.modules.map((module, moduleIndex) => (
            <div
              key={module.position}
              className='bg-gray-50 rounded p-4'
            >
              {/* Section Header */}
              <div className='flex items-center justify-between pb-4'>
                <div className='w-[90%] flex items-center gap-3 overflow-hidden'>
                  <Menu
                    size={16}
                    className='text-gray-500'
                  />
                  <span className='text-sm font-medium text-gray-800 whitespace-nowrap'>
                    Module 0{moduleIndex + 1} :
                  </span>
                  <span
                    className={`${module.title.length > 5 ? "text-gray-800" : "text-red-500"} text-sm whitespace-break-spaces`}
                  >
                    {module.title}
                  </span>
                </div>
                <div className='w-[10%] flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => addLesson(module.position)}
                    className='p-1.5 hover:bg-gray-200 rounded transition-colors'
                  >
                    <Plus
                      size={18}
                      className='text-gray-600'
                    />
                  </button>
                  <button
                    type='button'
                    onClick={() => setOpeModal({ type: "sectionName", sectionId: module.position })}
                    className='p-1.5 hover:bg-gray-200 rounded transition-colors'
                  >
                    <Pencil
                      size={18}
                      className='text-gray-600'
                    />
                  </button>
                  <button
                    type='button'
                    onClick={() => deleteSection(module.position)}
                    className='p-1.5 hover:bg-gray-200 rounded transition-colors'
                  >
                    <Trash2
                      size={18}
                      className='text-gray-600'
                    />
                  </button>
                </div>
              </div>

              {/* Lectures */}
              <div className='flex flex-col gap-4'>
                {module.lessons.map((lesson, index) => (
                  <div key={index}>
                    <div className='flex items-center justify-between px-4 py-2 bg-white relative'>
                      <div className='flex items-center gap-3 overflow-hidden'>
                        <Menu
                          size={16}
                          className='text-gray-500'
                        />
                        <span
                          className={`${lesson.title.length > 5 ? "text-gray-800" : "text-red-500"} text-sm whitespace-break-spaces`}
                        >
                          {lesson.title}
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <button
                          type='button'
                          onClick={() =>
                            toggleLectureAndType(module.position, lesson.position, "expanded")
                          }
                          className='flex items-center gap-2 px-2 py-1.5 bg-orange-50 text-orange-500 rounded text-sm hover:bg-orange-100 transition-colors'
                        >
                          Contents
                          {lesson.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            setOpeModal({
                              type: "lectureName",
                              sectionId: module.position,
                              lectureId: lesson.position,
                            })
                          }
                          className='p-1.5 hover:bg-gray-100 rounded transition-colors'
                        >
                          <Pencil
                            size={16}
                            className='text-gray-500'
                          />
                        </button>
                        <button
                          type='button'
                          onClick={() => deleteLecture(module.position, lesson.position)}
                          className='p-1.5 hover:bg-gray-100 rounded transition-colors'
                        >
                          <Trash2
                            size={16}
                            className='text-gray-500'
                          />
                        </button>
                      </div>
                    </div>
                    <input
                      type='hidden'
                      {...register(`section_${module.position}_lecture_${lesson.position}_type`, {
                        required: `Please select a content type for Module ${module.position} lesson ${lesson.position}.`,
                      })}
                      value={lesson.type || ""}
                    />
                    {lesson.type === null &&
                      errors[`section_${module.position}_lecture_${lesson.position}_type`] && (
                        <p className='text-red-500 text-sm mt-1'>
                          {
                            errors[`section_${module.position}_lecture_${lesson.position}_type`]
                              ?.message as string
                          }
                        </p>
                      )}
                    {lesson.type === "QUIZ" && (
                      <>
                        <input
                          type='hidden'
                          {...register(
                            `section_${module.position}_lecture_${lesson.position}_addQuiz_type`,
                            {
                              required: `Please Add a Quiz for Module ${module.position} lesson ${lesson.position}.`,
                            }
                          )}
                          value={lesson.quiz ? "added" : ""}
                        />
                        {lesson.quiz &&
                          !showAddQuestions &&
                          lesson.quiz?.questions.length === 0 &&
                          errors[
                            `section_${module.position}_lecture_${lesson.position}_addQuiz_type`
                          ] && (
                            <p className='text-red-500 text-sm mt-1'>
                              {
                                errors[
                                  `section_${module.position}_lecture_${lesson.position}_addQuiz_type`
                                ]?.message as string
                              }
                            </p>
                          )}

                        <input
                          type='hidden'
                          {...register(
                            `section_${module.position}_lecture_${lesson.position}_quiz_type`,
                            {
                              required: `Please select a Quiz type for Module ${module.position} lesson ${lesson.position}.`,
                            }
                          )}
                          value={lesson.quiz && lesson.quiz.questions.length > 0 ? "added" : ""}
                        />
                        {lesson.quiz &&
                          lesson.quiz?.questions.length <= 0 &&
                          showAddQuestions &&
                          errors[
                            `section_${module.position}_lecture_${lesson.position}_quiz_type`
                          ] && (
                            <p className='text-red-500 text-sm mt-1'>
                              {
                                errors[
                                  `section_${module.position}_lecture_${lesson.position}_quiz_type`
                                ]?.message as string
                              }
                            </p>
                          )}
                      </>
                    )}
                    {lesson.type === "QUIZ" && !lesson.expanded && (
                      <>
                        <input
                          type='hidden'
                          {...register(
                            `section_${module.position}_lecture_${lesson.position}_quiz_title`,
                            {
                              required: `Please Add Quiz title for Module ${module.position} lesson ${lesson.position}.`,
                            }
                          )}
                          value={lesson.quiz && lesson.quiz.title ? lesson.quiz.title : ""}
                        />
                        {lesson.quiz &&
                          lesson.quiz?.questions.length <= 0 &&
                          errors[
                            `section_${module.position}_lecture_${lesson.position}_quiz_title`
                          ] && (
                            <p className='text-red-500 text-sm mt-1'>
                              {
                                errors[
                                  `section_${module.position}_lecture_${lesson.position}_quiz_title`
                                ]?.message as string
                              }
                            </p>
                          )}

                        <input
                          type='hidden'
                          {...register(
                            `section_${module.position}_lecture_${lesson.position}_quiz_description`,
                            {
                              required: `Please Add Quiz description for Module ${module.position} lesson ${lesson.position}.`,
                            }
                          )}
                          value={
                            lesson.quiz && lesson.quiz.description ? lesson.quiz.description : ""
                          }
                        />
                        {lesson.quiz &&
                          lesson.quiz?.questions.length <= 0 &&
                          errors[
                            `section_${module.position}_lecture_${lesson.position}_quiz_description`
                          ] && (
                            <p className='text-red-500 text-sm mt-1'>
                              {
                                errors[
                                  `section_${module.position}_lecture_${lesson.position}_quiz_description`
                                ]?.message as string
                              }
                            </p>
                          )}

                        <input
                          type='hidden'
                          {...register(
                            `section_${module.position}_lecture_${lesson.position}_quiz_score`,
                            {
                              required: `Please Add Quiz passing score for Module ${module.position} lesson ${lesson.position}.`,
                            }
                          )}
                          value={
                            lesson.quiz && lesson.quiz.passingScore ? lesson.quiz.passingScore : ""
                          }
                        />
                        {lesson.quiz &&
                          lesson.quiz?.questions.length <= 0 &&
                          errors[
                            `section_${module.position}_lecture_${lesson.position}_quiz_score`
                          ] && (
                            <p className='text-red-500 text-sm mt-1'>
                              {
                                errors[
                                  `section_${module.position}_lecture_${lesson.position}_quiz_score`
                                ]?.message as string
                              }
                            </p>
                          )}
                      </>
                    )}
                    {/* Expanded Content */}
                    {lesson.expanded && (
                      <div className='h-auto bg-white p-4 pt-0'>
                        {/* Contents Type Selection */}
                        {lesson.lessonTypeSelection && (
                          <div>
                            <span className='text-sm text-gray-600 mb-1'>
                              Select a content type :
                            </span>
                            <div className='flex items-center justify-center gap-10 border border-dashed border-gray-200 p-2'>
                              <button
                                type='button'
                                onClick={() => {
                                  toggleLectureAndType(
                                    module.position,
                                    lesson.position,
                                    "lessonTypeSelection",
                                    "VIDEO"
                                  );
                                  setValue(
                                    `section_${module.position}_lecture_${lesson.position}_type`,
                                    "VIDEO"
                                  );
                                }}
                                className='px-3 py-1.5 border border-gray-100 text-gray-800 rounded text-sm hover:bg-gray-100 transition-colors duration-500 cursor-pointer'
                              >
                                Video
                              </button>
                              <button
                                type='button'
                                onClick={() => {
                                  toggleLectureAndType(
                                    module.position,
                                    lesson.position,
                                    "lessonTypeSelection",
                                    "ARTICLE"
                                  );
                                  setValue(
                                    `section_${module.position}_lecture_${lesson.position}_type`,
                                    "ARTICLE"
                                  );
                                }}
                                className='px-3 py-1.5 border border-gray-100 text-gray-800 rounded text-sm hover:bg-gray-100 transition-colors duration-500 cursor-pointer'
                              >
                                Article
                              </button>
                              <button
                                type='button'
                                onClick={() => {
                                  toggleLectureAndType(
                                    module.position,
                                    lesson.position,
                                    "lessonTypeSelection",
                                    "QUIZ"
                                  );
                                  setValue(
                                    `section_${module.position}_lecture_${lesson.position}_type`,
                                    "QUIZ"
                                  );
                                }}
                                className='px-3 py-1.5 border border-gray-100 text-gray-800 rounded text-sm hover:bg-gray-100 transition-colors duration-500 cursor-pointer'
                              >
                                Quiz
                              </button>
                            </div>
                          </div>
                        )}
                        {/* Contents Details */}
                        {lesson.type === "VIDEO" && (
                          <div className='bg-gray-100/20 w-full h-full p-2 pb-0 flex flex-col gap-1 rounded'>
                            <fieldset
                              disabled={loading}
                              className='mb-3 space-y-2 rounded border border-gray-200 bg-white p-3 text-sm'
                            >
                              <legend className='px-1 font-semibold'>Video hosting</legend>
                              {(
                                [
                                  [
                                    "FREE",
                                    "Free Hosting",
                                    "Standard video hosting. Suitable for free lessons and content that does not require advanced protection.",
                                  ],
                                  [
                                    "PREMIUM",
                                    "Premium Hosting",
                                    "Protected video hosting with enhanced access security.",
                                  ],
                                ] as const
                              ).map(([value, label, description]) => (
                                <label
                                  key={value}
                                  className='flex items-start gap-2 p-2'
                                >
                                  <input
                                    type='radio'
                                    name={`hosting-${module.position}-${lesson.position}`}
                                    value={value}
                                    checked={
                                      (lesson.requestedHostingType ??
                                        lesson.hostingType ??
                                        courseData.defaultHosting ??
                                        (courseData.originalPrice > 0
                                          ? "PREMIUM"
                                          : policy?.defaultHosting) ??
                                        "PREMIUM") === value
                                    }
                                    disabled={
                                      value === "FREE"
                                        ? !policy?.freeEnabled ||
                                          (courseData.originalPrice > 0 && !policy.allowFreePaid)
                                        : policy
                                          ? !policy.premiumEnabled
                                          : false
                                    }
                                    onChange={() =>
                                      setCourseData(prev => ({
                                        ...prev,
                                        modules: prev.modules.map(m => ({
                                          ...m,
                                          lessons: m.lessons.map(l =>
                                            m.position === module.position &&
                                            l.position === lesson.position
                                              ? {
                                                  ...l,
                                                  requestedHostingType: value,
                                                  youtubeDisclosureAccepted: false,
                                                }
                                              : l
                                          ),
                                        })),
                                      }))
                                    }
                                  />
                                  <span>
                                    <strong>{label}</strong>
                                    {value === "PREMIUM" && courseData.originalPrice > 0
                                      ? " (Recommended)"
                                      : ""}
                                    <span className='block text-xs text-gray-500'>
                                      {description}
                                    </span>
                                  </span>
                                </label>
                              ))}
                              {(lesson.requestedHostingType ??
                                lesson.hostingType ??
                                courseData.defaultHosting ??
                                (courseData.originalPrice > 0
                                  ? "PREMIUM"
                                  : policy?.defaultHosting) ??
                                "PREMIUM") === "FREE" && (
                                <>
                                  <div className='rounded bg-orange-50 p-3 text-xs'>
                                    Upload destination: the central ALOSKILL YouTube channel.
                                    Privacy: Unlisted; embedding enabled. Title: {lesson.title}.
                                    Description: {lesson.description || "(empty)"}. A private course
                                    playlist organizes these videos. Anyone with a video link may
                                    share it.
                                    <label className='mt-2 flex gap-2'>
                                      <input
                                        type='checkbox'
                                        checked={Boolean(lesson.youtubeDisclosureAccepted)}
                                        onChange={e => {
                                          const checked = e.target.checked;
                                          setCourseData(prev => ({
                                            ...prev,
                                            modules: prev.modules.map(m => ({
                                              ...m,
                                              lessons: m.lessons.map(l =>
                                                m.position === module.position &&
                                                l.position === lesson.position
                                                  ? { ...l, youtubeDisclosureAccepted: checked }
                                                  : l
                                              ),
                                            })),
                                          }));
                                        }}
                                      />
                                      I authorize this upload to YouTube as Unlisted and agree to
                                      the{" "}
                                      <a
                                        className='underline'
                                        href='https://www.youtube.com/t/terms'
                                        target='_blank'
                                        rel='noreferrer'
                                      >
                                        YouTube Terms
                                      </a>{" "}
                                      and{" "}
                                      <a
                                        className='underline'
                                        href='https://policies.google.com/privacy'
                                        target='_blank'
                                        rel='noreferrer'
                                      >
                                        Google Privacy Policy
                                      </a>
                                      .
                                    </label>
                                  </div>
                                  {courseData.originalPrice > 0 && (
                                    <label className='flex gap-2 text-xs text-orange-700'>
                                      <input
                                        type='checkbox'
                                        checked={Boolean(lesson.freeHostingAcknowledged)}
                                        onChange={e => {
                                          const checked = e.target.checked;
                                          setCourseData(prev => ({
                                            ...prev,
                                            modules: prev.modules.map(m => ({
                                              ...m,
                                              lessons: m.lessons.map(l =>
                                                m.position === module.position &&
                                                l.position === lesson.position
                                                  ? { ...l, freeHostingAcknowledged: checked }
                                                  : l
                                              ),
                                            })),
                                          }));
                                        }}
                                      />
                                      I understand that paid content links can be shared and access
                                      protection is limited.
                                    </label>
                                  )}
                                </>
                              )}
                              {(lesson.contentUrl?.url || lesson.pendingVideoUploadJobId) && (
                                <label className='block cursor-pointer rounded border border-dashed p-2 text-center'>
                                  {lesson.contentUrl?.url
                                    ? "Replace video / change hosting (select source file)"
                                    : "Select video / retry upload"}
                                  <input
                                    type='file'
                                    accept='.mp4,.mov,.webm'
                                    className='block w-full text-xs'
                                    disabled={loading}
                                    onChange={e =>
                                      void handleFileSelect(e, module.position, lesson.position)
                                    }
                                  />
                                </label>
                              )}
                              {lesson.uploadMessage && (
                                <p
                                  role='status'
                                  className='text-xs'
                                >
                                  {lesson.uploadMessage}
                                </p>
                              )}
                              {uploadPercentage && (
                                <p
                                  role='status'
                                  className='text-xs'
                                >
                                  {uploadPercentage}
                                </p>
                              )}
                            </fieldset>
                            {/* Video and Files */}
                            <div className='flex items-center justify-center gap-3'>
                              {/* Add Video For Lessons */}
                              {lesson.contentUrl?.name ? (
                                <>
                                  <div className='w-full rounded border border-dashed border-gray-200 p-3 flex items-center justify-start hover:bg-gray-100/40 transition-colors relative'>
                                    <span className='text-sm w-[95%]'>
                                      {lesson.contentUrl.name}
                                    </span>
                                    <span
                                      onClick={() =>
                                        deleteLectureFile(
                                          module.position,
                                          lesson.position,
                                          undefined,
                                          "video"
                                        )
                                      }
                                      className='absolute right-2 h-full w-fit flex items-center cursor-pointer'
                                    >
                                      <Trash className='w-4 h-4' />
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div
                                    className={`w-full rounded border border-dashed border-gray-200 p-3 flex items-center justify-center hover:bg-gray-100/40 transition-colors ${
                                      errors[
                                        `section_${module.position}_lecture_${lesson.position}_video`
                                      ] && "bg-red-50"
                                    }`}
                                  >
                                    {loading ? (
                                      <Loader className='w-4 h-4 animate-spin mx-auto my-auto' />
                                    ) : (
                                      <>
                                        {uploadPercentage ? (
                                          <span className='flex items-center gap-2 text-sm'>
                                            <CloudUpload className='animate-pulse mr-2 w-4 h-4' />{" "}
                                            {uploadPercentage}
                                          </span>
                                        ) : (
                                          <>
                                            <label
                                              htmlFor={`lessonVideo-${module.position}-${lesson.position}`}
                                              className={`flex items-center justify-center gap-2 text-sm w-full cursor-pointer`}
                                            >
                                              <Upload className='w-3 h-3' /> Add Video
                                            </label>
                                            <input
                                              {...register(
                                                `section_${module.position}_lecture_${lesson.position}_video`,
                                                {
                                                  required: "Video is required for this lesson",
                                                }
                                              )}
                                              onChange={e =>
                                                handleFileSelect(
                                                  e,
                                                  module.position,
                                                  lesson.position
                                                )
                                              }
                                              id={`lessonVideo-${module.position}-${lesson.position}`}
                                              type='file'
                                              accept='.mp4,.mov,.webm'
                                              className='hidden'
                                            />
                                          </>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </>
                              )}

                              {/* Add File For Lessons */}
                              {fileLoading ? (
                                <div className='w-full rounded border border-dashed border-gray-200 p-3 flex flex-col items-center justify-start hover:bg-gray-100/40 transition-colors'>
                                  <Loader className='w-4 h-4 animate-spin mx-auto my-auto' />
                                </div>
                              ) : lesson.files && lesson.files.length > 0 ? (
                                <>
                                  <div className='w-full rounded border border-dashed border-gray-200 p-2 flex flex-col items-center justify-start hover:bg-gray-100/40 transition-colors'>
                                    {lesson.files.map((fileName, index) => (
                                      <div
                                        key={index}
                                        className='w-full p-1 flex items-center'
                                      >
                                        <span className='text-sm w-[95%]'>{fileName.name}</span>
                                        <span
                                          onClick={() =>
                                            deleteLectureFile(
                                              module.position,
                                              lesson.position,
                                              fileName.name
                                            )
                                          }
                                          className='h-full w-fit flex items-center cursor-pointer'
                                        >
                                          <Trash className='w-4 h-4' />
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className='w-full rounded border border-dashed border-gray-200 p-3 flex items-center justify-center cursor-pointer hover:bg-gray-100/40 transition-colors'>
                                    <label
                                      htmlFor='lessonfile'
                                      className='flex items-center justify-center gap-2 text-sm w-full cursor-pointer'
                                    >
                                      <Upload className='w-3 h-3' /> Attach File
                                    </label>
                                    <input
                                      onChange={e =>
                                        handleFileSelect(e, module.position, lesson.position)
                                      }
                                      id='lessonfile'
                                      multiple={true}
                                      type='file'
                                      accept='.pdf,.doc,.docx,.ppt,.pptx'
                                      className='hidden'
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                            {errors[
                              `section_${module.position}_lecture_${lesson.position}_video`
                            ] && (
                              <p className='text-red-500 text-sm mt-1'>
                                {
                                  errors[
                                    `section_${module.position}_lecture_${lesson.position}_video`
                                  ]?.message as string
                                }
                              </p>
                            )}
                            {uploadError && (
                              <p className='text-red-500 text-sm mt-1'>{uploadError}</p>
                            )}
                            {/* Notes for Lesson */}
                            <div>
                              <span className='text-sm text-gray-600 mb-1'>Lecture Note:</span>
                              <textarea
                                {...register(
                                  `section_${module.position}_lecture_${lesson.position}_notes`,
                                  {
                                    required: "Lecture notes are required",
                                    maxLength: {
                                      value: 1000,
                                      message: "Lecture notes cannot exceed 1000 characters",
                                    },
                                    minLength: {
                                      value: 20,
                                      message: "Lecture notes must be greater than 20 characters",
                                    },
                                    pattern: {
                                      value: /^[^<>]*$/,
                                      message:
                                        "Lecture notes must not contain any opening or closing HTML tags",
                                    },
                                  }
                                )}
                                onChange={e =>
                                  handleTextValueChange(
                                    module.position,
                                    lesson.position,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                defaultValue={lesson.notes}
                                className={`w-full p-2 border border-dashed border-gray-200 rounded resize-none focus:outline-none focus:border-orange ${
                                  errors[
                                    `section_${module.position}_lecture_${lesson.position}_notes`
                                  ] && "border-red-400 bg-red-50"
                                }`}
                                placeholder='Add lecture notes here...'
                                rows={5}
                                maxLength={1000}
                              ></textarea>
                              {errors[
                                `section_${module.position}_lecture_${lesson.position}_notes`
                              ] && (
                                <p className='text-red-500 text-sm mt-1'>
                                  {
                                    errors[
                                      `section_${module.position}_lecture_${lesson.position}_notes`
                                    ]?.message as string
                                  }
                                </p>
                              )}
                            </div>
                            {/* Description for Lesson */}
                            <div>
                              <span className='text-sm text-gray-600 mb-1'>
                                Lecture Description:
                              </span>
                              <textarea
                                {...register(
                                  `section_${module.position}_lecture_${lesson.position}_description`,
                                  {
                                    required: "Lecture description is required",
                                    minLength: {
                                      value: 20,
                                      message:
                                        "Lecture description must be greater than 20 characters",
                                    },
                                    pattern: {
                                      value: /^[^<>]*$/,
                                      message:
                                        "Lecture description must not contain any opening or closing HTML tags",
                                    },
                                  }
                                )}
                                onChange={e =>
                                  handleTextValueChange(
                                    module.position,
                                    lesson.position,
                                    "description",
                                    e.target.value
                                  )
                                }
                                defaultValue={lesson.description}
                                className={`w-full p-2 border border-dashed border-gray-200 rounded resize-none focus:outline-none focus:border-orange ${
                                  errors[
                                    `section_${module.position}_lecture_${lesson.position}_description`
                                  ] && "border-red-400 bg-red-50"
                                }`}
                                placeholder='Add lecture Description here...'
                                rows={5}
                              ></textarea>
                              {errors[
                                `section_${module.position}_lecture_${lesson.position}_description`
                              ] && (
                                <p className='text-red-500 text-sm mt-1'>
                                  {
                                    errors[
                                      `section_${module.position}_lecture_${lesson.position}_description`
                                    ]?.message as string
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {lesson.type === "ARTICLE" && (
                          <div className='bg-gray-100/20 w-full h-full p-2 pb-0 flex flex-col gap-1 rounded'>
                            {/* Add File For Lessons */}
                            {lesson.files && lesson.files.length > 0 ? (
                              <>
                                <div className='w-full rounded border border-dashed border-gray-200 p-2 flex flex-col items-center justify-start hover:bg-gray-100/40 transition-colors'>
                                  {lesson.files.map((fileName, index) => (
                                    <div
                                      key={index}
                                      className='p-1 flex items-center w-full border-b border-gray-200 last:border-0'
                                    >
                                      <span className='text-sm w-[98%]'>{fileName.name}</span>
                                      <span
                                        onClick={() =>
                                          deleteLectureFile(
                                            module.position,
                                            lesson.position,
                                            fileName.name
                                          )
                                        }
                                        className='h-full w-fit flex items-center cursor-pointer'
                                      >
                                        <Trash className='w-4 h-4' />
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className='w-full rounded border border-dashed border-gray-200 p-3 flex items-center justify-center cursor-pointer hover:bg-gray-100/40 transition-colors'>
                                  <label
                                    htmlFor='lessonfile'
                                    className='flex items-center justify-center gap-2 text-sm w-full cursor-pointer'
                                  >
                                    <Upload className='w-3 h-3' /> Attach File
                                  </label>
                                  <input
                                    onChange={e =>
                                      handleFileSelect(e, module.position, lesson.position)
                                    }
                                    id='lessonfile'
                                    multiple={true}
                                    type='file'
                                    accept='.pdf,.doc,.docx,.ppt,.pptx'
                                    className='hidden'
                                  />
                                </div>
                              </>
                            )}
                            <div className='mt-2'>
                              <span className='text-sm text-gray-600 mb-1'>Article Content:</span>
                              <textarea
                                onChange={e =>
                                  handleTextValueChange(
                                    module.position,
                                    lesson.position,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className='w-full p-2 border border-dashed border-gray-200 rounded resize-none focus:outline-none focus:border-orange'
                                placeholder='Add article content here...'
                                defaultValue={lesson.description}
                                rows={8}
                              ></textarea>
                            </div>
                          </div>
                        )}
                        {lesson.type === "QUIZ" && (
                          <div className='bg-gray-100/40 w-full p-4 rounded flex flex-col gap-3'>
                            <div>
                              {/* Quiz Title */}
                              <div>
                                <span className='text-sm text-gray-600 mb-1'>Quiz Title :</span>
                                <input
                                  type='text'
                                  {...register(
                                    `section_${module.position}_lecture_${lesson.position}_quiz_title`,
                                    {
                                      required: "Quiz title is required for this lesson",
                                      minLength: {
                                        value: 20,
                                        message: "Quiz title must be greater than 20 characters",
                                      },
                                      maxLength: {
                                        value: 500,
                                        message: "Quiz title cannot exceed 500 characters",
                                      },
                                      pattern: {
                                        value: /^[^<>]*$/,
                                        message:
                                          "Quiz title must not contain any opening or closing HTML tags",
                                      },
                                    }
                                  )}
                                  maxLength={500}
                                  onChange={e =>
                                    handleQuizInputChange(
                                      module.position,
                                      lesson.position,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  value={lesson.quiz?.title || ""}
                                  placeholder='Enter quiz title...'
                                  className={`w-full px-2 py-2 border border-gray-200 focus:outline-none focus:border-orange text-sm appearance-none rounded ${
                                    errors[
                                      `section_${module.position}_lecture_${lesson.position}_quiz_title`
                                    ] && "border-red-400 bg-red-50"
                                  }`}
                                ></input>
                                {errors[
                                  `section_${module.position}_lecture_${lesson.position}_quiz_title`
                                ] && (
                                  <p className='text-red-500 text-sm mt-1'>
                                    {
                                      errors[
                                        `section_${module.position}_lecture_${lesson.position}_quiz_title`
                                      ]?.message as string
                                    }
                                  </p>
                                )}
                              </div>

                              {/* Quiz Description */}
                              <div>
                                <span className='text-sm text-gray-600 mb-1'>
                                  Quiz Description :
                                </span>
                                <textarea
                                  {...register(
                                    `section_${module.position}_lecture_${lesson.position}_quiz_description`,
                                    {
                                      required: "Quiz Description is required for this lesson",
                                      minLength: {
                                        value: 20,
                                        message: "Quiz description must be at least 20 characters",
                                      },
                                      pattern: {
                                        value: /^[^<>]*$/,
                                        message:
                                          "Quiz description must not contain any opening or closing HTML tags",
                                      },
                                    }
                                  )}
                                  rows={3}
                                  onChange={e =>
                                    handleQuizInputChange(
                                      module.position,
                                      lesson.position,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  value={lesson.quiz?.description || ""}
                                  placeholder='Enter quiz description...'
                                  className={`w-full px-2 py-2 border border-gray-200 focus:outline-none focus:border-orange text-sm appearance-none rounded resize-none ${
                                    errors[
                                      `section_${module.position}_lecture_${lesson.position}_quiz_description`
                                    ] && "border-red-400 bg-red-50"
                                  }`}
                                ></textarea>
                                {errors[
                                  `section_${module.position}_lecture_${lesson.position}_quiz_description`
                                ] && (
                                  <p className='text-red-500 text-sm mt-1'>
                                    {
                                      errors[
                                        `section_${module.position}_lecture_${lesson.position}_quiz_description`
                                      ]?.message as string
                                    }
                                  </p>
                                )}
                              </div>

                              <div className='flex items-baseline gap-3'>
                                {/* Quiz Duration */}
                                <div className='w-full'>
                                  <span className='text-sm text-gray-600 mb-1'>
                                    Quiz Duration (in minutes) :
                                  </span>
                                  <input
                                    {...register(
                                      `section_${module.position}_lecture_${lesson.position}_quiz_duration`,
                                      {
                                        maxLength: {
                                          value: 60,
                                          message: "Quiz duration cannot exceed 60 minutes",
                                        },
                                      }
                                    )}
                                    type='number'
                                    min={1}
                                    max={60}
                                    onChange={e =>
                                      handleQuizInputChange(
                                        module.position,
                                        lesson.position,
                                        "duration",
                                        Number(e.target.value)
                                      )
                                    }
                                    value={lesson.quiz?.duration || ""}
                                    placeholder='Enter quiz duration in minutes...'
                                    className={`w-full px-2 py-2 border border-gray-200 focus:outline-none focus:border-orange text-sm appearance-none rounded ${
                                      errors[
                                        `section_${module.position}_lecture_${lesson.position}_quiz_duration`
                                      ] && "border-red-400 bg-red-50"
                                    }`}
                                  ></input>
                                  {errors[
                                    `section_${module.position}_lecture_${lesson.position}_quiz_duration`
                                  ] && (
                                    <p className='text-red-500 text-sm mt-1'>
                                      {
                                        errors[
                                          `section_${module.position}_lecture_${lesson.position}_quiz_duration`
                                        ]?.message as string
                                      }
                                    </p>
                                  )}
                                </div>

                                {/* Quiz passing score */}
                                <div className='w-full'>
                                  <span className='text-sm text-gray-600 mb-1'>
                                    Quiz Passing Score (% ) :
                                  </span>
                                  <input
                                    {...register(
                                      `section_${module.position}_lecture_${lesson.position}_quiz_score`,
                                      {
                                        required: "Quiz passing score is required for this lesson",
                                        maxLength: {
                                          value: 100,
                                          message: "Quiz passing score cannot exceed 100 percent",
                                        },
                                      }
                                    )}
                                    type='number'
                                    min={1}
                                    max={100}
                                    onChange={e =>
                                      handleQuizInputChange(
                                        module.position,
                                        lesson.position,
                                        "passingScore",
                                        Number(e.target.value)
                                      )
                                    }
                                    value={lesson.quiz?.passingScore || ""}
                                    placeholder='Enter quiz passing score in percentage...'
                                    className={`w-full px-2 py-2 border border-gray-200 focus:outline-none focus:border-orange text-sm appearance-none rounded ${
                                      errors[
                                        `section_${module.position}_lecture_${lesson.position}_quiz_score`
                                      ] && "border-red-400 bg-red-50"
                                    }`}
                                  ></input>
                                  {errors[
                                    `section_${module.position}_lecture_${lesson.position}_quiz_score`
                                  ] && (
                                    <p className='text-red-500 text-sm mt-1'>
                                      {
                                        errors[
                                          `section_${module.position}_lecture_${lesson.position}_quiz_score`
                                        ]?.message as string
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {lesson.quiz?.questions &&
                              lesson.quiz.questions.length > 0 &&
                              lesson.quiz.questions.map((question, index) => (
                                <div
                                  key={index}
                                  className='bg-white p-3 group'
                                >
                                  <div className='flex items-center justify-between mb-2'>
                                    <span className='text-sm text-gray-600'>
                                      {`Question ${index + 1} : ${question.type}`}
                                    </span>
                                    <Trash
                                      onClick={() =>
                                        handleDeleteQuiz(
                                          module.position,
                                          lesson.position,
                                          question.position
                                        )
                                      }
                                      className='w-3.5 h-3.5 hidden group-hover:block cursor-pointer'
                                    />
                                  </div>
                                  <div className='grid grid-cols-4 gap-2'>
                                    {/* Quiz Points */}
                                    <div className=''>
                                      <span className='text-sm text-gray-600 mb-1'>
                                        Points of this Qustion :
                                      </span>
                                      <input
                                        type='number'
                                        min={1}
                                        max={10}
                                        onChange={e =>
                                          handleQuestionInputChange(
                                            module.position,
                                            lesson.position,
                                            question.position,
                                            "points",
                                            e.target.value
                                          )
                                        }
                                        defaultValue={question.points}
                                        placeholder='Enter a number upto 10'
                                        className='w-full px-2 py-1.5 border border-gray-200 focus:outline-none focus:border-orange text-sm appearance-none rounded'
                                      ></input>
                                    </div>
                                    {/* Quiz Qustion */}
                                    <textarea
                                      {...register(
                                        `section_${module.position}_lecture_${lesson.position}_quiz_question_${question.position}_text`,
                                        {
                                          required: "Must be add question title",
                                          minLength: {
                                            value: 10,
                                            message:
                                              "Question title must be at least 10 characters",
                                          },
                                          maxLength: {
                                            value: 200,
                                            message: "Question title cannot exceed 200 characters",
                                          },
                                          pattern: {
                                            value: /^[^<>]*$/,
                                            message:
                                              "Question title must not contain any opening or closing HTML tags",
                                          },
                                        }
                                      )}
                                      onChange={e =>
                                        handleQuestionInputChange(
                                          module.position,
                                          lesson.position,
                                          question.position,
                                          "text",
                                          e.target.value
                                        )
                                      }
                                      placeholder='Enter your qustion title...'
                                      value={question.text}
                                      rows={3}
                                      className='w-full px-2 py-1.5 border border-gray-200 focus:outline-none focus:border-orange text-sm col-span-4 resize-none rounded'
                                    ></textarea>
                                    <input
                                      type='hidden'
                                      {...register(
                                        `section_${module.position}_lecture_${lesson.position}_${question.position}_type`,
                                        {
                                          required: `Please Choose a option for correct answere for lesson ${lesson.position} Qustion ${question.position}.`,
                                        }
                                      )}
                                      value={
                                        question.options.findIndex(o => o.isCorrect) > -1
                                          ? "valid"
                                          : ""
                                      }
                                    />
                                    {/* Quiz Options */}
                                    {question.type === "MULTIPLE_CHOICE" ||
                                    question.type === "SINGLE_CHOICE" ? (
                                      <>
                                        {/* Option 1 */}
                                        <div className='col-span-2 flex'>
                                          <span
                                            onClick={() => {
                                              updateQuizOptionCorrectAnswere(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                1
                                              );
                                              setValue(
                                                `section_${module.position}_lecture_${lesson.position}_${question.position}_type`,
                                                1
                                              );
                                            }}
                                            className={`w-7 h-full border border-r-0 border-gray-200 rounded-l text-center cursor-pointer ${question.options[0]?.isCorrect && "bg-orange"}`}
                                          ></span>
                                          <input
                                            {...register(
                                              `section_${module.position}_lecture_${lesson.position}_quiz_option_${question.position}_option_1`,
                                              {
                                                required: `${`section_${module.position}_lecture_${lesson.position}_quiz_option_${question.position}_option_1`} must be add option`,
                                                minLength: {
                                                  value: 1,
                                                  message:
                                                    "Option text must be at least 1 character",
                                                },
                                                maxLength: {
                                                  value: 50,
                                                  message:
                                                    "Option text cannot exceed 50 characters",
                                                },
                                                pattern: {
                                                  value: /^[^<>]*$/,
                                                  message:
                                                    "Option text must not contain any opening or closing HTML tags",
                                                },
                                              }
                                            )}
                                            type='text'
                                            value={question.options && question.options[0]?.text}
                                            onChange={e =>
                                              addQuizOption(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                1,
                                                e.target.value
                                              )
                                            }
                                            placeholder='Enter Opton 1'
                                            className='w-full px-2 py-1.5 border border-gray-200 focus:outline-none focus:border-orange text-sm rounded-r'
                                          ></input>
                                        </div>
                                        {/* Option 2 */}
                                        <div className='col-span-2 flex'>
                                          <span
                                            onClick={() => {
                                              updateQuizOptionCorrectAnswere(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                2
                                              );
                                              setValue(
                                                `section_${module.position}_lecture_${lesson.position}_${question.position}_type`,
                                                2
                                              );
                                            }}
                                            className={`w-7 h-full border border-r-0 border-gray-200 rounded-l text-center cursor-pointer ${question.options[1]?.isCorrect && "bg-orange"}`}
                                          ></span>
                                          <input
                                            {...register(
                                              `section_${module.position}_lecture_${lesson.position}_quiz_option_${question.position}_option_2`,
                                              {
                                                required: `${`section_${module.position}_lecture_${lesson.position}_quiz_option_${question.position}_option_2`} must be add option`,
                                                minLength: {
                                                  value: 1,
                                                  message:
                                                    "Option text must be at least 1 character",
                                                },
                                                maxLength: {
                                                  value: 50,
                                                  message:
                                                    "Option text cannot exceed 50 characters",
                                                },
                                                pattern: {
                                                  value: /^[^<>]*$/,
                                                  message:
                                                    "Option text must not contain any opening or closing HTML tags",
                                                },
                                              }
                                            )}
                                            type='text'
                                            value={question.options && question.options[1]?.text}
                                            onChange={e =>
                                              addQuizOption(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                2,
                                                e.target.value
                                              )
                                            }
                                            placeholder='Enter Opton 2'
                                            className='w-full px-2 py-1.5 border border-gray-200 focus:outline-none focus:border-orange text-sm rounded-r'
                                          ></input>
                                        </div>
                                        {/* Option 3 */}
                                        <div className='col-span-2 flex'>
                                          <span
                                            onClick={() => {
                                              updateQuizOptionCorrectAnswere(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                3
                                              );
                                              setValue(
                                                `section_${module.position}_lecture_${lesson.position}_${question.position}_type`,
                                                3
                                              );
                                            }}
                                            className={`w-7 h-full border border-r-0 border-gray-200 rounded-l text-center cursor-pointer ${question.options[2]?.isCorrect && "bg-orange"}`}
                                          ></span>
                                          <input
                                            {...register(
                                              `section_${module.position}_lecture_${lesson.position}_quiz_option_${question.position}_option_3`,
                                              {
                                                required: `${`section_${module.position}_lecture_${lesson.position}_quiz_option_${question.position}_option_3`} must be add option`,
                                                minLength: {
                                                  value: 1,
                                                  message:
                                                    "Option text must be at least 1 character",
                                                },
                                                maxLength: {
                                                  value: 50,
                                                  message:
                                                    "Option text cannot exceed 50 characters",
                                                },
                                                pattern: {
                                                  value: /^[^<>]*$/,
                                                  message:
                                                    "Option text must not contain any opening or closing HTML tags",
                                                },
                                              }
                                            )}
                                            type='text'
                                            value={question.options && question.options[2]?.text}
                                            onChange={e =>
                                              addQuizOption(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                3,
                                                e.target.value
                                              )
                                            }
                                            placeholder='Enter Opton 3'
                                            className='w-full px-2 py-1.5 border border-gray-200 focus:outline-none focus:border-orange text-sm rounded-r'
                                          ></input>
                                        </div>
                                        {/* Option 4 */}
                                        <div className='col-span-2 flex'>
                                          <span
                                            onClick={() => {
                                              updateQuizOptionCorrectAnswere(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                4
                                              );
                                              setValue(
                                                `section_${module.position}_lecture_${lesson.position}_${question.position}_type`,
                                                4
                                              );
                                            }}
                                            className={`w-7 h-full border border-r-0 border-gray-200 rounded-l text-center cursor-pointer ${question.options[3]?.isCorrect && "bg-orange"}`}
                                          ></span>
                                          <input
                                            {...register(
                                              `section_${module.position}_lecture_${lesson.position}_quiz_option_${question.position}_option_4`,
                                              {
                                                required: `${`section_${module.position}_lecture_${lesson.position}_quiz_option_${question.position}_option_4`} must be add option`,
                                                minLength: {
                                                  value: 1,
                                                  message:
                                                    "Option text must be at least 1 character",
                                                },
                                                maxLength: {
                                                  value: 50,
                                                  message:
                                                    "Option text cannot exceed 50 characters",
                                                },
                                                pattern: {
                                                  value: /^[^<>]*$/,
                                                  message:
                                                    "Option text must not contain any opening or closing HTML tags",
                                                },
                                              }
                                            )}
                                            type='text'
                                            value={question.options && question.options[3]?.text}
                                            onChange={e =>
                                              addQuizOption(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                4,
                                                e.target.value
                                              )
                                            }
                                            placeholder='Enter Opton 4'
                                            className='w-full px-2 py-1.5 border border-gray-200 focus:outline-none focus:border-orange text-sm rounded-r'
                                          ></input>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        {/* True False Answer */}
                                        <div className='col-span-2 flex'>
                                          <span
                                            onClick={() => {
                                              updateQuizOptionCorrectAnswere(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                1
                                              );
                                              setValue(
                                                `section_${module.position}_lecture_${lesson.position}_${question.position}_type`,
                                                1
                                              );
                                            }}
                                            className={`w-7 h-full border border-r-0 border-gray-200 rounded-l text-center cursor-pointer ${question.options[0]?.isCorrect && "bg-orange"}`}
                                          ></span>
                                          <input
                                            type='text'
                                            value={question.options && question?.options[0]?.text}
                                            readOnly
                                            className='w-full px-2 py-1.5 border border-gray-200 focus:outline-none focus:border-orange text-sm rounded-r'
                                          ></input>
                                        </div>

                                        <div className='col-span-2 flex'>
                                          <span
                                            onClick={() => {
                                              updateQuizOptionCorrectAnswere(
                                                module.position,
                                                lesson.position,
                                                question.position,
                                                2
                                              );
                                              setValue(
                                                `section_${module.position}_lecture_${lesson.position}_${question.position}_type`,
                                                2
                                              );
                                            }}
                                            className={`w-7 h-full border border-r-0 border-gray-200 rounded-l text-center cursor-pointer ${question.options[1]?.isCorrect && "bg-orange"}`}
                                          ></span>
                                          <input
                                            type='text'
                                            value={question.options && question?.options[1]?.text}
                                            readOnly
                                            className='w-full px-2 py-1.5 border border-gray-200 focus:outline-none focus:border-orange text-sm rounded-r'
                                          ></input>
                                        </div>
                                      </>
                                    )}
                                    {question.options.filter(o => o.text.length > 0).length >=
                                      (question.type === "TRUE_FALSE" ? 2 : 4) &&
                                      errors[
                                        `section_${module.position}_lecture_${lesson.position}_${question.position}_type`
                                      ] && (
                                        <p className='text-red-500 text-sm mt-1 col-span-4'>
                                          {
                                            errors[
                                              `section_${module.position}_lecture_${lesson.position}_${question.position}_type`
                                            ]?.message as string
                                          }
                                        </p>
                                      )}
                                    {quizOptionError && (
                                      <p className='text-red-500 text-sm mt-1 col-span-4'>
                                        {quizOptionError}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            {/* Add Quiz */}
                            <div>
                              <span className='text-sm text-gray-600 mb-1'>Add a Quiz :</span>
                              <div className='flex items-center justify-center gap-10 border border-dashed border-gray-200 p-2'>
                                <button
                                  type='button'
                                  onClick={() => {
                                    setShowAddQuestions(true);
                                    setValue(
                                      `section_${module.position}_lecture_${lesson.position}_addQuiz_type`,
                                      "ADD_QUIZ"
                                    );
                                  }}
                                  className='flex items-center gap-2 px-3 py-1.5 border border-gray-100 text-gray-800 rounded! text-sm hover:bg-gray-100 transition-colors duration-500 cursor-pointer'
                                >
                                  <Plus className='w-4 h-4' />
                                  Add Quiz Question
                                </button>
                              </div>
                            </div>

                            {showAddQuestions && (
                              <>
                                <div>
                                  <span className='text-sm text-gray-600 mb-1'>
                                    Select Question type :
                                  </span>
                                  <div className='flex items-center justify-center gap-10 border border-dashed border-gray-200 p-2'>
                                    <button
                                      type='button'
                                      onClick={() => {
                                        addQuizQuestion(
                                          module.position,
                                          lesson.position,
                                          "MULTIPLE_CHOICE"
                                        );
                                        setValue(
                                          `section_${module.position}_lecture_${lesson.position}_quiz_type`,
                                          "MULTIPLE_CHOICE"
                                        );
                                      }}
                                      className='px-3 py-1.5 border border-gray-100 text-gray-800 rounded text-sm hover:bg-gray-100 transition-colors duration-500 cursor-pointer'
                                    >
                                      MULTIPLE_CHOICE
                                    </button>
                                    <button
                                      type='button'
                                      onClick={() => {
                                        addQuizQuestion(
                                          module.position,
                                          lesson.position,
                                          "SINGLE_CHOICE"
                                        );
                                        setValue(
                                          `section_${module.position}_lecture_${lesson.position}_quiz_type`,
                                          "SINGLE_CHOICE"
                                        );
                                      }}
                                      className='px-3 py-1.5 border border-gray-100 text-gray-800 rounded text-sm hover:bg-gray-100 transition-colors duration-500 cursor-pointer'
                                    >
                                      SINGLE_CHOICE
                                    </button>
                                    <button
                                      type='button'
                                      onClick={() => {
                                        addQuizQuestion(
                                          module.position,
                                          lesson.position,
                                          "TRUE_FALSE"
                                        );
                                        setValue(
                                          `section_${module.position}_lecture_${lesson.position}_quiz_type`,
                                          "TRUE_FALSE"
                                        );
                                      }}
                                      className='px-3 py-1.5 border border-gray-100 text-gray-800 rounded text-sm hover:bg-gray-100 transition-colors duration-500 cursor-pointer'
                                    >
                                      TRUE_FALSE
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Add Sections Button */}
        <button
          type='button'
          onClick={addSection}
          className='w-full py-2 bg-orange-50 text-orange-500 rounded font-medium hover:bg-orange-100 transition-colors mt-4 cursor-pointer'
        >
          Add Sections
        </button>

        {/* Footer Actions */}
        <div className='py-6'>
          <CourseFooter
            handlePrevious={handlePrevious}
            isSubmitting={isSubmitting}
            currentStep={currentStep}
          />
        </div>
      </form>
      {(() => {
        switch (openModal.type) {
          case "sectionName":
            return loadModalComponent("sectionName");
          case "lectureName":
            return loadModalComponent("lectureName");
          case "videoUpload":
            return loadModalComponent("videoUpload");
          case "fileUpload":
            return loadModalComponent("fileUpload");
          case "caption":
            return loadModalComponent("caption");
          case "description":
            return loadModalComponent("description");
          case "notes":
            return loadModalComponent("notes");
          default:
            return null;
        }
      })()}
    </div>
  );
}
