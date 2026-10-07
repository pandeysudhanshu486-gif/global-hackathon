import React, { useState } from 'react';
import {
  XCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Cpu,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export interface WhyWorkProofComparisonProps {
  defaultExpanded?: boolean;
}

export const WhyWorkProofComparison: React.FC<WhyWorkProofComparisonProps> = ({
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const comparisonRows = [
    {
      factor: 'Candidate Evaluation',
      traditional: 'Keyword-stuffed resumes and unverified self-reported claims',
      workproof: 'Verified code diffs, passing test suites, and technical explanations',
    },
    {
      factor: 'Hiring Assessment',
      traditional: 'Memorized LeetCode puzzles and trivia unrelated to real work',
      workproof: 'Work Simulator with authentic production tasks and regression suites',
    },
    {
      factor: 'Hiring Signal',
      traditional: 'Black-box algorithms, arbitrary scores, and resume filters',
      workproof: 'Evidence > Score: 4-tier transparent hierarchy (Demonstrated 4/4 dots)',
    },
    {
      factor: 'Access for Youth & First-Time Coders',
      traditional: 'Screened out due to lack of prior job titles or prestige pedigree',
      workproof: 'Judged on observable proof of capability — anyone who solves the bug gets proof',
    },
    {
      factor: 'Credential Integrity',
      traditional: 'Easy to fake with ChatGPT or exaggerated LinkedIn profiles',
      workproof: 'Tamper-proof SHA-256 cryptographic signatures linked to execution logs',
    },
  ];

  return (
    <Card className="border-zinc-200 overflow-hidden shadow-xs">
      <CardHeader
        className="flex flex-row items-center justify-between p-4 sm:p-5 bg-zinc-50/70 border-b border-zinc-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-zinc-900">
                Why WorkProof AI?
              </CardTitle>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                Evidence &gt; Score
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Traditional Tech Hiring vs. Evidence-First Verification for Youth Employment
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50 transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Side-by-side cards for quick visual scan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Traditional Hiring Column */}
            <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-red-200/60">
                <FileQuestion className="w-4 h-4 text-red-600" />
                <h4 className="text-xs font-bold text-red-950 uppercase tracking-wide">
                  Traditional Hiring (Broken for First-Time Coders)
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-red-900">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Resumes:</strong> Paper claims that anyone can embellish or generate with AI.</span>
                </div>
                <div className="flex items-start gap-2 text-red-900">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>ATS Filters:</strong> Early-career youth rejected for missing 2+ years of prior experience.</span>
                </div>
                <div className="flex items-start gap-2 text-red-900">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>LeetCode Interviews:</strong> Memorizing artificial puzzles instead of shipping working code.</span>
                </div>
                <div className="flex items-start gap-2 text-red-900">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Black-box Scores:</strong> Unexplained AI ratings that create anxiety without guidance.</span>
                </div>
              </div>
            </div>

            {/* WorkProof AI Column */}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  WorkProof AI (Evidence-First Pathway)
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Work Simulator:</strong> Real codebase, authentic bug fix, and live unit test runner.</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Deterministic Proof:</strong> 100% test assertions must pass; zero guesswork.</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Proof Passport:</strong> Immutable SHA-256 receipt recruiters can inspect with 1 click.</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Inclusive Hiring:</strong> Direct matching to apprenticeships based on verified capability.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed comparison table */}
          <div className="overflow-x-auto border border-zinc-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="p-3 w-1/4">Evaluation Aspect</th>
                  <th className="p-3 w-3/8 text-red-800">Old Way (Resume-First)</th>
                  <th className="p-3 w-3/8 text-emerald-800">WorkProof AI (Evidence-First)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="p-3 font-semibold text-zinc-900">{row.factor}</td>
                    <td className="p-3 text-zinc-600">{row.traditional}</td>
                    <td className="p-3 text-emerald-950 font-medium bg-emerald-50/20">
                      {row.workproof}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom callout */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3 text-xs text-blue-950">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>The Core Principle:</strong> We never generate arbitrary hireability scores. We produce observable proof of work.
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-blue-700 shrink-0 uppercase tracking-wider">
              Evidence &gt; Score
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
