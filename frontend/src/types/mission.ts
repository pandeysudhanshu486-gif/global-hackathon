export interface MissionFile {
  path: string;
  content: string;
}

export interface SkillTested {
  skillName: string;
  category: string;
  isPrimary: boolean;
}

export interface MissionManifest {
  slug: string;
  version: number;
  title: string;
  category: string;
  type: string;
  difficulty: number;
  timeEstimateMinutes: number;
  skillsTested: SkillTested[];
  rubricVersion: string;
  runtime: string;
  status: string;
  description?: string;
}

export interface TestResultItem {
  name: string;
  status: 'passed' | 'failed' | 'error';
  durationMs?: number;
  message?: string;
}

export interface RunExecutionResult {
  runId: string;
  status: 'completed' | 'failed' | 'timeout' | 'error';
  passed: number;
  failed: number;
  total: number;
  duration: number;
  tests: TestResultItem[];
  stdout: string;
  stderr: string;
}

export interface MissionSessionState {
  status: 'not_started' | 'in_progress' | 'submitted' | 'evaluated';
  startedAt: string;
  lastActivityAt: string;
  submittedAt?: string;
  runCount: number;
  failedRunCount: number;
  latestRunId?: string;
  latestTestResult?: {
    passed: boolean;
    passedCount: number;
    failedCount: number;
    totalCount: number;
    tests: TestResultItem[];
    runAt: string;
  };
  integrityHash?: string;
}

export interface MissionWorkspaceData {
  mission: MissionManifest;
  session: MissionSessionState;
  files: MissionFile[];
  starterFiles: MissionFile[];
}

export interface SubmissionResult {
  success: boolean;
  message: string;
  evidenceId: string;
  integrityHash: string;
  status: string;
}
