import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { SkillGapSummary } from '../components/skill-gap/SkillGapSummary';
import { MissionRecommendationCard } from '../components/skill-gap/MissionRecommendationCard';
import { CapabilityCard } from '../components/skill-gap/CapabilityCard';
import { PageExplainerCard } from '../components/guidance/PageExplainerCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { apiUrl } from '../utils/api';
import type {
  SkillGapAnalysisData,
  RoleListItem,
  CapabilityAnalysisItem,
} from '../types/skill-gap';
import { authFetch } from '../utils/auth';

interface SkillGapPageProps {
  onNavigateToMission?: (slug: string) => void;
  onOpenTour?: () => void;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({ onNavigateToMission, onOpenTour }) => {
  const [data, setData] = useState<SkillGapAnalysisData | null>(null);
  const [availableRoles, setAvailableRoles] = useState<RoleListItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('backend-developer');
  const [filterCategory, setFilterCategory] = useState<'all' | 'core' | 'recommended' | 'gaps'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      const res = await fetch(apiUrl('/api/skills/roles'));
      if (res.ok) {
        const body = await res.json();
        if (body.success && Array.isArray(body.data)) {
          setAvailableRoles(body.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch available roles:', err);
    }
  };

  // Fetch student skill gap analysis
  const fetchSkillGap = async (roleId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const queryParam = roleId ? `?roleId=${encodeURIComponent(roleId)}` : '';
      const res = await authFetch(`/api/student/skill-gap${queryParam}`);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication required to view personalized skill gap analysis.');
        }
        throw new Error(`Failed to load skill gap analysis (${res.status})`);
      }

      const body = await res.json();
      if (body.success && body.data) {
        setData(body.data);
        if (body.data.targetRole?.roleId) {
          setSelectedRoleId(body.data.targetRole.roleId);
        }
      } else {
        throw new Error(body.error?.message || 'Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to Skill Gap service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchSkillGap();
  }, []);

  const handleRoleChange = (newRoleId: string) => {
    setSelectedRoleId(newRoleId);
    fetchSkillGap(newRoleId);
  };

  const handleStartMission = (slug: string) => {
    if (onNavigateToMission) {
      onNavigateToMission(slug);
    } else {
      alert(`Opening Work Simulator Mission: ${slug}`);
    }
  };

  const handleTakeAction = (_cap: CapabilityAnalysisItem) => {
    if (data?.recommendedMission) {
      handleStartMission(data.recommendedMission.slug);
    } else {
      handleStartMission('backend-order-total-bug');
    }
  };

  // Filter capabilities based on active tab
  const filteredCapabilities = (data?.capabilities || []).filter((cap) => {
    if (filterCategory === 'core') return cap.importance === 'core';
    if (filterCategory === 'recommended') return cap.importance === 'recommended';
    if (filterCategory === 'gaps') return cap.status !== 'demonstrated';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Skill Gap &amp; Mission Recommendation Engine
            </h1>
            <Badge variant="default" size="sm">
              Evidence-Aware
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Deterministic mapping from your Target Role to required capabilities, observable evidence, and curated work missions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSkillGap(selectedRoleId)}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </Button>
      </div>

      {/* Explainer Guide Card for Hackathon Judges & First-Time Users */}
      <PageExplainerCard pageId="skill-gap" onOpenWalkthrough={onOpenTour} />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSkillGap(selectedRoleId)}
              className="bg-white text-xs border-red-300 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-4 animate-pulse">
          <div className="h-44 bg-zinc-200 rounded-lg" />
          <div className="h-40 bg-zinc-200 rounded-lg" />
          <div className="h-28 bg-zinc-200 rounded-lg" />
          <div className="h-28 bg-zinc-200 rounded-lg" />
        </div>
      )}

      {/* Loaded Content */}
      {data && (
        <>
          {/* Target Role & Evidence Breakdown Summary */}
          <SkillGapSummary
            targetRole={data.targetRole}
            summary={data.summary}
            availableRoles={availableRoles}
            selectedRoleId={selectedRoleId}
            onSelectRole={handleRoleChange}
            loading={loading}
          />

          {/* Recommended Mission Action Card */}
          <MissionRecommendationCard
            mission={data.recommendedMission}
            onStartMission={handleStartMission}
          />

          {/* Capabilities Matrix Header & Filters */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Target Capabilities Matrix ({filteredCapabilities.length} of{' '}
                  {data.capabilities.length})
                </h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1 rounded transition-colors ${
                    filterCategory === 'all'
                      ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  All ({data.capabilities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('core')}
                  className={`px-3 py-1 rounded transition-colors ${
                    filterCategory === 'core'
                      ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Core Requirements
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('recommended')}
                  className={`px-3 py-1 rounded transition-colors ${
                    filterCategory === 'recommended'
                      ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Recommended
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('gaps')}
                  className={`px-3 py-1 rounded transition-colors ${
                    filterCategory === 'gaps'
                      ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Unproven Gaps (
                  {data.summary.totalCapabilities - data.summary.demonstratedCount})
                </button>
              </div>
            </div>

            {/* Capability Cards List */}
            <div className="space-y-3">
              {filteredCapabilities.map((cap) => (
                <CapabilityCard
                  key={cap.capabilityId}
                  capability={cap}
                  onTakeAction={handleTakeAction}
                />
              ))}

              {filteredCapabilities.length === 0 && (
                <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-lg text-xs text-zinc-500">
                  <CheckCircle2 className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                  <span>No capabilities match the selected filter.</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
