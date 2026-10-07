import fs from 'fs';
import { GeminiClient } from './gemini.client.js';
import { IResumeParsedData } from '../models/studentProfile.model.js';
import { logger } from '../shared/logger.js';

interface RawExtractedData {
  skills?: Array<{ name: string; category?: string }>;
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationYear?: number;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    duration?: string;
    description?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string[];
  }>;
  certifications?: string[];
}

const KNOWN_SKILLS_DICTIONARY: Record<string, string> = {
  javascript: 'frontend',
  typescript: 'frontend',
  react: 'frontend',
  'react.js': 'frontend',
  vue: 'frontend',
  'vue.js': 'frontend',
  angular: 'frontend',
  html: 'frontend',
  css: 'frontend',
  tailwind: 'frontend',
  'node.js': 'backend',
  node: 'backend',
  express: 'backend',
  'express.js': 'backend',
  python: 'backend',
  django: 'backend',
  flask: 'backend',
  fastapi: 'backend',
  java: 'backend',
  'spring boot': 'backend',
  golang: 'backend',
  go: 'backend',
  rust: 'backend',
  c: 'backend',
  'c++': 'backend',
  'c#': 'backend',
  '.net': 'backend',
  mongodb: 'database',
  postgres: 'database',
  postgresql: 'database',
  mysql: 'database',
  redis: 'database',
  sqlite: 'database',
  docker: 'devops',
  kubernetes: 'devops',
  aws: 'devops',
  gcp: 'devops',
  azure: 'devops',
  git: 'devops',
  github: 'devops',
  jest: 'testing',
  mocha: 'testing',
  cypress: 'testing',
  playwright: 'testing',
  testing: 'testing',
  graphql: 'backend',
  'rest api': 'backend',
  'restful apis': 'backend',
};

const escapeRegex = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export class ResumeAnalyzer {
  private static RESUME_PROMPT = `
You are an assistive technical resume extraction engine for WorkProof AI.
Analyze the attached PDF resume and extract structured profile information.

STRICT EXTRACTION RULES:
1. Extract ONLY information explicitly present in the document. Do not invent or infer missing details.
2. Categorize skills into: frontend, backend, database, testing, devops, architecture, general.
3. If an item is not present, return an empty array for that section.
4. Output must match this exact JSON schema:

{
  "skills": [
    { "name": "string", "category": "frontend|backend|database|testing|devops|architecture|general" }
  ],
  "education": [
    { "institution": "string", "degree": "string", "field": "string", "graduationYear": 2025 }
  ],
  "experience": [
    { "title": "string", "company": "string", "duration": "string", "description": "string" }
  ],
  "projects": [
    { "title": "string", "description": "string", "technologies": ["string"] }
  ],
  "certifications": ["string"]
}
`;

  /**
   * Deterministic fallback extractor parsing PDF stream text chunks & keyword tokens
   */
  public static extractFromBufferFallback(buffer: Buffer): RawExtractedData {
    // Extract raw textual strings from PDF stream
    const rawText = buffer
      .toString('latin1')
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .toLowerCase();

    const extractedSkills: Array<{ name: string; category: string }> = [];
    const seenSkills = new Set<string>();

    for (const [skillKey, category] of Object.entries(KNOWN_SKILLS_DICTIONARY)) {
      const escaped = escapeRegex(skillKey);
      const regex = new RegExp(`(^|[^a-zA-Z0-9_+#])${escaped}([^a-zA-Z0-9_+#]|$)`, 'i');
      if (regex.test(rawText) && !seenSkills.has(skillKey)) {
        seenSkills.add(skillKey);
        extractedSkills.push({
          name: skillKey.charAt(0).toUpperCase() + skillKey.slice(1),
          category,
        });
      }
    }

    return {
      skills: extractedSkills,
      education: [],
      experience: [],
      projects: [],
      certifications: [],
    };
  }

  /**
   * Parses a PDF resume using Gemini (with deterministic heuristic fallback)
   */
  public static async analyzeResume(filePath: string): Promise<IResumeParsedData> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      let rawData: RawExtractedData | null = null;
      let method: 'gemini' | 'heuristic_fallback' = 'gemini';

      if (GeminiClient.isConfigured()) {
        const base64Pdf = fileBuffer.toString('base64');
        rawData = await GeminiClient.generateJson<RawExtractedData>(this.RESUME_PROMPT, {
          mimeType: 'application/pdf',
          data: base64Pdf,
        });
      }

      if (!rawData) {
        logger.info('Using deterministic heuristic fallback for resume parsing');
        rawData = this.extractFromBufferFallback(fileBuffer);
        method = 'heuristic_fallback';
      }

      // Structure and sanitize parsed output
      const result: IResumeParsedData = {
        extractedSkills: Array.isArray(rawData.skills)
          ? rawData.skills.map((s) => ({
              name: String(s.name || '').trim(),
              category: s.category || 'general',
            })).filter((s) => s.name.length > 0)
          : [],
        extractedExperience: Array.isArray(rawData.experience)
          ? rawData.experience.map((e) => ({
              title: String(e.title || '').trim(),
              company: String(e.company || '').trim(),
              duration: e.duration,
              description: e.description,
            })).filter((e) => e.title.length > 0 && e.company.length > 0)
          : [],
        extractedEducation: Array.isArray(rawData.education)
          ? rawData.education.map((ed) => ({
              institution: String(ed.institution || '').trim(),
              degree: String(ed.degree || '').trim(),
              field: ed.field,
              graduationYear: typeof ed.graduationYear === 'number' ? ed.graduationYear : undefined,
            })).filter((ed) => ed.institution.length > 0)
          : [],
        extractedProjects: Array.isArray(rawData.projects)
          ? rawData.projects.map((p) => ({
              title: String(p.title || '').trim(),
              description: String(p.description || '').trim(),
              technologies: Array.isArray(p.technologies) ? p.technologies : [],
            })).filter((p) => p.title.length > 0)
          : [],
        extractedCertifications: Array.isArray(rawData.certifications)
          ? rawData.certifications.map((c) => String(c).trim()).filter(Boolean)
          : [],
        extractionMethod: method,
        parsedAt: new Date(),
        verified: false, // Invariant: AI extraction is strictly unverified assistive context
      };

      return result;
    } catch (err: any) {
      logger.error('ResumeAnalyzer failed:', err);
      return {
        extractedSkills: [],
        extractedExperience: [],
        extractedEducation: [],
        extractedProjects: [],
        extractedCertifications: [],
        extractionMethod: 'heuristic_fallback',
        parsedAt: new Date(),
        verified: false,
      };
    }
  }
}
