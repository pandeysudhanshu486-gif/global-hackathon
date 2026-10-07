import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Terminal,
} from 'lucide-react';
import { EvaluationSummary } from '../components/evaluation/EvaluationSummary';
import { CapabilityEvidenceCard } from '../components/evaluation/CapabilityEvidenceCard';
import { ExplanationFeedback } from '../components/evaluation/ExplanationFeedback';
import { PageExplainerCard } from '../components/guidance/PageExplainerCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { EvaluationResultData } from '../types/evaluation';
import { authFetch } from '../utils/auth';

interface EvaluationResultPageProps {
  missionSlug?: string;
  initialEvaluation?: EvaluationResultData | null;
  onBackToDashboard: () => void;
  onViewSkillGap: () => void;
  onReviewMission?: () => void;
  onOpenTour?: () => void;
}

export const EvaluationResultPage: React.FC<EvaluationResultPageProps> = ({
  missionSlug = 'backend-order-total-bug',
  initialEvaluation = null,
  onBackToDashboard,
  onViewSkillGap,
  onReviewMission,
  onOpenTour,
}) => {
  const [evaluation, setEvaluation] = useState<EvaluationResultData | null>(initialEvaluation);
  const [loading, setLoading] = useState<boolean>(!initialEvaluation);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const fetchEvaluation = async () => {
    setLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const res = await authFetch(`/api/student/evaluations/missions/${missionSlug}`);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication required to view evaluation results.');
        }
        if (res.status === 404) {
          // Resilient fallback: check if any evaluation exists in the student's submission list
          try {
            const listRes = await authFetch('/api/student/evaluations');
            if (listRes.ok) {
              const listBody = await listRes.json();
              if (listBody.success && Array.isArray(listBody.data) && listBody.data.length > 0) {
                setEvaluation(listBody.data[0]);
                return;
              }
            }
          } catch {
            // Ignore fallback error and proceed to not found
          }
          setIsNotFound(true);
          return;
        }
        throw new Error(`Failed to load evaluation (${res.status})`);
      }

      const body = await res.json();
      if (body.success && body.data) {
        setEvaluation(body.data);
      } else {
        throw new Error(body.error?.message || 'Invalid evaluation response');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching evaluation results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialEvaluation) {
      fetchEvaluation();
    }
  }, [missionSlug]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 pb-16 font-sans">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToDashboard}
            className="text-zinc-600 hover:text-zinc-900 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Dashboard</span>
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
              Evaluation &amp; Capability Proof Receipt
            </h1>
            <Badge variant="default" size="sm">
              Verified Evidence
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvaluation}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Explainer Guide Card for Hackathon Judges & First-Time Users */}
      <PageExplainerCard pageId="submissions" onOpenWalkthrough={onOpenTour} />

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-44 bg-zinc-200 rounded-lg" />
          <div className="h-48 bg-zinc-200 rounded-lg" />
          <div className="h-40 bg-zinc-200 rounded-lg" />
        </div>
      )}

      {/* Empty State when no submission yet */}
      {isNotFound && !loading && (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Terminal className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-zinc-900">
              No Mission Submissions Yet
            </h2>
            <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
              Aapne abhi tak koi work mission submit nahi kiya hai. Apni pehli verified capability proof receipt pane ke liye Work Simulator mein mission complete karein.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={onReviewMission || onBackToDashboard}
              className="w-full sm:w-auto text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span>Start Work Mission</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onViewSkillGap}
              className="w-full sm:w-auto text-xs font-medium flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Skill Gap Map</span>
            </Button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && !isNotFound && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvaluation}
              className="bg-white text-xs border-red-300 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loaded Evaluation Results */}
      {evaluation && (
        <div className="space-y-6">
          {/* Section 1: Evaluation Summary & High-Level Metrics */}
          <EvaluationSummary evaluation={evaluation} />

          {/* Section 2: Demonstrated Capabilities Awarded */}
          <CapabilityEvidenceCard
            capabilities={evaluation.capabilitiesAwarded}
            missionSlug={evaluation.missionSlug}
            runId={evaluation.runId}
            codeHash={evaluation.codeHash}
            integrityHash={evaluation.integrityHash}
          />

          {/* Section 3: Technical Reasoning Qualitative Review */}
          <ExplanationFeedback assistive={evaluation.assistive} />

          {/* Section 4: Next Action Callout & Continuous Improvement Loop */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                Continuous Proof of Work Loop
              </span>
              <h3 className="text-base font-bold">
                Your Skill Gap Map Has Been Updated
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Check your updated capability profile to inspect your newly proven demonstrated capabilities and discover your next recommended work mission.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={onViewSkillGap}
                className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Skill Gap Map</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Button>

              {onReviewMission && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onReviewMission}
                  className="w-full sm:w-auto text-white hover:bg-blue-700 text-xs flex items-center justify-center gap-1.5"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Review Code</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
