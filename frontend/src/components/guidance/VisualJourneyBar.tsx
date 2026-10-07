import React from 'react';
import {
  Target,
  BarChart3,
  Terminal,
  ShieldCheck,
  FileCheck2,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface VisualJourneyBarProps {
  currentStepId?: string;
  onNavigate?: (view: string) => void;
  completedSteps?: string[];
  interactive?: boolean;
}

export interface JourneyStepDef {
  id: string;
  stepNumber: number;
  label: string;
  shortDescription: string;
  icon: React.ElementType;
  viewTarget: string;
}

export const JOURNEY_STEPS: JourneyStepDef[] = [
  {
    id: 'target-role',
    stepNumber: 1,
    label: 'Target Role',
    shortDescription: 'Choose your desired job pathway',
    icon: Target,
    viewTarget: 'target-role',
  },
  {
    id: 'skill-gap',
    stepNumber: 2,
    label: 'Skill Gap Map',
    shortDescription: 'Inspect real evidence requirements',
    icon: BarChart3,
    viewTarget: 'skill-gap',
  },
  {
    id: 'missions',
    stepNumber: 3,
    label: 'Real Mission',
    shortDescription: 'Solve workplace bug in simulator',
    icon: Terminal,
    viewTarget: 'missions',
  },
  {
    id: 'submissions',
    stepNumber: 4,
    label: 'Verified Proof',
    shortDescription: '100% tests passed + SHA-256 receipt',
    icon: ShieldCheck,
    viewTarget: 'submissions',
  },
  {
    id: 'passport',
    stepNumber: 5,
    label: 'Proof Passport',
    shortDescription: 'Shareable cryptographic credential',
    icon: FileCheck2,
    viewTarget: 'passport',
  },
  {
    id: 'opportunities',
    stepNumber: 6,
    label: 'Opportunities',
    shortDescription: 'Apply to apprenticeships with proof',
    icon: Briefcase,
    viewTarget: 'opportunities',
  },
];

export const VisualJourneyBar: React.FC<VisualJourneyBarProps> = ({
  currentStepId = 'skill-gap',
  onNavigate,
  completedSteps = [],
  interactive = true,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Invariant & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
              The WorkProof AI Journey
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-800">
              Evidence &gt; Score
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            How first-time coders turn real work into tamper-proof hiring signals
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Click any step to inspect</span>
        </div>
      </div>

      {/* Steps Visual Chain */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {JOURNEY_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = currentStepId === step.id;
          const isCompleted = completedSteps.includes(step.id);

          return (
            <div
              key={step.id}
              onClick={() => {
                if (interactive && onNavigate) {
                  onNavigate(step.viewTarget);
                }
              }}
              className={`relative rounded-lg p-3 border transition-all flex flex-col justify-between ${
                interactive ? 'cursor-pointer select-none' : ''
              } ${
                isCurrent
                  ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                  : isCompleted
                  ? 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400'
                  : 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100/60'
              }`}
            >
              {/* Step indicator header */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  Step {step.stepNumber}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                ) : (
                  <span className="text-[10px] text-zinc-400 font-mono">0{idx + 1}</span>
                )}
              </div>

              {/* Icon & Label */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-zinc-500'
                    }`}
                  />
                  <h4
                    className={`text-xs font-bold truncate ${
                      isCurrent
                        ? 'text-blue-950'
                        : isCompleted
                        ? 'text-emerald-950'
                        : 'text-zinc-800'
                    }`}
                  >
                    {step.label}
                  </h4>
                </div>

                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-snug">
                  {step.shortDescription}
                </p>
              </div>

              {/* Status pill at bottom */}
              <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px]">
                <span
                  className={`font-semibold ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-blue-700'
                      : 'text-zinc-400'
                  }`}
                >
                  {isCompleted ? 'Completed' : isCurrent ? 'Current Focus' : 'Upcoming'}
                </span>
                {interactive && (
                  <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-zinc-700" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
