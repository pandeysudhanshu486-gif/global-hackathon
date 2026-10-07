import React, { useState } from 'react';
import {
  X,
  Target,
  BarChart3,
  Terminal,
  ShieldCheck,
  FileCheck2,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface GuidedWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

interface TourStep {
  id: string;
  viewName?: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  keyPoints: string[];
  principleHighlight: string;
  actionLabel?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'target-role',
    viewName: 'target-role',
    badge: 'Step 1 of 6 • Career Pathway',
    title: '1. Select Your Target Role',
    subtitle: 'Clear industry expectations, zero vague job descriptions',
    description:
      'Instead of confusing lists of 50+ requirements, WorkProof AI translates modern roles (like Backend Developer or Frontend Engineer) into standardized, observable capabilities.',
    icon: Target,
    keyPoints: [
      'Standardized role templates vetted for entry-level & apprentice hiring',
      'Distinguishes Core capabilities from Recommended capabilities',
      'Translates vague job descriptions into concrete engineering tasks',
    ],
    principleHighlight: 'Clear standards give youth and first-time coders an achievable roadmap.',
    actionLabel: 'Explore Target Roles',
  },
  {
    id: 'skill-gap',
    viewName: 'skill-gap',
    badge: 'Step 2 of 6 • Evidence Hierarchy',
    title: '2. Understand Your Skill Gap',
    subtitle: 'Evidence-first capability mapping instead of arbitrary percentages',
    description:
      'Your Skill Gap Map visually tracks every capability across 4 strict evidence levels. We never use arbitrary scores or hireability percentages — only real evidence.',
    icon: BarChart3,
    keyPoints: [
      'Level 1: Declared (Self-reported claims)',
      'Level 2: AI-Assisted (Parsed from resumes)',
      'Level 3: Supporting (Public GitHub activity)',
      'Level 4: Demonstrated (Passing automated tests in simulator)',
    ],
    principleHighlight: 'EVIDENCE > SCORE: Every dot represents verifiable proof, not a black-box AI score.',
    actionLabel: 'View Skill Gap Map',
  },
  {
    id: 'work-missions',
    viewName: 'missions',
    badge: 'Step 3 of 6 • Workplace Simulator',
    title: '3. Complete Real Work Missions',
    subtitle: 'Production codebases, real bugs, zero LeetCode trivia',
    description:
      'Step into the Work Simulator. You receive real starter files with authentic business bugs (e.g., floating-point calculation leaks or discount clamping errors), acceptance criteria, and full unit test suites.',
    icon: Terminal,
    keyPoints: [
      'Real in-browser code editor with instant syntax highlighting',
      'Isolated sandbox execution environment running Node.js / Python',
      'Automated unit & regression assertions that must pass 100%',
    ],
    principleHighlight: 'Simulates the actual day-to-day work of junior engineers.',
    actionLabel: 'Open Work Simulator',
  },
  {
    id: 'demonstrated-proof',
    viewName: 'submissions',
    badge: 'Step 4 of 6 • Deterministic Verification',
    title: '4. Generate Cryptographic Proof',
    subtitle: 'Immutable SHA-256 signatures that cannot be faked or hallucinated',
    description:
      'Once all test assertions pass, submitting generates an immutable SHA-256 cryptographic proof receipt. The candidate writes a brief technical explanation, locking their demonstrated proof into an audit trail.',
    icon: ShieldCheck,
    keyPoints: [
      'Deterministic verification: 100% of test assertions must pass',
      'SHA-256 cryptographic hash links candidate ID, code diff, and test suite',
      'Elevates candidate capability from Gap or Supporting to Demonstrated (4/4)',
    ],
    principleHighlight: 'Tamper-proof hiring signal recruiters can independently verify.',
    actionLabel: 'Inspect Proof Receipts',
  },
  {
    id: 'proof-passport',
    viewName: 'passport',
    badge: 'Step 5 of 6 • Portable Hiring Signal',
    title: '5. Build Your Proof-of-Work Passport',
    subtitle: 'A verified digital credential replacing traditional resumes',
    description:
      'All verified capabilities aggregate into your public Proof Passport. Candidates can share a public link or QR code with employers, showcasing verified test suites, GitHub history, and code diffs with privacy controls.',
    icon: FileCheck2,
    keyPoints: [
      'Clean public URL and QR code for resumes and LinkedIn',
      'Granular privacy settings: control what recruiters can view',
      'Instant candidate dossier viewable by hiring teams',
    ],
    principleHighlight: 'Empowers first-time coders with tangible proof over prestige.',
    actionLabel: 'View Proof Passport',
  },
  {
    id: 'opportunities',
    viewName: 'opportunities',
    badge: 'Step 6 of 6 • Opportunity Matching',
    title: '6. Discover Apprenticeships & Jobs',
    subtitle: 'Direct matching based on proven capabilities, not keywords',
    description:
      'Discover apprenticeships, internships, and junior roles curated specifically for youth and early-career talent. WorkProof compares your Demonstrated capabilities against employer requirements for 1-click verified applications.',
    icon: Briefcase,
    keyPoints: [
      'Apprenticeships, internships, and entry-level positions',
      'Capability match breakdown: see exactly which requirements you satisfy',
      'Apply with 1-click using your verified Proof Passport',
    ],
    principleHighlight: 'Connects verified talent directly to inclusive employers.',
    actionLabel: 'Browse Opportunities',
  },
];

export const GuidedWalkthroughModal: React.FC<GuidedWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpToPage = () => {
    if (currentStep.viewName && onNavigate) {
      onNavigate(currentStep.viewName);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-700/80 border border-blue-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">How WorkProof AI Works</h3>
              <p className="text-[11px] text-blue-200">The Evidence-First Journey in 6 Simple Steps</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition-colors"
            title="Close walkthrough"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {TOUR_STEPS.map((s, idx) => {
              const active = idx === currentStepIndex;
              const completed = idx < currentStepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : completed
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-zinc-200/70 text-zinc-600 hover:bg-zinc-300'
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="w-3 h-3 text-green-700" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                  <span className="hidden sm:inline">
                    {idx === 0
                      ? 'Role'
                      : idx === 1
                      ? 'Gap'
                      : idx === 2
                      ? 'Mission'
                      : idx === 3
                      ? 'Proof'
                      : idx === 4
                      ? 'Passport'
                      : 'Jobs'}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-zinc-500 font-medium shrink-0 ml-2">
            {currentStepIndex + 1} of {TOUR_STEPS.length}
          </span>
        </div>

        {/* Step Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step Title Header */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded">
                {currentStep.badge}
              </span>
              <h4 className="text-lg font-bold text-zinc-900 leading-snug">
                {currentStep.title}
              </h4>
              <p className="text-xs text-blue-700 font-medium">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Description Paragraph */}
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Key Bullet Points */}
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <h5 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
              Key Mechanism:
            </h5>
            <div className="space-y-1.5">
              {currentStep.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Principle Badge */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center gap-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="font-medium text-[11px]">
              <strong className="text-amber-950 font-bold">WorkProof Invariant:</strong>{' '}
              {currentStep.principleHighlight}
            </p>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-800 font-medium order-2 sm:order-1 cursor-pointer"
          >
            Skip Walkthrough
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
            {!isFirst && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Back
              </Button>
            )}

            {currentStep.viewName && onNavigate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleJumpToPage}
                className="text-xs"
              >
                {currentStep.actionLabel || 'Try this Step'}
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={!isLast ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
              className="text-xs font-semibold px-4"
            >
              {isLast ? 'Complete Tour & Start' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
