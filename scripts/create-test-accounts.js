// This script clears all users and creates test parent and child accounts
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database cleanup and test account creation');

    // Delete all existing data
    console.log('Deleting existing user data...');
    
    try {
      // Delete module progress records
      await prisma.$executeRaw`TRUNCATE "ModuleProgress" CASCADE;`;
      console.log('- Module progress records deleted');
    } catch (e) {
      console.log('- No ModuleProgress table found or error clearing it');
    }
    
    try {
      // Delete module assignments
      await prisma.$executeRaw`TRUNCATE "ModuleAssignment" CASCADE;`;
      console.log('- Module assignments deleted');
    } catch (e) {
      console.log('- No ModuleAssignment table found or error clearing it');
    }
    
    try {
      // Delete user relations
      await prisma.$executeRaw`TRUNCATE "UserRelation" CASCADE;`;
      console.log('- User relations deleted');
    } catch (e) {
      console.log('- No UserRelation table found or error clearing it');
    }
    
    try {
      // Delete sessions
      await prisma.$executeRaw`TRUNCATE "Session" CASCADE;`;
      console.log('- Sessions deleted');
    } catch (e) {
      console.log('- No Session table found or error clearing it');
    }
    
    try {
      // Delete accounts
      await prisma.$executeRaw`TRUNCATE "Account" CASCADE;`;
      console.log('- Accounts deleted');
    } catch (e) {
      console.log('- No Account table found or error clearing it');
    }
    
    try {
      // Delete users
      await prisma.$executeRaw`TRUNCATE "User" CASCADE;`;
      console.log('- Users deleted');
    } catch (e) {
      console.log('- No User table found or error clearing it');
    }

    console.log('Database cleared successfully');

    // Create test parent account
    const hashedParentPassword = await hash('password123', 10);
    const parent = await prisma.user.create({
      data: {
        name: 'Test Parent',
        email: 'parent@test.com',
        password: hashedParentPassword,
        userType: 'PARENT',
      },
    });
    console.log(`Created parent account: ${parent.email}`);

    // Create test child account
    const hashedChildPassword = await hash('password123', 10);
    const child = await prisma.user.create({
      data: {
        name: 'Test Child',
        email: 'child@test.com',
        password: hashedChildPassword,
        userType: 'CHILD',
        childId: 'CHILD12345',
      },
    });

    // Create relation between parent and child
    try {
      await prisma.userRelation.create({
        data: {
          parentId: parent.id,
          childId: child.id,
          relation: 'PARENT',
        },
      });
      console.log('Created parent-child relationship successfully');
    } catch (e) {
      console.log('Failed to create parent-child relationship: ', e.message);
    }
    
    console.log('Test accounts created successfully:');
    console.log('----------------------------------');
    console.log('Parent Login:');
    console.log('Email: parent@test.com');
    console.log('Password: password123');
    console.log('\nChild Login:');
    console.log('Email: child@test.com');
    console.log('Password: password123');
    console.log('Child ID: CHILD12345');
    console.log('----------------------------------');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 