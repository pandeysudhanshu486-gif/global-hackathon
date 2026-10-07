import assert from 'assert';
import jwt from 'jsonwebtoken';
import { createApp } from '../server.js';
import { env } from '../config/env.js';
import { MissionService } from '../modules/mission/mission.service.js';
import { runMissionSchema, submitMissionSchema } from '../modules/mission/mission.validation.js';
import { computeSha256 } from '../shared/hash.js';

console.log('--- Starting Milestone 4 Work Simulator & Secure Execution Tests ---');

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
    userId: '507f1f77bcf86cd799439031',
    email: 'student1@university.edu',
    name: 'Alice Builder',
    role: 'student',
  };

  const studentUser2 = {
    userId: '507f1f77bcf86cd799439032',
    email: 'student2@university.edu',
    name: 'Bob Student',
    role: 'student',
  };

  const recruiterUser = {
    userId: '507f1f77bcf86cd799439033',
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

  // 1. Unauthenticated mission access returns 401
  await test('HTTP Security: Unauthenticated request to GET /api/student/missions/backend-order-total-bug returns 401', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/missions/backend-order-total-bug`);
      assert.strictEqual(res.status, 401);
    } finally {
      server.close();
    }
  });

  // 2. Recruiter mission access returns 403 Forbidden
  await test('HTTP Security: Recruiter token accessing GET /api/student/missions/backend-order-total-bug is forbidden (403)', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/missions/backend-order-total-bug`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      assert.strictEqual(res.status, 403);
    } finally {
      server.close();
    }
  });

  // 3. Unknown mission returns 404
  await test('Mission Catalog: Request for unknown mission returns 404', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/missions/non-existent-mission-slug`, {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert.strictEqual(res.status, 404);
    } finally {
      server.close();
    }
  });

  // 4. Student can open their own mission workspace
  await test('Mission Workspace: Student can open valid mission and receive starter files', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const res = await fetch(`http://localhost:${port}/api/student/missions/backend-order-total-bug`, {
        headers: { Authorization: `Bearer ${student1Token}` },
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.mission.slug, 'backend-order-total-bug');
      assert.ok(body.data.files.length > 0, 'Must have workspace files');
      assert.ok(body.data.files.some((f: any) => f.path.includes('calculations.js')));
      assert.ok(body.data.mission.description.length > 0);
    } finally {
      server.close();
    }
  });

  // 5. Tenant isolation: Student A cannot access or mutate Student B's session
  await test('Tenant Isolation: Mission sessions are isolated per student ID', async () => {
    const session1 = await MissionService.getOrCreateSession(studentUser1.userId, 'backend-order-total-bug');
    const session2 = await MissionService.getOrCreateSession(studentUser2.userId, 'backend-order-total-bug');

    assert.strictEqual(session1.userId, studentUser1.userId);
    assert.strictEqual(session2.userId, studentUser2.userId);
    assert.notStrictEqual(session1._id?.toString(), session2._id?.toString());
  });

  // 6. Invalid file payload rejected by schema
  await test('Validation: Empty files payload is rejected with 422', () => {
    const invalid = runMissionSchema.body.safeParse({ files: [] });
    assert.strictEqual(invalid.success, false);
  });

  // 7. Path traversal rejected
  await test('Security: Path traversal attempt in file path is rejected', async () => {
    const traversalPayload = [
      { path: '../../etc/passwd', content: 'malicious code' },
      { path: '/etc/shadow', content: 'malicious code' },
      { path: 'src/../../../evil.js', content: 'malicious' },
    ];

    for (const file of traversalPayload) {
      try {
        await MissionService.runStudentMission(studentUser1.userId, 'backend-order-total-bug', [file]);
        assert.fail(`Should have thrown BadRequestError for path traversal: ${file.path}`);
      } catch (err: any) {
        assert.ok(err.message.includes('Path traversal') || err.message.includes('Security violation'));
      }
    }
  });

  // 8. Unexpected file rejected
  await test('Security: Unexpected arbitrary file is rejected', async () => {
    try {
      await MissionService.runStudentMission(studentUser1.userId, 'backend-order-total-bug', [
        { path: 'src/unauthorized_executable.sh', content: '#!/bin/bash\nrm -rf /' },
      ]);
      assert.fail('Should have rejected unauthorized file');
    } catch (err: any) {
      assert.ok(err.message.includes('Unexpected file') || err.message.includes('not allowed'));
    }
  });

  // 9. Run request reaches execution service and executes starter code
  await test('Execution Service: Running default starter code returns actual test output and failure count', async () => {
    const starterFiles = MissionService.getStarterFiles('backend-order-total-bug');
    const result = await MissionService.runStudentMission(
      studentUser1.userId,
      'backend-order-total-bug',
      starterFiles
    );

    assert.ok(result.runId.startsWith('run_'));
    assert.ok(['completed', 'failed'].includes(result.status));
    assert.ok(typeof result.passed === 'number');
    assert.ok(typeof result.total === 'number');
    assert.ok(result.tests.length > 0);
    assert.ok(result.duration > 0);
  });

  // 10. Fixing calculations.js passes 100% of test assertions
  await test('Execution Service: Corrected solution passes all test assertions (3/3)', async () => {
    const fixedCalculationsCode = `
/**
 * Fixed Order Calculation Module
 */
function calculateSubtotal(items) {
  if (!Array.isArray(items)) return 0;
  let total = 0;
  for (const item of items) {
    if (item && typeof item.price === 'number' && typeof item.quantity === 'number') {
      total += item.price * item.quantity;
    }
  }
  return Number(total.toFixed(2));
}

function applyDiscount(amount, discountPercent) {
  if (typeof amount !== 'number' || amount < 0) return 0;
  if (typeof discountPercent !== 'number' || discountPercent <= 0) return amount;
  const clampedDiscount = Math.min(Math.max(discountPercent, 0), 100);
  const discountAmount = amount * (clampedDiscount / 100);
  return Number((amount - discountAmount).toFixed(2));
}

function calculateOrderTotal(items, discountPercent = 0, taxPercent = 0) {
  const subtotal = calculateSubtotal(items);
  const discounted = applyDiscount(subtotal, discountPercent);
  const tax = discounted * (Math.max(taxPercent, 0) / 100);
  return Number((discounted + tax).toFixed(2));
}

module.exports = {
  calculateSubtotal,
  applyDiscount,
  calculateOrderTotal,
};
`;

    const fixedFiles = [
      { path: 'src/calculations.js', content: fixedCalculationsCode },
      { path: 'package.json', content: '{"name":"starter","version":"1.0.0"}' },
    ];

    const result = await MissionService.runStudentMission(
      studentUser1.userId,
      'backend-order-total-bug',
      fixedFiles
    );

    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.passed, 3);
    assert.strictEqual(result.failed, 0);
    assert.strictEqual(result.total, 3);
    assert.strictEqual(result.tests.every((t) => t.status === 'passed'), true);
  });

  // 11. Failing test is represented accurately
  await test('Execution Service: Broken implementation correctly reports failures', async () => {
    const brokenCode = `
function calculateSubtotal() { return 0; }
function applyDiscount() { return 0; }
function calculateOrderTotal() { return 0; }
module.exports = { calculateSubtotal, applyDiscount, calculateOrderTotal };
`;
    const result = await MissionService.runStudentMission(
      studentUser1.userId,
      'backend-order-total-bug',
      [{ path: 'src/calculations.js', content: brokenCode }]
    );

    assert.strictEqual(result.status, 'failed');
    assert.ok(result.failed > 0);
  });

  // 12. Host secrets and internal paths are stripped from output
  await test('Security: No host environment secrets or internal filesystem leaks in output', async () => {
    const starterFiles = MissionService.getStarterFiles('backend-order-total-bug');
    const result = await MissionService.runStudentMission(
      studentUser1.userId,
      'backend-order-total-bug',
      starterFiles
    );

    assert.strictEqual(result.stdout.includes(env.JWT_ACCESS_SECRET), false);
    assert.strictEqual(result.stdout.includes(env.EXECUTION_SECRET), false);
    assert.strictEqual(result.stdout.includes('/Users/'), false);
  });

  // 13. Client cannot forge passed=true on submit without running passing tests
  await test('Submission Rule: Rejects submission attempt when latest tests failed or unrun', async () => {
    // Reset session with failed code
    const brokenCode = `module.exports = { calculateSubtotal: () => -999, applyDiscount: () => 0, calculateOrderTotal: () => 0 };`;
    await MissionService.runStudentMission(
      studentUser2.userId,
      'backend-order-total-bug',
      [{ path: 'src/calculations.js', content: brokenCode }]
    );

    try {
      await MissionService.submitStudentMission(
        studentUser2.userId,
        'backend-order-total-bug',
        'Attempting to submit without passing tests'
      );
      assert.fail('Should have rejected submission with failing tests');
    } catch (err: any) {
      assert.ok(err.message.includes('Cannot submit mission without passing all required test assertions'));
    }
  });

  // 14. Successful submission creates SHA-256 integrity-hashed Demonstrated evidence
  await test('Evidence Generation: Passing submission creates verified SHA-256 cryptographic evidence', async () => {
    // 1. Run fixed solution for student1
    const fixedCalculationsCode = `
function calculateSubtotal(items) {
  if (!Array.isArray(items)) return 0;
  return Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
}
function applyDiscount(amount, discountPercent) {
  if (amount < 0 || discountPercent <= 0) return amount;
  return Number((amount - amount * (discountPercent / 100)).toFixed(2));
}
function calculateOrderTotal(items, discountPercent = 0, taxPercent = 0) {
  const subtotal = calculateSubtotal(items);
  const discounted = applyDiscount(subtotal, discountPercent);
  const tax = discounted * (taxPercent / 100);
  return Number((discounted + tax).toFixed(2));
}
module.exports = { calculateSubtotal, applyDiscount, calculateOrderTotal };
`;
    await MissionService.runStudentMission(studentUser1.userId, 'backend-order-total-bug', [
      { path: 'src/calculations.js', content: fixedCalculationsCode },
    ]);

    // 2. Submit mission
    const subResult = await MissionService.submitStudentMission(
      studentUser1.userId,
      'backend-order-total-bug',
      'Fixed IEEE 754 precision loss with toFixed(2) monetary accumulator and coupon boundary clamping.'
    );

    assert.strictEqual(subResult.success, true);
    assert.strictEqual(subResult.status, 'submitted');
    assert.strictEqual(typeof subResult.integrityHash, 'string');
    assert.strictEqual(subResult.integrityHash.length, 64); // SHA-256 hex length

    // Check session status
    const status = await MissionService.getStudentMissionStatus(studentUser1.userId, 'backend-order-total-bug');
    assert.strictEqual(status.status, 'submitted');
    assert.strictEqual(status.hasPassedTests, true);
    assert.strictEqual(status.integrityHash, subResult.integrityHash);
  });

  // 15. HTTP API full end-to-end run and submit check
  await test('HTTP API: End-to-end run and submit through Express endpoints', async () => {
    const app = createApp();
    const server = app.listen(0);
    const port = (server.address() as any).port;

    try {
      const fixedCalculationsCode = `
function calculateSubtotal(items) { return Number(items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)); }
function applyDiscount(a, d) { return Number((a - a * (d / 100)).toFixed(2)); }
function calculateOrderTotal(i, d = 0, t = 0) { const s = calculateSubtotal(i); const disc = applyDiscount(s, d); return Number((disc + disc * (t / 100)).toFixed(2)); }
module.exports = { calculateSubtotal, applyDiscount, calculateOrderTotal };
`;

      // 1. Run tests via POST /api/student/missions/backend-order-total-bug/run
      const runRes = await fetch(`http://localhost:${port}/api/student/missions/backend-order-total-bug/run`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student1Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: [{ path: 'src/calculations.js', content: fixedCalculationsCode }],
        }),
      });

      assert.strictEqual(runRes.status, 200);
      const runBody = await runRes.json();
      assert.strictEqual(runBody.success, true);
      assert.strictEqual(runBody.data.status, 'completed');
      assert.strictEqual(runBody.data.passed, 3);

      // 2. Submit via POST /api/student/missions/backend-order-total-bug/submit
      const subRes = await fetch(`http://localhost:${port}/api/student/missions/backend-order-total-bug/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student1Token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technicalExplanation: 'Resolved floating-point precision issue with monetary rounding.',
        }),
      });

      assert.strictEqual(subRes.status, 200);
      const subBody = await subRes.json();
      assert.strictEqual(subBody.success, true);
      assert.strictEqual(subBody.data.status, 'submitted');
      assert.ok(subBody.data.integrityHash.length === 64);
    } finally {
      server.close();
    }
  });

  console.log(`\nMilestone 4 Tests Summary: ${passedTests}/${totalTests} passed`);
  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
