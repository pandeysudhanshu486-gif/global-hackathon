import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  FolderGit2,
  Code2,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { SkillsManager, type DeclaredSkill } from '../components/profile/SkillsManager';
import { ResumeUploadCard, type ResumeParsedData } from '../components/profile/ResumeUploadCard';
import { GitHubAnalysisCard, type GitHubAnalysisData } from '../components/profile/GitHubAnalysisCard';
import { authFetch } from '../utils/auth';

export interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  graduationYear?: number;
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
}

export interface StudentProfileData {
  name: string;
  email: string;
  bio?: string;
  location?: string;
  workPreference: 'remote' | 'onsite' | 'hybrid';
  targetRole?: string;
  interests: string[];
  education: EducationItem[];
  declaredSkills: DeclaredSkill[];
  projects: ProjectItem[];
  resumeFileName?: string;
  resumeParsedData?: ResumeParsedData;
  github?: {
    username?: string;
    profileUrl?: string;
    connected: boolean;
    lastAnalyzedAt?: string;
  };
  publicSlug?: string;
}

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form local state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [workPreference, setWorkPreference] = useState<'remote' | 'onsite' | 'hybrid'>('remote');
  const [targetRole, setTargetRole] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [declaredSkillsList, setDeclaredSkillsList] = useState<DeclaredSkill[]>([]);
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'resume' | 'github'>('info');

  // Fetch student profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authFetch('/api/student/profile');

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || 'Failed to load profile');
        }

        const p: StudentProfileData = data.data;
        setProfile(p);
        setName(p.name || '');
        setBio(p.bio || '');
        setLocation(p.location || '');
        setWorkPreference(p.workPreference || 'remote');
        setTargetRole(p.targetRole || '');
        setInterestsInput(p.interests ? p.interests.join(', ') : '');
        setEducationList(p.education || []);
        setDeclaredSkillsList(p.declaredSkills || []);
        setProjectsList(p.projects || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);

    try {
      const interests = interestsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        workPreference,
        targetRole: targetRole.trim(),
        interests,
        education: educationList,
        declaredSkills: declaredSkillsList,
        projects: projectsList,
      };

      const response = await authFetch('/api/student/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update profile');
      }

      setProfile(data.data);
      setSuccessMsg('Profile changes saved successfully.');

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Education Helpers
  const addEducation = () => {
    setEducationList([
      ...educationList,
      { institution: '', degree: '', field: '', graduationYear: new Date().getFullYear() },
    ]);
  };

  const updateEducation = (index: number, field: keyof EducationItem, val: any) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: val };
    setEducationList(updated);
  };

  const removeEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  // Project Helpers
  const addProject = () => {
    setProjectsList([
      ...projectsList,
      { title: '', description: '', technologies: [], url: '', githubUrl: '' },
    ]);
  };

  const updateProject = (index: number, field: keyof ProjectItem, val: any) => {
    const updated = [...projectsList];
    updated[index] = { ...updated[index], [field]: val };
    setProjectsList(updated);
  };

  const removeProject = (index: number) => {
    setProjectsList(projectsList.filter((_, i) => i !== index));
  };

  // Resume Upload Callback
  const handleResumeSuccess = (parsedData: ResumeParsedData, fileName: string) => {
    setProfile((prev) => (prev ? { ...prev, resumeParsedData: parsedData, resumeFileName: fileName } : null));

    if (educationList.length === 0 && parsedData.extractedEducation.length > 0) {
      setEducationList(parsedData.extractedEducation);
    }
    if (projectsList.length === 0 && parsedData.extractedProjects.length > 0) {
      setProjectsList(parsedData.extractedProjects);
    }
  };

  // GitHub Analysis Callback
  const handleGitHubSuccess = (data: GitHubAnalysisData) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            github: {
              username: data.username,
              profileUrl: data.profileUrl,
              connected: true,
              lastAnalyzedAt: data.analyzedAt?.toString(),
            },
          }
        : null
    );
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-500 font-medium">Loading candidate profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Candidate Profile & Skills</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your declared capabilities, education, projects, resume analysis, and public GitHub context.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveProfile}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2.5 text-xs text-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Section Sub-Tabs */}
      <div className="flex border-b border-zinc-200 gap-2 overflow-x-auto select-none">
        {[
          { id: 'info', label: 'Basic Info & Education', icon: User },
          { id: 'skills', label: 'Declared Skills', icon: Code2 },
          { id: 'resume', label: 'Resume & AI Extraction', icon: GraduationCap },
          { id: 'github', label: 'GitHub Evidence', icon: FolderGit2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-md'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BASIC INFO, EDUCATION & PROJECTS */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Basic Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Personal & Career Target</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  value={profile?.email || ''}
                  disabled
                  helperText="Managed via account authentication"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Target Job Role"
                  placeholder="e.g. Junior Backend Developer, Frontend Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  helperText="Used to tailor your skill gap map and recommended missions"
                  leftIcon={<Layers className="w-4 h-4" />}
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium text-zinc-700">Work Preference</label>
                  <select
                    value={workPreference}
                    onChange={(e) => setWorkPreference(e.target.value as any)}
                    className="w-full h-10 px-3 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Input
                  label="Interests / Focus Areas (comma-separated)"
                  placeholder="e.g. Distributed Systems, REST APIs, Microservices"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium text-zinc-700">Professional Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief summary of your background, coding journey, and current learning focus..."
                  className="w-full p-3 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Education Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Education & Credentials
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5">Your academic degrees or formal training.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={addEducation}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Education
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {educationList.length === 0 ? (
                <p className="text-xs text-zinc-400 italic py-2">No education records added yet.</p>
              ) : (
                educationList.map((ed, idx) => (
                  <div key={idx} className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="absolute top-3 right-3 text-zinc-400 hover:text-red-600 p-1"
                      title="Remove record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <Input
                        label="Institution / College"
                        placeholder="e.g. University of California"
                        value={ed.institution}
                        onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                        required
                      />
                      <Input
                        label="Degree"
                        placeholder="e.g. B.S. Computer Science"
                        value={ed.degree}
                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Field of Study (Optional)"
                        placeholder="e.g. Software Engineering"
                        value={ed.field || ''}
                        onChange={(e) => updateEducation(idx, 'field', e.target.value)}
                      />
                      <Input
                        label="Graduation Year"
                        type="number"
                        placeholder="2025"
                        value={ed.graduationYear || ''}
                        onChange={(e) => updateEducation(idx, 'graduationYear', parseInt(e.target.value) || undefined)}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Projects Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-blue-600" />
                  Engineering Projects
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Portfolio projects demonstrating your software implementation background.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={addProject}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Project
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectsList.length === 0 ? (
                <p className="text-xs text-zinc-400 italic py-2">No projects added yet.</p>
              ) : (
                projectsList.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="absolute top-3 right-3 text-zinc-400 hover:text-red-600 p-1"
                      title="Remove project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <Input
                        label="Project Title"
                        placeholder="e.g. E-Commerce Order Microservice"
                        value={proj.title}
                        onChange={(e) => updateProject(idx, 'title', e.target.value)}
                        required
                      />
                      <Input
                        label="Technologies Used (comma-separated)"
                        placeholder="e.g. Node.js, Express, MongoDB, Jest"
                        value={proj.technologies ? proj.technologies.join(', ') : ''}
                        onChange={(e) =>
                          updateProject(
                            idx,
                            'technologies',
                            e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-xs font-medium text-zinc-700">Project Description</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => updateProject(idx, 'description', e.target.value)}
                        placeholder="What problem did this project solve? What technical decisions did you make?"
                        className="w-full p-2.5 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Live Demo URL (Optional)"
                        placeholder="https://..."
                        value={proj.url || ''}
                        onChange={(e) => updateProject(idx, 'url', e.target.value)}
                      />
                      <Input
                        label="GitHub Repository URL (Optional)"
                        placeholder="https://github.com/..."
                        value={proj.githubUrl || ''}
                        onChange={(e) => updateProject(idx, 'githubUrl', e.target.value)}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: DECLARED SKILLS MANAGER */}
      {activeTab === 'skills' && (
        <SkillsManager
          declaredSkills={declaredSkillsList}
          aiExtractedSkills={profile?.resumeParsedData?.extractedSkills || []}
          githubLanguages={profile?.github?.connected ? [] : []}
          onAddSkill={(skill) => setDeclaredSkillsList([...declaredSkillsList, skill])}
          onRemoveSkill={(index) => setDeclaredSkillsList(declaredSkillsList.filter((_, i) => i !== index))}
        />
      )}

      {/* TAB 3: RESUME UPLOAD & AI EXTRACTION */}
      {activeTab === 'resume' && (
        <ResumeUploadCard
          resumeFileName={profile?.resumeFileName}
          resumeParsedData={profile?.resumeParsedData}
          onUploadSuccess={handleResumeSuccess}
        />
      )}

      {/* TAB 4: GITHUB SUPPORTING EVIDENCE */}
      {activeTab === 'github' && (
        <GitHubAnalysisCard
          initialUsername={profile?.github?.username}
          initialProfileUrl={profile?.github?.profileUrl}
          lastAnalyzedAt={profile?.github?.lastAnalyzedAt}
          onAnalysisSuccess={handleGitHubSuccess}
        />
      )}

      {/* Sticky Bottom Save Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border-t border-zinc-200 py-3 px-6 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xs text-zinc-500 hidden sm:block">
            Proof Passport: <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-[11px] font-mono">{profile?.publicSlug || 'slug-pending'}</code>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveProfile}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
