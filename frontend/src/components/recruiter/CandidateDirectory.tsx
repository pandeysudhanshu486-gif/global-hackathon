import React from 'react';
import {
  ShieldCheck,
  Terminal,
  FolderGit2,
  FileText,
  User,
  GraduationCap,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EvidenceLevelIndicator } from '../ui/EvidenceLevelIndicator';
import type { CandidateListItem } from '../../types/recruiter';

interface CandidateDirectoryProps {
  candidates: CandidateListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  onViewCandidate: (candidateId: string) => void;
  onResetFilters?: () => void;
  isLoading?: boolean;
}

export const CandidateDirectory: React.FC<CandidateDirectoryProps> = ({
  candidates,
  pagination,
  onPageChange,
  onViewCandidate,
  onResetFilters,
  isLoading = false,
}) => {
  if (candidates.length === 0 && !isLoading) {
    return (
      <Card className="p-12 text-center border-dashed border-zinc-300 bg-white">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900">No Candidates Found</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              No candidates match your current evidence filter criteria. Try expanding your search or resetting filters.
            </p>
          </div>
          {onResetFilters && (
            <Button variant="outline" size="sm" onClick={onResetFilters} className="text-xs">
              Reset Filters
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const getEvidenceLevelNumber = (level: string): 0 | 1 | 2 | 3 => {
    switch (level) {
      case 'demonstrated':
        return 3;
      case 'supporting':
        return 2;
      case 'ai_assisted':
        return 1;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      {/* Directory Grid of Candidate Cards */}
      <div className="grid grid-cols-1 gap-4">
        {candidates.map((candidate) => {
          const educationPreview = candidate.education?.[0];
          const hasDemonstrated = candidate.demonstratedCapabilitiesCount > 0;

          return (
            <Card
              key={candidate.id}
              className="p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white border-zinc-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left: Candidate Profile Meta */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {candidate.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-zinc-900">{candidate.name}</h3>
                        <EvidenceLevelIndicator
                          level={getEvidenceLevelNumber(candidate.highestEvidenceLevel)}
                          size="sm"
                          showText={false}
                        />
                      </div>
                      <p className="text-xs text-zinc-500 font-medium capitalize">
                        {candidate.targetRole?.replace('-', ' ') || 'Software Engineer'}
                      </p>
                    </div>

                    {hasDemonstrated && (
                      <Badge variant="success" size="sm" className="ml-auto lg:ml-2">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        <span>Verified Proof</span>
                      </Badge>
                    )}
                  </div>

                  {/* Bio & Education Context */}
                  {candidate.bio && (
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {candidate.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 pt-0.5">
                    {candidate.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{candidate.location} ({candidate.workPreference})</span>
                      </span>
                    )}
                    {educationPreview && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{educationPreview.institution} · {educationPreview.degree}</span>
                      </span>
                    )}
                  </div>

                  {/* Factual Evidence Tiers Summary */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {/* Tier 4: Demonstrated */}
                    {candidate.demonstratedCapabilitiesCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-50 border border-green-200 text-green-800 text-[11px] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                        <span>{candidate.demonstratedCapabilitiesCount} Demonstrated</span>
                      </span>
                    )}

                    {/* Work Simulator Missions */}
                    {candidate.completedMissionsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
                        <Terminal className="w-3.5 h-3.5 text-blue-600" />
                        <span>{candidate.completedMissionsCount} Mission Passed</span>
                      </span>
                    )}

                    {/* Tier 3: Supporting GitHub */}
                    {candidate.hasGitHub && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-semibold">
                        <FolderGit2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>GitHub Supporting Context</span>
                      </span>
                    )}

                    {/* Tier 2: AI-Assisted Resume */}
                    {candidate.hasResume && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Resume Parsed (Unverified)</span>
                      </span>
                    )}

                    {/* Tier 1: Declared Skills */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-medium">
                      <span>{candidate.declaredSkills.length} Declared Skills</span>
                    </span>
                  </div>

                  {/* Demonstrated Capabilities Pill Tags */}
                  {candidate.demonstratedCapabilities.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
                        Proven:
                      </span>
                      {candidate.demonstratedCapabilities.slice(0, 4).map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold"
                        >
                          ✓ {cap}
                        </span>
                      ))}
                      {candidate.demonstratedCapabilities.length > 4 && (
                        <span className="text-[10px] text-zinc-500">
                          +{candidate.demonstratedCapabilities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Action CTA */}
                <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onViewCandidate(candidate.id)}
                    className="w-full sm:w-auto text-xs font-semibold px-4 flex items-center justify-center gap-1.5"
                  >
                    <span>View Evidence Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Factual Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-4 py-3 text-xs">
          <span className="text-zinc-500 font-medium">
            Showing <strong className="text-zinc-800">{candidates.length}</strong> of{' '}
            <strong className="text-zinc-800">{pagination.total}</strong> verified candidates
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => onPageChange(pagination.page - 1)}
              className="text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              <span>Previous</span>
            </Button>

            <span className="text-zinc-700 font-semibold px-2">
              {pagination.page} / {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="text-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
