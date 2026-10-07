import React from 'react';
import { ShieldCheck, FolderGit2, FileText, User } from 'lucide-react';

export type PassportEvidenceClassification =
  | 'Demonstrated'
  | 'Supporting Evidence'
  | 'AI-Assisted / Unverified'
  | 'Declared';

interface PassportEvidenceBadgeProps {
  classification: PassportEvidenceClassification;
  size?: 'sm' | 'md';
}

export const PassportEvidenceBadge: React.FC<PassportEvidenceBadgeProps> = ({
  classification,
  size = 'md',
}) => {
  const isSmall = size === 'sm';

  switch (classification) {
    case 'Demonstrated':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs ${
            isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <ShieldCheck className={isSmall ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
          <span>Demonstrated (4/4 Verified)</span>
        </span>
      );

    case 'Supporting Evidence':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-purple-50 text-purple-800 border border-purple-200 ${
            isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <FolderGit2 className={isSmall ? 'w-3 h-3 text-purple-600' : 'w-3.5 h-3.5 text-purple-600'} />
          <span>Supporting Evidence</span>
        </span>
      );

    case 'AI-Assisted / Unverified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${
            isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <FileText className={isSmall ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          <span>AI-Assisted • Unverified</span>
        </span>
      );

    case 'Declared':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 ${
            isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
        >
          <User className={isSmall ? 'w-3 h-3 text-zinc-400' : 'w-3.5 h-3.5 text-zinc-400'} />
          <span>Declared</span>
        </span>
      );
  }
};
