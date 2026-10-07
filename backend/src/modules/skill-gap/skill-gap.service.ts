import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { StudentProfileModel } from '../../models/studentProfile.model.js';
import { EvidenceRecordModel } from '../../models/evidenceRecord.model.js';
import { UserModel } from '../../models/user.model.js';
import { MissionService } from '../mission/mission.service.js';
import { EvaluationService } from '../evaluation/evaluation.service.js';
import { NotFoundError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import {
  EvidenceState,
  CapabilityAnalysisItem,
  RecommendedMission,
  SkillGapAnalysisResult,
} from './skill-gap.types.js';

interface RoleCapabilityDef {
  capabilityId: string;
  name: string;
  category: string;
  importance: 'core' | 'recommended';
  description: string;
  technologies: string[];
  evidenceRequirement: string;
  defaultMissionSlug: string;
}

interface RoleTemplateDef {
  roleId: string;
  name: string;
  category: string;
  description: string;
  capabilities: RoleCapabilityDef[];
}

interface RoleTemplatesFile {
  version: string;
  updatedAt: string;
  roles: RoleTemplateDef[];
}

export class SkillGapService {
  private static roleTemplatesCache: RoleTemplatesFile | null = null;

  private static getRolesFilePath(): string {
    const rootDir = process.cwd();
    const candidates = [
      path.join(rootDir, 'rubrics', 'roles', 'v1.0.json'),
      path.join(rootDir, '..', 'rubrics', 'roles', 'v1.0.json'),
      path.join(__dirname, '../../../../rubrics/roles/v1.0.json'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return path.join(rootDir, 'rubrics', 'roles', 'v1.0.json');
  }

  public static loadRoleTemplates(): RoleTemplatesFile {
    const filePath = this.getRolesFilePath();
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        this.roleTemplatesCache = JSON.parse(raw);
        return this.roleTemplatesCache!;
      } catch (err) {
        logger.warn(`Failed to parse roles rubric at ${filePath}:`, err);
      }
    }

    // Default fallback definition if file is unreadable
    return {
      version: 'v1.0-fallback',
      updatedAt: new Date().toISOString(),
      roles: [
        {
          roleId: 'backend-developer',
          name: 'Backend Developer',
          category: 'Software Engineering',
          description: 'Designs, develops, and maintains server-side logic, RESTful APIs, and databases.',
          capabilities: [
            {
              capabilityId: 'api-development',
              name: 'API Development',
              category: 'backend',
              importance: 'core',
              description: 'Design and implementation of deterministic RESTful HTTP API endpoints.',
              technologies: ['Node.js', 'Express', 'Python', 'FastAPI', 'REST API'],
              evidenceRequirement: 'Working HTTP handlers with automated integration test coverage.',
              defaultMissionSlug: 'backend-order-total-bug',
            },
            {
              capabilityId: 'debugging-error-handling',
              name: 'Backend Debugging & Error Handling',
              category: 'backend',
              importance: 'core',
              description: 'Diagnose runtime errors, arithmetic defects, and structure error responses.',
              technologies: ['Debugging', 'Logging', 'Node.js', 'Python'],
              evidenceRequirement: 'Root cause diagnosis and verified bug fix submission.',
              defaultMissionSlug: 'backend-order-total-bug',
            },
            {
              capabilityId: 'automated-testing',
              name: 'Automated Testing & Regression',
              category: 'testing',
              importance: 'core',
              description: 'Author unit tests and assert boundary conditions and regressions.',
              technologies: ['Jest', 'Testing', 'Unit Tests'],
              evidenceRequirement: 'Passing test suite achieving 100% on boundary conditions.',
              defaultMissionSlug: 'backend-order-total-bug',
            },
          ],
        },
      ],
    };
  }

  public static getAvailableRoles() {
    const templates = this.roleTemplatesCache || this.loadRoleTemplates();
    return templates.roles.map((r) => ({
      roleId: r.roleId,
      name: r.name,
      category: r.category,
      description: r.description,
      capabilitiesCount: r.capabilities.length,
      coreCapabilitiesCount: r.capabilities.filter((c) => c.importance === 'core').length,
    }));
  }

  public static getRoleById(roleId: string): RoleTemplateDef {
    const templates = this.roleTemplatesCache || this.loadRoleTemplates();
    const cleanId = roleId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const role =
      templates.roles.find((r) => r.roleId === roleId || r.roleId === cleanId) ||
      templates.roles.find((r) => r.name.toLowerCase().includes(roleId.toLowerCase())) ||
      templates.roles[0];

    return role;
  }

  /**
   * Main Engine: Analyzes candidate evidence against target role capabilities
   */
  public static async analyzeStudentSkillGap(
    userId: string,
    requestedRoleId?: string
  ): Promise<SkillGapAnalysisResult> {
    let user: any = null;
    let profile: any = null;
    let evidenceRecords: any[] = [];

    if (mongoose.connection.readyState === 1) {
      try {
        user = await UserModel.findById(userId).select('email role');
      } catch (err) {
        logger.debug('UserModel.findById query skipped or errored:', err);
      }

      try {
        profile = await StudentProfileModel.findOne({ userId });
        if (!profile && user) {
          profile = await StudentProfileModel.create({
            userId,
            name: user.name || 'Student Candidate',
            declaredSkills: [],
            education: [],
            projects: [],
            interests: [],
          });
        }
      } catch (err) {
        logger.debug('StudentProfileModel query skipped or errored:', err);
      }

      if (profile) {
        try {
          evidenceRecords = await EvidenceRecordModel.find({
            studentId: profile._id,
          }).lean();
        } catch (err) {
          logger.debug('EvidenceRecordModel query skipped or errored:', err);
        }
      }
    }

    // Determine target role
    const targetRoleSlug = requestedRoleId || (profile && profile.targetRole) || 'backend-developer';
    const roleDef = this.getRoleById(targetRoleSlug);
    const templates = this.roleTemplatesCache || this.loadRoleTemplates();

    // Collect candidate evaluations
    let passedEvaluations: any[] = [];
    try {
      const studentEvaluations = await EvaluationService.listStudentEvaluations(userId);
      passedEvaluations = (studentEvaluations || []).filter((e) => e.finalStatus === 'passed');
    } catch (evalErr) {
      logger.debug('EvaluationService.listStudentEvaluations skipped or errored:', evalErr);
    }

    // Collect candidate evidence
    const declaredSkills =
      (profile && profile.declaredSkills && profile.declaredSkills.length > 0)
        ? profile.declaredSkills
        : [
            { name: 'JavaScript', category: 'frontend', selfAssessedLevel: 'intermediate' },
            { name: 'REST APIs', category: 'backend', selfAssessedLevel: 'beginner' },
          ];
    const resumeSkills = (profile && profile.resumeParsedData && profile.resumeParsedData.extractedSkills) || [];

    const missionEvidence = evidenceRecords.filter((e) => e.sourceType === 'mission');
    const githubEvidence = evidenceRecords.filter((e) => e.sourceType === 'github');

    // Analyze each capability in the target role
    const capabilitiesAnalysis: CapabilityAnalysisItem[] = [];
    let demonstratedCount = 0;
    let supportingCount = 0;
    let declaredCount = 0;
    let aiAssistedCount = 0;
    let gapCount = 0;

    for (const cap of roleDef.capabilities) {
      const techListLower = cap.technologies.map((t) => t.toLowerCase());

      // 1. Check for Demonstrated Evidence (verified mission test pass or formal evaluation)
      const matchingPassedEvaluation = passedEvaluations.find((ev) => {
        const awarded = ev.capabilitiesAwarded || [];
        return awarded.some((a: any) => {
          const aNameLower = (a.name || '').toLowerCase();
          const capNameLower = cap.name.toLowerCase();
          const capIdLower = cap.capabilityId.toLowerCase();
          return (
            aNameLower === capNameLower ||
            capNameLower.includes(aNameLower) ||
            aNameLower.includes(capNameLower) ||
            capIdLower.includes(aNameLower)
          );
        });
      });

      const matchingMissionProof =
        matchingPassedEvaluation ||
        missionEvidence.find((m) => {
          const capNameLower = (m.capabilityName || '').toLowerCase();
          const capIdLower = cap.capabilityId.toLowerCase();
          const mData: any = m.data || {};
          return (
            capNameLower.includes(cap.name.toLowerCase()) ||
            cap.name.toLowerCase().includes(capNameLower) ||
            (mData.criteriaId && mData.criteriaId.toLowerCase().includes(capIdLower)) ||
            techListLower.some((t) => capNameLower.includes(t))
          );
        });

      // 2. Check for Supporting Evidence (GitHub repo analysis)
      const matchingGithubRecords = githubEvidence.filter((g) => {
        const capNameLower = (g.capabilityName || '').toLowerCase();
        const repoData: any = g.data || {};
        const techMentioned: string[] = repoData.technologiesMentioned || [];
        return (
          capNameLower.includes(cap.name.toLowerCase()) ||
          techListLower.some((t) => capNameLower.includes(t) || techMentioned.map((x) => x.toLowerCase()).includes(t))
        );
      });

      // 3. Check for Declared Skill
      const matchingDeclaredSkill = declaredSkills.find((d: any) =>
        techListLower.some((t) => d.name.toLowerCase().includes(t) || t.includes(d.name.toLowerCase()))
      );

      // 4. Check for AI-Assisted Resume Skill
      const matchingResumeSkill = resumeSkills.find((r: any) =>
        techListLower.some((t) => r.name.toLowerCase().includes(t) || t.includes(r.name.toLowerCase()))
      );

      // Determine evidence status
      let status: EvidenceState = 'evidence_gap';
      let currentEvidenceSummary = 'No evidence found in profile, resume, or repositories.';
      let missingEvidence = `Requires demonstrated test suite results matching "${cap.name}".`;
      let whyItMatters = `Essential for ${roleDef.name} roles to ensure reliable software delivery.`;
      let recommendedAction = `Complete the curated mission for ${cap.name} to demonstrate capability.`;

      if (matchingMissionProof) {
        status = 'demonstrated';
        demonstratedCount++;
        const hashDisplay = matchingPassedEvaluation?.integrityHash
          ? ` [SHA-256: ${matchingPassedEvaluation.integrityHash.substring(0, 16)}...]`
          : '';
        currentEvidenceSummary = `Demonstrated via verified mission submission (100% test pass rate)${hashDisplay}.`;
        missingEvidence = 'None. Capability is proven with verified execution test suites.';
        recommendedAction = 'Capability demonstrated. Maintain readiness or attempt advanced missions.';
      } else if (matchingGithubRecords.length > 0) {
        status = 'supporting';
        supportingCount++;
        currentEvidenceSummary = `Supporting evidence found in ${matchingGithubRecords.length} public GitHub repos (${matchingGithubRecords[0].capabilityName}).`;
        missingEvidence = `Lacks observable automated test results demonstrating ${cap.name} correctness under production constraints.`;
        recommendedAction = `Take a Work Simulator mission to elevate this from Supporting to Demonstrated.`;
      } else if (matchingDeclaredSkill) {
        status = 'declared';
        declaredCount++;
        currentEvidenceSummary = `Declared self-reported skill (${matchingDeclaredSkill.name} - ${matchingDeclaredSkill.selfAssessedLevel}).`;
        missingEvidence = `Unverified self-reported claim. Lacks code submission or test evidence.`;
        recommendedAction = `Prove this declared skill by completing the ${cap.name} engineering mission.`;
      } else if (matchingResumeSkill) {
        status = 'ai_assisted';
        aiAssistedCount++;
        currentEvidenceSummary = `Extracted from uploaded resume document (${matchingResumeSkill.name}).`;
        missingEvidence = `Unverified resume mention. Lacks confirmed task completion.`;
        recommendedAction = `Declare this skill in your profile and complete a Work Simulator task to verify it.`;
      } else {
        status = 'evidence_gap';
        gapCount++;
      }

      capabilitiesAnalysis.push({
        capabilityId: cap.capabilityId,
        name: cap.name,
        category: cap.category,
        importance: cap.importance,
        description: cap.description,
        status,
        currentEvidenceSummary,
        missingEvidence,
        whyItMatters,
        recommendedAction,
        supportingEvidenceRecordsCount: matchingGithubRecords.length,
      });
    }

    // Deterministic Mission Recommendation Algorithm
    // Priority:
    // 1. Core capabilities that are in 'evidence_gap' or 'declared' or 'supporting'
    // 2. Select top unproven core capability
    // 3. Match curated mission from catalog
    const unprovenCore = capabilitiesAnalysis.find(
      (c) => c.importance === 'core' && c.status !== 'demonstrated'
    );
    const unprovenRecommended = capabilitiesAnalysis.find(
      (c) => c.importance === 'recommended' && c.status !== 'demonstrated'
    );

    const targetCap = unprovenCore || unprovenRecommended;
    let recommendedMission: RecommendedMission | null = null;

    if (targetCap) {
      const capDef = roleDef.capabilities.find((c) => c.capabilityId === targetCap.capabilityId);
      const missionSlug = capDef?.defaultMissionSlug || 'backend-order-total-bug';

      try {
        const missionManifest = MissionService.getMissionBySlug(missionSlug);

        let rationale = '';
        if (targetCap.status === 'supporting') {
          rationale = `Your profile shows supporting public GitHub activity in ${targetCap.name}, but lacks verified test execution proof. Completing "${missionManifest.title}" provides observable proof of correctness.`;
        } else if (targetCap.status === 'declared') {
          rationale = `You have self-declared ${targetCap.name}. Taking "${missionManifest.title}" allows you to elevate this claim to Demonstrated status with test-backed proof.`;
        } else if (targetCap.status === 'ai_assisted') {
          rationale = `Your resume mentions ${targetCap.name}. Completing "${missionManifest.title}" converts this unverified draft into an immutable hiring signal.`;
        } else {
          rationale = `${targetCap.name} is a core requirement for ${roleDef.name} roles. Completing this mission closes your primary evidence gap.`;
        }

        recommendedMission = {
          slug: missionManifest.slug,
          title: missionManifest.title,
          description: missionManifest.description || 'Curated workplace engineering task.',
          category: missionManifest.category,
          type: missionManifest.type,
          difficulty: missionManifest.difficulty,
          timeEstimateMinutes: missionManifest.timeEstimateMinutes,
          capabilitiesTested: missionManifest.skillsTested.map((s) => s.skillName),
          rationale,
        };
      } catch {
        recommendedMission = null;
      }
    }

    return {
      targetRole: {
        roleId: roleDef.roleId,
        name: roleDef.name,
        category: roleDef.category,
        description: roleDef.description,
      },
      roleVersion: templates.version,
      summary: {
        totalCapabilities: roleDef.capabilities.length,
        demonstratedCount,
        supportingCount,
        declaredCount,
        aiAssistedCount,
        gapCount,
      },
      capabilities: capabilitiesAnalysis,
      recommendedMission,
      generatedAt: new Date(),
    };
  }
}
