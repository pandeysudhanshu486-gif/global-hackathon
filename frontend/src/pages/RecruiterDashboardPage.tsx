import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { CandidateFilters } from '../components/recruiter/CandidateFilters';
import { CandidateDirectory } from '../components/recruiter/CandidateDirectory';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type {
  CandidateListItem,
  CandidateSearchFilterParams,
  RecruiterProfile,
} from '../types/recruiter';
import { authFetch } from '../utils/auth';

interface RecruiterDashboardPageProps {
  onViewCandidate: (candidateId: string) => void;
  onNavigateToProfile?: () => void;
}

export const RecruiterDashboardPage: React.FC<RecruiterDashboardPageProps> = ({
  onViewCandidate,
  onNavigateToProfile,
}) => {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [filters, setFilters] = useState<CandidateSearchFilterParams>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Recruiter Profile
  const fetchProfile = async () => {
    try {
      const res = await authFetch('/api/recruiter/profile');
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          setProfile(body.data);
        }
      }
    } catch {
      // Non-blocking profile load
    }
  };

  // 2. Fetch Candidates with Active Filters
  const fetchCandidates = async (currentFilters: CandidateSearchFilterParams) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (currentFilters.targetRole) queryParams.set('targetRole', currentFilters.targetRole);
      if (currentFilters.capability) queryParams.set('capability', currentFilters.capability);
      if (currentFilters.evidenceLevel) queryParams.set('evidenceLevel', currentFilters.evidenceLevel);
      if (currentFilters.missionSlug) queryParams.set('missionSlug', currentFilters.missionSlug);
      if (currentFilters.search) queryParams.set('search', currentFilters.search);
      if (currentFilters.page) queryParams.set('page', String(currentFilters.page));
      if (currentFilters.limit) queryParams.set('limit', String(currentFilters.limit));

      const res = await authFetch(`/api/recruiter/candidates?${queryParams.toString()}`);

      if (!res.ok) {
        if (res.status === 401) throw new Error('Authentication session expired. Please sign in again.');
        if (res.status === 403) throw new Error('Access denied. Recruiter privileges required.');
        throw new Error(`Failed to load candidates (${res.status})`);
      }

      const body = await res.json();
      if (body.success && body.data) {
        setCandidates(body.data.candidates || []);
        if (body.data.pagination) {
          setPagination(body.data.pagination);
        }
      } else {
        throw new Error(body.error?.message || 'Invalid server response');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching candidate directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchCandidates(filters);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<CandidateSearchFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      {/* Recruiter Header Banner */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Recruiter Evidence Portal
            </span>
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Evidence &gt; Score</span>
            </Badge>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            Verified Engineering Candidate Directory
          </h1>

          <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
            Inspect factual evidence records, sandbox test suite pass rates, and SHA-256 cryptographic proof of work without arbitrary AI ranking scores.
          </p>
        </div>

        {/* Recruiter Organization Pill */}
        {profile && (
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg p-3 shrink-0 self-start md:self-auto">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 leading-tight">{profile.companyName}</p>
              <p className="text-[11px] text-zinc-500">{profile.recruiterName}</p>
            </div>
            {onNavigateToProfile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToProfile}
                className="text-[11px] text-blue-600 hover:text-blue-800 ml-1"
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filter Controls Bar */}
      <CandidateFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        isLoading={loading}
      />

      {/* Error View */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCandidates(filters)}
              className="bg-white text-xs border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Retry</span>
            </Button>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-32 bg-zinc-200 rounded-xl" />
          <div className="h-32 bg-zinc-200 rounded-xl" />
          <div className="h-32 bg-zinc-200 rounded-xl" />
        </div>
      )}

      {/* Candidates List Display */}
      {!loading && !error && (
        <CandidateDirectory
          candidates={candidates}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewCandidate={onViewCandidate}
          onResetFilters={handleResetFilters}
          isLoading={loading}
        />
      )}
    </div>
  );
};
