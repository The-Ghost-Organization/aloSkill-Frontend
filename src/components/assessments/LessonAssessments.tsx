'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ClipboardCheck, Clock, FileText, Loader2, Upload } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import type { AssessmentFile, Attempt, Overview } from './types';
import { downloadAssessmentFile } from './download';
const button =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
const secondary =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:opacity-50';
const input =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600';
export default function LessonAssessments({
  lessonId,
  onPassed,
}: {
  lessonId: string;
  onPassed?: () => void;
}) {
  const [data, setData] = useState<Overview | null>(null),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [attempt, setAttempt] = useState<Attempt | null>(null),
    [index, setIndex] = useState(0),
    [saveState, setSaveState] = useState(''),
    [confirm, setConfirm] = useState(false),
    [now, setNow] = useState(Date.now()),
    [offset, setOffset] = useState(0);
  const [text, setText] = useState(''),
    [link, setLink] = useState(''),
    [files, setFiles] = useState<AssessmentFile[]>([]),
    [uploading, setUploading] = useState(false);
  const answers = useRef<Record<string, string[]>>({}),
    queue = useRef<Promise<unknown>>(Promise.resolve()),
    mounted = useRef(true),
    submitting = useRef(false);
  const generation = useRef(0),
    saveVersion = useRef(0);
  const attemptId = useRef<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
    };
  }, []);
  const load = useCallback(async () => {
    const request = ++generation.current;
    const response = await apiClient.get<Overview>(`/assessments/lessons/${lessonId}`);
    if (!mounted.current || request !== generation.current) return;
    setLoading(false);
    if (!response.success || !response.data) {
      setError(response.message ?? 'Assessments could not load.');
      return;
    }
    setError('');
    setData(response.data);
    if (response.data.attempts.some((item) => item.isPassed)) onPassed?.();
    if (response.data.serverTime) setOffset(new Date(response.data.serverTime).getTime() - Date.now());
    const incoming = response.data.activeAttempt;
    if (incoming) {
      // Keep unsaved or failed local edits when refreshing the same active attempt.
      // A resumed or different attempt initializes from the server instead.
      if (attemptId.current !== incoming.id) {
        attemptId.current = incoming.id;
        answers.current = incoming.answers ?? {};
        saveVersion.current++;
      }
      setAttempt({ ...incoming, answers: answers.current });
    } else {
      // Overview can finalize a deadline or discover submission in another tab.
      const finalized = response.data.attempts.find(item => item.id === attemptId.current && item.submittedAt);
      saveVersion.current++;
      attemptId.current = finalized?.id ?? null;
      answers.current = finalized?.answers ?? {};
      setAttempt(finalized ?? null);
    }
  }, [lessonId, onPassed]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const submit = useCallback(async () => {
    if (!attempt || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setConfirm(false);
    setError('');
    await queue.current;
    const response = await apiClient.post<Attempt>(`/assessments/attempts/${attempt.id}/submit`, {
      answers: answers.current,
    });
    if (!mounted.current) return;
    setBusy(false);
    submitting.current = false;
    if (!response.success || !response.data) {
      setError(response.message ?? 'Submission failed. Your answers are kept here. Retry submission.');
      return;
    }
    setAttempt(response.data);
    setSaveState('Submitted');
    await load();
    if (response.data.isPassed) onPassed?.();
  }, [attempt, load, onPassed]);
  const deadline = attempt?.deadlineAt ? new Date(attempt.deadlineAt).getTime() : null;
  const remaining = deadline ? Math.max(0, Math.ceil((deadline - now - offset) / 1000)) : null;
  const autoSubmitted = useRef('');
  useEffect(() => {
    if (attempt && !attempt.submittedAt && remaining === 0 && autoSubmitted.current !== attempt.id) {
      autoSubmitted.current = attempt.id;
      void submit();
    }
  }, [attempt, remaining, submit]);
  useEffect(() => {
    if (!attempt || attempt.submittedAt) return;
    const before = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, [attempt]);
  function changeAnswer(questionId: string, optionId: string, multiple: boolean) {
    if (!attempt || busy || submitting.current || remaining === 0) return;
    const current = answers.current[questionId] ?? [];
    const next = {
      ...answers.current,
      [questionId]: multiple
        ? current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
        : [optionId],
    };
    answers.current = next;
    setAttempt({ ...attempt, answers: next });
    setSaveState('Saving answers…');
    const version = ++saveVersion.current;
    queue.current = queue.current.then(async () => {
      if (version !== saveVersion.current) return;
      const response = await apiClient.patch<Attempt>(`/assessments/attempts/${attempt.id}`, {
        answers: next,
      });
      if (!mounted.current) return;
      if (response.success && response.data?.submittedAt) {
        setAttempt(response.data);
        setSaveState('Submitted');
        saveVersion.current++;
        await load();
        return;
      }
      if (version === saveVersion.current)
        setSaveState(
          response.success ? 'Answers saved' : 'Save failed. Keep this page open and retry or submit.',
        );
    });
  }
  async function start() {
    generation.current++;
    setBusy(true);
    setError('');
    const response = await apiClient.post<Attempt>(`/assessments/lessons/${lessonId}/attempts`);
    if (!mounted.current) return;
    setBusy(false);
    if (!response.success || !response.data) {
      setError(response.message ?? 'Quiz could not start.');
      return;
    }
    attemptId.current = response.data.id;
    setAttempt(response.data);
    setData((previous) =>
      previous
        ? {
            ...previous,
            activeAttempt: response.data!,
            attempts: previous.attempts.some((item) => item.id === response.data!.id)
              ? previous.attempts
              : [response.data!, ...previous.attempts],
            attemptsRemaining: previous.attempts.some((item) => item.id === response.data!.id)
              ? previous.attemptsRemaining
              : Math.max(0, previous.attemptsRemaining - 1),
          }
        : previous,
    );
    answers.current = response.data.answers ?? {};
    setIndex(0);
    setNow(Date.now());
    if (response.data.serverTime) setOffset(new Date(response.data.serverTime).getTime() - Date.now());
    setSaveState('Answers saved');
  }
  async function upload(selected: FileList | null) {
    if (!selected) return;
    if (files.length + selected.length > 5) {
      setError('Attach up to 5 files.');
      return;
    }
    setUploading(true);
    setError('');
    for (const file of Array.from(selected)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} exceeds 10 MB.`);
        continue;
      }
      const form = new FormData();
      form.append('file', file);
      const response = await apiClient.postFormData<AssessmentFile>(
        `/assessments/lessons/${lessonId}/files`,
        form,
      );
      if (!mounted.current) return;
      if (response.success && response.data) setFiles((previous) => [...previous, response.data!]);
      else setError(response.message ?? `Could not upload ${file.name}.`);
    }
    if (mounted.current) setUploading(false);
  }
  async function submitAssignment(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim() && !link.trim() && !files.length) {
      setError('Add a written response, project link or file before submitting.');
      return;
    }
    setBusy(true);
    setError('');
    const response = await apiClient.post(`/assessments/lessons/${lessonId}/submissions`, {
      text: text.trim() || undefined,
      link: link.trim() || undefined,
      fileIds: files.map((file) => file.id),
    });
    if (!mounted.current) return;
    setBusy(false);
    if (!response.success) {
      setError(response.message ?? 'Your assignment could not be submitted. Please retry.');
      return;
    }
    setText('');
    setLink('');
    setFiles([]);
    await load();
  }
  if (loading)
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-white p-6 text-sm text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading assessments…
      </div>
    );
  if (!data)
    return (
      <div role="alert" className="rounded-xl border bg-white p-6">
        <p className="text-sm text-red-700">{error}</p>
        <button className={`${secondary} mt-3`} onClick={() => void load()}>
          Try again
        </button>
      </div>
    );
  const quiz = data.quiz,
    assignment = data.assignment,
    active = attempt && !attempt.submittedAt ? attempt : null,
    question = active?.questions[index],
    answered = active?.questions.filter((q) => answers.current[q.id]?.length).length ?? 0,
    latest = data.submissions[0];
  const assignmentClosed = Boolean(
    assignment?.dueAt && !assignment.allowLate && new Date(assignment.dueAt).getTime() < now + offset,
  );
  const canSubmitAssignment =
    !assignmentClosed &&
    (!latest || latest.status === 'RESUBMISSION_REQUESTED') &&
    data.submissions.length < (assignment?.maxAttempts ?? 3);
  return (
    <div className="space-y-6 text-gray-900" style={{ userSelect: 'text' }}>
      {!active && <div className="flex justify-end"><button type="button" className={secondary} disabled={busy || uploading} onClick={() => void load()}>Refresh results</button></div>}
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {!quiz && !assignment && (
        <p className="rounded-xl border bg-white p-6 text-gray-600">
          There are no assessments for this lesson.
        </p>
      )}
      {quiz && (
        <section
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          aria-labelledby="lesson-quiz-title"
        >
          <header className="border-b border-gray-100 p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <ClipboardCheck className="h-4 w-4" />
              Knowledge check
            </div>
            <h3 id="lesson-quiz-title" className="text-xl font-bold">
              {quiz.title}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{quiz.description}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
              <span>
                {quiz.questionCount} questions · {quiz.totalPoints} points
              </span>
              <span>{quiz.duration ? `${quiz.duration} minutes` : 'No time limit'}</span>
              <span>Pass mark {quiz.passingScore}%</span>
              <span>{data.attemptsRemaining} attempts remaining</span>
            </div>
          </header>
          <div className="p-5 sm:p-6">
            {active && question ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold">
                    Question {index + 1} of {active.questions.length}
                  </span>
                  {remaining !== null && (
                    <span
                      role="timer"
                      className={`flex items-center gap-2 font-semibold tabular-nums ${remaining < 60 ? 'text-red-700' : 'text-gray-700'}`}
                    >
                      <Clock className="h-4 w-4" />
                      {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} remaining
                    </span>
                  )}
                </div>
                <div className="my-3 h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${(answered / active.questions.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {answered} of {active.questions.length} answered · {question.points} points
                </p>
                <fieldset disabled={busy || remaining === 0} className="mt-6">
                  <legend className="text-lg font-semibold leading-7">{question.text}</legend>
                  <p className="mb-4 mt-2 text-sm text-gray-600">
                    {question.type === 'MULTIPLE_CHOICE'
                      ? 'Select all correct answers. Exact matching is required for points.'
                      : 'Choose one answer.'}
                  </p>
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${answers.current[question.id]?.includes(option.id) ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <input
                          className="mt-1 accent-emerald-700"
                          type={question.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                          name={question.id}
                          checked={answers.current[question.id]?.includes(option.id) ?? false}
                          onChange={() =>
                            changeAnswer(question.id, option.id, question.type === 'MULTIPLE_CHOICE')
                          }
                        />
                        <span className="text-sm leading-6">{option.text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-5 flex flex-wrap gap-2" aria-label="Question navigation">
                  {active.questions.map((q, i) => (
                    <button
                      key={q.id}
                      aria-label={`Question ${i + 1}${answers.current[q.id]?.length ? ', answered' : ''}`}
                      aria-current={index === i ? 'step' : undefined}
                      className={`h-9 w-9 rounded-lg border text-sm ${i === index ? 'border-emerald-700 bg-emerald-700 text-white' : answers.current[q.id]?.length ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200'}`}
                      onClick={() => setIndex(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-gray-600" role="status">
                    {saveState}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className={secondary}
                      disabled={index === 0}
                      onClick={() => setIndex((i) => i - 1)}
                    >
                      Previous
                    </button>
                    {index < active.questions.length - 1 ? (
                      <button className={secondary} onClick={() => setIndex((i) => i + 1)}>
                        Next
                      </button>
                    ) : (
                      <button className={button} disabled={busy} onClick={() => setConfirm(true)}>
                        Review & submit
                      </button>
                    )}
                  </div>
                </div>
                {remaining === 0 && !busy && (
                  <button className={`${button} mt-4`} onClick={() => void submit()}>
                    Retry final submission
                  </button>
                )}
                {confirm && (
                  <div
                    role="group"
                    aria-labelledby="submit-quiz-heading"
                    className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
                  >
                    <h4 id="submit-quiz-heading" className="font-semibold">
                      Submit this attempt?
                    </h4>
                    <p className="mt-2 text-sm">
                      {active.questions.length - answered
                        ? `${active.questions.length - answered} questions are unanswered and will receive zero points.`
                        : 'All questions are answered.'}{' '}
                      Answers cannot be changed after submission.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <button className={secondary} onClick={() => setConfirm(false)}>
                        Keep reviewing
                      </button>
                      <button className={button} disabled={busy} onClick={() => void submit()}>
                        Submit quiz
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="mb-4 text-sm leading-6 text-gray-600">
                  Your answers save as you go.{' '}
                  {quiz.duration
                    ? 'The timer continues if you leave this page. Your attempt submits when time runs out.'
                    : 'You can leave and resume an unfinished attempt.'}{' '}
                  Each submitted attempt counts toward your limit.
                </p>
                <button
                  className={button}
                  disabled={busy || data.attemptsRemaining === 0}
                  onClick={() => void start()}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ClipboardCheck className="h-4 w-4" />
                  )}
                  {data.attemptsRemaining === 0
                    ? 'No attempts remaining'
                    : data.attempts.some((a) => a.submittedAt)
                      ? 'Try quiz again'
                      : 'Start quiz'}
                </button>
              </>
            )}
            {data.attempts.some((a) => a.submittedAt) && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <h4 className="mb-3 font-semibold">Your results</h4>
                <ul className="divide-y divide-gray-100">
                  {data.attempts
                    .filter((a) => a.submittedAt)
                    .map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                      >
                        <span>{new Date(a.submittedAt!).toLocaleString()}</span>
                        <strong className={a.isPassed ? 'text-emerald-700' : 'text-amber-800'}>
                          {a.scoreAchieved}% · {a.isPassed ? 'Passed' : 'Not passed'}
                        </strong>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
      {assignment && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <FileText className="h-4 w-4" />
            Practical assignment
          </div>
          <h3 className="text-xl font-bold">{assignment.title}</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">
            {assignment.instructions}
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Instructor reviewed · Pass mark {assignment.passingScore ?? 50}% · {data.submissions.length}/
            {assignment.maxAttempts ?? 3} submissions
            {assignment.dueAt &&
              ` · Due ${new Date(assignment.dueAt).toLocaleString()}${assignment.allowLate ? ' (late work accepted)' : ''}`}
          </p>
          {canSubmitAssignment ? (
            <form onSubmit={submitAssignment} className="mt-5 space-y-4">
              {assignment.submissionTypes.includes('TEXT') && (
                <label className="block text-sm font-medium">
                  Written response
                  <textarea
                    className={input}
                    rows={5}
                    maxLength={30000}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Explain your approach and share your work…"
                  />
                </label>
              )}
              {assignment.submissionTypes.includes('LINK') && (
                <label className="block text-sm font-medium">
                  Project link
                  <input
                    className={input}
                    type="url"
                    maxLength={2000}
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://…"
                  />
                </label>
              )}
              {assignment.submissionTypes.includes('FILE') && (
                <div>
                  <label className="block rounded-xl border border-dashed border-gray-300 p-4 text-sm font-medium">
                    <span className="mb-2 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Attach your work
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.png,.jpg,.jpeg,.docx,.xlsx,.pptx,.zip"
                      disabled={uploading || busy}
                      onChange={(e) => {
                        void upload(e.target.files);
                        e.target.value = '';
                      }}
                      className="w-full text-sm"
                    />
                    <span className="mt-2 block text-xs text-gray-600">
                      Up to 5 files, 10 MB each. PDF, text, images, Office documents or ZIP.
                    </span>
                  </label>
                  <ul>
                    {files.map((file) => (
                      <li key={file.id} className="mt-2 flex items-center justify-between gap-3 text-sm">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          className="text-red-700 underline"
                          onClick={() => setFiles((items) => items.filter((item) => item.id !== file.id))}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button type="submit" className={button} disabled={busy || uploading}>
                {(busy || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                {uploading ? 'Uploading…' : latest ? 'Submit revised work' : 'Submit assignment'}
              </button>
            </form>
          ) : (
            <p role="status" className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              {assignmentClosed
                ? 'The submission deadline has passed.'
                : latest?.status === 'SUBMITTED'
                  ? 'Your work is submitted and awaiting instructor review.'
                  : latest?.status === 'GRADED'
                    ? 'Your assignment has been graded.'
                    : 'You have reached the submission limit.'}
            </p>
          )}
          {data.submissions.length > 0 && (
            <div className="mt-6 border-t pt-5">
              <h4 className="font-semibold">Submission history</h4>
              <div className="mt-3 space-y-4">
                {data.submissions.map((item) => (
                  <article key={item.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      <strong className="text-emerald-800">
                        {item.status === 'GRADED'
                          ? `${item.score}% · ${(item.score ?? 0) >= (assignment.passingScore ?? 50) ? 'Passed' : 'Not passed'}`
                          : item.status === 'RESUBMISSION_REQUESTED'
                            ? 'Changes requested'
                            : 'Awaiting review'}
                      </strong>
                    </div>
                    {item.text && (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{item.text}</p>
                    )}
                    {item.link && /^https?:\/\//i.test(item.link) && (
                      <a
                        className="mt-2 block break-all text-sm text-emerald-800 underline"
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.link}
                      </a>
                    )}
                    {item.files?.map((file) => (
                      <button
                        key={file.id}
                        className="mt-2 block max-w-full truncate text-sm text-emerald-800 underline"
                        onClick={() => void downloadAssessmentFile(file).catch((e) => setError(e.message))}
                      >
                        {file.name}
                      </button>
                    ))}
                    {item.feedback && (
                      <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm">
                        <strong>Instructor feedback</strong>
                        <p className="mt-1 whitespace-pre-wrap">{item.feedback}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
