import React, { useState } from 'react';
import { Plus, X, Sparkles, FolderGit2, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export interface DeclaredSkill {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'testing' | 'devops' | 'architecture' | 'general';
  selfAssessedLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface SkillsManagerProps {
  declaredSkills: DeclaredSkill[];
  aiExtractedSkills?: Array<{ name: string; category?: string }>;
  githubLanguages?: Array<{ language: string; repoCount: number }>;
  onAddSkill: (skill: DeclaredSkill) => void;
  onRemoveSkill: (index: number) => void;
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  declaredSkills,
  aiExtractedSkills = [],
  githubLanguages = [],
  onAddSkill,
  onRemoveSkill,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState<DeclaredSkill['category']>('backend');
  const [level, setLevel] = useState<DeclaredSkill['selfAssessedLevel']>('intermediate');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setError('Skill name is required');
      return;
    }

    // Check for duplicate
    if (declaredSkills.some((s) => s.name.toLowerCase() === skillName.trim().toLowerCase())) {
      setError('This skill is already declared in your profile');
      return;
    }

    onAddSkill({
      name: skillName.trim(),
      category,
      selfAssessedLevel: level,
    });

    setSkillName('');
    setError(null);
    setIsAdding(false);
  };

  const handleQuickAdd = (name: string, cat?: string) => {
    if (declaredSkills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    const safeCat: DeclaredSkill['category'] =
      cat && ['frontend', 'backend', 'database', 'testing', 'devops', 'architecture', 'general'].includes(cat)
        ? (cat as DeclaredSkill['category'])
        : 'general';

    onAddSkill({
      name,
      category: safeCat,
      selfAssessedLevel: 'intermediate',
    });
  };

  return (
    <div className="space-y-6">
      {/* Evidence Hierarchy Banner */}
      <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-zinc-900">WorkProof AI Evidence Distinction</p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-600">
            <span className="inline-flex items-center gap-1 font-medium">
              <Badge variant="secondary">Declared</Badge> Self-reported claim (unverified)
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                AI-Assisted
              </span>{' '}
              Extracted from resume (unverified)
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 rounded-full">
                Supporting
              </span>{' '}
              GitHub public repos
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-50 text-green-800 border border-green-200 rounded-full">
                Demonstrated
              </span>{' '}
              Passed Work Simulator test suite
            </span>
          </div>
        </div>
      </div>

      {/* Declared Skills Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm">Declared Technical Skills</CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">
              Skills you claim and want to prove through workplace engineering missions.
            </p>
          </div>
          {!isAdding && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAdding(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Skill
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {isAdding && (
            <form onSubmit={handleAdd} className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900">Declare a New Skill</h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setError(null);
                  }}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Skill Name"
                  placeholder="e.g. Node.js, Express, React"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  required
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium text-zinc-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-10 px-3 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="backend">Backend</option>
                    <option value="frontend">Frontend</option>
                    <option value="database">Database</option>
                    <option value="testing">Testing</option>
                    <option value="devops">DevOps</option>
                    <option value="architecture">Architecture</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium text-zinc-700">Self-Assessed Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full h-10 px-3 text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Declared Skill
                </Button>
              </div>
            </form>
          )}

          {/* List of declared skills */}
          {declaredSkills.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50 rounded-lg border border-dashed border-zinc-300 space-y-2">
              <p className="text-xs text-zinc-600 font-medium">No skills declared yet.</p>
              <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                Declare the technologies you know or upload your resume below to start receiving relevant work missions.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAdding(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Declare First Skill
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {declaredSkills.map((skill, index) => (
                <div
                  key={`${skill.name}-${index}`}
                  className="p-3 bg-white rounded-lg border border-zinc-200 flex items-center justify-between hover:border-zinc-300 transition-colors shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900">{skill.name}</span>
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase bg-zinc-100 px-1.5 py-0.2 rounded">
                        {skill.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <span className="capitalize">{skill.selfAssessedLevel}</span>
                      <span>•</span>
                      <span className="text-blue-700 font-medium">Declared</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveSkill(index)}
                    className="text-zinc-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="Remove skill"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI-Extracted Skills Section (If Available) */}
      {aiExtractedSkills.length > 0 && (
        <Card className="border-amber-200/80 bg-amber-50/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AI-Extracted Skills from Resume (Review & Declare)
              </CardTitle>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                Unverified Assistive Data
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Click any extracted skill to add it to your official declared skills for verification testing.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {aiExtractedSkills.map((s, idx) => {
                const isAlreadyDeclared = declaredSkills.some(
                  (d) => d.name.toLowerCase() === s.name.toLowerCase()
                );
                return (
                  <button
                    key={`${s.name}-${idx}`}
                    type="button"
                    disabled={isAlreadyDeclared}
                    onClick={() => handleQuickAdd(s.name, s.category)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      isAlreadyDeclared
                        ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-default'
                        : 'bg-white text-zinc-800 border-amber-300 hover:bg-amber-50 hover:border-amber-400 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <span>{s.name}</span>
                    {isAlreadyDeclared ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <Plus className="w-3 h-3 text-amber-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* GitHub Supporting Technologies (If Available) */}
      {githubLanguages.length > 0 && (
        <Card className="border-purple-200/80 bg-purple-50/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-1.5 text-purple-900">
                <FolderGit2 className="w-3.5 h-3.5 text-purple-600" />
                Technologies Found in Public GitHub Repositories
              </CardTitle>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                Supporting Evidence
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Public code activity provides supporting context, but does not independently grant verified skill status.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {githubLanguages.map((g, idx) => {
                const isAlreadyDeclared = declaredSkills.some(
                  (d) => d.name.toLowerCase() === g.language.toLowerCase()
                );
                return (
                  <button
                    key={`${g.language}-${idx}`}
                    type="button"
                    disabled={isAlreadyDeclared}
                    onClick={() => handleQuickAdd(g.language)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      isAlreadyDeclared
                        ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-default'
                        : 'bg-white text-zinc-800 border-purple-300 hover:bg-purple-50 hover:border-purple-400 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <span>{g.language}</span>
                    <span className="text-[10px] text-zinc-400">({g.repoCount} repos)</span>
                    {isAlreadyDeclared ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <Plus className="w-3 h-3 text-purple-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
