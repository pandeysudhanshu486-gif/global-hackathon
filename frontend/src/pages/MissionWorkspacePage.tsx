import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  FileText,
  Code2,
  Terminal,
} from 'lucide-react';
import { MissionHeader } from '../components/mission/MissionHeader';
import { MissionInstructions } from '../components/mission/MissionInstructions';
import { CodeEditor } from '../components/mission/CodeEditor';
import { TestResults } from '../components/mission/TestResults';
import { MissionSubmitPanel } from '../components/mission/MissionSubmitPanel';
import { PageExplainerCard } from '../components/guidance/PageExplainerCard';
import { Button } from '../components/ui/Button';
import type {
  MissionWorkspaceData,
  MissionFile,
  RunExecutionResult,
  SubmissionResult,
} from '../types/mission';
import { authFetch } from '../utils/auth';

interface MissionWorkspacePageProps {
  missionSlug?: string;
  onBack: () => void;
  onViewSkillGap?: () => void;
  onViewEvaluation?: (missionSlug: string) => void;
  onOpenTour?: () => void;
}

export const MissionWorkspacePage: React.FC<MissionWorkspacePageProps> = ({
  missionSlug = 'backend-order-total-bug',
  onBack,
  onViewSkillGap,
  onViewEvaluation,
  onOpenTour,
}) => {
  const [workspaceData, setWorkspaceData] = useState<MissionWorkspaceData | null>(null);
  const [files, setFiles] = useState<MissionFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('src/calculations.js');
  const [activeMobileTab, setActiveMobileTab] = useState<'instructions' | 'editor' | 'tests'>('editor');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<RunExecutionResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Fetch student mission workspace
  const fetchWorkspace = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch(`/api/student/missions/${missionSlug}`);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication required to open mission workspace.');
        }
        throw new Error(`Failed to load mission workspace (${res.status})`);
      }

      const body = await res.json();
      if (body.success && body.data) {
        const data: MissionWorkspaceData = body.data;
        setWorkspaceData(data);
        setFiles(data.files || data.starterFiles || []);

        // Pick target editable file
        const preferred = data.files?.find((f) => f.path.includes('calculations.js')) || data.files?.[0];
        if (preferred) {
          setActiveFilePath(preferred.path);
        }

        // Restore latest test results if available
        if (data.session?.latestTestResult) {
          setTestResult({
            runId: data.session.latestRunId || 'prev_run',
            status: data.session.latestTestResult.passed ? 'completed' : 'failed',
            passed: data.session.latestTestResult.passedCount || 0,
            failed: data.session.latestTestResult.failedCount || 0,
            total: data.session.latestTestResult.totalCount || 0,
            duration: 120,
            tests: data.session.latestTestResult.tests || [],
            stdout: '',
            stderr: '',
          });
        }

        // Restore submission status
        if (data.session?.status === 'submitted' || data.session?.status === 'evaluated') {
          setSubmissionResult({
            success: true,
            message: 'Mission already submitted',
            evidenceId: (data.session as any).submissionEvidenceId || 'recorded',
            integrityHash: data.session.integrityHash || 'verified-proof',
            status: data.session.status,
          });
        }
      } else {
        throw new Error(body.error?.message || 'Invalid server response');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to Mission Workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [missionSlug]);

  // File modification handler
  const handleFileChange = (path: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content: newContent } : f))
    );
  };

  // Reset file back to starter code
  const handleResetStarterFile = (path: string) => {
    if (workspaceData?.starterFiles) {
      const original = workspaceData.starterFiles.find((f) => f.path === path);
      if (original) {
        setFiles((prev) =>
          prev.map((f) => (f.path === path ? { ...f, content: original.content } : f))
        );
      }
    }
  };

  // Run tests in sandbox runner
  const handleRunTests = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const res = await authFetch(`/api/student/missions/${missionSlug}/run`, {
        method: 'POST',
        body: JSON.stringify({ files }),
      });

      const body = await res.json();
      if (res.ok && body.success && body.data) {
        setTestResult(body.data);
      } else {
        const errorMsg =
          body.error?.message ||
          (typeof body.error === 'string' ? body.error : null) ||
          body.message ||
          'Execution error';
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      setError(`Execution failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit mission and record cryptographic evidence
  const handleSubmitMission = async (technicalExplanation: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, any> = {};
      const trimmed = technicalExplanation?.trim();
      if (trimmed) {
        payload.technicalExplanation = trimmed;
      }

      const res = await authFetch(`/api/student/missions/${missionSlug}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (res.ok && body.success && body.data) {
        setSubmissionResult(body.data);
        if (workspaceData) {
          setWorkspaceData({
            ...workspaceData,
            session: {
              ...workspaceData.session,
              status: 'submitted',
              integrityHash: body.data.integrityHash,
            },
          });
        }
      } else {
        const detailMsg = Array.isArray(body.error?.details) && body.error.details[0]?.message
          ? body.error.details[0].message
          : null;
        const errorMsg =
          detailMsg ||
          body.error?.message ||
          (typeof body.error === 'string' ? body.error : null) ||
          body.message ||
          'Submission failed';
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      setError(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllPassed =
    (testResult &&
      testResult.status === 'completed' &&
      testResult.passed === testResult.total &&
      testResult.total > 0 &&
      testResult.failed === 0) ||
    false;

  const isSubmitted =
    workspaceData?.session?.status === 'submitted' ||
    workspaceData?.session?.status === 'evaluated';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-zinc-50 font-sans">
      {/* Loading Screen */}
      {loading && (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-zinc-700">Loading Work Simulator Workspace...</p>
          </div>
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="p-6 max-w-4xl mx-auto w-full">
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWorkspace}
                className="bg-white text-xs border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span>Retry</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loaded Mission Workspace */}
      {workspaceData && (
        <>
          {/* Mission Top Header */}
          <MissionHeader
            mission={workspaceData.mission}
            session={workspaceData.session}
            onBack={onBack}
            hasPassedTests={isAllPassed}
          />

          {/* Explainer Guide Card for Hackathon Judges & First-Time Users */}
          <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-6 pt-4">
            <PageExplainerCard pageId="missions" onOpenWalkthrough={onOpenTour} />
          </div>

          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex items-center justify-around bg-white border-b border-zinc-200 px-4 py-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveMobileTab('instructions')}
              className={`flex items-center gap-1.5 py-1 px-3 rounded-md transition-colors ${
                activeMobileTab === 'instructions'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-zinc-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Instructions</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab('editor')}
              className={`flex items-center gap-1.5 py-1 px-3 rounded-md transition-colors ${
                activeMobileTab === 'editor'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-zinc-600'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab('tests')}
              className={`flex items-center gap-1.5 py-1 px-3 rounded-md transition-colors ${
                activeMobileTab === 'tests'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-zinc-600'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Test Results</span>
            </button>
          </div>

          {/* Workspace Multi-Pane Container */}
          <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Mission Instructions & Workspace File Tree (5 Cols on LG) */}
            <div
              className={`lg:col-span-5 h-[calc(100vh-12rem)] overflow-y-auto ${
                activeMobileTab === 'instructions' ? 'block' : 'hidden lg:block'
              }`}
            >
              <MissionInstructions
                mission={workspaceData.mission}
                files={files}
                activeFilePath={activeFilePath}
                onSelectFile={(path) => {
                  setActiveFilePath(path);
                  setActiveMobileTab('editor');
                }}
              />
            </div>

            {/* Right Column: Code Editor + Test Panel + Submission (7 Cols on LG) */}
            <div
              className={`lg:col-span-7 space-y-4 ${
                activeMobileTab === 'instructions' ? 'hidden lg:block' : 'block'
              }`}
            >
              {/* Code Editor */}
              <div
                className={`h-[440px] ${
                  activeMobileTab === 'tests' ? 'hidden lg:block' : 'block'
                }`}
              >
                <CodeEditor
                  files={files}
                  activeFilePath={activeFilePath}
                  onSelectFile={setActiveFilePath}
                  onFileChange={handleFileChange}
                  onResetStarterFile={handleResetStarterFile}
                  readOnly={isSubmitted}
                />
              </div>

              {/* Test Evaluation Results Panel */}
              <div
                className={
                  activeMobileTab === 'editor' ? 'hidden lg:block' : 'block'
                }
              >
                <TestResults
                  onRunTests={handleRunTests}
                  isRunning={isRunning}
                  result={testResult}
                />
              </div>

              {/* Submission & Cryptographic Proof Receipt Panel */}
              <div
                className={
                  activeMobileTab === 'editor' ? 'hidden lg:block' : 'block'
                }
              >
                <MissionSubmitPanel
                  isAllPassed={isAllPassed}
                  onSubmit={handleSubmitMission}
                  isSubmitting={isSubmitting}
                  submissionResult={submissionResult}
                  onViewDashboard={onBack}
                  onViewSkillGap={onViewSkillGap}
                  onViewEvaluation={onViewEvaluation ? () => onViewEvaluation(missionSlug) : undefined}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
