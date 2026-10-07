import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CandidateEvidenceDossier } from '../components/recruiter/CandidateEvidenceDossier';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { CandidateEvidenceSummary } from '../types/recruiter';
import { authFetch } from '../utils/auth';

interface CandidateEvidencePageProps {
  studentId: string;
  onBack: () => void;
  onViewPublicPassport?: (slug: string) => void;
}

export const CandidateEvidencePage: React.FC<CandidateEvidencePageProps> = ({
  studentId,
  onBack,
  onViewPublicPassport,
}) => {
  const [summary, setSummary] = useState<CandidateEvidenceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch(`/api/recruiter/candidates/${studentId}`);

      if (!res.ok) {
        if (res.status === 401) throw new Error('Authentication required.');
        if (res.status === 403) throw new Error('Access forbidden. Recruiter privileges required.');
        if (res.status === 404) throw new Error('Candidate evidence dossier not found.');
        throw new Error(`Failed to load candidate evidence (${res.status})`);
      }

      const body = await res.json();
      if (body.success && body.data) {
        setSummary(body.data);
      } else {
        throw new Error(body.error?.message || 'Invalid dossier response');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching candidate evidence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchCandidateSummary();
    }
  }, [studentId]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-zinc-600 hover:text-zinc-900 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Candidate Directory</span>
          </Button>

          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
              Candidate Proof of Work Dossier
            </h1>
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Verifiable Proof</span>
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCandidateSummary}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-44 bg-zinc-200 rounded-xl" />
          <div className="h-64 bg-zinc-200 rounded-xl" />
          <div className="h-40 bg-zinc-200 rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-xl flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCandidateSummary}
              className="bg-white text-xs border-red-300 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loaded Candidate Evidence Dossier */}
      {summary && !loading && (
        <CandidateEvidenceDossier
          summary={summary}
          onBack={onBack}
          onViewPublicPassport={onViewPublicPassport}
        />
      )}
    </div>
  );
};
