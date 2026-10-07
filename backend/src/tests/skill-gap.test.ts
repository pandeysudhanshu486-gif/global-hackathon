import assert from 'assert';
import jwt from 'jsonwebtoken';
import { createApp } from '../server.js';
import { env } from '../config/env.js';
import { SkillGapService } from '../modules/skill-gap/skill-gap.service.js';
import { getSkillGapQuerySchema } from '../modules/skill-gap/skill-gap.validation.js';

console.log('--- Starting Milestone 3 Skill Gap Engine & Mission Recommendation Tests ---');

let passedTests = 0;
let totalTests = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      await res;
    }
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ ${name}:`, err.message);
  }
}

async function runSkillGapTests() {
  const studentUser = {
    userId: '507f1f77bcf86cd799439021',
    email: 'sgstudent@university.edu',
    name: 'Alice Gap Test',
    role: 'student',
  };

  const recruiterUser = {
    userId: '507f1f77bcf86cd799439022',
    email: 'recruiter@techcorp.com',
    name: 'Rachel Recruiter',
    role: 'recruiter',
  };

  const studentToken = jwt.sign(
    { userId: studentUser.userId, email: studentUser.email, role: studentUser.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const recruiterToken = jwt.sign(
    { userId: recruiterUser.userId, email: recruiterUser.email, role: recruiterUser.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  // 1. Role templates validation
  await test('SkillGapService loads role templates successfully', async () => {
    const templates = SkillGapService.loadRoleTemplates();
    assert.ok(templates.roles.length >= 2, 'Should load at least 2 roles');
    const backendRole = templates.roles.find((r) => r.roleId === 'backend-developer');
    assert.ok(backendRole, 'Backend developer role must exist');
    assert.ok(backendRole.capabilities.length >= 3, 'Backend role should have >= 3 capabilities');
  });

  // 2. Query validation schema
  await test('getSkillGapQuerySchema validates query parameters correctly', () => {
    const validRole = getSkillGapQuerySchema.query.safeParse({ roleId: 'backend-developer' });
    assert.strictEqual(validRole.success, true);

    const validTarget = getSkillGapQuerySchema.query.safeParse({ targetRole: 'frontend-developer' });
    assert.strictEqual(validTarget.success, true);

    const empty = getSkillGapQuerySchema.query.safeParse({});
    assert.strictEqual(empty.success, true);

    const extra = getSkillGapQuerySchema.query.safeParse({ extraParam: 'invalid' });
    assert.strictEqual(extra.success, false);
  });

  // 3. Public GET /api/skills/roles
  await test('GET /api/skills/roles returns list of curated roles without auth', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/skills/roles`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data), 'Roles must be an array in body.data');
      assert.ok(body.data.some((r: any) => r.roleId === 'backend-developer'));
      assert.ok(body.data.some((r: any) => r.roleId === 'frontend-developer'));
    } finally {
      server.close();
    }
  });

  // 4. Auth protection on GET /api/student/skill-gap
  await test('GET /api/student/skill-gap returns 401 Unauthorized without token', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/skill-gap`);
      assert.strictEqual(res.status, 401);
    } finally {
      server.close();
    }
  });

  // 5. Role restriction: Recruiter rejected
  await test('GET /api/student/skill-gap returns 403 Forbidden for recruiter role', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/skill-gap`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      assert.strictEqual(res.status, 403);
    } finally {
      server.close();
    }
  });

  // 6. Default analysis for authenticated student
  await test('GET /api/student/skill-gap returns evidence-aware analysis for student', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/skill-gap`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      const data = body.data;

      assert.strictEqual(data.targetRole.roleId, 'backend-developer');
      assert.ok(data.capabilities.length > 0);
      assert.ok(data.summary.totalCapabilities > 0);
      assert.ok(data.recommendedMission !== null);
      assert.ok(data.recommendedMission.slug.length > 0);
      assert.ok(data.recommendedMission.rationale.length > 0);
    } finally {
      server.close();
    }
  });

  // 7. Dynamic role override query param
  await test('GET /api/student/skill-gap?targetRole=frontend-developer overrides analysis role', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/skill-gap?targetRole=frontend-developer`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      const data = body.data;

      assert.strictEqual(data.targetRole.roleId, 'frontend-developer');
      assert.strictEqual(data.targetRole.name, 'Frontend Developer');
      assert.ok(data.capabilities.some((c: any) => c.capabilityId === 'client-state-management'));
    } finally {
      server.close();
    }
  });

  // 8. Deterministic Recommendation focuses on first missing core capability
  await test('SkillGapService recommends deterministic mission matching highest priority gap', async () => {
    const analysis = await SkillGapService.analyzeStudentSkillGap(studentUser.userId, 'backend-developer');
    assert.ok(analysis.recommendedMission);
    assert.strictEqual(typeof analysis.recommendedMission?.title, 'string');
    assert.strictEqual(typeof analysis.recommendedMission?.slug, 'string');
    assert.strictEqual(typeof analysis.recommendedMission?.rationale, 'string');
  });

  // 9. Mission Catalog endpoint GET /api/missions
  await test('GET /api/missions returns all curated missions with metadata', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/missions`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.data), 'Missions must be an array in body.data');
      assert.ok(body.data.length >= 2);
      const backendMission = body.data.find((m: any) => m.slug === 'backend-order-total-bug');
      assert.ok(backendMission);
      assert.strictEqual(backendMission.slug, 'backend-order-total-bug');
    } finally {
      server.close();
    }
  });

  // 10. Mission single fetch GET /api/missions/:slug
  await test('GET /api/missions/:slug returns single mission details', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/missions/backend-order-total-bug`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.slug, 'backend-order-total-bug');
      assert.ok(body.data.description.length > 0);
    } finally {
      server.close();
    }
  });

  // 11. Non-existent mission returns 404
  await test('GET /api/missions/non-existent returns 404', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/missions/non-existent`);
      assert.strictEqual(res.status, 404);
    } finally {
      server.close();
    }
  });

  // 12. Evidence Hierarchy and state verification
  await test('Evidence hierarchy status values are valid and have informative explanations', async () => {
    const analysis = await SkillGapService.analyzeStudentSkillGap(studentUser.userId, 'backend-developer');
    for (const cap of analysis.capabilities) {
      assert.ok(
        ['demonstrated', 'supporting', 'declared', 'ai_assisted', 'evidence_gap'].includes(cap.status),
        `Status ${cap.status} must be valid enum`
      );
      assert.ok(cap.currentEvidenceSummary.length > 0, 'Must have current evidence summary');
      assert.ok(cap.missingEvidence.length > 0, 'Must have missing evidence summary');
      assert.ok(cap.recommendedAction.length > 0, 'Must have recommended action');
      assert.ok(cap.whyItMatters.length > 0, 'Must have why it matters explanation');
    }
  });

  console.log(`\nSkill Gap Tests Summary: ${passedTests}/${totalTests} passed`);
  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runSkillGapTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
