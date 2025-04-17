// @ts-check
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

async function fixParentChildLinks() {
  console.log('Starting parent-child link fix script...');

  try {
    // Get all UserRelation records
    const relations = await prisma.userRelation.findMany();
    console.log(`Found ${relations.length} parent-child relationships`);

    // Iterate through each relation
    for (const relation of relations) {
      console.log(`Processing relation: parentId=${relation.parentId}, childId=${relation.childId}`);
      
      // Update the child's parentId field
      await prisma.user.update({
        where: { id: relation.childId },
        data: { parentId: relation.parentId }
      });
      
      console.log(`Updated child ${relation.childId} to have parentId ${relation.parentId}`);
    }

    console.log('All parent-child links have been fixed!');
  } catch (error) {
    console.error('Error fixing parent-child links:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixParentChildLinks()
  .then(() => console.log('Script completed successfully'))
  .catch((error) => console.error('Script error:', error)); 