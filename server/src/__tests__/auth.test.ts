import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { createTestCollege } from './helpers';
import { prisma } from '../lib/prisma';

let collegeCode: string;

beforeAll(async () => {
  const college = await createTestCollege('AUTH001');
  collegeCode = college.code;
});

describe('Auth Routes', () => {
  const testEmail = `auth_test_${Date.now()}@example.com`;

  it('should register with valid data', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'Test@12345',
      role: 'STUDENT',
      firstName: 'Test',
      lastName: 'User',
      collegeCode,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('Registration successful');
  });

  it('should return 409 for existing email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'Test@12345',
      role: 'STUDENT',
      firstName: 'Dup',
      lastName: 'User',
      collegeCode,
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 403 when registering as PLACEMENT_OFFICER', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: `officer_${Date.now()}@example.com`,
      password: 'Test@12345',
      role: 'PLACEMENT_OFFICER',
      collegeCode,
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should login with correct credentials and set cookie', async () => {
    // First verify the email manually
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }

    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'Test@12345',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.headers['set-cookie']).toBeDefined();
    // Ensure JWT is NOT in response body
    expect(res.body.data.token).toBeUndefined();
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for GET /api/auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return current user for GET /api/auth/me with valid token', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'Test@12345',
    });

    const cookie = loginRes.headers['set-cookie'];
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', Array.isArray(cookie) ? cookie : [cookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
  });
});
