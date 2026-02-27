const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clinics = await prisma.clinic.findMany({
    select: { id: true, name: true, phone: true, address: true },
    orderBy: { name: 'asc' },
  });
  console.log('총', clinics.length, '개 지점');
  clinics.forEach(c => console.log(c.name, '|', c.phone, '|', c.address.slice(0, 40)));
}

main().finally(() => prisma.$disconnect());
