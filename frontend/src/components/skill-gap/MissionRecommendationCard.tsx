import React from 'react';
import {
  Sparkles,
  Clock,
  BarChart,
  CheckCircle2,
  ArrowRight,
  Terminal,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { RecommendedMission } from '../../types/skill-gap';

interface MissionRecommendationCardProps {
  mission: RecommendedMission | null;
  onStartMission: (slug: string) => void;
}

export const MissionRecommendationCard: React.FC<MissionRecommendationCardProps> = ({
  mission,
  onStartMission,
}) => {
  if (!mission) {
    return (
      <Card className="border-green-200 bg-green-50/30 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-green-900">
              All Target Role Capabilities Demonstrated!
            </h4>
            <p className="text-xs text-green-700 mt-0.5">
              You have demonstrated all core capabilities for this role template with passing test proofs.
            </p>
          </div>
        </div>
      </Card>
    );
  }

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

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 shadow-xs overflow-hidden">
      <CardHeader className="bg-blue-600/5 border-b border-blue-100 py-3.5 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-600 text-white">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                Recommended Next Action
              </span>
              <p className="text-xs text-zinc-500">Highest-impact mission to close your evidence gap</p>
            </div>
          </div>
          <Badge variant="default" size="sm" className="bg-blue-600 text-white border-none font-semibold">
            Work Simulator Mission
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Mission Title and Meta */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-base font-bold text-zinc-900">{mission.title}</h3>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-600 bg-white px-2 py-1 rounded border border-zinc-200">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{mission.timeEstimateMinutes} mins</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-zinc-600 bg-white px-2 py-1 rounded border border-zinc-200">
                <BarChart className="w-3.5 h-3.5 text-zinc-400" />
                <span>{getDifficultyLabel(mission.difficulty)}</span>
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">{mission.description}</p>
        </div>

        {/* Explainable Rationale Box */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-md p-3.5 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Why this mission?</span>
          </div>
          <p className="text-blue-950/80 leading-relaxed font-medium">{mission.rationale}</p>
        </div>

        {/* Capabilities Tested Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
            Capabilities Verified Upon Pass:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {mission.capabilitiesTested.map((cap, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span>{cap}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
            <span>Completing test suites elevates status to Demonstrated (4/4 dots)</span>
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-semibold px-5 py-2.5 shadow-sm"
            onClick={() => onStartMission(mission.slug)}
          >
            <span>Start Mission in Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
