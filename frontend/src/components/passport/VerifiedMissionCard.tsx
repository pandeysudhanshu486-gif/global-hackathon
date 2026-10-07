import React, { useState } from 'react';
import {
  ShieldCheck,
  Terminal,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { PublicVerifiedMission } from '../../types/passport';

interface VerifiedMissionCardProps {
  mission: PublicVerifiedMission;
  demonstratedCapabilities?: string[];
}

export const VerifiedMissionCard: React.FC<VerifiedMissionCardProps> = ({
  mission,
  demonstratedCapabilities = ['API Development', 'Testing', 'Debugging'],
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(mission.integrityHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(mission.evaluatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="p-6 border-emerald-200 bg-linear-to-br from-emerald-50/30 via-white to-white shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-emerald-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">{mission.missionTitle}</h3>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">Mission: {mission.missionSlug}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            {mission.testsPassed}/{mission.testsTotal} Tests Passed (100%)
          </Badge>
        </div>
      </div>

      {/* Capabilities Demonstrated Pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3 h-3 text-zinc-400" />
          <span>Demonstrated Capabilities:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {demonstratedCapabilities.map((cap, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{cap}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Human-Readable Verification Receipt */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
          <span className="flex items-center gap-1 text-emerald-800 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Proof Receipt</span>
          </span>
          <span className="flex items-center gap-1 text-zinc-400 text-[10px]">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-700 pt-1">
          <div>
            <span className="text-zinc-500">Run ID:</span> {mission.runId}
          </div>
          <div>
            <span className="text-zinc-500">Verification:</span> <span className="text-emerald-700 font-bold">100% Deterministic Pass</span>
          </div>
        </div>

        {/* SHA-256 Hash with Copy */}
        <div className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-zinc-200/90 text-[10px] text-zinc-800">
          <span className="flex items-center gap-1 text-zinc-500 shrink-0">
            <Lock className="w-3 h-3 text-blue-600" />
            <span>SHA-256:</span>
          </span>
          <span className="truncate text-zinc-700">{mission.integrityHash}</span>
          <button
            type="button"
            onClick={handleCopyHash}
            className="p-1 text-zinc-500 hover:text-zinc-800 shrink-0 cursor-pointer"
            title="Copy Proof Hash"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </Card>
  );
};
