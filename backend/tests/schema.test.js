const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Prisma Schema Validation', () => {
  it('debería instanciar todos los modelos correctamente', () => {
    expect(prisma.user).toBeDefined();
    expect(prisma.business).toBeDefined();
    expect(prisma.location).toBeDefined();
    expect(prisma.product).toBeDefined();
    expect(prisma.transaction).toBeDefined();
    expect(prisma.expense).toBeDefined();
    expect(prisma.workerProfile).toBeDefined();
    expect(prisma.transactionItem).toBeDefined();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
});
