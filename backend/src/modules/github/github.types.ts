export interface GitHubUserProfile {
  login: string;
  id: number;
  avatar_url?: string;
  html_url: string;
  name?: string;
  bio?: string;
  public_repos: number;
  public_gists?: number;
  followers?: number;
  following?: number;
  created_at: string;
}

export interface GitHubRawRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics?: string[];
  default_branch?: string;
}

export interface ProcessedRepoContext {
  id: number;
  name: string;
  description: string;
  url: string;
  primaryLanguage: string;
  category: string;
  stars: number;
  forks: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  topics: string[];
  readmeSummary?: {
    hasReadme: boolean;
    technologiesDetected: string[];
    purposeSummary: string;
  };
}

export interface GitHubAnalysisResult {
  username: string;
  profileUrl: string;
  publicRepoCount: number;
  totalStars: number;
  totalForks: number;
  primaryLanguages: Array<{ language: string; repoCount: number }>;
  repositories: ProcessedRepoContext[];
  evidenceRecordsCreated: number;
  analyzedAt: Date;
  status: 'supporting';
  verified: false; // Invariant: Supporting evidence is strictly unverified
}
