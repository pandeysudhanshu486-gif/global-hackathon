import React from 'react';
import {
  ArrowLeft,
  Clock,
  BarChart,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { MissionManifest, MissionSessionState } from '../../types/mission';

interface MissionHeaderProps {
  mission: MissionManifest;
  session: MissionSessionState;
  onBack: () => void;
  hasPassedTests: boolean;
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  mission,
  session,
  onBack,
  hasPassedTests,
}) => {
  const getDifficultyLabel = (diff: number) => {
    switch (diff) {
      case 1:
        return 'Beginner';
      case 2:
        return 'Intermediate';
      case 3:
        return 'Advanced';
      default:
        return 'Standard';
    }
  };

  const isSubmitted = session.status === 'submitted' || session.status === 'evaluated';

  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-16 z-10 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Back Button & Mission Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-zinc-600 hover:text-zinc-900 -ml-2 shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-1 rounded bg-blue-50 text-blue-700">
                <Terminal className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-zinc-900 tracking-tight">
                {mission.title}
              </h1>
              <Badge variant="default" size="sm" className="capitalize font-semibold">
                {mission.category}
              </Badge>
              <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                {mission.runtime}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{mission.timeEstimateMinutes} mins</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <BarChart className="w-3.5 h-3.5 text-zinc-400" />
                <span>{getDifficultyLabel(mission.difficulty)}</span>
              </span>
              <span>•</span>
              <span className="text-zinc-600">
                Verifies:{' '}
                <strong className="text-zinc-800">
                  {mission.skillsTested.map((s) => s.skillName).join(', ')}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Session Status & Runs */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Session Status</p>
            <p className="text-xs font-bold text-zinc-800">
              {session.runCount} {session.runCount === 1 ? 'Run' : 'Runs'} Attempted
            </p>
          </div>

          {isSubmitted ? (
            <Badge variant="success" size="md" className="flex items-center gap-1.5 py-1 px-3">
              <ShieldCheck className="w-4 h-4 text-green-700" />
              <span className="font-bold">Submitted &amp; Verified</span>
            </Badge>
          ) : hasPassedTests ? (
            <Badge variant="success" size="md" className="flex items-center gap-1.5 py-1 px-3">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span className="font-bold">All Tests Passed</span>
            </Badge>
          ) : (
            <Badge variant="warning" size="md" className="flex items-center gap-1.5 py-1 px-3">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span className="font-bold">In Progress</span>
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
};
