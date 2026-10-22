import assert from 'assert';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { PassportService } from '../modules/passport/passport.service.js';
import { updatePassportSettingsSchema } from '../modules/passport/passport.validation.js';
import { StudentProfileModel } from '../models/studentProfile.model.js';
import { PassportModel } from '../models/passport.model.js';

const API_BASE = `http://localhost:${env.PORT || 5002}`;

const generateTestToken = (userId: string, email: string, role: 'student' | 'recruiter' | 'admin') => {
  return jwt.sign({ userId, email, role }, env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
};

async function runTests() {
  console.log('--- Starting Milestone 6 Phase 3 Public Proof Passport Backend Tests ---');
  let passedCount = 0;
  const totalCount = 18;

  const student1Id = '650000000000000000000001';
  const student2Id = '650000000000000000000002';
  const student1Token = generateTestToken(student1Id, 'alex.chen@test.com', 'student');
  const student2Token = generateTestToken(student2Id, 'sarah.j@test.com', 'student');

  // Test Fixture: Ensure student profiles and passports exist in MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  // Seed / ensure StudentProfile for student 1 (Alex Chen)
  let p1 = await StudentProfileModel.findOne({ userId: new mongoose.Types.ObjectId(student1Id) });
  if (!p1) {
    p1 = await StudentProfileModel.create({
      userId: new mongoose.Types.ObjectId(student1Id),
      name: 'Alex Chen',
      targetRole: 'backend-developer',
      bio: 'Backend engineer focused on distributed systems and APIs.',
      education: [{ institution: 'UC Berkeley', degree: 'B.S. Computer Science', graduationYear: 2024 }],
      projects: [
        {
          title: 'Order Flow Engine',
          description: 'High-throughput async transaction processing',
          technologies: ['Node.js', 'TypeScript'],
          githubUrl: 'https://github.com/alexchen-dev/order-engine',
        },
      ],
      declaredSkills: [
        { name: 'Node.js', category: 'backend', selfAssessedLevel: 'advanced' },
        { name: 'TypeScript', category: 'backend', selfAssessedLevel: 'intermediate' },
      ],
      githubConnected: true,
      githubUsername: 'alexchen-dev',
      githubProfileUrl: 'https://github.com/alexchen-dev',
      resumeParsedData: {
        extractedSkills: [{ name: 'JavaScript' }, { name: 'Express' }],
        extractionMethod: 'heuristic_fallback',
        parsedAt: new Date(),
        verified: false,
      },
      interests: [],
    });
  } else {
    p1.education = [{ institution: 'UC Berkeley', degree: 'B.S. Computer Science', graduationYear: 2024 }];
    p1.projects = [
      {
        title: 'Order Flow Engine',
        description: 'High-throughput async transaction processing',
        technologies: ['Node.js', 'TypeScript'],
        githubUrl: 'https://github.com/alexchen-dev/order-engine',
      },
    ];
    p1.githubConnected = true;
    p1.githubUsername = 'alexchen-dev';
    p1.resumeParsedData = {
      extractedSkills: [{ name: 'JavaScript' }, { name: 'Express' }],
      extractionMethod: 'heuristic_fallback',
      parsedAt: new Date(),
      verified: false,
      extractedExperience: [],
      extractedEducation: [],
      extractedProjects: [],
      extractedCertifications: [],
    };
    await p1.save();
  }

  await PassportModel.findOneAndUpdate(
    { studentId: p1._id },
    {
      studentId: p1._id,
      publicSlug: 'alex-chen-wk7a',
      visibility: 'public',
      privacySettings: PassportService.defaultPrivacySettings,
      stats: { missionsCompleted: 1, totalEvidenceRecords: 3, skillsWithEvidence: 3 },
      lastUpdatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Seed / ensure StudentProfile for student 2 (Sarah Jenkins)
  let p2 = await StudentProfileModel.findOne({ userId: new mongoose.Types.ObjectId(student2Id) });
  if (!p2) {
    p2 = await StudentProfileModel.create({
      userId: new mongoose.Types.ObjectId(student2Id),
      name: 'Sarah Jenkins',
      targetRole: 'frontend-developer',
      education: [{ institution: 'NYU', degree: 'B.S. Information Systems', graduationYear: 2025 }],
      projects: [],
      declaredSkills: [{ name: 'React', category: 'frontend', selfAssessedLevel: 'advanced' }],
      interests: [],
    });
  }

  await PassportModel.findOneAndUpdate(
    { studentId: p2._id },
    {
      studentId: p2._id,
      publicSlug: 'sarah-jenkins-xk9b',
      visibility: 'public',
      privacySettings: PassportService.defaultPrivacySettings,
      stats: { missionsCompleted: 0, totalEvidenceRecords: 0, skillsWithEvidence: 0 },
      lastUpdatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Test 1: Valid public passport loads without authentication
  try {
    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    assert.strictEqual(res.status, 200, 'Expected 200 OK for public passport load');
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.candidate.displayName, 'Candidate displayName must be present');
    assert.ok(body.data.passportMetadata, 'Passport metadata must be present');
    passedCount++;
    console.log('  ✓ Public Access: Valid public passport loads without authentication (200)');
  } catch (err: any) {
    console.error('  ✗ Public Access test failed:', err.message);
  }

  // Test 2: Unknown slug returns 404
  try {
    const res = await fetch(`${API_BASE}/api/passport/non-existent-candidate-slug-123`);
    assert.strictEqual(res.status, 404, 'Expected 404 for non-existent passport slug');
    passedCount++;
    console.log('  ✓ Error Handling: Unknown slug returns 404');
  } catch (err: any) {
    console.error('  ✗ Unknown slug test failed:', err.message);
  }

  // Test 3: Disabled passport is not publicly accessible
  try {
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ passportEnabled: false }),
    });

    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    assert.strictEqual(res.status, 404, 'Expected 404 when passport is disabled');

    // Restore
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ passportEnabled: true }),
    });

    passedCount++;
    console.log('  ✓ Privacy Control: Disabled passport is not publicly accessible (404)');
  } catch (err: any) {
    console.error('  ✗ Disabled passport test failed:', err.message);
  }

  // Test 4: Private education is hidden when showEducation is false
  try {
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showEducation: false }),
    });

    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const body = await res.json();
    assert.strictEqual(body.data.candidate.education, undefined, 'Education should be omitted');

    // Restore
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showEducation: true }),
    });

    passedCount++;
    console.log('  ✓ Privacy Filter: Private education is hidden when showEducation is false');
  } catch (err: any) {
    console.error('  ✗ Private education filter test failed:', err.message);
  }

  // Test 5: Private projects are hidden when showProjects is false
  try {
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showProjects: false }),
    });

    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const body = await res.json();
    assert.strictEqual(body.data.candidate.projects, undefined, 'Projects should be omitted');

    // Restore
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showProjects: true }),
    });

    passedCount++;
    console.log('  ✓ Privacy Filter: Private projects are hidden when showProjects is false');
  } catch (err: any) {
    console.error('  ✗ Private projects filter test failed:', err.message);
  }

  // Test 6: Private GitHub evidence is hidden when showGithubEvidence is false
  try {
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showGithubEvidence: false }),
    });

    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const body = await res.json();
    assert.strictEqual(body.data.evidenceHierarchy.supportingGitHub, undefined, 'GitHub should be omitted');

    // Restore
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showGithubEvidence: true }),
    });

    passedCount++;
    console.log('  ✓ Privacy Filter: Private GitHub evidence is hidden when showGithubEvidence is false');
  } catch (err: any) {
    console.error('  ✗ Private GitHub filter test failed:', err.message);
  }

  // Test 7: Private resume evidence is hidden when showResumeEvidence is false
  try {
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showResumeEvidence: false }),
    });

    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const body = await res.json();
    assert.strictEqual(body.data.evidenceHierarchy.aiAssistedResume, undefined, 'Resume should be omitted');

    // Restore
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showResumeEvidence: true }),
    });

    passedCount++;
    console.log('  ✓ Privacy Filter: Private resume evidence is hidden when showResumeEvidence is false');
  } catch (err: any) {
    console.error('  ✗ Private resume filter test failed:', err.message);
  }

  // Test 8: Demonstrated evidence remains correctly classified
  try {
    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const body = await res.json();
    assert.strictEqual(body.data.evidenceHierarchy.demonstratedCapabilities.classification, 'Demonstrated');
    assert.ok(body.data.evidenceHierarchy.demonstratedCapabilities.count >= 0);
    passedCount++;
    console.log('  ✓ Evidence Invariant: Demonstrated evidence remains strictly classified as Demonstrated');
  } catch (err: any) {
    console.error('  ✗ Demonstrated classification test failed:', err.message);
  }

  // Test 9: Supporting GitHub evidence cannot become Demonstrated
  try {
    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const body = await res.json();
    if (body.data.evidenceHierarchy.supportingGitHub) {
      assert.strictEqual(body.data.evidenceHierarchy.supportingGitHub.classification, 'Supporting Evidence');
      assert.ok(
        body.data.evidenceHierarchy.supportingGitHub.disclaimer.includes('supporting evidence'),
        'Must include supporting disclaimer'
      );
    }
    passedCount++;
    console.log('  ✓ Evidence Invariant: Supporting GitHub evidence cannot become Demonstrated');
  } catch (err: any) {
    console.error('  ✗ GitHub evidence invariant test failed:', err.message);
  }

  // Test 10: AI-assisted resume evidence cannot become Demonstrated
  try {
    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const body = await res.json();
    if (body.data.evidenceHierarchy.aiAssistedResume) {
      assert.strictEqual(body.data.evidenceHierarchy.aiAssistedResume.classification, 'AI-Assisted / Unverified');
      assert.ok(body.data.evidenceHierarchy.aiAssistedResume.disclaimer.includes('assistive'));
    }
    passedCount++;
    console.log('  ✓ Evidence Invariant: AI-assisted resume evidence cannot become Demonstrated');
  } catch (err: any) {
    console.error('  ✗ Resume evidence invariant test failed:', err.message);
  }

  // Test 11: Declared skills remain Declared
  try {
    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const body = await res.json();
    if (body.data.evidenceHierarchy.declaredSkills) {
      assert.strictEqual(body.data.evidenceHierarchy.declaredSkills.classification, 'Declared');
    }
    passedCount++;
    console.log('  ✓ Evidence Invariant: Declared skills remain strictly classified as Declared');
  } catch (err: any) {
    console.error('  ✗ Declared skills invariant test failed:', err.message);
  }

  // Test 12: Password hash never appears in public passport response
  try {
    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const rawText = await res.text();
    assert.ok(!rawText.includes('passwordHash'), 'Password hash must never appear in response');
    passedCount++;
    console.log('  ✓ Security: Password hash never appears in public passport response');
  } catch (err: any) {
    console.error('  ✗ Password leakage test failed:', err.message);
  }

  // Test 13: JWT / refresh token never appears
  try {
    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const rawText = await res.text();
    assert.ok(!rawText.includes('refreshToken'), 'Refresh token must never appear in response');
    assert.ok(!rawText.includes('JWT_ACCESS_SECRET'), 'JWT secret must never appear in response');
    passedCount++;
    console.log('  ✓ Security: JWT and refresh tokens never appear in public passport response');
  } catch (err: any) {
    console.error('  ✗ Token leakage test failed:', err.message);
  }

  // Test 14: API keys never appear
  try {
    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const rawText = await res.text();
    assert.ok(!rawText.includes('GEMINI_API_KEY'), 'Gemini API key must never appear in response');
    passedCount++;
    console.log('  ✓ Security: API keys never appear in public response');
  } catch (err: any) {
    console.error('  ✗ API key leakage test failed:', err.message);
  }

  // Test 15: Internal filesystem paths never appear
  try {
    const res = await fetch(`${API_BASE}/api/passport/alex-chen-wk7a`);
    const rawText = await res.text();
    assert.ok(!rawText.includes('/var/folders/'), 'Internal temp paths must not leak');
    assert.ok(!rawText.includes('/workproof-ai/backend/src'), 'Source code paths must not leak');
    passedCount++;
    console.log('  ✓ Security: Internal filesystem execution paths never appear');
  } catch (err: any) {
    console.error('  ✗ Filesystem path leakage test failed:', err.message);
  }

  // Test 16: Student can update passport privacy settings
  try {
    const res = await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        showBio: false,
        showEducation: true,
        showProjects: true,
      }),
    });
    assert.strictEqual(res.status, 200, 'Student should be able to update their passport settings');
    const body = await res.json();
    assert.strictEqual(body.data.privacySettings.showBio, false);
    // Restore
    await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showBio: true }),
    });
    passedCount++;
    console.log('  ✓ Student Owner: Student can update their passport privacy settings');
  } catch (err: any) {
    console.error('  ✗ Student update settings test failed:', err.message);
  }

  // Test 17: Another student cannot modify someone else's passport
  try {
    // Student 2 updates their own settings and receives student 2's passport
    const res = await fetch(`${API_BASE}/api/student/passport`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${student2Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showEducation: false }),
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    // Verify Student 1 settings were not touched
    const s1Res = await fetch(`${API_BASE}/api/student/passport`, {
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    const s1Body = await s1Res.json();
    assert.strictEqual(s1Body.data.privacySettings.showEducation, true);
    passedCount++;
    console.log('  ✓ Tenant Isolation: Another student cannot modify another student\'s passport');
  } catch (err: any) {
    console.error('  ✗ Tenant isolation test failed:', err.message);
  }

  // Test 18: Student cannot manually promote evidence to Demonstrated via payload injection
  try {
    const injectedPayload = {
      showEducation: true,
      demonstratedCapabilities: ['fake-injected-capability'],
      status: 'demonstrated',
    };
    const parseResult = updatePassportSettingsSchema.safeParse(injectedPayload);
    assert.strictEqual(
      parseResult.success,
      false,
      'Strict Zod schema must reject attempts to inject restricted fields'
    );
    passedCount++;
    console.log('  ✓ Tamper Prevention: Student cannot manually inject or promote evidence to Demonstrated');
  } catch (err: any) {
    console.error('  ✗ Tamper prevention test failed:', err.message);
  }

  console.log(`\nMilestone 6 Phase 3 Passport Tests Summary: ${passedCount}/${totalCount} passed`);

  // Cleanup: restore default settings and close connection
  if (mongoose.connection.readyState === 1) {
    await PassportModel.updateOne(
      { publicSlug: 'alex-chen-wk7a' },
      { privacySettings: PassportService.defaultPrivacySettings, visibility: 'public' }
    );
    await mongoose.disconnect();
  }

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
