import React, { useState } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  ShieldCheck,
  Code2,
  Briefcase,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { CandidateSearchFilterParams } from '../../types/recruiter';

interface CandidateFiltersProps {
  filters: CandidateSearchFilterParams;
  onFilterChange: (newFilters: Partial<CandidateSearchFilterParams>) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export const CandidateFilters: React.FC<CandidateFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  isLoading = false,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput, page: 1 });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onFilterChange({ search: searchInput, page: 1 });
    }
  };

  const hasActiveFilters = Boolean(
    filters.targetRole ||
    filters.capability ||
    filters.evidenceLevel ||
    filters.missionSlug ||
    filters.search
  );

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Search Bar & Mobile Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search candidates by name, target role, institution, or capability..."
            className="w-full pl-9 pr-24 py-2.5 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-md text-[11px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Mobile Filter Expander Toggle */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="sm:hidden text-xs flex items-center justify-center gap-1.5 w-full"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
            {mobileExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput('');
                onResetFilters();
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Controls: Desktop always visible, Mobile collapsible */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${mobileExpanded ? 'block' : 'hidden sm:grid'}`}>
        {/* Filter 1: Target Role */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
            <span>Target Role</span>
          </label>
          <select
            value={filters.targetRole || ''}
            onChange={(e) => onFilterChange({ targetRole: e.target.value || undefined, page: 1 })}
            className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          >
            <option value="">All Target Roles</option>
            <option value="backend-developer">Backend Developer</option>
            <option value="frontend-developer">Frontend Developer</option>
            <option value="fullstack-developer">Full Stack Developer</option>
            <option value="devops-engineer">DevOps Engineer</option>
            <option value="data-engineer">Data Engineer</option>
          </select>
        </div>

        {/* Filter 2: Capability Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Capability</span>
          </label>
          <select
            value={filters.capability || ''}
            onChange={(e) => onFilterChange({ capability: e.target.value || undefined, page: 1 })}
            className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          >
            <option value="">All Capabilities</option>
            <option value="testing">Testing / Test Suites</option>
            <option value="debugging">Debugging & Error Handling</option>
            <option value="api-development">API Development</option>
            <option value="Node.js">Node.js</option>
            <option value="TypeScript">TypeScript</option>
            <option value="React">React</option>
            <option value="PostgreSQL">PostgreSQL</option>
          </select>
        </div>

        {/* Filter 3: Minimum Evidence Level */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Evidence Level</span>
          </label>
          <select
            value={filters.evidenceLevel || ''}
            onChange={(e) =>
              onFilterChange({
                evidenceLevel: (e.target.value as any) || undefined,
                page: 1,
              })
            }
            className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          >
            <option value="">All Evidence Levels</option>
            <option value="demonstrated">Demonstrated (Verified Work Proof)</option>
            <option value="supporting">Supporting Evidence (GitHub Connected)</option>
            <option value="ai_assisted">AI-Assisted / Unverified (Resume)</option>
            <option value="declared">Declared (Self-reported)</option>
          </select>
        </div>

        {/* Filter 4: Work Simulator Mission */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Passed Mission</span>
          </label>
          <select
            value={filters.missionSlug || ''}
            onChange={(e) => onFilterChange({ missionSlug: e.target.value || undefined, page: 1 })}
            className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          >
            <option value="">All Missions</option>
            <option value="backend-order-total-bug">Order Total Calculation Bug</option>
          </select>
        </div>
      </div>
    </div>
  );
};
