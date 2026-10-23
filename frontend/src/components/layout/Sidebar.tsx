import React from 'react';
import {
  LayoutDashboard,
  User,
  Target,
  BarChart3,
  Terminal,
  FolderGit2,
  ShieldCheck,
  Briefcase,
  Building2,
  Users,
} from 'lucide-react';
import { EvidenceLevelIndicator } from '../ui/EvidenceLevelIndicator';

export interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  role?: string;
}

export const RECRUITER_NAV_GROUPS = [
  {
    group: 'RECRUITMENT',
    items: [
      { id: 'recruiter-dashboard', label: 'Candidate Directory', icon: Users },
      { id: 'recruiter-opportunities', label: 'Apprenticeships & Jobs', icon: Briefcase },
    ],
  },
  {
    group: 'ORGANIZATION',
    items: [
      { id: 'recruiter-profile', label: 'Company Profile', icon: Building2 },
    ],
  },
];

export const STUDENT_NAV_GROUPS = [
  {
    group: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'Profile & Skills', icon: User },
    ],
  },
  {
    group: 'SKILLS & GAPS',
    items: [
      { id: 'target-role', label: 'Target Role', icon: Target },
      { id: 'skill-gap', label: 'Skill Gap Map', icon: BarChart3 },
    ],
  },
  {
    group: 'REAL WORK',
    items: [
      { id: 'missions', label: 'Work Missions', icon: Terminal },
      { id: 'submissions', label: 'Submissions', icon: FolderGit2 },
    ],
  },
  {
    group: 'HIRING SIGNAL',
    items: [
      { id: 'passport', label: 'Proof Passport', icon: ShieldCheck },
      { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, role = 'student' }) => {
  const isRecruiter = role === 'recruiter';
  const navGroups = isRecruiter ? RECRUITER_NAV_GROUPS : STUDENT_NAV_GROUPS;

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <p className="px-3 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeView === item.id ||
                  (isRecruiter && item.id === 'recruiter-dashboard' && activeView === 'recruiter-candidate-detail');

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer: Real-time Evidence Status or Recruiter Partner Tag */}
      {isRecruiter ? (
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500">Recruiter Portal</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Verified Partner
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-tight">
            Evidence-first talent discovery. Inspect sandbox test runs and cryptographic SHA-256 receipts.
          </p>
        </div>
      ) : (
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500">Evidence Status</span>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              Active
            </span>
          </div>
          <div className="space-y-1">
            <EvidenceLevelIndicator level={3} size="sm" showText={true} />
            <p className="text-[10px] text-zinc-500 leading-tight">
              Demonstrated capabilities backed by test suites & submissions.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

