export interface ExecutionFile {
  path: string;
  content: string;
}

export interface ExecutionJobRequest {
  attemptId: string;
  missionSlug: string;
  files: ExecutionFile[];
  command?: 'test' | 'run';
  timeoutMs?: number;
}

export interface TestResultItem {
  name: string;
  status: 'passed' | 'failed' | 'error';
  durationMs?: number;
  message?: string;
}

export interface ExecutionJobResponse {
  jobId: string;
  status: 'completed' | 'failed' | 'timeout' | 'error';
  exitCode: number;
  passed: number;
  failed: number;
  total: number;
  stdout: string;
  stderr: string;
  executionDurationMs: number;
  tests: TestResultItem[];
  metrics?: {
    filesChecked: number;
    linesModified: number;
  };
}
