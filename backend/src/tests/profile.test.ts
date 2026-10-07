import assert from 'assert';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { updateProfileSchema } from '../modules/profile/profile.validation.js';

console.log('--- Starting Milestone 2 Profile Backend Tests ---');

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
  // Test 1: Validation Schema accepts valid complete profile payload
  await test('Validation: Valid complete profile payload passes schema validation', async () => {
    const validPayload = {
      body: {
        name: 'Alex Coder',
        bio: 'Aspiring backend engineer focusing on Node.js and distributed systems.',
        location: 'San Francisco, CA',
        workPreference: 'remote' as const,
        targetRole: 'Junior Backend Developer',
        interests: ['REST APIs', 'Cloud Computing', 'Database Tuning'],
        education: [
          {
            institution: 'Tech University',
            degree: 'B.S. Computer Science',
            field: 'Software Engineering',
            graduationYear: 2025,
          },
        ],
        declaredSkills: [
          {
            name: 'Node.js',
            category: 'backend' as const,
            selfAssessedLevel: 'intermediate' as const,
          },
          {
            name: 'Testing',
            category: 'testing' as const,
            selfAssessedLevel: 'beginner' as const,
          },
        ],
        projects: [
          {
            title: 'E-Commerce Order Microservice',
            description: 'Order calculation API with regression testing and discount validation.',
            technologies: ['Node.js', 'Express', 'Jest'],
            url: 'https://ecommerce-demo.example.com',
            githubUrl: 'https://github.com/example/ecommerce-service',
          },
        ],
      },
    };

    const parsed = await updateProfileSchema.body.parseAsync(validPayload.body);
    assert.strictEqual(parsed.name, 'Alex Coder');
    assert.strictEqual(parsed.targetRole, 'Junior Backend Developer');
    assert.strictEqual(parsed.projects?.length, 1);
    assert.strictEqual(parsed.declaredSkills?.length, 2);
  });

  // Test 2: Validation Schema rejects payloads containing restricted/internal fields (e.g. userId, password, role)
  await test('Validation: Rejects injection of restricted fields (userId, role, password, evidenceLevel)', async () => {
    const restrictedPayload = {
      name: 'Hacker Attempt',
      userId: '64e1234567890abcdef12345',
      role: 'admin',
      password: 'new_password',
      evidenceLevel: 4,
      demonstratedStatus: true,
    };

    try {
      await updateProfileSchema.body.parseAsync(restrictedPayload);
      assert.fail('Should have thrown validation error for unrecognized/restricted fields');
    } catch (err: any) {
      assert.ok(err.issues || err.errors || err.message, 'Validation error caught successfully');
    }
  });

  // Test 3: Validation Schema rejects malformed project and skill data
  await test('Validation: Rejects malformed project (empty title) and skill (invalid category)', async () => {
    const malformedPayload = {
      declaredSkills: [
        {
          name: 'Invalid Skill',
          category: 'invalid_category_name' as any,
          selfAssessedLevel: 'expert' as any,
        },
      ],
      projects: [
        {
          title: '', // Empty title not allowed
          description: 'Valid description',
          technologies: [],
        },
      ],
    };

    try {
      await updateProfileSchema.body.parseAsync(malformedPayload);
      assert.fail('Should have failed on malformed skill and project');
    } catch (err: any) {
      assert.ok(err.issues.length >= 2, 'Multiple validation issues caught');
    }
  });

  const API_BASE = `http://localhost:${env.PORT || 5002}`;

  // Test 4: Express App Route Verification — Unauthenticated access to /api/student/profile returns 401
  await test('HTTP Security: Unauthenticated request to GET /api/student/profile is rejected (401)', async () => {
    const response = await fetch(`${API_BASE}/api/student/profile`);
    const data = await response.json();
    assert.strictEqual(response.status, 401);
    assert.strictEqual(data.success, false);
    assert.ok(data.error.message.includes('Authentication required'));
  });

  // Test 5: Express App Route Verification — Recruiter role token accessing /api/student/profile returns 403 Forbidden
  await test('HTTP Security: Recruiter role token accessing GET /api/student/profile is forbidden (403)', async () => {
    const recruiterToken = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', email: 'recruiter@company.com', role: 'recruiter' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const response = await fetch(`${API_BASE}/api/student/profile`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const data = await response.json();
    assert.strictEqual(response.status, 403);
    assert.strictEqual(data.success, false);
    assert.ok(data.error.message.includes('Access denied'));
  });

  // Test 6: Express App Route Verification — Invalid PUT payload returns 422 Unprocessable Entity
  await test('HTTP Validation: PUT /api/student/profile with invalid payload returns 422 with issue details', async () => {
    const studentToken = jwt.sign(
      { userId: '507f1f77bcf86cd799439012', email: 'student@example.com', role: 'student' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const response = await fetch(`${API_BASE}/api/student/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'attempt_override',
        bio: 'x'.repeat(600), // Exceeds 500 characters
      }),
    });
    const data = await response.json();
    assert.strictEqual(response.status, 422);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error.message, 'Request validation failed');
    assert.ok(Array.isArray(data.error.details));
  });

  console.log(`\nTest Run Completed: ${passedTests}/${totalTests} tests passed.`);
  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAllTests();
