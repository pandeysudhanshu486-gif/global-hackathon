import React, { useState } from 'react';
import {
  ShieldCheck,
  GitBranch,
  FileText,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { CapabilityAnalysisItem, EvidenceState } from '../../types/skill-gap';

interface CapabilityCardProps {
  capability: CapabilityAnalysisItem;
  onTakeAction?: (capability: CapabilityAnalysisItem) => void;
}

const statusConfig: Record<
  EvidenceState,
  {
    label: string;
    dots: number;
    color: string;
    badgeVariant: 'success' | 'info' | 'warning' | 'secondary' | 'error';
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  demonstrated: {
    label: 'Demonstrated',
    dots: 4,
    color: 'bg-green-600',
    badgeVariant: 'success',
    icon: ShieldCheck,
  },
  supporting: {
    label: 'Supporting Evidence',
    dots: 2,
    color: 'bg-blue-600',
    badgeVariant: 'info',
    icon: GitBranch,
  },
  declared: {
    label: 'Declared Claim',
    dots: 1,
    color: 'bg-amber-600',
    badgeVariant: 'warning',
    icon: FileText,
  },
  ai_assisted: {
    label: 'Resume Mention (Unverified)',
    dots: 1,
    color: 'bg-amber-600',
    badgeVariant: 'warning',
    icon: Sparkles,
  },
  evidence_gap: {
    label: 'Evidence Gap',
    dots: 0,
    color: 'bg-zinc-300',
    badgeVariant: 'secondary',
    icon: AlertCircle,
  },
};

export const CapabilityCard: React.FC<CapabilityCardProps> = ({ capability, onTakeAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cfg = statusConfig[capability.status] || statusConfig.evidence_gap;
  const StatusIcon = cfg.icon;

  return (
    <Card className="hover:border-zinc-300 transition-shadow">
      <div className="p-5 space-y-4">
        {/* Header Row: Title, Importance, Category & Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-zinc-900">{capability.name}</h4>
              <Badge
                variant={capability.importance === 'core' ? 'default' : 'secondary'}
                size="sm"
              >
                {capability.importance === 'core' ? 'Core Requirement' : 'Recommended'}
              </Badge>
              <Badge variant="outline" size="sm" className="capitalize text-zinc-600">
                {capability.category}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
              {capability.description}
            </p>
          </div>

          {/* Evidence Level Display: 4-dots + Text Badge (Never dots alone) */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-1" aria-label={`Evidence Level: ${cfg.dots} of 4`}>
              {[1, 2, 3, 4].map((dot) => (
                <span
                  key={dot}
                  className={`w-2 h-2 rounded-full ${
                    dot <= cfg.dots ? cfg.color : 'bg-zinc-200'
                  }`}
                />
              ))}
            </div>
            <Badge variant={cfg.badgeVariant} size="sm" className="flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              <span>{cfg.label}</span>
            </Badge>
          </div>
        </div>

        {/* Evidence Status Context Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Current Evidence State */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-md p-3 text-xs space-y-1">
            <div className="font-semibold text-zinc-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Current Evidence</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">{capability.currentEvidenceSummary}</p>
          </div>

          {/* Missing Proof / Gap Rationale */}
          <div
            className={`border rounded-md p-3 text-xs space-y-1 ${
              capability.status === 'demonstrated'
                ? 'bg-green-50/50 border-green-100 text-green-800'
                : 'bg-amber-50/40 border-amber-100 text-amber-900'
            }`}
          >
            <div className="font-semibold flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  capability.status === 'demonstrated' ? 'bg-green-500' : 'bg-amber-500'
                }`}
              />
              <span>{capability.status === 'demonstrated' ? 'Verified Status' : 'Evidence Needed'}</span>
            </div>
            <p className="leading-relaxed">{capability.missingEvidence}</p>
          </div>
        </div>

        {/* Collapsible Details: Why It Matters & Deep Context */}
        {isExpanded && (
          <div className="pt-2 border-t border-zinc-100 space-y-3 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-zinc-800 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                Why this matters for recruiters:
              </span>
              <p className="text-zinc-600 leading-relaxed bg-zinc-50 p-2.5 rounded border border-zinc-200/60">
                {capability.whyItMatters}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-zinc-800">Target Action to Prove:</span>
              <p className="text-zinc-700 font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-200/80">
                {capability.recommendedAction}
              </p>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-zinc-500 hover:text-zinc-800 font-medium flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <span>Hide analysis details</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Inspect why this matters</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {capability.status !== 'demonstrated' && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1.5 font-medium"
              onClick={() => onTakeAction?.(capability)}
            >
              <span>Prove Capability</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
