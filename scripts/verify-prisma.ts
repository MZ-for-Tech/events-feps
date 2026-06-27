import { prisma } from '../lib/prisma';

async function verify() {
  try {
    const userCount = await prisma.user.count();
    console.log('✅ Connected (Users count: ' + userCount + ')');
  } catch (error) {
    console.error('❌ Failed to connect:');
    console.error(error);
    process.exit(1);
  } finally {
    // Note: We don't need to disconnect PrismaPg pooling explicitly here
  }
}

verify();
