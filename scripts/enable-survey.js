const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.event.updateMany({
    data: { surveyEnabled: true }
  });
  console.log('Updated events:', updated.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
