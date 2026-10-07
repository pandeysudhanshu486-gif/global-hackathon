import React, { useState } from 'react';
import {
  ShieldCheck,
  Terminal,
  FolderGit2,
  FileText,
  User,
  GraduationCap,
  MapPin,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Clock,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EvidenceLevelIndicator } from '../ui/EvidenceLevelIndicator';
import { EvidenceTimeline } from './EvidenceTimeline';
import type { CandidateEvidenceSummary } from '../../types/recruiter';

interface CandidateEvidenceDossierProps {
  summary: CandidateEvidenceSummary;
  onBack?: () => void;
  onViewPublicPassport?: (slug: string) => void;
}

export const CandidateEvidenceDossier: React.FC<CandidateEvidenceDossierProps> = ({
  summary,
  onViewPublicPassport,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'timeline' | 'profile'>('evidence');

  const { candidate, evidenceHierarchy, completedMissions, evidenceTimeline } =
    summary;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Candidate Hero Header */}
      <Card className="p-6 bg-linear-to-r from-blue-50/60 via-white to-white border-zinc-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {candidate.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{candidate.name}</h1>
                  {evidenceHierarchy.demonstratedCapabilities.count > 0 ? (
                    <Badge variant="success" size="sm">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      <span>Demonstrated Proof</span>
                    </Badge>
                  ) : (
                    <Badge variant="default" size="sm">
                      Candidate Dossier
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                  <p className="text-xs font-semibold text-blue-700 capitalize">
                    Target Role: {candidate.targetRole?.replace('-', ' ') || 'Software Engineer'}
                  </p>
                  {candidate.publicSlug && (
                    <button
                      type="button"
                      onClick={() =>
                        onViewPublicPassport
                          ? onViewPublicPassport(candidate.publicSlug!)
                          : window.open(`/passport/${candidate.publicSlug}`, '_blank')
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Public Passport ({candidate.publicSlug})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {candidate.bio && (
              <p className="text-xs text-zinc-600 max-w-3xl leading-relaxed">
                {candidate.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-500 pt-1">
              {candidate.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{candidate.location} ({candidate.workPreference})</span>
                </span>
              )}

              {candidate.education?.[0] && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {candidate.education[0].institution} · {candidate.education[0].degree}
                    {candidate.education[0].graduationYear ? ` (${candidate.education[0].graduationYear})` : ''}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Factual Evidence Count Summary Tile */}
          <div className="bg-white rounded-lg border border-zinc-200 p-4 shrink-0 space-y-2 min-w-[240px] shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              Evidence Breakdown
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-green-800 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>Demonstrated:</span>
                </span>
                <strong className="text-zinc-900">{evidenceHierarchy.demonstratedCapabilities.count}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-800 font-medium">
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Missions Passed:</span>
                </span>
                <strong className="text-zinc-900">{completedMissions.length}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-purple-800 font-medium">
                  <FolderGit2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Supporting GitHub:</span>
                </span>
                <strong className="text-zinc-900">{evidenceHierarchy.supportingGitHub.connected ? 'Active' : 'None'}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Declared Skills:</span>
                </span>
                <strong className="text-zinc-900">{evidenceHierarchy.declaredSkills.count}</strong>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation View Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'evidence'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Evidence Tiers & Receipts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Proof Timeline ({evidenceTimeline.length})</span>
        </button>
      </div>

      {/* TAB 1: Evidence Hierarchy & Verifiable Receipts */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* TIER 4: Demonstrated Work & Completed Missions */}
          <Card className="p-6 border-green-300 bg-linear-to-b from-green-50/40 via-white to-white shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-green-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-green-950">
                      Tier 4: Demonstrated Capabilities
                    </h2>
                    <Badge variant="success" size="sm">
                      4/4 Verified
                    </Badge>
                  </div>
                  <p className="text-[11px] text-green-800">
                    Proven through deterministic test suite execution in the isolated Work Simulator sandbox.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-green-900 bg-green-100/70 px-2.5 py-1 rounded">
                {evidenceHierarchy.demonstratedCapabilities.count} Proven
              </span>
            </div>

            {/* Demonstrated Capabilities Pill Badges */}
            {evidenceHierarchy.demonstratedCapabilities.count > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {evidenceHierarchy.demonstratedCapabilities.capabilities.map((cap) => (
                  <div
                    key={cap.capabilityId}
                    className="p-3 bg-white rounded-lg border border-green-200/90 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">{cap.name}</span>
                      <EvidenceLevelIndicator level={3} size="sm" showText={false} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Source: {cap.sourceMissionSlug}</span>
                      <span>Rubric: {cap.rubricVersion}</span>
                    </div>

                    <div className="p-1.5 bg-zinc-50 rounded border border-zinc-200/80 text-[10px] font-mono text-zinc-700 flex items-center justify-between gap-2 overflow-hidden">
                      <span className="truncate">{cap.integrityHash}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(cap.integrityHash)}
                        className="text-zinc-500 hover:text-zinc-800 cursor-pointer"
                        title="Copy Proof Hash"
                      >
                        {copiedHash === cap.integrityHash ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                Candidate has not yet completed a Work Simulator mission.
              </p>
            )}

            {/* Completed Missions Detailed Receipts */}
            {completedMissions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-green-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-950 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Work Simulator Execution Receipts</span>
                </h3>

                {completedMissions.map((mission) => (
                  <div
                    key={mission.runId}
                    className="bg-white rounded-lg border border-green-200 p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">{mission.missionTitle}</h4>
                        <span className="text-[11px] text-zinc-500 font-mono">Slug: {mission.missionSlug}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">
                          {mission.testsPassed}/{mission.testsTotal} Tests Passed (100%)
                        </Badge>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(mission.evaluatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-zinc-50 p-2.5 rounded border border-zinc-200">
                      <div>
                        <span className="text-zinc-500">Run ID:</span> <span className="text-zinc-800">{mission.runId}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Execution Status:</span> <span className="text-green-700 font-bold">DETERMINISTIC PASS</span>
                      </div>
                      <div className="col-span-full truncate">
                        <span className="text-zinc-500">Code Hash:</span> <span className="text-zinc-700">{mission.codeHash}</span>
                      </div>
                      <div className="col-span-full truncate">
                        <span className="text-zinc-500">Receipt SHA-256:</span> <span className="text-blue-700 font-semibold">{mission.integrityHash}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* TIER 3: Supporting Evidence (GitHub) */}
          <Card className="p-6 border-purple-200 bg-linear-to-b from-purple-50/40 via-white to-white shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-purple-950">
                      Tier 3: Supporting Evidence (GitHub)
                    </h2>
                    <Badge variant="outline" size="sm">
                      Supporting Context
                    </Badge>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    Public repositories analyzed for technology context and architectural patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* Mandatory Recruiter Disclaimer */}
            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-md flex items-start gap-2 text-[11px] text-purple-900 leading-relaxed">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span>
                <strong>Evidence Rule:</strong> {evidenceHierarchy.supportingGitHub.disclaimer}
              </span>
            </div>

            {evidenceHierarchy.supportingGitHub.connected ? (
              <div className="p-4 bg-white rounded-lg border border-purple-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800">
                    GitHub Handle: @{evidenceHierarchy.supportingGitHub.username}
                  </span>
                  {evidenceHierarchy.supportingGitHub.profileUrl && (
                    <a
                      href={evidenceHierarchy.supportingGitHub.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Public Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {evidenceHierarchy.supportingGitHub.lastAnalyzedAt && (
                  <p className="text-[10px] text-zinc-500">
                    Last Analyzed: {new Date(evidenceHierarchy.supportingGitHub.lastAnalyzedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                No GitHub account connected by candidate.
              </p>
            )}
          </Card>

          {/* TIER 2: AI-Assisted Resume Extraction */}
          <Card className="p-6 border-amber-200 bg-linear-to-b from-amber-50/40 via-white to-white shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-amber-950">
                      Tier 2: AI-Assisted Resume Information
                    </h2>
                    <Badge variant="warning" size="sm">
                      Unverified Claim
                    </Badge>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Parsed from candidate uploaded PDF resume. Strictly assistive until proven in simulator.
                  </p>
                </div>
              </div>
            </div>

            {/* Mandatory Recruiter Disclaimer */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md flex items-start gap-2 text-[11px] text-amber-900 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Verification Status:</strong> {evidenceHierarchy.aiAssistedResume.disclaimer}
              </span>
            </div>

            {evidenceHierarchy.aiAssistedResume.available && evidenceHierarchy.aiAssistedResume.data ? (
              <div className="space-y-3 pt-1 text-xs">
                {/* Extracted Skills */}
                {evidenceHierarchy.aiAssistedResume.data.extractedSkills?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                      Extracted Resume Mentions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evidenceHierarchy.aiAssistedResume.data.extractedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                No resume uploaded for AI assistive extraction.
              </p>
            )}
          </Card>

          {/* TIER 1: Declared Skills */}
          <Card className="p-6 border-zinc-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-zinc-900">
                      Tier 1: Declared Skills
                    </h2>
                    <Badge variant="default" size="sm">
                      Self-Reported
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Self-assessed capabilities stated on candidate profile.
                  </p>
                </div>
              </div>
            </div>

            {evidenceHierarchy.declaredSkills.skills.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                {evidenceHierarchy.declaredSkills.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-zinc-900">{skill.name}</p>
                      <p className="text-[10px] text-zinc-500 capitalize">{skill.category}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-200 px-1.5 py-0.5 rounded capitalize">
                      {skill.selfAssessedLevel}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                No self-declared skills listed.
              </p>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: Verifiable Proof Timeline */}
      {activeTab === 'timeline' && (
        <Card className="p-6 border-zinc-200 bg-white shadow-xs space-y-4">
          <div className="pb-2 border-b border-zinc-100">
            <h2 className="text-sm font-bold text-zinc-900">Chronological Evidence Stream</h2>
            <p className="text-xs text-zinc-500">
              Audit trail of candidate skill declarations, AI extractions, and cryptographically verified proof milestones.
            </p>
          </div>

          <EvidenceTimeline timeline={evidenceTimeline} />
        </Card>
      )}
    </div>
  );
};
