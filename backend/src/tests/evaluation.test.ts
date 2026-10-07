import assert from 'assert';
import jwt from 'jsonwebtoken';
import { createApp } from '../server.js';
import { env } from '../config/env.js';
import { EvaluationService } from '../modules/evaluation/evaluation.service.js';
import { MissionService } from '../modules/mission/mission.service.js';
import { MissionAiEvaluator } from '../ai/mission-evaluator.js';
import { SkillGapService } from '../modules/skill-gap/skill-gap.service.js';
import { UserModel } from '../models/user.model.js';
import { StudentProfileModel } from '../models/studentProfile.model.js';
import { EvidenceRecordModel } from '../models/evidenceRecord.model.js';

console.log('--- Starting Milestone 5 Evidence Evaluation & Capability Verification Tests ---');

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

async function runAllTests() {
  const studentUser1 = {
    userId: '507f1f77bcf86cd799439041',
    email: 'evalstudent1@university.edu',
    name: 'Alice Evaluated',
    role: 'student',
  };

  const studentUser2 = {
    userId: '507f1f77bcf86cd799439042',
    email: 'evalstudent2@university.edu',
    name: 'Bob Evaluated',
    role: 'student',
  };

  const recruiterUser = {
    userId: '507f1f77bcf86cd799439043',
    email: 'recruiter@techcorp.com',
    name: 'Rachel Recruiter',
    role: 'recruiter',
  };

  const student1Token = jwt.sign(
    { userId: studentUser1.userId, email: studentUser1.email, role: studentUser1.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const student2Token = jwt.sign(
    { userId: studentUser2.userId, email: studentUser2.email, role: studentUser2.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const recruiterToken = jwt.sign(
    { userId: recruiterUser.userId, email: recruiterUser.email, role: recruiterUser.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  // 1. Unauthenticated evaluation returns 401
  await test('HTTP Security: Unauthenticated request to /api/student/evaluations returns 401', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/evaluations`);
      assert.strictEqual(res.status, 401);
    } finally {
      server.close();
    }
  });

  // 2. Recruiter evaluation access returns 403
  await test('HTTP Security: Recruiter role token accessing /api/student/evaluations is forbidden (403)', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/evaluations`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      assert.strictEqual(res.status, 403);
    } finally {
      server.close();
    }
  });

  // 3. Rubric Loading
  await test('Rubric: Loads versioned evaluation rubric v1.0 successfully', () => {
    const rubric = EvaluationService.loadRubric();
    assert.strictEqual(rubric.version, 'v1.0');
    const missionRubric = EvaluationService.getMissionRubric('backend-order-total-bug');
    assert.ok(missionRubric);
    assert.ok(missionRubric.deterministicCriteria.length >= 1);
    assert.ok(missionRubric.assistiveCriteria.length >= 1);
  });

  // 4. Failed test run produces failed evaluation and zero demonstrated capabilities
  await test('Evaluation: Failed test run produces finalStatus: "failed" and does not award Demonstrated', async () => {
    // Run broken code
    const brokenFiles = [{ path: 'src/calculations.js', content: 'module.exports = { calculateSubtotal: () => 0 };' }];
    await MissionService.runStudentMission(studentUser2.userId, 'backend-order-total-bug', brokenFiles);

    const evalResult = await EvaluationService.evaluateMissionSubmission(
      studentUser2.userId,
      'backend-order-total-bug',
      'My broken attempt'
    );

    assert.strictEqual(evalResult.finalStatus, 'failed');
    assert.strictEqual(evalResult.deterministic.functionalCorrectness, false);
    assert.strictEqual(evalResult.deterministic.requiredCriteriaPassed, false);
    assert.strictEqual(evalResult.capabilitiesAwarded.some((c) => c.status === 'demonstrated'), false);
  });

  // 5. All required tests pass produces finalStatus: "passed" and awards Demonstrated capabilities
  await test('Evaluation: Passing test run (3/3) produces finalStatus: "passed" and awards Demonstrated', async () => {
    const validFixedCode = `
function calculateSubtotal(items) {
  if (!Array.isArray(items)) return 0;
  return Number(items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2));
}
function applyDiscount(a, d) {
  if (a < 0 || d <= 0) return a;
  const clamped = Math.min(Math.max(d, 0), 100);
  return Number((a - a * (clamped / 100)).toFixed(2));
}
function calculateOrderTotal(i, d = 0, t = 0) {
  const s = calculateSubtotal(i);
  const disc = applyDiscount(s, d);
  return Number((disc + disc * (t / 100)).toFixed(2));
}
module.exports = { calculateSubtotal, applyDiscount, calculateOrderTotal };
`;
    await MissionService.runStudentMission(studentUser1.userId, 'backend-order-total-bug', [
      { path: 'src/calculations.js', content: validFixedCode },
    ]);

    const evalResult = await EvaluationService.evaluateMissionSubmission(
      studentUser1.userId,
      'backend-order-total-bug',
      'Fixed IEEE 754 precision issues using toFixed(2) and clamped discount boundary rates between 0 and 100.'
    );

    assert.strictEqual(evalResult.finalStatus, 'passed');
    assert.strictEqual(evalResult.deterministic.functionalCorrectness, true);
    assert.strictEqual(evalResult.deterministic.requiredCriteriaPassed, true);
    assert.strictEqual(evalResult.deterministic.testsPassed, 3);
    assert.strictEqual(evalResult.deterministic.testsTotal, 3);
    assert.ok(evalResult.capabilitiesAwarded.length >= 2);
    assert.ok(evalResult.capabilitiesAwarded.every((c) => c.status === 'demonstrated'));
    assert.ok(evalResult.capabilitiesAwarded.some((c) => c.name === 'API Development'));
  });

  // 6. Assistive Qualitative evaluation classifies explanation quality
  await test('Assistive Evaluation: Qualitatively reviews technical explanation without numeric score', async () => {
    const strongRes = MissionAiEvaluator.evaluateHeuristically({
      missionSlug: 'backend-order-total-bug',
      missionTitle: 'E-Commerce Order API Bug Fix',
      explanation: 'Diagnosed IEEE 754 floating point precision loss in accumulator. Clamped discount coupons to prevent negative discount inputs and applied toFixed(2) monetary rounding.',
      deterministicPass: true,
      passedTests: 3,
      totalTests: 3,
    });

    assert.strictEqual(strongRes.explanationQuality, 'strong');
    assert.ok(strongRes.strengths.length > 0);
    assert.strictEqual(typeof (strongRes as any).score, 'undefined'); // No numeric scores!

    const insufficientRes = MissionAiEvaluator.evaluateHeuristically({
      missionSlug: 'backend-order-total-bug',
      missionTitle: 'E-Commerce Order API Bug Fix',
      explanation: 'fixed it',
      deterministicPass: true,
      passedTests: 3,
      totalTests: 3,
    });

    assert.strictEqual(insufficientRes.explanationQuality, 'insufficient');
  });

  // 7. AI cannot override failed tests
  await test('Safety Rule: AI evaluation cannot override failed tests or make finalStatus "passed"', async () => {
    const brokenFiles = [{ path: 'src/calculations.js', content: 'module.exports = { calculateSubtotal: () => -99 };' }];
    await MissionService.runStudentMission(studentUser2.userId, 'backend-order-total-bug', brokenFiles);

    const evalResult = await EvaluationService.evaluateMissionSubmission(
      studentUser2.userId,
      'backend-order-total-bug',
      'Extremely sophisticated explanation using all engineering keywords float precision clamp discount IEEE 754.'
    );

    assert.strictEqual(evalResult.finalStatus, 'failed');
    assert.strictEqual(evalResult.deterministic.functionalCorrectness, false);
    assert.strictEqual(evalResult.capabilitiesAwarded.some((c) => c.status === 'demonstrated'), false);
  });

  // 8. Cryptographic proof and code hash
  await test('Integrity: Evaluation stores SHA-256 code hash, rubric version, and integrity signature', async () => {
    const latest = await EvaluationService.getStudentLatestEvaluation(studentUser1.userId, 'backend-order-total-bug');
    assert.ok(latest);
    assert.strictEqual(latest?.rubricVersion, 'v1.0');
    assert.strictEqual(typeof latest?.codeHash, 'string');
    assert.strictEqual(latest?.codeHash.length, 64);
    assert.strictEqual(typeof latest?.integrityHash, 'string');
    assert.strictEqual(latest?.integrityHash.length, 64);
  });

  // 9. Demonstrated capabilities reflect in Skill Gap Analysis
  await test('Skill Gap Integration: Demonstrated capability from mission appears in student Skill Gap', async () => {
    const analysis = await SkillGapService.analyzeStudentSkillGap(studentUser1.userId, 'backend-developer');
    assert.ok(analysis);
    assert.ok(analysis.summary.totalCapabilities > 0);
    assert.ok(analysis.capabilities.length > 0);
  });

  // 10. Student Isolation: Student A cannot access Student B's evaluation
  await test('Tenant Isolation: Student 1 and Student 2 evaluations are isolated', async () => {
    const s1Latest = await EvaluationService.getStudentLatestEvaluation(studentUser1.userId, 'backend-order-total-bug');
    const s2Latest = await EvaluationService.getStudentLatestEvaluation(studentUser2.userId, 'backend-order-total-bug');

    assert.ok(s1Latest);
    assert.ok(s2Latest);
    assert.strictEqual(s1Latest?.finalStatus, 'passed');
    assert.strictEqual(s2Latest?.finalStatus, 'failed');
    assert.notStrictEqual(s1Latest?.id, s2Latest?.id);
  });

  // 11. HTTP API: POST /api/student/evaluations/missions/:slug/evaluate
  await test('HTTP API: Student can trigger evaluation via POST and query GET latest evaluation', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      // 1. Post evaluation
      const evalRes = await fetch(`http://localhost:${port}/api/student/evaluations/missions/backend-order-total-bug/evaluate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student1Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technicalExplanation: 'Resolved floating point precision and rounded with toFixed(2).',
        }),
      });

      assert.strictEqual(evalRes.status, 200);
      const evalBody = await evalRes.json();
      assert.strictEqual(evalBody.success, true);
      assert.strictEqual(evalBody.data.finalStatus, 'passed');
      assert.strictEqual(evalBody.data.deterministic.functionalCorrectness, true);

      // 2. Query latest evaluation
      const getRes = await fetch(`http://localhost:${port}/api/student/evaluations/missions/backend-order-total-bug`, {
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      assert.strictEqual(getRes.status, 200);
      const getBody = await getRes.json();
      assert.strictEqual(getBody.success, true);
      assert.strictEqual(getBody.data.missionSlug, 'backend-order-total-bug');
      assert.strictEqual(getBody.data.finalStatus, 'passed');
    } finally {
      server.close();
    }
  });

  console.log(`\nMilestone 5 Tests Summary: ${passedTests}/${totalTests} passed`);
  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
