import { z } from 'zod';
import type { FieldErrors } from 'react-hook-form';
import type { CourseModule } from './page.tsx';

// Match the server's curriculum rules, using the draft that will actually be saved.
// File inputs and collapsed/unmounted controls are not the source of truth.

const quizQuestionSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(10, 'Question text must be at least 10 characters long')
      .max(200, 'Question text cannot exceed 200 characters')
      .regex(/^[^<>]*$/, 'Question title must not contain any opening or closing HTML tags'),
    position: z.number('Position must be an integer').int().positive(),
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SINGLE_CHOICE'], 'Question type is required'),
    points: z
      .number('Points must be a number')
      .int()
      .positive()
      .min(1)
      .max(10, 'Points cannot exceed 10'),
    options: z
      .array(
        z.object({
          text: z
            .string()
            .trim()
            .min(1, 'Option text must be at least 1 characters long')
            .max(50, 'Option text cannot exceed 50 characters')
            .regex(/^[^<>]*$/, 'Option Text must not contain any opening or closing HTML tags'),
          position: z.number('Position must be an integer').int().positive(),
          isCorrect: z.boolean('isCorrect must be a boolean'),
        })
      )
      .min(2, 'At least two options are required')
      .max(4, 'No more than 4 options are allowed')
      .refine(options => {
        const texts = options.map((option: any) => option.text.toLowerCase());
        return texts.length === new Set(texts).size;
      }, 'Option texts must be unique'),
  })
  .superRefine((data, ctx) => {
    const correctOptions = data.options.filter(opt => opt.isCorrect);
    if (correctOptions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one option must be marked as correct.',
        path: ['options'],
      });
    }
    if (data.type === 'SINGLE_CHOICE' && correctOptions.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only one option can be marked as correct for SINGLE_CHOICE questions.',
        path: ['options'],
      });
    }
    if (data.type === 'MULTIPLE_CHOICE' && correctOptions.length > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Less than 3 or equal to 3 can be marked as correct for MULTIPLE_CHOICE questions.',
        path: ['options'],
      });
    }
    if (data.type === 'TRUE_FALSE' && data.options.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'TRUE_FALSE questions must have exactly 2 options.',
        path: ['options'],
      });
    }
  });

const courseQuizSchema = z.object({
  title: z
    .string()
    .min(20, 'Quiz title must be at least 20 characters long')
    .max(500, 'Quiz title cannot exceed 500 characters')
    .regex(/^[^<>]*$/, 'Quiz title must not contain any opening or closing HTML tags'),
  description: z
    .string()
    .min(20, 'Quiz description must be at least 20 characters long')
    .regex(/^[^<>]*$/, 'Quiz description must not contain any opening or closing HTML tags.'),
  duration: z
    .number('Duration must be a number and must be positive')
    .int()
    .positive()
    .min(1)
    .max(60)
    .nullable()
    .optional(),
  passingScore: z.number('Passing score must be a number').int().positive().min(1).max(100),
  attemptsAllowed: z.number('attemptsAllowed must be a number').int().positive().min(1).max(10),
  questions: z.array(quizQuestionSchema).nonempty('At least one question is required'),
});

const courseLessonSchema = z.object({
  id: z.string().uuid().optional(),
  hostingType: z.enum(['FREE', 'PREMIUM']).optional(),
  videoUploadJobId: z.string().uuid().nullable().optional(),
  freeHostingAcknowledged: z.boolean().optional(),
  title: z
    .string()
    .trim()
    .min(5, 'LessonTitle must be at least 5 characters long')
    .max(150, 'LessonTitle cannot exceed 150 characters')
    .regex(/^[^<>]*$/, 'LessonTitle must not contain any opening or closing HTML tags.'),
  position: z.number('Position must be an integer').int().positive(),
  notes: z.preprocess(
    val => (val === '' ? undefined : val),
    z
      .string()
      .trim()
      .min(20, 'Notes must be at least 20 characters long')
      .max(1000, 'Notes cannot exceed 1000 characters')
      .regex(/^[^<>]*$/, 'Notes must not contain any opening or closing HTML tags.')
      .optional()
  ),
  description: z.preprocess(
    val => (val === '' ? undefined : val),
    z
      .string()
      .trim()
      .min(20, 'Description must be at least 20 characters long')
      .regex(/^[^<>]*$/, 'Description must not contain any opening or closing HTML tags.')
      .optional()
  ),
  type: z.enum(['VIDEO', 'ARTICLE', 'QUIZ'], 'Type is required'),
  contentUrl: z
    .object({
      name: z.string().optional(),
      url: z.preprocess(
        val => (typeof val === 'string' && val.trim() === '' ? undefined : val),
        z.string().url('Content url must be a valid URL (http:// or https://)').optional()
      ),
    })
    .optional()
    .nullable(),
  files: z
    .array(
      z.object({
        name: z.string(),
        url: z.url(
          'Content url Must be a valid URL format (e.g., starting with http:// or https://)'
        ),
      })
    )
    .optional(),
  duration: z
    .number('Lesson Duration must be a number and must be positive')
    .int()
    .positive()
    .min(1)
    .nullable()
    .optional(),
  quiz: courseQuizSchema.optional(),
});

const courseModuleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters long')
    .max(150, 'Title cannot exceed 150 characters')
    .regex(/^[^<>]*$/, 'Title must not contain any opening or closing HTML tags.'),
  position: z.number('Position must be an integer').int().positive(),
  lessons: z.array(courseLessonSchema).nonempty('At least one lesson is required'),
});

export function validateCurriculum(modules: CourseModule[]): FieldErrors {
  const errors: FieldErrors = {};
  const result = z.array(courseModuleSchema).min(1, 'Add at least one module').safeParse(modules);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const [moduleIndex, , lessonIndex, ...path] = issue.path;
      const module = typeof moduleIndex === 'number' ? modules[moduleIndex] : undefined;
      const lesson = typeof lessonIndex === 'number' ? module?.lessons[lessonIndex] : undefined;
      const prefix = module ? `section_${module.position}` : 'curriculum';
      const name = lesson ? `${prefix}_lecture_${lesson.position}_${path.join('_')}` : prefix;
      errors[name] ??= { type: 'validate', message: `${module ? `Module ${module.position}` : 'Curriculum'}${lesson ? `, lesson ${lesson.position}` : ''}: ${issue.message}` };
    }
  }
  for (const module of modules) {
    for (const lesson of module.lessons) {
      if (lesson.type === 'QUIZ' && !lesson.quiz) {
        errors[`section_${module.position}_lecture_${lesson.position}_addQuiz_type`] = {
          type: 'validate', message: `Module ${module.position}, lesson ${lesson.position}: Add a quiz with at least one question.`,
        };
      }
      if (lesson.type !== 'VIDEO') continue;
      const name = `section_${module.position}_lecture_${lesson.position}_video`;
      const label = `Module ${module.position}, lesson ${lesson.position}: `;
      const message = lesson.pendingVideoUploadJobId
        ? 'Your video is still uploading or processing. Wait for Video ready, or retry if the upload failed.'
        : !lesson.contentUrl?.url?.trim()
          ? 'Upload a video for this lesson.'
          : lesson.requestedHostingType && lesson.requestedHostingType !== (lesson.hostingType ?? 'PREMIUM')
            ? 'Finish uploading to the selected hosting provider or restore the existing provider.'
            : undefined;
      if (message) errors[name] = { type: 'validate', message: label + message };
    }
  }
  return errors;
}

