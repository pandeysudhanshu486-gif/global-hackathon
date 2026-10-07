import React, { useState } from 'react';
import {
  FolderGit2,
  Search,
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileCode,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authFetch } from '../../utils/auth';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export interface GitHubRepoSummary {
  id: number;
  name: string;
  description: string;
  url: string;
  primaryLanguage: string;
  category: string;
  stars: number;
  forks: number;
  topics: string[];
  readmeSummary?: {
    hasReadme: boolean;
    technologiesDetected: string[];
    purposeSummary: string;
  };
}

export interface GitHubAnalysisData {
  username: string;
  profileUrl: string;
  publicRepoCount: number;
  totalStars: number;
  totalForks: number;
  primaryLanguages: Array<{ language: string; repoCount: number }>;
  repositories: GitHubRepoSummary[];
  analyzedAt?: string | Date;
  status: 'supporting';
  verified: false;
}

export interface GitHubAnalysisCardProps {
  initialUsername?: string;
  initialProfileUrl?: string;
  lastAnalyzedAt?: string | Date;
  onAnalysisSuccess: (data: GitHubAnalysisData) => void;
}

export const GitHubAnalysisCard: React.FC<GitHubAnalysisCardProps> = ({
  initialUsername = '',
  initialProfileUrl,
  lastAnalyzedAt,
  onAnalysisSuccess,
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GitHubAnalysisData | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a public GitHub username');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsAnalyzing(true);

    try {
      const response = await authFetch('/api/student/profile/github', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to analyze GitHub profile');
      }

      setAnalysisResult(result.data);
      setSuccessMsg(`Public GitHub profile "${username}" analyzed. Supporting evidence records created.`);
      onAnalysisSuccess(result.data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with GitHub analyzer');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="space-y-4">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-purple-600" />
              Public GitHub Supporting Evidence Analyzer
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">
              Analyze public repositories to provide supporting engineering evidence and project context.
            </p>
          </div>
          <span className="text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full self-start sm:self-auto">
            Supporting Evidence Only
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Username Input Form */}
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <Input
              label="GitHub Username"
              placeholder="e.g. octocat, torvalds"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isAnalyzing}
            leftIcon={<FolderGit2 className="w-4 h-4" />}
          >
            Analyze GitHub
          </Button>
        </form>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2.5 text-xs text-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Non-Scoring Invariant Disclaimer */}
        <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-200/80 text-xs text-purple-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Supporting Evidence Principle</p>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              GitHub data is recorded as supporting context. It does <strong>not</strong> produce arbitrary AI scores or
              independently grant "Demonstrated" capability status without verified Work Simulator submissions.
            </p>
          </div>
        </div>

        {/* Analysis Results Display */}
        {(analysisResult || initialUsername) && (
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-zinc-900">
                    GitHub: @{analysisResult?.username || initialUsername}
                  </h4>
                  <a
                    href={analysisResult?.profileUrl || initialProfileUrl || `https://github.com/${initialUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs inline-flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {analysisResult?.publicRepoCount ?? 'Multiple'} Public Repositories Analyzed
                </p>
              </div>

              {(analysisResult?.analyzedAt || lastAnalyzedAt) && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Last Analyzed:{' '}
                    {new Date(analysisResult?.analyzedAt || (lastAnalyzedAt as any)).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            {analysisResult && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                  <p className="text-zinc-500 text-[11px]">Public Repos</p>
                  <p className="font-bold text-zinc-900 text-base">{analysisResult.publicRepoCount}</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                  <p className="text-zinc-500 text-[11px] flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 text-amber-500" /> Stars
                  </p>
                  <p className="font-bold text-zinc-900 text-base">{analysisResult.totalStars}</p>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-zinc-200">
                  <p className="text-zinc-500 text-[11px] flex items-center justify-center gap-1">
                    <GitFork className="w-3 h-3 text-zinc-500" /> Forks
                  </p>
                  <p className="font-bold text-zinc-900 text-base">{analysisResult.totalForks}</p>
                </div>
              </div>
            )}

            {/* Analyzed Public Repositories List */}
            {analysisResult?.repositories && analysisResult.repositories.length > 0 && (
              <div className="space-y-2 pt-1">
                <h5 className="text-xs font-bold text-zinc-800">
                  Supporting Public Repositories ({analysisResult.repositories.length})
                </h5>
                <div className="space-y-2">
                  {analysisResult.repositories.map((repo) => (
                    <div
                      key={repo.id}
                      className="p-3 bg-white rounded-lg border border-zinc-200 space-y-1.5 hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-xs text-blue-700 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{repo.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <span className="font-medium text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded">
                            {repo.primaryLanguage}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-500" /> {repo.stars}
                          </span>
                        </div>
                      </div>

                      {repo.description && <p className="text-xs text-zinc-600 line-clamp-2">{repo.description}</p>}

                      {repo.readmeSummary?.hasReadme && (
                        <div className="text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded border border-zinc-100 flex items-start gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-zinc-700">README context: </span>
                            <span>{repo.readmeSummary.purposeSummary}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
