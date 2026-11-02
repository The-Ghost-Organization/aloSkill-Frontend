export type SubmissionType = 'TEXT' | 'LINK' | 'FILE';
export type AssignmentConfig = {
  title: string;
  instructions: string;
  submissionTypes: SubmissionType[];
  maxScore?: number;
  passingScore?: number;
  dueAt?: string;
  allowLate?: boolean;
  maxAttempts?: number;
};
export type AssessmentFile = { id: string; name: string; size: number; mimeType: string };
export type Question = {
  id: string;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  points: number;
  options: { id: string; text: string }[];
};
export type Attempt = {
  id: string;
  startedAt: string;
  deadlineAt?: string | null;
  submittedAt?: string | null;
  scoreAchieved?: number | null;
  isPassed?: boolean | null;
  earnedPoints?: number;
  totalPoints?: number;
  answers: Record<string, string[]>;
  questions: Question[];
  serverTime?: string;
};
export type Submission = {
  id: string;
  lessonId: string;
  text?: string;
  link?: string;
  files: AssessmentFile[];
  status: 'SUBMITTED' | 'GRADED' | 'RESUBMISSION_REQUESTED';
  score?: number | null;
  feedback?: string | null;
  createdAt: string;
  user?: { email: string; studentProfile?: { displayName?: string } };
  lesson?: { title: string; assignment?: AssignmentConfig };
};
export type Overview = {
  quiz: {
    id: string;
    title: string;
    description?: string;
    duration?: number | null;
    passingScore: number;
    attemptsAllowed: number;
    questionCount: number;
    totalPoints: number;
  } | null;
  activeAttempt: Attempt | null;
  attempts: Attempt[];
  attemptsRemaining: number;
  assignment: AssignmentConfig | null;
  submissions: Submission[];
  serverTime?: string;
};
