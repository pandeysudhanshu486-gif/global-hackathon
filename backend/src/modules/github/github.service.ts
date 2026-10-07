import { StudentProfileModel } from '../../models/studentProfile.model.js';
import { UserModel } from '../../models/user.model.js';
import { EvidenceRecordModel } from '../../models/evidenceRecord.model.js';
import { computeSha256 } from '../../shared/hash.js';
import { NotFoundError, BadRequestError, AppError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import { env } from '../../config/env.js';
import {
  GitHubUserProfile,
  GitHubRawRepo,
  ProcessedRepoContext,
  GitHubAnalysisResult,
} from './github.types.js';

const LANGUAGE_CATEGORY_MAP: Record<string, string> = {
  javascript: 'frontend',
  typescript: 'frontend',
  html: 'frontend',
  css: 'frontend',
  vue: 'frontend',
  svelte: 'frontend',
  python: 'backend',
  java: 'backend',
  go: 'backend',
  rust: 'backend',
  'c++': 'backend',
  c: 'backend',
  'c#': 'backend',
  php: 'backend',
  ruby: 'backend',
  kotlin: 'backend',
  swift: 'frontend',
  dart: 'frontend',
  shell: 'devops',
  dockerfile: 'devops',
  sql: 'database',
};

const COMMON_TECH_KEYWORDS = [
  'typescript',
  'javascript',
  'python',
  'java',
  'golang',
  'rust',
  'react',
  'next.js',
  'node.js',
  'express',
  'fastapi',
  'django',
  'flask',
  'spring boot',
  'mongodb',
  'postgresql',
  'mysql',
  'redis',
  'docker',
  'kubernetes',
  'graphql',
  'rest api',
  'jest',
  'mocha',
  'cypress',
  'tailwind',
  'aws',
  'gcp',
];

export class GitHubService {
  private static readonly API_BASE = 'https://api.github.com';

  private static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'WorkProof-AI-Verification-Platform',
    };

    if (env.GITHUB_TOKEN && env.GITHUB_TOKEN.trim().length > 5) {
      headers['Authorization'] = `token ${env.GITHUB_TOKEN.trim()}`;
    }

    return headers;
  }

  private static getCategoryForLanguage(lang?: string | null): string {
    if (!lang) return 'general';
    return LANGUAGE_CATEGORY_MAP[lang.toLowerCase()] || 'backend';
  }

  /**
   * Fetches public GitHub user profile
   */
  public static async fetchPublicProfile(username: string): Promise<GitHubUserProfile> {
    const url = `${this.API_BASE}/users/${encodeURIComponent(username)}`;
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(8000),
      });

      if (response.status === 404) {
        throw new NotFoundError(`GitHub user "${username}" was not found. Please verify the public username.`);
      }

      if (response.status === 403) {
        const remaining = response.headers.get('x-ratelimit-remaining');
        if (remaining === '0') {
          throw new BadRequestError('GitHub API rate limit exceeded. Please try again in a few minutes.');
        }
        throw new BadRequestError('GitHub API access was restricted.');
      }

      if (!response.ok) {
        throw new AppError(`GitHub API error: HTTP ${response.status}`, 502);
      }

      return (await response.json()) as GitHubUserProfile;
    } catch (err: any) {
      if (err instanceof NotFoundError || err instanceof BadRequestError || err instanceof AppError) {
        throw err;
      }
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new AppError('GitHub API request timed out. Please try again.', 504);
      }
      logger.error('Error querying GitHub user profile:', err);
      throw new AppError(`Failed to fetch GitHub profile: ${err.message}`, 502);
    }
  }

  /**
   * Fetches public repositories for a user
   */
  public static async fetchPublicRepositories(username: string): Promise<GitHubRawRepo[]> {
    const url = `${this.API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated`;
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        logger.warn(`GitHub repos fetch returned status ${response.status}`);
        return [];
      }

      return (await response.json()) as GitHubRawRepo[];
    } catch (err) {
      logger.warn('Failed to fetch public repositories from GitHub:', err);
      return [];
    }
  }

  /**
   * Fetches README content safely without failing if not present
   */
  public static async fetchRepoReadme(username: string, repoName: string): Promise<string | null> {
    const url = `${this.API_BASE}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/readme`;
    try {
      const response = await fetch(url, {
        headers: {
          ...this.getHeaders(),
          Accept: 'application/vnd.github.raw+json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.status === 404 || !response.ok) {
        return null;
      }

      return await response.text();
    } catch {
      return null;
    }
  }

  /**
   * Parses README content for technology mentions (self-authored context)
   */
  public static parseReadmeContext(readmeContent: string | null): {
    hasReadme: boolean;
    technologiesDetected: string[];
    purposeSummary: string;
  } {
    if (!readmeContent || readmeContent.trim().length === 0) {
      return {
        hasReadme: false,
        technologiesDetected: [],
        purposeSummary: 'No README found in public repository',
      };
    }

    const lower = readmeContent.toLowerCase();
    const detected: string[] = [];

    for (const tech of COMMON_TECH_KEYWORDS) {
      if (lower.includes(tech)) {
        detected.push(tech);
      }
    }

    // Extract first meaningful line as purpose summary
    const firstLine = readmeContent
      .split('\n')
      .map((l) => l.replace(/^[#*\- \t]+/, '').trim())
      .find((l) => l.length > 10 && !l.startsWith('![')) || 'Project documentation available';

    return {
      hasReadme: true,
      technologiesDetected: detected,
      purposeSummary: firstLine.substring(0, 150),
    };
  }

  /**
   * Main analysis execution: fetches public GitHub data, creates supporting evidence records, and updates student profile
   */
  public static async analyzeUserGitHub(
    userId: string,
    username: string
  ): Promise<GitHubAnalysisResult> {
    const user = await UserModel.findById(userId).select('email role');
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    let profile = await StudentProfileModel.findOne({ userId });
    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    // 1. Fetch public profile
    const gitHubUser = await this.fetchPublicProfile(username);

    // 2. Fetch public repos
    const rawRepos = await this.fetchPublicRepositories(username);

    // 3. Process repositories & fetch README context for top repos
    const processedRepos: ProcessedRepoContext[] = [];
    const languageCounts: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    const nonForkRepos = rawRepos.filter((r) => !r.fork);
    const reposToAnalyze = (nonForkRepos.length > 0 ? nonForkRepos : rawRepos).slice(0, 10);

    for (const r of reposToAnalyze) {
      const primaryLang = r.language || 'Other';
      const category = this.getCategoryForLanguage(r.language);

      if (r.language) {
        languageCounts[primaryLang] = (languageCounts[primaryLang] || 0) + 1;
      }

      totalStars += r.stargazers_count;
      totalForks += r.forks_count;

      // Fetch README context
      const readmeRaw = await this.fetchRepoReadme(username, r.name);
      const readmeContext = this.parseReadmeContext(readmeRaw);

      processedRepos.push({
        id: r.id,
        name: r.name,
        description: r.description || '',
        url: r.html_url,
        primaryLanguage: primaryLang,
        category,
        stars: r.stargazers_count,
        forks: r.forks_count,
        openIssues: r.open_issues_count,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        pushedAt: r.pushed_at,
        topics: r.topics || [],
        readmeSummary: readmeContext,
      });
    }

    // Sort languages by count
    const primaryLanguages = Object.entries(languageCounts)
      .map(([language, repoCount]) => ({ language, repoCount }))
      .sort((a, b) => b.repoCount - a.repoCount);

    // 4. Create immutable append-only EvidenceRecords for top repositories
    let evidenceCreated = 0;
    const now = new Date();

    for (const repo of processedRepos.slice(0, 5)) {
      const evidencePayload = {
        studentId: profile._id,
        sourceType: 'github' as const,
        type: 'GITHUB_REPO' as const,
        capabilityName: repo.primaryLanguage !== 'Other' ? repo.primaryLanguage : 'Software Development',
        capabilityCategory: repo.category,
        visibilityLevel: 'public' as const,
        sanitized: true,
        data: {
          repoName: repo.name,
          url: repo.url,
          description: repo.description,
          language: repo.primaryLanguage,
          stars: repo.stars,
          forks: repo.forks,
          topics: repo.topics,
          technologiesMentioned: repo.readmeSummary?.technologiesDetected || [],
          readmeSummary: repo.readmeSummary?.purposeSummary,
          isSupportingEvidence: true,
          verified: false, // Invariant: Supporting evidence is strictly unverified
          capturedAt: now.toISOString(),
        },
      };

      const integrityHash = computeSha256(evidencePayload);

      await EvidenceRecordModel.create({
        ...evidencePayload,
        integrityHash,
      });

      evidenceCreated++;
    }

    // 5. Update StudentProfile metadata (without touching manually declared skills)
    profile.githubUsername = gitHubUser.login;
    profile.githubProfileUrl = gitHubUser.html_url;
    profile.githubConnected = true;
    profile.githubLastAnalyzedAt = now;

    await profile.save();

    return {
      username: gitHubUser.login,
      profileUrl: gitHubUser.html_url,
      publicRepoCount: gitHubUser.public_repos,
      totalStars,
      totalForks,
      primaryLanguages,
      repositories: processedRepos,
      evidenceRecordsCreated: evidenceCreated,
      analyzedAt: now,
      status: 'supporting',
      verified: false,
    };
  }

  /**
   * Retrieves cached GitHub summary & supporting evidence records for the authenticated student
   */
  public static async getStudentGitHubSummary(userId: string) {
    const user = await UserModel.findById(userId).select('email');
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    const profile = await StudentProfileModel.findOne({ userId });
    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    // Retrieve supporting GitHub evidence records for this student
    const evidenceRecords = await EvidenceRecordModel.find({
      studentId: profile._id,
      sourceType: 'github',
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      connected: profile.githubConnected || false,
      username: profile.githubUsername || null,
      profileUrl: profile.githubProfileUrl || null,
      lastAnalyzedAt: profile.githubLastAnalyzedAt || null,
      evidenceRecordsCount: evidenceRecords.length,
      evidenceRecords: evidenceRecords.map((e) => ({
        id: e._id.toString(),
        type: e.type,
        capabilityName: e.capabilityName,
        capabilityCategory: e.capabilityCategory,
        data: e.data,
        integrityHash: e.integrityHash,
        createdAt: e.createdAt,
        verified: false,
        status: 'supporting',
      })),
    };
  }
}
