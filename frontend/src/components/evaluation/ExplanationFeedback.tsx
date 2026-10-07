import React from 'react';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { AssistiveResults, ExplanationQuality } from '../../types/evaluation';

interface ExplanationFeedbackProps {
  assistive: AssistiveResults;
}

const qualityConfig: Record<
  ExplanationQuality,
  { label: string; variant: 'success' | 'warning' | 'error' | 'secondary'; description: string }
> = {
  strong: {
    label: 'Strong Technical Articulation',
    variant: 'success',
    description: 'Clearly identified the underlying defect, boundary constraints, and solution design.',
  },
  adequate: {
    label: 'Adequate Explanation',
    variant: 'warning',
    description: 'Summarized the bug fix adequately. Adding deeper edge case discussion can enhance clarity.',
  },
  insufficient: {
    label: 'Brief / Insufficient',
    variant: 'error',
    description: 'Explanation was brief. Elaborating on root cause analysis provides stronger signal to recruiters.',
  },
  not_provided: {
    label: 'Not Provided',
    variant: 'secondary',
    description: 'No written explanation was submitted with code.',
  },
};

export const ExplanationFeedback: React.FC<ExplanationFeedbackProps> = ({ assistive }) => {
  const cfg = qualityConfig[assistive.explanationQuality] || qualityConfig.adequate;

  return (
    <Card className="border-zinc-200 bg-white shadow-xs">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-50 text-amber-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Technical Reasoning &amp; Articulation Review
              </h3>
              <p className="text-xs text-zinc-500">
                Assistive qualitative analysis of your submitted explanation
              </p>
            </div>
          </div>

          <Badge variant={cfg.variant} size="sm" className="font-semibold self-start sm:self-auto">
            {cfg.label}
          </Badge>
        </div>

        {/* Status Description */}
        <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-md border border-zinc-100">
          {cfg.description}
        </p>

        {/* Strengths & Improvement Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Strengths */}
          <div className="p-4 rounded-lg border border-green-200 bg-green-50/30 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-green-900 text-xs">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Observed Strengths:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-green-900/90 list-disc list-inside">
              {assistive.strengths.map((s, idx) => (
                <li key={idx} className="leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Areas */}
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Suggested Areas to Deepen:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-900/90 list-disc list-inside">
              {assistive.improvementAreas.map((imp, idx) => (
                <li key={idx} className="leading-relaxed">
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Qualitative Transparency Footnote */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-1">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Qualitative reviews are assistive and intended for mentorship. They do not alter your deterministic test outcomes or create numeric ranking scores.
          </span>
        </div>
      </div>
    </Card>
  );
};
