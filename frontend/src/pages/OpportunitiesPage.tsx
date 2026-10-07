import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Send,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageExplainerCard } from '../components/guidance/PageExplainerCard';
import { authFetch } from '../utils/auth';
import type { StudentOpportunityMatch } from '../types/opportunity';

interface OpportunitiesPageProps {
  onNavigateToMission?: (slug: string) => void;
  onNavigateToPassport?: () => void;
  onPreviewPublicPassport?: (slug: string) => void;
  onOpenTour?: () => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  onNavigateToMission,
  onNavigateToPassport,
  onOpenTour,
}) => {
  const [opportunities, setOpportunities] = useState<StudentOpportunityMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (roleFilter !== 'all') params.append('targetRole', roleFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await authFetch(`/api/student/opportunities?${params.toString()}`);

      if (!res.ok) {
        throw new Error(`Failed to load opportunities (${res.status})`);
      }

      const body = await res.json();
      if (body.success && Array.isArray(body.data)) {
        setOpportunities(body.data);
      } else {
        throw new Error(body.error?.message || 'Invalid response');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [typeFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleApply = async (oppId: string) => {
    setApplyingId(oppId);
    setSuccessMessage(null);

    try {
      const res = await authFetch(`/api/student/opportunities/${oppId}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          notes: 'Applying with verified WorkProof AI Proof Passport.',
        }),
      });

      const body = await res.json();
      if (res.ok && body.success) {
        setSuccessMessage('Application submitted successfully with your verified Proof Passport!');
        // Update local state
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === oppId
              ? {
                  ...o,
                  applicantsCount: o.applicantsCount + 1,
                  candidateMatch: {
                    ...o.candidateMatch,
                    hasApplied: true,
                    applicationStatus: 'submitted',
                  },
                }
              : o
          )
        );
        setTimeout(() => {
          setSuccessMessage(null);
        }, 4000);
      } else {
        throw new Error(body.error?.message || 'Failed to submit application');
      }
    } catch (err: any) {
      alert(err.message || 'Application failed');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans pb-24">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Tech Employment for Youth
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Verified Apprenticeships & Entry-Level Roles
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Job Discovery & Apprenticeship Pathways
          </h1>
          <p className="text-xs text-zinc-600 max-w-2xl">
            Discover paid apprenticeships, early-career internships, and junior developer roles where
            you are evaluated by <strong>Demonstrated Code Execution Evidence</strong>, not resume buzzwords.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {onNavigateToPassport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToPassport}
              className="text-xs bg-white"
            >
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
              <span>Passport Settings</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOpportunities}
            disabled={loading}
            className="text-xs bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Explainer Guide Card for Hackathon Judges & First-Time Users */}
      <PageExplainerCard pageId="opportunities" onOpenWalkthrough={onOpenTour} />

      {/* Global Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-3 text-xs shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{successMessage}</p>
            <p className="text-[11px] text-emerald-700">
              The hiring partner can now inspect your verified test execution runs and cryptographic SHA-256 receipts.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="p-4 bg-white border-zinc-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Opportunity Type Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Pathways' },
              { id: 'apprenticeship', label: 'Apprenticeships (Mentored)', icon: GraduationCap },
              { id: 'internship', label: 'Internships', icon: Briefcase },
              { id: 'junior_developer', label: 'Junior Roles', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = typeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, skills, company..."
                className="pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" className="text-xs">
              Filter
            </Button>
          </form>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-48 bg-zinc-200 rounded-xl" />
          <div className="h-48 bg-zinc-200 rounded-xl" />
          <div className="h-48 bg-zinc-200 rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchOpportunities} className="bg-white text-xs">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Opportunities List */}
      {!loading && !error && opportunities.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-3">
          <Briefcase className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900">No matching opportunities found</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Try resetting your filters or search keywords to discover all active youth apprenticeships.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTypeFilter('all');
              setRoleFilter('all');
              setSearchTerm('');
            }}
            className="text-xs bg-white"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {!loading && !error && opportunities.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {opportunities.map((opp) => {
            const isMatch100 = opp.candidateMatch.matchPercentage === 100;
            const hasApplied = opp.candidateMatch.hasApplied;

            return (
              <Card
                key={opp.id}
                className={`p-6 border transition-all duration-200 ${
                  isMatch100
                    ? 'border-emerald-300 bg-linear-to-r from-emerald-50/20 via-white to-white shadow-xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-2xs'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Opportunity Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-zinc-100">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize bg-blue-50 text-blue-800 border border-blue-200">
                          {opp.type.replace('_', ' ')}
                        </span>
                        {opp.mentorshipProvided && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>1-on-1 Mentorship</span>
                          </span>
                        )}
                        {opp.targetRole && (
                          <span className="text-[11px] font-mono text-zinc-500">
                            Role: {opp.targetRole.replace('-', ' ')}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-zinc-900 tracking-tight">{opp.title}</h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1 font-medium text-zinc-700">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{opp.companyName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{opp.location} ({opp.workPreference})</span>
                        </span>
                        {opp.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{opp.duration}</span>
                          </span>
                        )}
                        {opp.stipendOrSalary && (
                          <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{opp.stipendOrSalary}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Candidate Proof Match Pill */}
                    <div className="shrink-0 flex flex-col items-start sm:items-end gap-1">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          isMatch100
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : opp.candidateMatch.matchPercentage > 0
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>
                          {opp.candidateMatch.demonstratedMatches.length}/{opp.requiredCapabilities.length} Capabilities Proven ({opp.candidateMatch.matchPercentage}%)
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {opp.applicantsCount} youth applied
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-600 leading-relaxed">{opp.description}</p>

                  {/* Required Capabilities Breakdown */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
                      Required Demonstrated Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {opp.requiredCapabilities.map((cap) => {
                        const isDemonstrated = opp.candidateMatch.demonstratedMatches.includes(cap);
                        return (
                          <div
                            key={cap}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              isDemonstrated
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {isDemonstrated ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{cap}</span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                                  Verified
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{cap}</span>
                                <span className="text-[10px] font-medium text-amber-700">
                                  (Proof Needed)
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                    <div className="text-xs text-zinc-500">
                      {hasApplied ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Applied with Proof Passport (Status: Submitted)</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600">
                          {isMatch100
                            ? 'All required capabilities verified. Direct 1-click apply is ready.'
                            : 'Solve realistic work simulator missions to complete missing capability proofs.'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {opp.candidateMatch.missingCapabilities.length > 0 && onNavigateToMission && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigateToMission('backend-order-total-bug')}
                          className="text-xs bg-white text-zinc-800 hover:bg-zinc-100"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          <span>Prove Missing Skills</span>
                        </Button>
                      )}

                      {!hasApplied && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={applyingId === opp.id}
                          onClick={() => handleApply(opp.id)}
                          className={`text-xs ${
                            isMatch100 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          <span>{applyingId === opp.id ? 'Submitting...' : '1-Click Apply with Passport'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
