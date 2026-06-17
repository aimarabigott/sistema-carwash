const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Auth API', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'owner@test.com' } });
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('debería registrar un nuevo Dueño', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'owner@test.com', password: '123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('OWNER');
  });

  it('debería hacer login y devolver un token', async () => {
    // Ensure the user exists first (use Prisma or rely on the previous register test leaving the user there)
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@test.com', password: '123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('owner@test.com');
  });
});
