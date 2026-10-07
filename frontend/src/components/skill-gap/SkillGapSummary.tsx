import React from 'react';
import { Target, ShieldCheck, GitBranch, FileText, AlertCircle, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { SkillGapSummary as ISkillGapSummary, TargetRoleSummary, RoleListItem } from '../../types/skill-gap';

interface SkillGapSummaryProps {
  targetRole: TargetRoleSummary;
  summary: ISkillGapSummary;
  availableRoles: RoleListItem[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  loading?: boolean;
}

export const SkillGapSummary: React.FC<SkillGapSummaryProps> = ({
  targetRole,
  summary,
  availableRoles,
  selectedRoleId,
  onSelectRole,
  loading = false,
}) => {
  const total = summary.totalCapabilities || 1;

  return (
    <Card className="bg-white border-zinc-200">
      <div className="p-6 space-y-6">
        {/* Role Selection & Description */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">{targetRole.name}</h2>
              <Badge variant="default" size="sm">
                {targetRole.category}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
              {targetRole.description}
            </p>
          </div>

          {/* Role Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="role-select" className="text-xs font-semibold text-zinc-600 shrink-0">
              Analyze Role:
            </label>
            <select
              id="role-select"
              value={selectedRoleId}
              onChange={(e) => onSelectRole(e.target.value)}
              disabled={loading}
              className="text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            >
              {availableRoles.map((r) => (
                <option key={r.roleId} value={r.roleId}>
                  {r.name} ({r.capabilitiesCount} capabilities)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Evidence Status Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Demonstrated */}
          <div className="p-3.5 rounded-lg border border-green-200 bg-green-50/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-green-900 uppercase tracking-wide flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                Demonstrated
              </span>
              <span className="text-sm font-bold text-green-800">
                {summary.demonstratedCount}/{summary.totalCapabilities}
              </span>
            </div>
            <p className="text-[11px] text-green-700">Passing test suite evidence (4/4 dots)</p>
          </div>

          {/* 2. Supporting Evidence */}
          <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                Supporting
              </span>
              <span className="text-sm font-bold text-blue-800">
                {summary.supportingCount}/{summary.totalCapabilities}
              </span>
            </div>
            <p className="text-[11px] text-blue-700">Public GitHub activity (2/4 dots)</p>
          </div>

          {/* 3. Declared / Resume Claims */}
          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                Declared / AI
              </span>
              <span className="text-sm font-bold text-amber-800">
                {summary.declaredCount + summary.aiAssistedCount}/{summary.totalCapabilities}
              </span>
            </div>
            <p className="text-[11px] text-amber-700">Self-reported / resume (1/4 dots)</p>
          </div>

          {/* 4. Missing Evidence Gap */}
          <div className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                Evidence Gap
              </span>
              <span className="text-sm font-bold text-zinc-700">
                {summary.gapCount}/{summary.totalCapabilities}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">No proof or mention (0/4 dots)</p>
          </div>
        </div>

        {/* Evidence Distribution Multi-Segment Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-600 font-medium">
            <span>Evidence Profile Distribution</span>
            <span>{summary.totalCapabilities} Total Target Capabilities</span>
          </div>
          <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-0.5">
            {summary.demonstratedCount > 0 && (
              <div
                style={{ width: `${(summary.demonstratedCount / total) * 100}%` }}
                className="bg-green-600 h-full transition-all duration-500"
                title={`Demonstrated: ${summary.demonstratedCount}`}
              />
            )}
            {summary.supportingCount > 0 && (
              <div
                style={{ width: `${(summary.supportingCount / total) * 100}%` }}
                className="bg-blue-600 h-full transition-all duration-500"
                title={`Supporting: ${summary.supportingCount}`}
              />
            )}
            {(summary.declaredCount > 0 || summary.aiAssistedCount > 0) && (
              <div
                style={{
                  width: `${((summary.declaredCount + summary.aiAssistedCount) / total) * 100}%`,
                }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`Declared/AI: ${summary.declaredCount + summary.aiAssistedCount}`}
              />
            )}
            {summary.gapCount > 0 && (
              <div
                style={{ width: `${(summary.gapCount / total) * 100}%` }}
                className="bg-zinc-300 h-full transition-all duration-500"
                title={`Missing Evidence: ${summary.gapCount}`}
              />
            )}
          </div>
        </div>

        {/* Core Product Principle Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-md p-3 text-xs flex items-center gap-2 text-slate-700">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Principle: Evidence &gt; Score.</strong> WorkProof AI replaces arbitrary percentage rankings with inspectable proofs, test executions, and verifiable work simulator outcomes.
          </span>
        </div>
      </div>
    </Card>
  );
};
