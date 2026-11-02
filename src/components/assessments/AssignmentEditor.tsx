'use client';
import type { AssignmentConfig, SubmissionType } from './types';
const input =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600';
export default function AssignmentEditor({
  value,
  onChange,
}: {
  value: AssignmentConfig;
  onChange: (next: AssignmentConfig) => void;
}) {
  const patch = (next: Partial<AssignmentConfig>) => onChange({ ...value, ...next });
  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <label className="block text-sm font-medium">
        Assignment title
        <input
          className={input}
          value={value.title}
          maxLength={150}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Build a responsive navigation menu"
        />
      </label>
      <label className="block text-sm font-medium">
        Instructions
        <textarea
          className={input}
          rows={4}
          value={value.instructions}
          maxLength={10000}
          onChange={(e) => patch({ instructions: e.target.value })}
          placeholder="Describe the task, expected outcome and grading criteria. At least 20 characters."
        />
      </label>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Accepted submission formats (choose one or more)</legend>
        <div className="flex flex-wrap gap-4">
          {(['TEXT', 'LINK', 'FILE'] as SubmissionType[]).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={value.submissionTypes.includes(type)}
                onChange={(e) =>
                  patch({
                    submissionTypes: e.target.checked
                      ? [...value.submissionTypes, type]
                      : value.submissionTypes.filter((t) => t !== type),
                  })
                }
              />
              {type === 'TEXT' ? 'Written response' : type === 'LINK' ? 'Project link' : 'File upload'}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Pass mark (%)
          <input
            className={input}
            type="number"
            min={0}
            max={100}
            value={value.passingScore ?? 50}
            onChange={(e) => patch({ passingScore: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm font-medium">
          Submission limit
          <input
            className={input}
            type="number"
            min={1}
            max={10}
            value={value.maxAttempts ?? 3}
            onChange={(e) => patch({ maxAttempts: Number(e.target.value) })}
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Due date (optional, your local time)
        <input
          className={input}
          type="datetime-local"
          value={
            value.dueAt
              ? new Date(new Date(value.dueAt).getTime() - new Date(value.dueAt).getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)
              : ''
          }
          onChange={(e) =>
            patch({ dueAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })
          }
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.allowLate ?? false}
          onChange={(e) => patch({ allowLate: e.target.checked })}
        />
        Accept submissions after the due date
      </label>
      <p className="text-xs text-gray-600">
        Assignments are reviewed by an instructor. Resubmission opens when the instructor requests changes.
      </p>
    </div>
  );
}
