'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import type { Submission } from '@/components/assessments/types';
import { downloadAssessmentFile } from '@/components/assessments/download';
const field =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600';
const button =
  'rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50';
function ReviewSubmission({ item, onSaved }: { item: Submission; onSaved: () => void }) {
  const [score, setScore] = useState(item.score == null ? '' : String(item.score)),
    [feedback, setFeedback] = useState(item.feedback ?? ''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function grade(status: 'GRADED' | 'RESUBMISSION_REQUESTED') {
    if (
      status === 'GRADED' &&
      (score === '' || !Number.isFinite(Number(score)) || Number(score) < 0 || Number(score) > 100)
    ) {
      setError('Enter a score between 0 and 100.');
      return;
    }
    if (!feedback.trim()) {
      setError('Add feedback for the student.');
      return;
    }
    setBusy(true);
    setError('');
    const response = await apiClient.patch(`/assessments/submissions/${item.id}/grade`, {
      score: score === '' ? 0 : Number(score),
      feedback: feedback.trim(),
      status,
    });
    setBusy(false);
    if (response.success) onSaved();
    else setError(response.message ?? 'Review could not be saved. Please retry.');
  }
  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 p-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{item.lesson?.title ?? 'Assignment submission'}</h2>
          <p className="mt-1 text-sm text-gray-600">
            {item.user?.studentProfile?.displayName ?? item.user?.email ?? 'Student'} ·{' '}
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
        <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          {item.status.replaceAll('_', ' ')}
        </span>
      </header>
      <div className="grid gap-6 p-5 xl:grid-cols-2">
        <section aria-label="Student work" className="min-w-0 space-y-4">
          {item.lesson?.assignment?.instructions && (
            <details className="rounded-lg bg-slate-50 p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Assignment instructions</summary>
              <p className="mt-2 whitespace-pre-wrap leading-6">{item.lesson.assignment.instructions}</p>
            </details>
          )}
          {item.text && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Written response
              </h3>
              <p className="whitespace-pre-wrap break-words text-sm leading-7">{item.text}</p>
            </div>
          )}
          {item.link && /^https?:\/\//i.test(item.link) && (
            <a
              className="block break-all text-sm text-emerald-800 underline"
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
              className="block max-w-full truncate text-left text-sm font-medium text-emerald-800 underline"
              onClick={() => void downloadAssessmentFile(file).catch((e) => setError(e.message))}
            >
              {file.name} · {(file.size / 1024).toFixed(0)} KB
            </button>
          ))}
        </section>
        <section aria-label="Instructor review" className="space-y-4 rounded-xl bg-slate-50 p-4">
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <label className="block text-sm font-semibold">
            Score (%)
            <input
              className={`${field} mt-2`}
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Feedback
            <textarea
              className={`${field} mt-2`}
              rows={4}
              maxLength={10000}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain what worked and what to improve."
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button disabled={busy} className={button} onClick={() => void grade('GRADED')}>
              {busy ? 'Saving…' : 'Publish grade'}
            </button>
            <button
              disabled={busy}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-50"
              onClick={() => void grade('RESUBMISSION_REQUESTED')}
            >
              Request resubmission
            </button>
          </div>
          <p className="text-xs leading-5 text-gray-600">
            Publishing makes the score and feedback visible to the student. Requesting changes opens another
            submission within the assignment limit.
          </p>
        </section>
      </div>
    </article>
  );
}
function AssessmentReviews() {
  const params = useSearchParams(),
    initial = params.get('courseId') ?? '';
  const [courseId, setCourseId] = useState(initial),
    [inputId, setInputId] = useState(initial),
    [items, setItems] = useState<Submission[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(''),
    [revision, setRevision] = useState(0),
    [filter, setFilter] = useState('SUBMITTED');
  const generation = useRef(0);
  useEffect(() => {
    const request = ++generation.current;
    if (!courseId) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError('');
    void apiClient
      .get<Submission[]>(`/assessments/courses/${encodeURIComponent(courseId)}/submissions`)
      .then((response) => {
        if (request !== generation.current) return;
        setLoading(false);
        if (response.success && response.data) setItems(response.data);
        else {
          setItems([]);
          setError(response.message ?? 'Submissions could not load.');
        }
      });
    return () => {
      generation.current++;
    };
  }, [courseId, revision]);
  const visible = items.filter((item) => filter === 'ALL' || item.status === filter);
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <header>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ClipboardCheck className="h-5 w-5" />
          Instructor workspace
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Assessment reviews</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review student work, provide feedback and publish assignment grades.
        </p>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCourseId(inputId.trim());
          setRevision((r) => r + 1);
        }}
        className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-end"
      >
        <label className="flex-1 text-sm font-medium">
          Course ID
          <input
            className={`${field} mt-2`}
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            required
            placeholder="Open from a course curriculum or enter its ID"
          />
        </label>
        <button className={button}>Load submissions</button>
      </form>
      {courseId && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">{items.length} submissions loaded</p>
          <label className="text-sm">
            Status{' '}
            <select
              className="ml-2 rounded-lg border bg-white px-3 py-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="SUBMITTED">Awaiting review</option>
              <option value="RESUBMISSION_REQUESTED">Changes requested</option>
              <option value="GRADED">Graded</option>
              <option value="ALL">All submissions</option>
            </select>
          </label>
        </div>
      )}
      {loading ? (
        <div className="flex items-center gap-3 rounded-xl border bg-white p-8 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading student work…
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {error}
          <button className="ml-3 underline" onClick={() => setRevision((r) => r + 1)}>
            Retry
          </button>
        </div>
      ) : !courseId ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-600">
          Choose a course to begin reviewing assignments.
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-600">
          No submissions in this status. New student work will appear here.
        </div>
      ) : (
        <div className="space-y-5">
          {visible.map((item) => (
            <ReviewSubmission
              key={`${item.id}-${item.status}-${item.score}-${item.feedback}`}
              item={item}
              onSaved={() => setRevision((r) => r + 1)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-sm">Loading assessment reviews…</p>}>
      <AssessmentReviews />
    </Suspense>
  );
}
