const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.membership.updateMany({
    where: { role: 'SUPER_ADMIN' },
    data: { role: 'OWNER' }
  });
  console.log(`Roles reseteados: ${result.count}`);
}
main();
