import React from 'react';
import {
  ShieldCheck,
  FolderGit2,
  FileText,
  User,
  Clock,
  Lock,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { EvidenceTimelineItem } from '../../types/recruiter';

interface EvidenceTimelineProps {
  timeline: EvidenceTimelineItem[];
}

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-zinc-500 bg-zinc-50 rounded-lg border border-zinc-200">
        No timeline events recorded yet.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'mission_passed':
      case 'evaluation_verified':
        return <ShieldCheck className="w-4 h-4 text-green-700" />;
      case 'github_analyzed':
        return <FolderGit2 className="w-4 h-4 text-purple-700" />;
      case 'resume_parsed':
        return <FileText className="w-4 h-4 text-amber-700" />;
      default:
        return <User className="w-4 h-4 text-blue-700" />;
    }
  };

  const getEventBadgeVariant = (
    classification: string
  ): 'success' | 'warning' | 'default' | 'outline' => {
    switch (classification) {
      case 'Demonstrated':
        return 'success';
      case 'Supporting Evidence':
        return 'outline';
      case 'AI-Assisted / Unverified':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
        {timeline.map((event) => {
          const dateStr = new Date(event.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={event.id} className="relative group">
              {/* Dot Icon Anchor */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-zinc-300 group-hover:border-blue-500 flex items-center justify-center shadow-2xs transition-colors">
                <div className="w-2 h-2 rounded-full bg-zinc-400 group-hover:bg-blue-600" />
              </div>

              {/* Event Card Container */}
              <div className="bg-white rounded-lg border border-zinc-200/80 p-3.5 space-y-2 shadow-2xs hover:border-zinc-300 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-zinc-50 border border-zinc-200">
                      {getEventIcon(event.type)}
                    </div>
                    <span className="text-xs font-bold text-zinc-900">{event.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getEventBadgeVariant(event.evidenceClassification)} size="sm">
                      {event.evidenceClassification}
                    </Badge>
                    <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{dateStr}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed pl-7">
                  {event.description}
                </p>

                {/* Metadata details if available */}
                {Boolean(event.metadata && event.metadata.integrityHash) && (
                  <div className="ml-7 mt-1.5 p-2 bg-zinc-50 rounded border border-zinc-200 text-[10px] font-mono text-zinc-700 flex items-center gap-1.5 overflow-hidden">
                    <Lock className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="text-zinc-500 shrink-0">SHA-256 Proof:</span>
                    <span className="truncate">{String(event.metadata!.integrityHash)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
