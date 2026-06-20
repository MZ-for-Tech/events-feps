import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.findFirst();
  if (!event) {
    console.log("No event found");
    return;
  }
  
  try {
    const updated = await prisma.event.update({
      where: { id: event.id },
      data: {
        status: "ARCHIVED",
        title: undefined,
        categoryId: undefined,
      }
    });
    console.log("Success:", updated.status);
  } catch (error) {
    console.error("Error updating:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
