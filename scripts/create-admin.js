const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('hana1120@@', 12);
  const user = await prisma.adminUser.upsert({
    where: { username: 'hanaent' },
    update: { passwordHash: hash, role: 'SUPER_ADMIN', isActive: true },
    create: { username: 'hanaent', passwordHash: hash, role: 'SUPER_ADMIN', isActive: true },
  });
  console.log('SUPER_ADMIN 생성:', user.username);
}

main().finally(() => prisma.$disconnect());
