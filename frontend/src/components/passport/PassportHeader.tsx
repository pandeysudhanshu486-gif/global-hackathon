import React, { useState } from 'react';
import {
  ShieldCheck,
  Share2,
  QrCode,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PassportQrModal } from './PassportQrModal';

interface PassportHeaderProps {
  displayName: string;
  targetRole?: string;
  bio?: string;
  publicSlug: string;
  verifiedCount: number;
}

export const PassportHeader: React.FC<PassportHeaderProps> = ({
  displayName,
  targetRole,
  bio,
  publicSlug,
  verifiedCount,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [qrOpen, setQrOpen] = useState<boolean>(false);

  const publicUrl = `/passport/${publicSlug}`;
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${publicUrl}` : publicUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Brand Banner Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 text-sm tracking-tight">WorkProof AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  Proof Passport
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQrOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-zinc-600" />
              <span>QR Code</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCopy}
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Passport Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Passport</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Candidate Profile Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                {displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{displayName}</h1>
                  <Badge variant="success" size="sm">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    <span>Verified Proof</span>
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-blue-700 capitalize pt-0.5">
                  Target Role: {targetRole?.replace('-', ' ') || 'Software Engineer'}
                </p>
              </div>
            </div>

            {bio && (
              <p className="text-xs text-zinc-600 leading-relaxed pt-1">
                {bio}
              </p>
            )}

            {/* Official Verification Statement */}
            <div className="pt-2 text-[11px] text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-200/80 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This passport presents immutable evidence of work completed and verified through WorkProof AI sandbox test suites.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shrink-0 text-center space-y-1 min-w-[200px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Verified Capabilities
            </span>
            <div className="text-3xl font-extrabold text-emerald-900">
              {verifiedCount}
            </div>
            <p className="text-[10px] text-emerald-700">
              100% Sandbox Execution Pass
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <PassportQrModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        publicUrl={publicUrl}
        candidateName={displayName}
      />
    </>
  );
};
