require('dotenv').config({ path: '../.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function registerAdmin() {
  const adminAddress = '0x4eF15D723260cb34fff018E46F13E64A7b7Bf7CD';
  
  console.log(`Registering admin: ${adminAddress}`);
  
  try {
    // Create or update user as admin
    const admin = await prisma.user.upsert({
      where: { address: adminAddress },
      update: { 
        isAdmin: true,
        lastActive: new Date()
      },
      create: { 
        address: adminAddress,
        isAdmin: true,
        balance: 0
      },
    });

    console.log('✅ Admin registered successfully!');
    console.log(`Admin ID: ${admin.id}`);
    console.log(`Admin Address: ${admin.address}`);
    console.log(`Is Admin: ${admin.isAdmin}`);
    console.log(`Registered At: ${admin.joinedAt}`);

  } catch (error) {
    console.error('❌ Error registering admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

registerAdmin();
