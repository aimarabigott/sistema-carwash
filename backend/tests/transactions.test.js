const request = require('supertest');
const app = require('../src/index');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Transactions API', () => {
  let locationId;
  beforeAll(async () => {
    const email = `tx${Date.now()}@test.com`;
    const owner = await prisma.user.create({ data: { email, password: '123', role: 'OWNER' } });
    const business = await prisma.business.create({ data: { ownerId: owner.id } });
    const loc = await prisma.location.create({ data: { businessId: business.id, name: 'Sede 1' } });
    locationId = loc.id;
  });
  afterAll(async () => { await prisma.$disconnect(); });

  it('debería crear una transacción', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ locationId, workerId: 'dummy', paymentMethod: 'CASH', totalAmount: 50 });
    expect(res.statusCode).toBe(201);
    expect(res.body.transaction.totalAmount).toBe(50);
  });
});
