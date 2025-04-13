import { PrismaClient, ModuleCategory, ModuleDifficulty, UserType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // Create test users
  const hashedPassword = await hash('password123', 10);
  
  // Create parent test account
  const parent = await prisma.user.upsert({
    where: { email: 'parent@test.com' },
    update: {},
    create: {
      email: 'parent@test.com',
      name: 'Test Parent',
      password: hashedPassword,
      userType: UserType.PARENT,
    },
  });
  
  // Create child test account
  const child = await prisma.user.upsert({
    where: { email: 'child@test.com' },
    update: {},
    create: {
      email: 'child@test.com',
      name: 'Test Child',
      password: hashedPassword,
      userType: UserType.CHILD,
      parentId: parent.id,
      childId: 'CHILD12345',
    },
  });
  
  console.log('Test users created successfully');

  // Seed modules
  const modules = [
    {
      title: "Introduction to Money",
      description: "Learn about different types of money and how we use it.",
      thumbnailUrl: "/placeholder.svg",
      totalDuration: "25:45",
      isPublished: true,
      category: ModuleCategory.GENERAL,
      difficulty: ModuleDifficulty.BEGINNER,
    },
    {
      title: "Saving Basics",
      description: "Why is saving important and how can you start saving today?",
      thumbnailUrl: "/placeholder.svg",
      totalDuration: "28:30",
      isPublished: true,
      category: ModuleCategory.SAVINGS,
      difficulty: ModuleDifficulty.BEGINNER,
    },
    {
      title: "Credit Scores Explained",
      description: "What is a credit score and why should you care about it?",
      thumbnailUrl: "/placeholder.svg",
      totalDuration: "20:15",
      isPublished: true,
      category: ModuleCategory.GENERAL,
      difficulty: ModuleDifficulty.INTERMEDIATE,
    },
    {
      title: "Money Goals",
      description: "Setting smart money goals and working towards them.",
      thumbnailUrl: "/placeholder.svg",
      totalDuration: "18:30",
      isPublished: true,
      category: ModuleCategory.BUDGETING,
      difficulty: ModuleDifficulty.BEGINNER,
    },
    {
      title: "Understanding Banks",
      description: "How banks work and how they help keep our money safe.",
      thumbnailUrl: "/placeholder.svg",
      totalDuration: "22:45",
      isPublished: true,
      category: ModuleCategory.GENERAL,
      difficulty: ModuleDifficulty.INTERMEDIATE,
    },
    {
      title: "Budgeting for Kids",
      description: "Simple ways to plan and track your money.",
      thumbnailUrl: "/placeholder.svg",
      totalDuration: "24:00",
      isPublished: true,
      category: ModuleCategory.BUDGETING,
      difficulty: ModuleDifficulty.BEGINNER,
    }
  ];

  for (const module of modules) {
    await prisma.module.upsert({
      where: { title: module.title },
      update: module,
      create: module,
    });
  }

  console.log('Modules seeded successfully');
  console.log('Seeding finished');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 