import React from 'react';
import {
  ShieldCheck,
  Terminal,
  FileCheck2,
  Briefcase,
  ArrowRight,
  Code2,
  CheckCircle2,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { EvidenceLevelIndicator } from '../components/ui/EvidenceLevelIndicator';
import { WhyWorkProofComparison } from '../components/guidance/WhyWorkProofComparison';

export interface LandingPageProps {
  onGetStarted: () => void;
  onRecruiterLogin: () => void;
  onOpenTour?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onRecruiterLogin,
  onOpenTour,
}) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center border-b border-zinc-100">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tech Employment Track for Youth & First-time Coders</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight max-w-4xl mx-auto leading-tight">
          From Skills to Proof to Opportunity.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Stop relying on self-reported resumes. Complete realistic engineering missions, pass automated test suites, and build an immutable <strong>Proof-of-Work Passport</strong> employers can trust.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={onGetStarted}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start Building Proof
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={onRecruiterLogin}
            leftIcon={<Search className="w-4 h-4" />}
          >
            I'm a Recruiter
          </Button>
          {onOpenTour && (
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenTour}
              leftIcon={<Sparkles className="w-4 h-4 text-blue-600" />}
              className="bg-blue-50/50 hover:bg-blue-100/60 border-blue-200 text-blue-800"
            >
              How It Works (60s Tour)
            </Button>
          )}
        </div>

        {/* Value Prop Banner */}
        <div className="mt-14 max-w-4xl mx-auto p-4 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="flex items-start gap-3 p-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Evidence Over Claims</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Verification requires code diffs, passing tests, and technical explanations.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 border-t md:border-t-0 md:border-l border-zinc-200">
            <Terminal className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Real Engineering Missions</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Fix production bugs, add features, and write regression tests in a simulator.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 border-t md:border-t-0 md:border-l border-zinc-200">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Proof-of-Work Passport</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Share an inspectable capability profile backed by cryptographic hashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Step Loop Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            The Evidence-First Verification Loop
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            How first-time job seekers turn declared skills into proven employment signals.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4 text-left">
          {[
            {
              step: '01',
              title: 'Target Role',
              desc: 'Select your target job or paste a job description to extract required capabilities.',
              icon: Layers,
            },
            {
              step: '02',
              title: 'Skill Gap Map',
              desc: 'Compare required capabilities against your current demonstrated evidence.',
              icon: Code2,
            },
            {
              step: '03',
              title: 'Work Mission',
              desc: 'Solve realistic workplace engineering tasks in the sandboxed Work Simulator.',
              icon: Terminal,
            },
            {
              step: '04',
              title: 'Multi-Signal Eval',
              desc: 'Automated tests (primary ground truth) + structured AI-assisted code review.',
              icon: FileCheck2,
            },
            {
              step: '05',
              title: 'Proof Passport',
              desc: 'Unlock verifiable capabilities and get discovered by hiring teams.',
              icon: Briefcase,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} className="hover:border-blue-300 transition-colors">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600">{item.step}</span>
                    <Icon className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">{item.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Passport Preview Teaser */}
      <section className="py-14 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-zinc-900">
              Proof Over Promises: Inside the Passport
            </h2>
            <p className="mt-2 text-xs text-zinc-600">
              Recruiters see exact test outputs, code diffs, and technical explanations—not just self-reported keywords.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-300 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-2">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Alex Chen — Junior Backend Engineer</h3>
                <p className="text-xs text-zinc-500">Verified Proof-of-Work Passport • Public Profile</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-700">Overall Status:</span>
                <EvidenceLevelIndicator level={3} showText={true} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-900">API Development & Debugging</h4>
                    <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded">
                      Demonstrated (Level 3)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Mission: E-Commerce Order API Bug Fix • 18/18 test assertions passed • Regression suite added
                  </p>
                </div>
                <Button size="sm" variant="secondary">
                  Inspect Evidence
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-900">Testing & Quality Assurance</h4>
                    <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded">
                      Demonstrated (Level 3)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Mission: Auth Module Unit Testing • 12 edge cases covered • 0 lint errors
                  </p>
                </div>
                <Button size="sm" variant="secondary">
                  Inspect Evidence
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why WorkProof Comparison Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <WhyWorkProofComparison defaultExpanded={true} />
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white text-center text-xs text-zinc-500 border-t border-zinc-200">
        <p>© 2026 WorkProof AI. From Skills to Proof to Opportunity.</p>
        <p className="mt-1 text-[11px] text-zinc-400">
          Skills-First Employment & Hiring Signal Architecture for First-Time Coders.
        </p>
      </footer>
    </div>
  );
};
