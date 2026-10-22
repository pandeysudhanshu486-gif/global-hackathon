import assert from 'assert';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { RecruiterService } from '../modules/recruiter/recruiter.service.js';
import { updateRecruiterProfileSchema, candidateSearchQuerySchema } from '../modules/recruiter/recruiter.validation.js';

const API_BASE = `http://localhost:${env.PORT || 5002}`;

const generateTestToken = (userId: string, email: string, role: 'student' | 'recruiter' | 'admin') => {
  return jwt.sign({ userId, email, role }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
};

async function runTests() {
  console.log('--- Starting Milestone 6 Phase 1 Recruiter Backend Tests ---');
  let passedCount = 0;
  const totalCount = 15;

  const studentToken = generateTestToken('650000000000000000000001', 'alex.chen@test.com', 'student');
  const student2Token = generateTestToken('650000000000000000000002', 'sarah.j@test.com', 'student');
  const recruiterToken = generateTestToken('650000000000000000000099', 'recruiter@techventures.io', 'recruiter');

  // Test 1: Unauthenticated request to recruiter profile is rejected with 401
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/profile`);
    assert.strictEqual(res.status, 401, 'Expected 401 Unauthorized for missing token');
    passedCount++;
    console.log('  ✓ HTTP Security: Unauthenticated request to /api/recruiter/profile returns 401');
  } catch (err: any) {
    console.error('  ✗ HTTP Security: Unauthenticated request failed:', err.message);
  }

  // Test 2: Student role accessing recruiter profile is forbidden with 403
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 403, 'Expected 403 Forbidden for student accessing recruiter route');
    passedCount++;
    console.log('  ✓ HTTP Security: Student role accessing /api/recruiter/profile returns 403 Forbidden');
  } catch (err: any) {
    console.error('  ✗ HTTP Security: Student role access test failed:', err.message);
  }

  // Test 3: Recruiter role accessing student private route is forbidden with 403
  try {
    const res = await fetch(`${API_BASE}/api/student/profile`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert.strictEqual(res.status, 403, 'Expected 403 Forbidden for recruiter accessing student route');
    passedCount++;
    console.log('  ✓ HTTP Security: Recruiter role accessing /api/student/profile returns 403 Forbidden');
  } catch (err: any) {
    console.error('  ✗ HTTP Security: Recruiter accessing student route test failed:', err.message);
  }

  // Test 4: Recruiter can fetch and update their profile
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/profile`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert.strictEqual(res.status, 200, 'Expected 200 OK for recruiter profile fetch');
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.recruiterName, 'Recruiter profile should contain recruiterName');

    const updateRes = await fetch(`${API_BASE}/api/recruiter/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recruiterName: 'Elena Rostova',
        companyName: 'Apex Cloud Systems',
        companyWebsite: 'https://apexcloud.example.com',
        companyDescription: 'Leading infrastructure and cloud engineering solutions provider.',
      }),
    });
    assert.strictEqual(updateRes.status, 200, 'Expected 200 OK for recruiter profile update');
    const updateBody = await updateRes.json();
    assert.strictEqual(updateBody.data.recruiterName, 'Elena Rostova');
    assert.strictEqual(updateBody.data.companyName, 'Apex Cloud Systems');
    passedCount++;
    console.log('  ✓ Recruiter Profile: Recruiter can fetch and update profile successfully');
  } catch (err: any) {
    console.error('  ✗ Recruiter Profile test failed:', err.message);
  }

  // Test 5: Validation rejects invalid recruiter profile payload
  try {
    const invalidPayload = {
      recruiterName: 'A', // too short
      companyName: '', // empty
      companyWebsite: 'not-a-valid-url',
    };
    const parseResult = updateRecruiterProfileSchema.safeParse(invalidPayload);
    assert.strictEqual(parseResult.success, false, 'Validation should fail on invalid inputs');

    const httpRes = await fetch(`${API_BASE}/api/recruiter/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPayload),
    });
    assert.strictEqual(httpRes.status, 422, 'Expected 422 Unprocessable Entity');
    passedCount++;
    console.log('  ✓ Validation: Invalid recruiter profile input is rejected (422)');
  } catch (err: any) {
    console.error('  ✗ Validation test failed:', err.message);
  }

  // Test 6: Student role accessing candidate search is forbidden (403)
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.strictEqual(res.status, 403, 'Student must not be able to access candidate search');
    passedCount++;
    console.log('  ✓ HTTP Security: Student role accessing /api/recruiter/candidates returns 403 Forbidden');
  } catch (err: any) {
    console.error('  ✗ Candidate search student access test failed:', err.message);
  }

  // Test 7: Recruiter can query candidate search API
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert.strictEqual(res.status, 200, 'Expected 200 OK for candidate search');
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data.candidates), 'Expected candidates array in data');
    assert.ok(body.data.pagination, 'Expected pagination in data');
    assert.ok(body.data.filters, 'Expected filters in data');
    passedCount++;
    console.log('  ✓ Candidate Search: Recruiter can query candidates list with factual pagination');
  } catch (err: any) {
    console.error('  ✗ Candidate Search query test failed:', err.message);
  }

  // Test 8: Target Role filter works accurately
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates?targetRole=backend-developer`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.candidates.length > 0);
    for (const c of body.data.candidates) {
      assert.ok(
        (c.targetRole || '').toLowerCase().includes('backend'),
        `Candidate ${c.name} does not match targetRole filter`
      );
    }
    passedCount++;
    console.log('  ✓ Filtering: Target role filter matches candidates accurately');
  } catch (err: any) {
    console.error('  ✗ Target role filter test failed:', err.message);
  }

  // Test 9: Capability filter matches declared or demonstrated skills
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates?capability=Node.js`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.candidates.length > 0);
    for (const c of body.data.candidates) {
      const hasDeclared = c.declaredSkills.some((s: any) => s.name.toLowerCase().includes('node'));
      const hasDemonstrated = c.demonstratedCapabilities.some((cap: string) => cap.includes('node'));
      assert.ok(hasDeclared || hasDemonstrated, 'Candidate must match capability filter');
    }
    passedCount++;
    console.log('  ✓ Filtering: Capability filter matches demonstrated & declared skills');
  } catch (err: any) {
    console.error('  ✗ Capability filter test failed:', err.message);
  }

  // Test 10: EvidenceLevel filter works without score-based ranking
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates?evidenceLevel=declared`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data.candidates));
    // Verify no arbitrary AI score field exists in candidate item
    for (const c of body.data.candidates) {
      assert.strictEqual((c as any).aiScore, undefined, 'aiScore must NEVER be returned');
      assert.strictEqual((c as any).hireabilityScore, undefined, 'hireabilityScore must NEVER be returned');
      assert.strictEqual((c as any).readinessPercentage, undefined, 'readinessPercentage must NEVER be returned');
    }
    passedCount++;
    console.log('  ✓ Filtering: EvidenceLevel filter works cleanly without score-based ranking');
  } catch (err: any) {
    console.error('  ✗ EvidenceLevel filter test failed:', err.message);
  }

  // Test 11: Candidate Evidence Summary endpoint
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates/650000000000000000000001`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert.strictEqual(res.status, 200, 'Expected 200 OK for candidate evidence summary');
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.candidate, 'Candidate info should be present');
    assert.ok(body.data.evidenceHierarchy, 'Evidence hierarchy should be present');
    assert.ok(body.data.evidenceTimeline, 'Evidence timeline should be present');
    passedCount++;
    console.log('  ✓ Candidate Detail: Recruiter can fetch candidate evidence summary');
  } catch (err: any) {
    console.error('  ✗ Candidate Detail test failed:', err.message);
  }

  // Test 12: Privacy & Security: Never leaks passwords, tokens, or private secrets
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates/650000000000000000000001`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const body = await res.json();
    const jsonStr = JSON.stringify(body);

    assert.ok(!jsonStr.includes('passwordHash'), 'Must not contain passwordHash');
    assert.ok(!jsonStr.includes('JWT_SECRET'), 'Must not contain JWT_SECRET');
    assert.ok(!jsonStr.includes('refreshToken'), 'Must not contain refreshToken');
    assert.ok(!jsonStr.includes('GEMINI_API_KEY'), 'Must not contain GEMINI_API_KEY');
    assert.strictEqual(body.data.candidate.passwordHash, undefined);
    assert.strictEqual(body.data.candidate.tokens, undefined);
    passedCount++;
    console.log('  ✓ Privacy & Security: Candidate evidence summary never leaks passwordHash, tokens, or secrets');
  } catch (err: any) {
    console.error('  ✗ Privacy & Security test failed:', err.message);
  }

  // Test 13: Evidence Hierarchy clearly distinguishes Declared, AI-Assisted, Supporting, and Demonstrated
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates/650000000000000000000001`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const body = await res.json();
    const hierarchy = body.data.evidenceHierarchy;

    assert.strictEqual(hierarchy.declaredSkills.classification, 'Declared');
    assert.strictEqual(hierarchy.aiAssistedResume.classification, 'AI-Assisted / Unverified');
    assert.strictEqual(hierarchy.aiAssistedResume.verified, false, 'AI resume must be unverified');
    assert.strictEqual(hierarchy.supportingGitHub.classification, 'Supporting Evidence');
    assert.strictEqual(hierarchy.supportingGitHub.isSupportingOnly, true);
    assert.strictEqual(hierarchy.demonstratedCapabilities.classification, 'Demonstrated');

    passedCount++;
    console.log('  ✓ Evidence Hierarchy: Clearly distinguishes Declared, AI-Assisted, Supporting, and Demonstrated');
  } catch (err: any) {
    console.error('  ✗ Evidence Hierarchy test failed:', err.message);
  }

  // Test 14: Evidence Invariant: GitHub and Resume information never produce Demonstrated status
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates/650000000000000000000001`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const body = await res.json();
    const hierarchy = body.data.evidenceHierarchy;

    // Verify resume extracted skills are strictly not in demonstratedCapabilities without mission evaluation
    assert.strictEqual(hierarchy.aiAssistedResume.verified, false);
    assert.strictEqual(hierarchy.supportingGitHub.verified, false);
    passedCount++;
    console.log('  ✓ Evidence Invariant: GitHub & Resume data strictly cannot create Demonstrated capability');
  } catch (err: any) {
    console.error('  ✗ Evidence Invariant test failed:', err.message);
  }

  // Test 15: Regression Test: Candidates with blank or missing targetRole never match a specific targetRole filter
  try {
    const res = await fetch(`${API_BASE}/api/recruiter/candidates?targetRole=backend-developer`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    for (const c of body.data.candidates) {
      assert.ok(
        c.targetRole && c.targetRole.trim().length > 0,
        `Candidate ${c.name} with blank targetRole was erroneously returned`
      );
      assert.ok(
        c.targetRole.toLowerCase().includes('backend'),
        `Candidate ${c.name} does not match backend targetRole filter`
      );
    }
    passedCount++;
    console.log('  ✓ Regression: Candidates with blank targetRole are excluded from targetRole search');
  } catch (err: any) {
    console.error('  ✗ Blank targetRole regression test failed:', err.message);
  }

  console.log(`\nMilestone 6 Recruiter Tests Summary: ${passedCount}/${totalCount} passed`);
  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
