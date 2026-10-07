import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Check,
  Copy,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PassportQrModal } from '../components/passport/PassportQrModal';
import { PageExplainerCard } from '../components/guidance/PageExplainerCard';
import type { StudentPassportConfig, PassportPrivacySettings } from '../types/passport';
import { authFetch } from '../utils/auth';

interface StudentPassportSettingsPageProps {
  onPreviewPublicPassport?: (slug: string) => void;
  onOpenTour?: () => void;
}

export const StudentPassportSettingsPage: React.FC<StudentPassportSettingsPageProps> = ({
  onPreviewPublicPassport,
  onOpenTour,
}) => {
  const [config, setConfig] = useState<StudentPassportConfig | null>(null);
  const [privacy, setPrivacy] = useState<PassportPrivacySettings>({
    passportEnabled: true,
    showEducation: true,
    showProjects: true,
    showDeclaredSkills: true,
    showGithubEvidence: true,
    showResumeEvidence: true,
    showDemonstratedEvidence: true,
    showBio: true,
    showTimeline: true,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [qrOpen, setQrOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authFetch('/api/student/passport');

      if (!res.ok) throw new Error(`Failed to load passport configuration (${res.status})`);

      const body = await res.json();
      if (body.success && body.data) {
        setConfig(body.data);
        if (body.data.privacySettings) {
          setPrivacy(body.data.privacySettings);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error fetching passport');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await authFetch('/api/student/passport', {
        method: 'PUT',
        body: JSON.stringify(privacy),
      });

      const body = await res.json();
      if (res.ok && body.success && body.data) {
        setConfig(body.data);
        setSuccessMessage('Passport privacy settings saved successfully.');
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        throw new Error(body.error?.message || 'Failed to update passport');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const fullUrl = config
    ? typeof window !== 'undefined'
      ? `${window.location.origin}${config.publicUrl}`
      : config.publicUrl
    : '';

  const handleCopyLink = () => {
    if (fullUrl) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSetting = (key: keyof PassportPrivacySettings) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            Proof Passport &amp; Privacy Settings
          </h1>
          <Badge variant="success" size="sm">
            Live Portfolio
          </Badge>
        </div>
        <p className="text-xs text-zinc-500">
          Control which demonstrated capabilities and evidence sections are published on your public Proof Passport link.
        </p>
      </div>

      {/* Explainer Guide Card for Hackathon Judges & First-Time Users */}
      <PageExplainerCard pageId="passport" onOpenWalkthrough={onOpenTour} />

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 bg-zinc-200 rounded-xl" />
          <div className="h-64 bg-zinc-200 rounded-xl" />
        </div>
      )}

      {!loading && config && (
        <>
          {/* Public Link Share Box */}
          <Card className="p-6 bg-linear-to-r from-blue-50/60 via-white to-white border-zinc-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Your Public Share Link
                </span>
                <h3 className="text-sm font-bold text-zinc-900">
                  Share Your Verified WorkProof Portfolio
                </h3>
                <p className="text-xs text-zinc-500">
                  Recruiters and hiring teams can inspect your verified code receipts and demonstrated capabilities.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrOpen(true)}
                  className="text-xs flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyLink}
                  className="text-xs font-semibold flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>

                {onPreviewPublicPassport && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPreviewPublicPassport(config.publicSlug)}
                    className="text-xs flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-700 select-all truncate">
              {fullUrl}
            </div>
          </Card>

          {/* Privacy Settings Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <Card className="p-6 bg-white border-zinc-200 shadow-xs space-y-5">
              <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Passport Publication &amp; Privacy</h3>
                  <p className="text-xs text-zinc-500">
                    Configure public visibility for each evidence tier and candidate detail.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-700">
                    {privacy.passportEnabled ? 'Passport Enabled' : 'Passport Disabled'}
                  </span>
                  <input
                    type="checkbox"
                    checked={privacy.passportEnabled}
                    onChange={() => toggleSetting('passportEnabled')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Demonstrated Evidence */}
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-950">Show Demonstrated Capabilities</p>
                    <p className="text-[11px] text-emerald-800">Verified simulator test runs & proof receipts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showDemonstratedEvidence}
                    onChange={() => toggleSetting('showDemonstratedEvidence')}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Supporting GitHub */}
                <div className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-purple-950">Show GitHub Supporting Context</p>
                    <p className="text-[11px] text-purple-800">Public repositories & language context</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showGithubEvidence}
                    onChange={() => toggleSetting('showGithubEvidence')}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>

                {/* Declared Skills */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">Show Declared Skills</p>
                    <p className="text-[11px] text-zinc-500">Self-reported skill categories & levels</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showDeclaredSkills}
                    onChange={() => toggleSetting('showDeclaredSkills')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* AI Resume Mentions */}
                <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-amber-950">Show Resume AI Mentions</p>
                    <p className="text-[11px] text-amber-800">Extracted resume keywords (unverified)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showResumeEvidence}
                    onChange={() => toggleSetting('showResumeEvidence')}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {/* Education */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">Show Education</p>
                    <p className="text-[11px] text-zinc-500">College institution, degree & graduation year</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showEducation}
                    onChange={() => toggleSetting('showEducation')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Projects */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">Show Projects</p>
                    <p className="text-[11px] text-zinc-500">Listed personal & academic portfolio projects</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showProjects}
                    onChange={() => toggleSetting('showProjects')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Bio */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">Show Professional Bio</p>
                    <p className="text-[11px] text-zinc-500">Summary paragraph about background</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showBio}
                    onChange={() => toggleSetting('showBio')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Timeline */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-zinc-900">Show Evidence Timeline</p>
                    <p className="text-[11px] text-zinc-500">Chronological verification history stream</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showTimeline}
                    onChange={() => toggleSetting('showTimeline')}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Button */}
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
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1" />
                      <span>Save Privacy Settings</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </form>

          {/* QR Modal */}
          <PassportQrModal
            isOpen={qrOpen}
            onClose={() => setQrOpen(false)}
            publicUrl={config.publicUrl}
            candidateName="Proof Passport"
          />
        </>
      )}
    </div>
  );
};
