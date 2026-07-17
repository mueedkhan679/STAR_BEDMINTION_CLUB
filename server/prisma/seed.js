import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user (plain text password for simplicity)
  const admin = await prisma.admin.upsert({
    where: { username: 'yahya' },
    update: {},
    create: {
      username: 'yahya',
      password: 'yahya123', // Plain text password
    },
  });

  console.log('✅ Admin user created/updated successfully');
  console.log('👤 Username: yahya');
  console.log('🔑 Password: yahya123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
