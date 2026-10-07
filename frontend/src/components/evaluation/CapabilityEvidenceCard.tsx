import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EvidenceLevelIndicator } from '../ui/EvidenceLevelIndicator';
import type { AwardedCapability } from '../../types/evaluation';

interface CapabilityEvidenceCardProps {
  capabilities: AwardedCapability[];
  missionSlug: string;
  runId: string;
  codeHash: string;
  integrityHash: string;
}

export const CapabilityEvidenceCard: React.FC<CapabilityEvidenceCardProps> = ({
  capabilities,
  missionSlug,
  runId,
  codeHash,
  integrityHash,
}) => {
  return (
    <Card className="border-zinc-200 bg-white shadow-xs">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-green-50 text-green-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Capabilities Demonstrated ({capabilities.length})
              </h3>
              <p className="text-xs text-zinc-500">
                Verified through passing execution of mission tests in the Work Simulator
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm" className="font-semibold">
            Status: Demonstrated (4/4 dots)
          </Badge>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {capabilities.map((cap) => (
            <div
              key={cap.capabilityId}
              className="p-4 rounded-lg border border-zinc-200 bg-zinc-50/50 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                    {cap.category}
                  </Badge>
                  <EvidenceLevelIndicator level={4} size="sm" showText={false} />
                </div>
                <h4 className="text-sm font-bold text-zinc-900">{cap.name}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Verified via mission{' '}
                  <code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px] text-zinc-800">
                    {missionSlug}
                  </code>
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[11px] text-zinc-600">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span>100% Tests Passed</span>
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  {runId.slice(0, 10)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Cryptographic Proof Verification Box */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-600 font-medium">
            <span className="flex items-center gap-1.5 font-bold text-zinc-800">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Cryptographic Proof of Work (SHA-256)</span>
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">Immutable Evidence Record</span>
          </div>

          <div className="space-y-1 text-[11px] font-mono text-zinc-600">
            <div className="flex items-center justify-between gap-2 p-1.5 bg-white rounded border border-zinc-200">
              <span className="text-zinc-500 font-sans font-semibold">Integrity Hash:</span>
              <span className="truncate text-zinc-800">{integrityHash}</span>
            </div>
            <div className="flex items-center justify-between gap-2 p-1.5 bg-white rounded border border-zinc-200">
              <span className="text-zinc-500 font-sans font-semibold">Code Snapshot Hash:</span>
              <span className="truncate text-zinc-800">{codeHash}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
            <span>
              This cryptographic signature is recorded in your immutable profile evidence ledger and visible on your Proof Passport.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
