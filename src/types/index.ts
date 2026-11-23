export type Role = 'ADMIN' | 'TA' | 'STU';
export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: Role;
  status: 'ACTIVE' | 'DISABLED';
}
export interface ClassItem {
  classId: string;
  className: string;
  invitationCode?: string;
}
export interface Lab {
  labId: string;
  classId: string;
  title: string;
  statement: string;
  status: 'scheduled' | 'open' | 'closed' | 'published';
  opensAt: string;
  deadlineAt: string;
  constraints: Array<{ id: string; text: string; deduction: number }>;
  limits: { cpuSeconds: number; memoryMb: number };
  updatedAt?: string;
}

export type SubmissionStatus = 'queued' | 'running' | 'finished' | 'failed';
export type JudgeVerdict = 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';

export interface SubmissionTestResult {
  testNumber: number;
  verdict: JudgeVerdict;
  executionMs?: number;
}

export interface Submission {
  id: string;
  labId: string;
  status: SubmissionStatus;
  receivedAt: string;
  overallVerdict: JudgeVerdict | null;
  tests: SubmissionTestResult[];
}
