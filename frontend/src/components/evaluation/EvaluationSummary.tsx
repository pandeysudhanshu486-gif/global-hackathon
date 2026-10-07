import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Terminal,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { EvaluationResultData } from '../../types/evaluation';

interface EvaluationSummaryProps {
  evaluation: EvaluationResultData;
}

export const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({ evaluation }) => {
  const isPassed = evaluation.finalStatus === 'passed';
  const demonstratedCount = evaluation.capabilitiesAwarded.filter(
    (c) => c.status === 'demonstrated'
  ).length;

  return (
    <Card className="border-zinc-200 bg-white shadow-xs overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Top Title & Status Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
                <Terminal className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">{evaluation.missionTitle}</h2>
              <Badge variant={isPassed ? 'success' : 'error'} size="sm" className="font-bold">
                {isPassed ? 'Evaluation Passed' : 'Evaluation Failed'}
              </Badge>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                Rubric {evaluation.rubricVersion}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500">
              Deterministic verification evaluated at{' '}
              {new Date(evaluation.evaluatedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={isPassed ? 'success' : 'warning'}
              size="md"
              className="py-1 px-3 text-xs font-semibold"
            >
              {isPassed ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-green-700 mr-1" />
                  <span>Demonstrated Evidence Recorded</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-700 mr-1" />
                  <span>Unproven Gaps Remain</span>
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* 3-Column Key Evaluation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Metric 1: Automated Test Pass Rate */}
          <div className="p-4 rounded-lg border border-green-200 bg-green-50/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-green-900 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Deterministic Tests
              </span>
              <span className="text-sm font-bold text-green-800">
                {evaluation.deterministic.testsPassed}/{evaluation.deterministic.testsTotal}
              </span>
            </div>
            <p className="text-[11px] text-green-700">
              {evaluation.deterministic.functionalCorrectness
                ? '100% test assertions passed'
                : 'Failing assertions detected'}
            </p>
          </div>

          {/* Metric 2: Capabilities Awarded */}
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                Capabilities Proven
              </span>
              <span className="text-sm font-bold text-blue-800">
                {demonstratedCount} Awarded
              </span>
            </div>
            <p className="text-[11px] text-blue-700">
              Elevated to Demonstrated level (4/4 dots)
            </p>
          </div>

          {/* Metric 3: Evaluation Mode */}
          <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-500" />
                Evaluation Method
              </span>
              <span className="text-xs font-bold text-zinc-800 capitalize">
                {evaluation.assistive.evaluationMethod.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Deterministic ground truth + qualitative feedback
            </p>
          </div>
        </div>

        {/* Core Product Principle Notice */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-md p-3 text-xs flex items-center gap-2 text-slate-700">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Principle: Evidence &gt; Score.</strong> Demonstrated capability is established exclusively through observable execution test passes. AI qualitative review is assistive and never overrides failed test suites.
          </span>
        </div>
      </div>
    </Card>
  );
};
