import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Terminal,
  FolderGit2,
  FileText,
  User,
  AlertCircle,
  ExternalLink,
  Clock,
  Info,
  RefreshCw,
} from 'lucide-react';
import { PassportHeader } from '../components/passport/PassportHeader';
import { PassportEvidenceBadge } from '../components/passport/PassportEvidenceBadge';
import { VerifiedMissionCard } from '../components/passport/VerifiedMissionCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { PublicPassportData } from '../types/passport';

interface PublicPassportPageProps {
  slug?: string;
  onNavigateHome?: () => void;
}

export const PublicPassportPage: React.FC<PublicPassportPageProps> = ({
  slug = 'alex-chen-wk7a',
  onNavigateHome,
}) => {
  const [passportData, setPassportData] = useState<PublicPassportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicPassport = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/passport/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Proof Passport "${slug}" was not found or has been made private by the candidate.`);
        }
        throw new Error(`Failed to load Proof Passport (${res.status})`);
      }

      const body = await res.json();
      if (body.success && body.data) {
        setPassportData(body.data);
      } else {
        throw new Error(body.error?.message || 'Invalid passport response');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading public passport');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchPublicPassport();
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-24">
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-xs border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={onNavigateHome}
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-zinc-900 text-sm tracking-tight">WorkProof AI</span>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 uppercase">
              Public Passport
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateHome}
                className="text-xs text-zinc-600"
              >
                Sign In / Join WorkProof
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pt-6">
        {/* Loading State */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-zinc-200 rounded-2xl" />
            <div className="h-64 bg-zinc-200 rounded-2xl" />
            <div className="h-40 bg-zinc-200 rounded-2xl" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-2xl text-center space-y-3 max-w-lg mx-auto my-12">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <h3 className="text-sm font-bold text-red-950">Passport Unavailable</h3>
            <p className="text-xs text-red-800 leading-relaxed">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPublicPassport}
              className="bg-white text-xs border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Loaded Passport Content */}
        {passportData && !loading && (
          <div className="space-y-8">
            {/* Header Showcase */}
            <PassportHeader
              displayName={passportData.candidate.displayName}
              targetRole={passportData.candidate.targetRole}
              bio={passportData.candidate.bio}
              publicSlug={passportData.passportMetadata.publicSlug}
              verifiedCount={passportData.evidenceHierarchy.demonstratedCapabilities.count}
            />

            {/* SECTION 1: Demonstrated Capabilities (Tier 4) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-900">
                      Demonstrated Capabilities
                    </h2>
                    <p className="text-[11px] text-zinc-500">
                      Independently verified through sandbox automated test suites
                    </p>
                  </div>
                </div>

                <PassportEvidenceBadge classification="Demonstrated" size="sm" />
              </div>

              {passportData.evidenceHierarchy.demonstratedCapabilities.count > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {passportData.evidenceHierarchy.demonstratedCapabilities.capabilities.map((cap) => (
                    <Card
                      key={cap.capabilityId}
                      className="p-4 border-emerald-200 bg-white shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-zinc-900">{cap.name}</h3>
                        <Badge variant="success" size="sm">
                          Demonstrated
                        </Badge>
                      </div>

                      <p className="text-[11px] text-zinc-600">
                        Demonstrated through <strong>{cap.sourceMissionTitle}</strong>
                      </p>

                      <div className="pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
                        <span>Rubric: {cap.rubricVersion}</span>
                        <span>{new Date(cap.verifiedAt).toLocaleDateString()}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic p-4 bg-white rounded-lg border border-zinc-200">
                  No demonstrated capabilities published yet.
                </p>
              )}
            </section>

            {/* SECTION 2: Verified Work Simulator Missions */}
            {passportData.verifiedMissions.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-blue-100 text-blue-700">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900">
                        Verified Work Simulator Proof
                      </h2>
                      <p className="text-[11px] text-zinc-500">
                        Deterministic code execution receipts generated in isolated test runners
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {passportData.verifiedMissions.map((mission) => (
                    <VerifiedMissionCard
                      key={mission.runId}
                      mission={mission}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 3: Supporting Evidence (GitHub) */}
            {passportData.evidenceHierarchy.supportingGitHub && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-purple-100 text-purple-700">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900">
                        Supporting Evidence (GitHub)
                      </h2>
                      <p className="text-[11px] text-zinc-500">
                        Public repository analysis for contextual architecture and languages
                      </p>
                    </div>
                  </div>

                  <PassportEvidenceBadge classification="Supporting Evidence" size="sm" />
                </div>

                <Card className="p-5 bg-white border-purple-200 shadow-xs space-y-3">
                  <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg flex items-start gap-2 text-[11px] text-purple-900 leading-relaxed">
                    <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{passportData.evidenceHierarchy.supportingGitHub.disclaimer}</span>
                  </div>

                  {passportData.evidenceHierarchy.supportingGitHub.connected && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-semibold text-zinc-800">
                        Public GitHub: @{passportData.evidenceHierarchy.supportingGitHub.username}
                      </span>
                      {passportData.evidenceHierarchy.supportingGitHub.profileUrl && (
                        <a
                          href={passportData.evidenceHierarchy.supportingGitHub.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-semibold"
                        >
                          <span>View Repositories</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              </section>
            )}

            {/* SECTION 4: Declared Skills */}
            {passportData.evidenceHierarchy.declaredSkills && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-zinc-100 text-zinc-700">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900">Declared Skills</h2>
                      <p className="text-[11px] text-zinc-500">Self-reported technical capabilities</p>
                    </div>
                  </div>

                  <PassportEvidenceBadge classification="Declared" size="sm" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {passportData.evidenceHierarchy.declaredSkills.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-zinc-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-zinc-900">{skill.name}</p>
                        <p className="text-[10px] text-zinc-500 capitalize">{skill.category}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded capitalize">
                        {skill.selfAssessedLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 5: AI-Assisted Resume Information */}
            {passportData.evidenceHierarchy.aiAssistedResume && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-amber-100 text-amber-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900">
                        AI-Assisted Resume Extraction
                      </h2>
                      <p className="text-[11px] text-zinc-500">
                        Assistive mentions parsed from uploaded resume
                      </p>
                    </div>
                  </div>

                  <PassportEvidenceBadge classification="AI-Assisted / Unverified" size="sm" />
                </div>

                <Card className="p-5 bg-white border-amber-200 shadow-xs space-y-3">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{passportData.evidenceHierarchy.aiAssistedResume.disclaimer}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {passportData.evidenceHierarchy.aiAssistedResume.extractedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </Card>
              </section>
            )}

            {/* SECTION 6: Evidence Timeline */}
            {passportData.evidenceTimeline && passportData.evidenceTimeline.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-blue-100 text-blue-700">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900">Evidence History</h2>
                      <p className="text-[11px] text-zinc-500">
                        Chronological stream of technical milestones and verifications
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {passportData.evidenceTimeline.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white rounded-lg border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900">{item.title}</span>
                          <Badge variant="outline" size="sm">
                            {item.evidenceClassification}
                          </Badge>
                        </div>
                        <p className="text-xs text-zinc-600">{item.description}</p>
                      </div>

                      <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
