import React, { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { authFetch } from '../../utils/auth';

export interface ResumeParsedData {
  extractedSkills: Array<{ name: string; category?: string }>;
  extractedExperience: Array<{ title: string; company: string; duration?: string; description?: string }>;
  extractedEducation: Array<{ institution: string; degree: string; field?: string; graduationYear?: number }>;
  extractedProjects: Array<{ title: string; description: string; technologies: string[] }>;
  extractedCertifications: string[];
  extractionMethod?: 'gemini' | 'heuristic_fallback';
  parsedAt?: string | Date;
  verified: false;
}

export interface ResumeUploadCardProps {
  resumeFileName?: string;
  resumeParsedData?: ResumeParsedData;
  onUploadSuccess: (parsedData: ResumeParsedData, fileName: string) => void;
}

export const ResumeUploadCard: React.FC<ResumeUploadCardProps> = ({
  resumeFileName,
  resumeParsedData,
  onUploadSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUploadFile = async (file: File) => {
    setError(null);
    setSuccessMsg(null);

    // 1. Validate File Type (PDF only)
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file format. Please upload a PDF resume document.');
      return;
    }

    // 2. Validate File Size (<= 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB limit. Please upload a smaller PDF.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await authFetch('/api/student/profile/resume', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to upload and analyze resume');
      }

      setSuccessMsg(`Resume "${file.name}" uploaded and analyzed with AI assistive parsing.`);
      onUploadSuccess(result.data.resumeParsedData, file.name);
    } catch (err: any) {
      setError(err.message || 'Network error occurred during resume upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUploadFile(e.target.files[0]);
    }
  };

  return (
    <Card className="space-y-4">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Resume Upload & Assistive AI Parsing
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-0.5">
              Upload your PDF resume to auto-populate draft education, projects, and skills for review.
            </p>
          </div>
          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full self-start sm:self-auto">
            AI-Assisted • Unverified
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-6 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-2 max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mx-auto">
              <UploadCloud className="w-5 h-5" />
            </div>

            <div className="text-xs">
              <span className="font-semibold text-blue-600 hover:underline">Click to upload</span> or drag and drop
              your resume PDF
            </div>

            <p className="text-[11px] text-zinc-400">PDF documents only (maximum file size 5 MB)</p>
          </div>
        </div>

        {/* Status Alerts */}
        {isUploading && (
          <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3 text-xs text-blue-800">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Analyzing resume structure with AI assistive parsing...</span>
          </div>
        )}

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

        {/* Existing / Extracted Resume Overview */}
        {resumeParsedData && (
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-600" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">
                    {resumeFileName || 'Uploaded Resume Document'}
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    Method: {resumeParsedData.extractionMethod === 'gemini' ? 'Google Gemini AI' : 'Deterministic Heuristic'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {resumeParsedData.parsedAt
                    ? new Date(resumeParsedData.parsedAt).toLocaleDateString()
                    : 'Recently Analyzed'}
                </span>
              </div>
            </div>

            {/* Strict Invariant Disclaimer */}
            <div className="p-2.5 rounded bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Note:</strong> AI extraction provides assistive drafts only. None of these items count as
                demonstrated until proven through Work Simulator missions.
              </span>
            </div>

            {/* Extracted Education Preview */}
            {resumeParsedData.extractedEducation.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-500" />
                  Extracted Education ({resumeParsedData.extractedEducation.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resumeParsedData.extractedEducation.map((ed, i) => (
                    <div key={i} className="p-2.5 bg-white rounded border border-zinc-200 text-xs">
                      <p className="font-semibold text-zinc-900">{ed.institution}</p>
                      <p className="text-zinc-600">{ed.degree} {ed.field ? `in ${ed.field}` : ''}</p>
                      {ed.graduationYear && <p className="text-[10px] text-zinc-400">Class of {ed.graduationYear}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Experience Preview */}
            {resumeParsedData.extractedExperience.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                  Extracted Experience ({resumeParsedData.extractedExperience.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resumeParsedData.extractedExperience.map((exp, i) => (
                    <div key={i} className="p-2.5 bg-white rounded border border-zinc-200 text-xs">
                      <p className="font-semibold text-zinc-900">{exp.title}</p>
                      <p className="text-zinc-600 font-medium">{exp.company}</p>
                      {exp.duration && <p className="text-[10px] text-zinc-400">{exp.duration}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Projects Preview */}
            {resumeParsedData.extractedProjects.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-zinc-500" />
                  Extracted Projects ({resumeParsedData.extractedProjects.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resumeParsedData.extractedProjects.map((proj, i) => (
                    <div key={i} className="p-2.5 bg-white rounded border border-zinc-200 text-xs">
                      <p className="font-semibold text-zinc-900">{proj.title}</p>
                      <p className="text-zinc-500 line-clamp-2 mt-0.5">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Certifications */}
            {resumeParsedData.extractedCertifications.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-zinc-500" />
                  Extracted Certifications
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {resumeParsedData.extractedCertifications.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
