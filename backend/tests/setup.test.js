describe('Backend Setup', () => {
  it('should have Prisma Client installed', () => {
    const { PrismaClient } = require('@prisma/client');
    expect(PrismaClient).toBeDefined();
  });
});
