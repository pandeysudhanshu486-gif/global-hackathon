import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Globe,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { authFetch } from '../utils/auth';

export const RecruiterProfilePage: React.FC = () => {
  const [recruiterName, setRecruiterName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [companyWebsite, setCompanyWebsite] = useState<string>('');
  const [companyDescription, setCompanyDescription] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authFetch('/api/recruiter/profile');

      if (!res.ok) {
        throw new Error(`Failed to load recruiter profile (${res.status})`);
      }

      const body = await res.json();
      if (body.success && body.data) {
        setRecruiterName(body.data.recruiterName || '');
        setCompanyName(body.data.companyName || '');
        setCompanyWebsite(body.data.companyWebsite || '');
        setCompanyDescription(body.data.companyDescription || '');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await authFetch('/api/recruiter/profile', {
        method: 'PUT',
        body: JSON.stringify({
          recruiterName: recruiterName.trim(),
          companyName: companyName.trim(),
          companyWebsite: companyWebsite.trim() || undefined,
          companyDescription: companyDescription.trim() || undefined,
        }),
      });

      const body = await res.json();
      if (res.ok && body.success && body.data) {
        setSuccessMessage('Company and recruiter profile updated successfully.');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        throw new Error(body.error?.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      {/* Top Header */}
      <div className="space-y-1 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            Company &amp; Recruiter Profile
          </h1>
          <Badge variant="success" size="sm">
            Partner Verified
          </Badge>
        </div>
        <p className="text-xs text-zinc-500">
          Manage your organization credentials and recruiter identity displayed on candidate discovery.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-64 bg-zinc-200 rounded-xl" />
        </div>
      )}

      {/* Profile Edit Form */}
      {!loading && (
        <Card className="p-6 bg-white border-zinc-200 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recruiter Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Recruiter Full Name *</span>
                </label>
                <Input
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  required
                  className="text-xs"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Company Name *</span>
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Cloud Systems"
                  required
                  className="text-xs"
                />
              </div>
            </div>

            {/* Company Website URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                <span>Company Website URL</span>
              </label>
              <Input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://company.example.com"
                className="text-xs"
              />
            </div>

            {/* Company Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Company Overview / Description</span>
              </label>
              <textarea
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 border border-zinc-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                placeholder="Briefly describe your company, engineering mission, and what kind of technical proof of work you seek in candidates..."
              />
            </div>

            {/* Submit Action Button */}
            <div className="flex items-center justify-end pt-3 border-t border-zinc-100">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={saving}
                className="text-xs font-semibold px-5 flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1" />
                    <span>Save Company Profile</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
