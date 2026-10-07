import assert from 'assert';
import jwt from 'jsonwebtoken';
import { createApp } from '../server.js';
import { env } from '../config/env.js';
import { OpportunityService } from '../modules/opportunity/opportunity.service.js';

console.log('--- Starting Hackathon Track: Tech Employment for Youth (Opportunities & Apprenticeships) Tests ---');

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✓ ${name}`);
          passedTests++;
        })
        .catch((err) => {
          console.error(`  ✗ ${name}:`, err.message);
        });
    }
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ ${name}:`, err.message);
  }
}

async function runAllTests() {
  // Test 1: Public opportunities catalog listing
  await test('Public Catalog: Returns curated youth jobs and apprenticeships', async () => {
    const all = await OpportunityService.listPublicOpportunities();
    assert.ok(Array.isArray(all));
    assert.ok(all.length >= 4, 'Should contain at least 4 curated opportunities');
    const hasApprenticeship = all.some((o) => o.type === 'apprenticeship');
    assert.strictEqual(hasApprenticeship, true, 'Contains structured apprenticeship programs');
  });

  // Test 2: Filter by type = 'apprenticeship'
  await test('Filtering: Returns only apprenticeship programs when filtered', async () => {
    const apprenticeships = await OpportunityService.listPublicOpportunities({ type: 'apprenticeship' });
    assert.ok(apprenticeships.length > 0);
    for (const opp of apprenticeships) {
      assert.strictEqual(opp.type, 'apprenticeship');
      assert.strictEqual(opp.mentorshipProvided, true);
    }
  });

  // Test 3: Filter by targetRole = 'backend-developer'
  await test('Filtering: Filters opportunities accurately by target role', async () => {
    const backendOpps = await OpportunityService.listPublicOpportunities({ targetRole: 'backend-developer' });
    assert.ok(backendOpps.length > 0);
    for (const opp of backendOpps) {
      assert.strictEqual(opp.targetRole, 'backend-developer');
    }
  });

  // Test 4: HTTP Security: Unauthenticated request to /api/student/opportunities returns 401
  await test('HTTP Security: Unauthenticated request to /api/student/opportunities is rejected (401)', async () => {
    const app = createApp();
    const server = app.listen(0);
    const address = server.address() as any;
    const port = address.port;

    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/student/opportunities`);
      const data = (await response.json()) as any;
      assert.strictEqual(response.status, 401);
      assert.strictEqual(data.success, false);
      assert.ok(data.error.message.includes('Authentication required'));
    } finally {
      server.close();
    }
  });

  // Test 5: HTTP Security: Recruiter role token accessing /api/student/opportunities returns 403 Forbidden
  await test('HTTP Security: Recruiter token accessing /api/student/opportunities is forbidden (403)', async () => {
    const app = createApp();
    const server = app.listen(0);
    const address = server.address() as any;
    const port = address.port;

    const recruiterToken = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', email: 'recruiter@company.com', role: 'recruiter' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/student/opportunities`, {
        headers: { Authorization: `Bearer ${recruiterToken}` },
      });
      const data = (await response.json()) as any;
      assert.strictEqual(response.status, 403);
      assert.strictEqual(data.success, false);
      assert.ok(data.error.message.includes('Access denied'));
    } finally {
      server.close();
    }
  });

  // Test 6: Evidence-Aware Matching calculates demonstrated capability overlap
  await test('Matching Engine: Calculates factual demonstrated capability matches for student', async () => {
    const studentId = '650000000000000000000001';
    const matches = await OpportunityService.listOpportunitiesForStudent(studentId);
    assert.ok(matches.length > 0);

    const first = matches[0];
    assert.ok(first.candidateMatch);
    assert.ok(Array.isArray(first.candidateMatch.demonstratedMatches));
    assert.ok(Array.isArray(first.candidateMatch.missingCapabilities));
    assert.strictEqual(typeof first.candidateMatch.matchPercentage, 'number');
    assert.strictEqual(typeof first.candidateMatch.qualifiesForDirectApply, 'boolean');
  });

  // Test 7: Student 1-Click Application with Proof Passport
  await test('Application: Student can apply to an apprenticeship with verified Proof Passport', async () => {
    const studentId = '650000000000000000000099';
    const opportunityId = 'opp-apprentice-backend-01';

    const result = await OpportunityService.applyToOpportunity(
      opportunityId,
      studentId,
      'First-time coder excited to learn distributed systems.'
    );

    assert.strictEqual(result.success, true);
    assert.ok(result.message.includes('Proof Passport'));
    assert.ok(result.publicSlug.length > 0);
  });

  // Test 8: Anti-Duplicate Application Rule (409 Conflict)
  await test('Integrity: Prevents duplicate applications from same student', async () => {
    const studentId = '650000000000000000000099';
    const opportunityId = 'opp-apprentice-backend-01';

    try {
      await OpportunityService.applyToOpportunity(opportunityId, studentId);
      assert.fail('Should have rejected duplicate application');
    } catch (err: any) {
      assert.ok(err.message.includes('already applied'));
    }
  });

  // Test 9: HTTP Security: Student token accessing /api/recruiter/opportunities returns 403 Forbidden
  await test('HTTP Security: Student token accessing /api/recruiter/opportunities is forbidden (403)', async () => {
    const app = createApp();
    const server = app.listen(0);
    const address = server.address() as any;
    const port = address.port;

    const studentToken = jwt.sign(
      { userId: '650000000000000000000001', email: 'student@example.com', role: 'student' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/recruiter/opportunities`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      const data = (await response.json()) as any;
      assert.strictEqual(response.status, 403);
      assert.strictEqual(data.success, false);
      assert.ok(data.error.message.includes('Access denied'));
    } finally {
      server.close();
    }
  });

  // Test 10: Recruiter can create an apprenticeship listing and retrieve company applicants with Proof Passports
  await test('Recruiter Management: Recruiter can post apprenticeship and view applicants with Proof Passports', async () => {
    const recruiterUserId = '507f1f77bcf86cd799439011';
    const newOpp = await OpportunityService.createOpportunity(recruiterUserId, {
      title: 'Youth Cloud Engineering Apprenticeship',
      companyName: 'Acme Cloud Labs',
      type: 'apprenticeship',
      location: 'Remote',
      workPreference: 'remote',
      targetRole: 'backend-developer',
      requiredCapabilities: ['API Development', 'Testing'],
      description: 'Mentorship-first apprenticeship program for high school & college youth coders.',
      mentorshipProvided: true,
      stipendOrSalary: '$35/hr',
    });

    assert.strictEqual(newOpp.title, 'Youth Cloud Engineering Apprenticeship');
    assert.strictEqual(newOpp.type, 'apprenticeship');

    // List recruiter opportunities
    const recruiterOpps = await OpportunityService.listRecruiterOpportunities(recruiterUserId);
    assert.ok(recruiterOpps.length > 0);
    const created = recruiterOpps.find((o) => o.id === newOpp.id);
    assert.ok(created);
    assert.ok(Array.isArray(created.applications));
  });

  console.log(`\nOpportunities & Apprenticeships Tests Summary: ${passedTests}/${totalTests} passed`);
  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests();
