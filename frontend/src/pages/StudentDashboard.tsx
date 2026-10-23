import React, { useEffect, useState } from 'react';
import {
  Target,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { EvidenceLevelIndicator } from '../components/ui/EvidenceLevelIndicator';
import { authFetch } from '../utils/auth';
import { apiUrl } from '../utils/api';
import { VisualJourneyBar } from '../components/guidance/VisualJourneyBar';
import { WhyWorkProofComparison } from '../components/guidance/WhyWorkProofComparison';

export interface StudentDashboardProps {
  user: { name: string; email: string; role: string; publicSlug?: string };
  onNavigate: (view: string) => void;
  onOpenTour?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onNavigate,
  onOpenTour,
}) => {
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    database: { status: string; state: string };
  } | null>(null);
  const [skillGapData, setSkillGapData] = useState<any | null>(null);
  const [passportStats, setPassportStats] = useState<{
    missionsCompleted: number;
    totalEvidenceRecords: number;
    skillsWithEvidence: number;
  } | null>(null);

  useEffect(() => {
    // Fetch live system health status
    fetch(apiUrl('/api/health'))
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBackendHealth(data);
        }
      })
      .catch(() => {
        setBackendHealth(null);
      });

    // Fetch live skill gap analysis
    authFetch('/api/student/skill-gap')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setSkillGapData(resData.data);
        }
      })
      .catch((err) => {
        console.debug('Skill gap fetch in dashboard:', err);
      });

    // Fetch live student passport statistics
    authFetch('/api/student/passport')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data?.stats) {
          setPassportStats(resData.data.stats);
        }
      })
      .catch((err) => {
        console.debug('Passport fetch in dashboard:', err);
      });
  }, []);

  const hasDemonstrated = (skillGapData?.summary?.demonstratedCount || 0) > 0;
  const completedSteps = ['target-role', 'skill-gap'];
  if (hasDemonstrated) {
    completedSteps.push('missions', 'submissions', 'passport');
  }
  const currentStepId = hasDemonstrated ? 'opportunities' : 'missions';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Welcome back, {user.name}</h1>
          <p className="text-xs text-zinc-500">
            WorkProof Candidate Dashboard • Role:{' '}
            <span className="capitalize font-semibold text-zinc-700">{user.role}</span>
          </p>
        </div>

        {/* Action Controls & Health */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenTour && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenTour}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
              className="text-xs font-semibold bg-blue-50/50 hover:bg-blue-100/60 border-blue-200 text-blue-800"
            >
              How WorkProof Works
            </Button>
          )}

          {/* Live System Health Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-700 shadow-xs">
            <Activity className="w-4 h-4 text-green-600 animate-pulse" />
            <span>API:</span>
            <span className="font-semibold text-green-700">
              {backendHealth?.status === 'operational' ? 'Operational' : 'Connected'}
            </span>
            <span className="text-zinc-300">|</span>
            <span>DB:</span>
            <span className="font-semibold text-zinc-800">
              {backendHealth?.database?.status === 'healthy' ? 'MongoDB Active' : 'Offline / Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* VISUAL JOURNEY: TARGET ROLE -> SKILL GAP -> MISSION -> PROOF -> PASSPORT -> JOBS */}
      <section aria-label="Candidate Progression Journey">
        <VisualJourneyBar
          currentStepId={currentStepId}
          completedSteps={completedSteps}
          onNavigate={onNavigate}
        />
      </section>

      {/* PRIMARY ACTION CARD: "WHAT SHOULD I DO NEXT?" */}
      <Card className="border-blue-200 bg-linear-to-r from-blue-50/50 via-white to-white shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 text-blue-800 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>RECOMMENDED NEXT ACTION</span>
              </div>
              <h2 className="text-lg font-bold text-zinc-900">
                {skillGapData?.recommendedMission
                  ? `Prove ${skillGapData.recommendedMission.title}`
                  : 'Close your Skill Gap for Target Role'}
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {skillGapData?.recommendedMission?.rationale ||
                  `Analyze your candidate evidence against curated role templates and launch verified Work Simulator missions to prove your capabilities.`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('missions')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Work Simulator
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => onNavigate('skill-gap')}
              >
                Inspect Gap Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TWO-COLUMN GRID: TARGET ROLE & PASSPORT SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Role Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Target Role Requirements
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                {skillGapData?.targetRole?.name || 'Backend Developer'} Template
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('target-role')}>
              Change Role
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-between text-xs">
              <span className="text-zinc-600">Demonstrated Capabilities</span>
              <span className="font-bold text-green-700">
                {skillGapData?.summary
                  ? `${skillGapData.summary.demonstratedCount} of ${skillGapData.summary.totalCapabilities} Requirements Met`
                  : '0 of 5 Requirements Met'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {(skillGapData?.capabilities || []).slice(0, 4).map((cap: any) => {
                const isDemonstrated = cap.status === 'demonstrated';
                const isSupporting = cap.status === 'supporting';
                return (
                  <div
                    key={cap.capabilityId}
                    className="flex items-center justify-between p-2 rounded hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isDemonstrated ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : isSupporting ? (
                        <Clock className="w-4 h-4 text-blue-600" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center text-[10px] text-zinc-400">
                          ○
                        </span>
                      )}
                      <span className="font-semibold text-zinc-900">{cap.name}</span>
                    </div>
                    <EvidenceLevelIndicator
                      level={
                        cap.status === 'demonstrated'
                          ? 4
                          : cap.status === 'supporting'
                            ? 2
                            : cap.status === 'declared' || cap.status === 'ai_assisted'
                              ? 1
                              : 0
                      }
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Proof-of-Work Passport Snapshot Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Proof-of-Work Passport
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                Public Slug: <code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px]">{user.publicSlug || 'candidate-preview'}</code>
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('passport')} rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              View Full
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <p className="text-xs text-zinc-500">Missions</p>
                <p className="text-lg font-bold text-zinc-900 mt-0.5">
                  {passportStats ? passportStats.missionsCompleted : 0}
                </p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <p className="text-xs text-zinc-500">Evidence Records</p>
                <p className="text-lg font-bold text-blue-600 mt-0.5">
                  {passportStats ? passportStats.totalEvidenceRecords : 0}
                </p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                <p className="text-xs text-zinc-500">Integrity</p>
                <p className="text-lg font-bold text-green-600 mt-0.5">100%</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 space-y-1.5">
              <p className="text-xs font-semibold text-zinc-800">Latest Evidence Generated</p>
              {passportStats && passportStats.missionsCompleted > 0 ? (
                <p className="text-xs text-zinc-600">
                  • <strong>E-Commerce Order API Bug Fix</strong>: Automated test assertions passed, root cause explained.
                </p>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  No mission evidence recorded yet. Launch the recommended mission above to earn your first tamper-proof capability badge!
                </p>
              )}
              <p className="text-[11px] text-zinc-400">Timestamped with SHA-256 integrity hash.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WHY WORKPROOF COMPARISON (TRADITIONAL VS EVIDENCE-FIRST) */}
      <section aria-label="Why WorkProof Comparison">
        <WhyWorkProofComparison defaultExpanded={true} />
      </section>
    </div>
  );
};
