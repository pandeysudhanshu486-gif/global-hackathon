import React, { useState } from 'react';
import {
  ShieldCheck,
  Send,
  Lock,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { SubmissionResult } from '../../types/mission';

interface MissionSubmitPanelProps {
  isAllPassed: boolean;
  onSubmit: (explanation: string) => Promise<void>;
  isSubmitting: boolean;
  submissionResult: SubmissionResult | null;
  onViewDashboard?: () => void;
  onViewSkillGap?: () => void;
  onViewEvaluation?: () => void;
}

export const MissionSubmitPanel: React.FC<MissionSubmitPanelProps> = ({
  isAllPassed,
  onSubmit,
  isSubmitting,
  submissionResult,
  onViewDashboard,
  onViewSkillGap,
  onViewEvaluation,
}) => {
  const [explanation, setExplanation] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(explanation);
  };

  const handleCopyHash = () => {
    if (submissionResult?.integrityHash) {
      navigator.clipboard.writeText(submissionResult.integrityHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  // State 1: Already successfully submitted
  if (submissionResult && submissionResult.success) {
    return (
      <Card className="border-green-300 bg-gradient-to-br from-green-50/70 via-white to-emerald-50/50 shadow-xs">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-green-950">
                Mission Submitted &amp; Verified!
              </h3>
              <p className="text-xs text-green-800">
                Your code passed all automated test suites. Cryptographic proof of work has been recorded.
              </p>
            </div>
          </div>

          {/* Cryptographic Proof Receipt */}
          <div className="bg-white border border-green-200 rounded-md p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-500 font-medium">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>SHA-256 Proof of Work Signature</span>
              </span>
              <Badge variant="success" size="sm">
                Demonstrated
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 bg-zinc-50 rounded border border-zinc-200/80 font-mono text-[11px] text-zinc-800">
              <span className="truncate">{submissionResult.integrityHash}</span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="p-1 text-zinc-500 hover:text-zinc-800 shrink-0 cursor-pointer"
                title="Copy SHA-256 Hash"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span>Evidence Level elevated to <strong>Demonstrated (4/4 dots)</strong> on your Skill Gap map.</span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            {onViewEvaluation && (
              <Button
                variant="primary"
                size="sm"
                onClick={onViewEvaluation}
                className="w-full sm:w-auto text-xs font-semibold"
              >
                View Structured Evaluation Receipt
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewSkillGap}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              View Skill Gap Map
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDashboard}
              className="w-full sm:w-auto text-xs text-zinc-600 hover:text-zinc-900"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // State 2: Tests not passed yet
  if (!isAllPassed) {
    return (
      <Card className="border-zinc-200 bg-zinc-50/70 p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-zinc-400" />
            <span>
              <strong>Submission Locked:</strong> Pass all test assertions in the sandbox above to unlock final submission.
            </span>
          </div>
          <Button variant="outline" size="sm" disabled className="opacity-50 text-xs shrink-0">
            Submit Solution
          </Button>
        </div>
      </Card>
    );
  }

  // State 3: Ready to submit
  return (
    <Card className="border-blue-200 bg-linear-to-r from-blue-50/40 via-white to-white shadow-xs">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-green-100 text-green-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900">
                Submit Solution for Verification
              </h3>
              <p className="text-[11px] text-zinc-500">
                Lock your verified submission into an immutable evidence record
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            All Tests Passed
          </Badge>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tech-explanation"
            className="block text-xs font-semibold text-zinc-700"
          >
            Technical Explanation (Recommended for Recruiters):
          </label>
          <textarea
            id="tech-explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            className="w-full text-xs p-3 border border-zinc-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            placeholder="Briefly describe what caused the floating-point calculation inaccuracies and how your solution ensures precision and valid coupon clamping..."
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Generates cryptographic SHA-256 evidence record.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 text-xs font-semibold px-5"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Recording Evidence...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final Solution</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
