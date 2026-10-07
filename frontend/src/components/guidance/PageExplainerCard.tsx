import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';

export interface PageExplainerCardProps {
  pageId: 'skill-gap' | 'missions' | 'submissions' | 'passport' | 'opportunities' | 'target-role';
  title?: string;
  summary?: string;
  details?: string[];
  takeaway?: string;
  onOpenWalkthrough?: () => void;
}

const PAGE_EXPLAINERS: Record<
  string,
  {
    title: string;
    badge: string;
    summary: string;
    details: string[];
    takeaway: string;
  }
> = {
  'target-role': {
    title: 'What is Target Role Selection?',
    badge: 'Step 1 • Career Pathway',
    summary:
      'Instead of generic job searches, you select an industry-defined career track. WorkProof maps the exact technical capabilities real companies expect.',
    details: [
      'Standardized roles (Backend Developer, Frontend, Full Stack) vetted for junior engineers.',
      'Separates critical "Core" requirements from "Recommended" capabilities.',
      'Drives the Skill Gap engine to recommend precise work missions.',
    ],
    takeaway: 'Evidence > Score: You always know exactly what skills you need to prove.',
  },
  'skill-gap': {
    title: 'What is the Skill Gap Map?',
    badge: 'Step 2 • Evidence Hierarchy',
    summary:
      'A transparent audit of your readiness against your target role. Every capability is categorized by evidence level — never an arbitrary score or algorithmic percentage.',
    details: [
      'Level 1: Declared (Self-claimed)',
      'Level 2: AI-Assisted (Parsed from resume)',
      'Level 3: Supporting (GitHub repos)',
      'Level 4: Demonstrated (Passed automated tests)',
    ],
    takeaway: 'Evidence > Score: 4 green dots mean verified code execution, not an algorithm guess.',
  },
  missions: {
    title: 'What is the Work Simulator?',
    badge: 'Step 3 • Workplace Coding',
    summary:
      'A realistic engineering workspace where you fix production bugs and write automated tests. No LeetCode algorithms or multiple-choice questions.',
    details: [
      'Authentic production codebases with real logic and edge-case defects.',
      'In-browser editor with live syntax highlighting and isolated test execution.',
      'Must pass 100% of test assertions before unlocking submission.',
    ],
    takeaway: 'Evidence > Score: Proves you can do the real work of a junior software developer.',
  },
  submissions: {
    title: 'What is this Evaluation Receipt?',
    badge: 'Step 4 • Cryptographic Proof',
    summary:
      'An immutable record of your verified solution. Shows automated test assertions, rubric evaluations, and a tamper-proof SHA-256 hash.',
    details: [
      'Deterministic test suite verification (100% pass rate recorded).',
      'Immutable SHA-256 cryptographic signature locking your code diff and identity.',
      'Elevates your capability on the Skill Gap Map to Demonstrated status.',
    ],
    takeaway: 'Evidence > Score: Cryptographically signed proof that recruiters can independently audit.',
  },
  passport: {
    title: 'What is the Proof Passport?',
    badge: 'Step 5 • Portable Hiring Signal',
    summary:
      'Your verified digital portfolio replacing traditional paper resumes. Demonstrates to recruiters exactly what you have built and proven.',
    details: [
      'Shareable public link & QR code for applications, resumes, and LinkedIn.',
      'Inspectable code diffs, test assertion logs, and repository evidence.',
      'Granular privacy controls: choose what contact info or code to make public.',
    ],
    takeaway: 'Evidence > Score: Gives youth and non-traditional candidates an unforgeable hiring signal.',
  },
  opportunities: {
    title: 'How do Opportunities & Applications Work?',
    badge: 'Step 6 • Direct Employment',
    summary:
      'Browse apprenticeships, internships, and junior roles curated for youth and first-time coders. Apply with 1-click using your verified Proof Passport.',
    details: [
      'Capability Matching: Shows which requirements you have already Demonstrated.',
      'Apprenticeships designed to bridge candidates into full-time tech careers.',
      '1-Click Apply: Recruiters receive your verified evidence dossier directly.',
    ],
    takeaway: 'Evidence > Score: Companies hire based on demonstrated ability, not pedigree.',
  },
};

export const PageExplainerCard: React.FC<PageExplainerCardProps> = ({
  pageId,
  title,
  summary,
  details,
  takeaway,
  onOpenWalkthrough,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const defaultContent = PAGE_EXPLAINERS[pageId] || {
    title: 'What is this page?',
    badge: 'Guide',
    summary: summary || 'Inspect and interact with verified capability proof.',
    details: details || [],
    takeaway: takeaway || 'Evidence > Score',
  };

  const displayTitle = title || defaultContent.title;
  const displaySummary = summary || defaultContent.summary;
  const displayDetails = details || defaultContent.details;
  const displayTakeaway = takeaway || defaultContent.takeaway;
  const displayBadge = defaultContent.badge;

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-full border border-blue-200 text-xs font-medium transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>What is this page?</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-white p-4 shadow-xs text-xs space-y-3 transition-all">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 text-xs sm:text-sm">
                {displayTitle}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100/80 text-blue-800 border border-blue-200">
                {displayBadge}
              </span>
            </div>
            <p className="text-zinc-600 text-xs mt-1 leading-relaxed">
              {displaySummary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-zinc-500 hover:text-zinc-800 hover:bg-blue-100/50 transition-colors"
            title={isExpanded ? 'Show less' : 'Learn more'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            title="Dismiss helper"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="pt-2 border-t border-blue-100 space-y-2.5 animate-in fade-in duration-150">
          {displayDetails.length > 0 && (
            <ul className="space-y-1 text-[11px] text-zinc-700 pl-4 list-disc marker:text-blue-500">
              {displayDetails.map((d, idx) => (
                <li key={idx}>{d}</li>
              ))}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-blue-900">
            <div className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{displayTakeaway}</span>
            </div>

            {onOpenWalkthrough && (
              <button
                type="button"
                onClick={onOpenWalkthrough}
                className="font-bold underline hover:text-blue-700 cursor-pointer text-[11px] text-left sm:text-right"
              >
                Launch 30-sec Guided Tour &rarr;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
