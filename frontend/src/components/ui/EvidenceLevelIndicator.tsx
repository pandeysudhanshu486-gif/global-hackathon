import React from 'react';

export type EvidenceLevel = 0 | 1 | 2 | 3 | 4;

export interface EvidenceLevelIndicatorProps {
  level: EvidenceLevel;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

const levelConfig: Record<
  EvidenceLevel,
  { label: string; activeColor: string; bgBadge: string; textBadge: string; borderBadge: string }
> = {
  0: {
    label: 'No Evidence',
    activeColor: 'bg-zinc-300',
    bgBadge: 'bg-zinc-100',
    textBadge: 'text-zinc-600',
    borderBadge: 'border-zinc-200',
  },
  1: {
    label: 'Attempted',
    activeColor: 'bg-sky-600',
    bgBadge: 'bg-sky-50',
    textBadge: 'text-sky-800',
    borderBadge: 'border-sky-200',
  },
  2: {
    label: 'Limited Evidence',
    activeColor: 'bg-amber-600',
    bgBadge: 'bg-amber-50',
    textBadge: 'text-amber-800',
    borderBadge: 'border-amber-200',
  },
  3: {
    label: 'Demonstrated',
    activeColor: 'bg-green-600',
    bgBadge: 'bg-green-50',
    textBadge: 'text-green-800',
    borderBadge: 'border-green-200',
  },
  4: {
    label: 'Strong Evidence',
    activeColor: 'bg-blue-700',
    bgBadge: 'bg-blue-50',
    textBadge: 'text-blue-900',
    borderBadge: 'border-blue-200',
  },
};

export const EvidenceLevelIndicator: React.FC<EvidenceLevelIndicatorProps> = ({
  level,
  showText = true,
  className = '',
  size = 'md',
}) => {
  const config = levelConfig[level] || levelConfig[0];
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label={`Evidence level: ${config.label}, ${level} of 4`}
      title={`Evidence level: ${config.label}`}
    >
      {/* 4-dot visual status indicator */}
      <div className="flex items-center gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => {
          const isFilled = step <= level;
          return (
            <span
              key={step}
              className={`${dotSize} rounded-full transition-colors ${
                isFilled ? config.activeColor : 'bg-zinc-200'
              }`}
            />
          );
        })}
      </div>

      {/* Explicit text label for accessibility and evidence-first clarity */}
      {showText && (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.bgBadge} ${config.textBadge} ${config.borderBadge}`}
        >
          {config.label}
        </span>
      )}
    </div>
  );
};
