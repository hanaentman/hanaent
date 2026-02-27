const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clinics = await prisma.clinic.findMany({
    select: { name: true, region: true },
    orderBy: { name: 'asc' },
  });
  console.log('총', clinics.length, '개 지점');
  clinics.forEach((c, i) => console.log(`${i + 1}. [${c.region}] ${c.name}`));
}

main().finally(() => prisma.$disconnect());
