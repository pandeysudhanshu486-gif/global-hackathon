import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Users,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { authFetch } from '../utils/auth';

interface Applicant {
  studentId: string;
  candidateName: string;
  publicSlug: string;
  demonstratedCapabilitiesCount: number;
  appliedAt: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'declined';
  notes?: string;
}

interface RecruiterOpportunity {
  id: string;
  title: string;
  companyName: string;
  type: 'apprenticeship' | 'internship' | 'entry_level' | 'junior_developer';
  location: string;
  workPreference: 'remote' | 'onsite' | 'hybrid';
  targetRole: string;
  requiredCapabilities: string[];
  description: string;
  mentorshipProvided: boolean;
  stipendOrSalary?: string;
  duration?: string;
  isOpen: boolean;
  applicantsCount: number;
  applications: Applicant[];
  createdAt: string;
}

interface RecruiterOpportunitiesPageProps {
  onViewCandidatePassport?: (slug: string) => void;
  onViewCandidateDossier?: (studentId: string) => void;
}

export const RecruiterOpportunitiesPage: React.FC<RecruiterOpportunitiesPageProps> = ({
  onViewCandidatePassport,
  onViewCandidateDossier,
}) => {
  const [opportunities, setOpportunities] = useState<RecruiterOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    companyName: 'Acme Technologies (Verified Partner)',
    type: 'apprenticeship' as const,
    location: 'Remote (Global)',
    workPreference: 'remote' as const,
    targetRole: 'backend-developer',
    requiredCapabilities: 'API Development, Testing, Debugging',
    description: '',
    mentorshipProvided: true,
    stipendOrSalary: '$35 - $45 / hr',
    duration: '6 Months',
  });

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch('/api/recruiter/opportunities');

      if (!res.ok) {
        throw new Error(`Failed to load company opportunities (${res.status})`);
      }

      const body = await res.json();
      if (body.success && Array.isArray(body.data)) {
        setOpportunities(body.data);
        if (body.data.length > 0 && !selectedOppId) {
          setSelectedOppId(body.data[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const capsArray = formData.requiredCapabilities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await authFetch('/api/recruiter/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          companyName: formData.companyName,
          type: formData.type,
          location: formData.location,
          workPreference: formData.workPreference,
          targetRole: formData.targetRole,
          requiredCapabilities: capsArray,
          description: formData.description,
          mentorshipProvided: formData.mentorshipProvided,
          stipendOrSalary: formData.stipendOrSalary,
          duration: formData.duration,
        }),
      });

      const body = await res.json();
      if (res.ok && body.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          companyName: 'Acme Technologies (Verified Partner)',
          type: 'apprenticeship',
          location: 'Remote (Global)',
          workPreference: 'remote',
          targetRole: 'backend-developer',
          requiredCapabilities: 'API Development, Testing, Debugging',
          description: '',
          mentorshipProvided: true,
          stipendOrSalary: '$35 - $45 / hr',
          duration: '6 Months',
        });
        fetchOpportunities();
      } else {
        throw new Error(body.error?.message || 'Failed to create opportunity');
      }
    } catch (err: any) {
      alert(err.message || 'Creation error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId) || opportunities[0];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans pb-24">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Youth Tech Pathways
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Employer Mentorship & Apprenticeship Programs
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Apprenticeship & Job Program Management
          </h1>
          <p className="text-xs text-zinc-600 max-w-2xl">
            Post mentored apprenticeships and entry-level pathways for first-time coders. Review applicants
            evaluated strictly by their <strong>Verified Proof Passports</strong> and sandbox execution receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Post New Apprenticeship</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchOpportunities}
            disabled={loading}
            className="text-xs bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-zinc-200 rounded-xl" />
          <div className="h-64 bg-zinc-200 rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchOpportunities} className="bg-white text-xs mt-2">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Posted Roles */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Active Programs ({opportunities.length})
            </h2>

            <div className="space-y-2.5">
              {opportunities.map((opp) => {
                const isSelected = selectedOpp?.id === opp.id;
                return (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOppId(opp.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 capitalize">
                          {opp.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{opp.applications?.length || 0} Applicants</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-zinc-900">{opp.title}</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">{opp.companyName}</p>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                        <span>{opp.location}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{opp.stipendOrSalary}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Program Details & Proof Passport Applicants */}
          <div className="lg:col-span-7 space-y-4">
            {selectedOpp ? (
              <Card className="p-6 bg-white border-zinc-200 shadow-xs space-y-6">
                {/* Program Header */}
                <div className="space-y-2 pb-4 border-b border-zinc-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full capitalize">
                      {selectedOpp.type.replace('_', ' ')} Program
                    </span>
                    <Badge variant="success" size="sm">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      <span>Verified Signal</span>
                    </Badge>
                  </div>

                  <h2 className="text-lg font-bold text-zinc-900">{selectedOpp.title}</h2>
                  <p className="text-xs text-zinc-600 leading-relaxed">{selectedOpp.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500 pt-1 font-medium">
                    <span className="flex items-center gap-1 text-zinc-700">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{selectedOpp.companyName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{selectedOpp.location} ({selectedOpp.workPreference})</span>
                    </span>
                    {selectedOpp.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{selectedOpp.duration}</span>
                      </span>
                    )}
                    {selectedOpp.stipendOrSalary && (
                      <span className="flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{selectedOpp.stipendOrSalary}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Required Capabilities */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Required Demonstrated Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOpp.requiredCapabilities.map((cap, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{cap}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Applicants Table / List with Proof Passports */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Youth Candidates Applied ({selectedOpp.applications?.length || 0})</span>
                    </h3>
                  </div>

                  {(!selectedOpp.applications || selectedOpp.applications.length === 0) && (
                    <div className="p-8 text-center bg-zinc-50 rounded-lg border border-zinc-200 space-y-2">
                      <Users className="w-6 h-6 text-zinc-400 mx-auto" />
                      <p className="text-xs font-semibold text-zinc-700">No applications received yet</p>
                      <p className="text-[11px] text-zinc-500">
                        First-time coders who match your required capabilities can 1-click apply with their Proof Passport.
                      </p>
                    </div>
                  )}

                  {selectedOpp.applications && selectedOpp.applications.length > 0 && (
                    <div className="space-y-2.5">
                      {selectedOpp.applications.map((app, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/60 hover:bg-white hover:border-blue-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900">{app.candidateName}</span>
                              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                                {app.demonstratedCapabilitiesCount} Demonstrated Proofs
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 font-mono">
                              Passport: /passport/{app.publicSlug} • Applied: {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                            {app.notes && (
                              <p className="text-xs text-zinc-600 italic">"{app.notes}"</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {onViewCandidatePassport && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewCandidatePassport(app.publicSlug)}
                                className="text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span>Inspect Passport</span>
                              </Button>
                            )}

                            {onViewCandidateDossier && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewCandidateDossier(app.studentId)}
                                className="text-xs text-zinc-700 hover:text-zinc-900"
                              >
                                Dossier
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      )}

      {/* CREATE APPRENTICESHIP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">Post Youth Apprenticeship Program</h2>
                  <p className="text-xs text-zinc-500">Create a mentored pathway evaluated by demonstrated proof</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700">Program Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Backend Engineering Apprentice"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Program Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                  >
                    <option value="apprenticeship">Apprenticeship (Mentored)</option>
                    <option value="internship">Internship</option>
                    <option value="junior_developer">Junior Developer Role</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Target Role</label>
                  <select
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                  >
                    <option value="backend-developer">Backend Developer</option>
                    <option value="frontend-developer">Frontend Developer</option>
                    <option value="fullstack-developer">Full-Stack Developer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Stipend / Salary</label>
                  <input
                    type="text"
                    value={formData.stipendOrSalary}
                    onChange={(e) => setFormData({ ...formData, stipendOrSalary: e.target.value })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700">
                  Required Capabilities (Comma-Separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="API Development, Testing, Debugging"
                  value={formData.requiredCapabilities}
                  onChange={(e) => setFormData({ ...formData, requiredCapabilities: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                />
                <p className="text-[10px] text-zinc-500">
                  Candidates must demonstrate these capabilities via deterministic Work Simulator test passes.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700">Program Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the mentorship structure, engineering team context, and learning objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? 'Publishing...' : 'Publish Apprenticeship'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterOpportunitiesPage;
