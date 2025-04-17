import { PrismaClient, ModuleCategory, ModuleDifficulty, UserType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // Create system admin account
  const hashedPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@piggywise.com' },
    update: {},
    create: {
      email: 'admin@piggywise.com',
      name: 'System Admin',
      password: hashedPassword,
      userType: UserType.PARENT, // Using PARENT type since we don't have ADMIN type
    },
  });

  console.log('System admin created successfully');
  
  // Create test parent account
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

  // Default modules created by system admin
  const defaultModules = [
    {
      title: "Introduction to Money",
      description: "Learn about different types of money and how we use it in everyday life. Perfect for beginners!",
      thumbnailUrl: "/modules/intro-to-money.jpg",
      totalDuration: "30:00",
      totalLessons: 5,
      isPublished: true,
      isMarketplace: true,
      category: ModuleCategory.GENERAL,
      difficulty: ModuleDifficulty.BEGINNER,
      creatorId: admin.id,
    },
    {
      title: "Smart Saving Habits",
      description: "Discover fun and effective ways to save money and develop good financial habits early in life.",
      thumbnailUrl: "/modules/smart-saving.jpg",
      totalDuration: "25:00",
      totalLessons: 4,
      isPublished: true,
      isMarketplace: true,
      category: ModuleCategory.SAVINGS,
      difficulty: ModuleDifficulty.BEGINNER,
      creatorId: admin.id,
    },
    {
      title: "Budgeting Basics",
      description: "Learn how to create and stick to a budget, making your money work for you!",
      thumbnailUrl: "/modules/budgeting-basics.jpg",
      totalDuration: "35:00",
      totalLessons: 6,
      isPublished: true,
      isMarketplace: true,
      category: ModuleCategory.BUDGETING,
      difficulty: ModuleDifficulty.BEGINNER,
      creatorId: admin.id,
    },
    {
      title: "Money Goals & Dreams",
      description: "Set financial goals and learn how to achieve them through smart planning and dedication.",
      thumbnailUrl: "/modules/money-goals.jpg",
      totalDuration: "28:00",
      totalLessons: 5,
      isPublished: true,
      isMarketplace: true,
      category: ModuleCategory.GENERAL,
      difficulty: ModuleDifficulty.INTERMEDIATE,
      creatorId: admin.id,
    },
    {
      title: "Understanding Banks",
      description: "Explore how banks work and why they're important for keeping your money safe.",
      thumbnailUrl: "/modules/banking-basics.jpg",
      totalDuration: "32:00",
      totalLessons: 5,
      isPublished: true,
      isMarketplace: true,
      category: ModuleCategory.GENERAL,
      difficulty: ModuleDifficulty.INTERMEDIATE,
      creatorId: admin.id,
    }
  ];

  // Create default modules
  for (const module of defaultModules) {
    await prisma.module.upsert({
      where: { title: module.title },
      update: {},
      create: module,
    });
  }

  console.log('Default modules seeded successfully');

  // Example module content for the first module
  const introToMoneyModule = await prisma.module.findUnique({
    where: { title: "Introduction to Money" },
  });

  if (introToMoneyModule) {
    const moduleContents = [
      {
        title: "What is Money?",
        description: "Understanding the basic concept of money and its importance",
        videoUrl: "https://example.com/videos/what-is-money",
        duration: "6:00",
        order: 1,
        moduleId: introToMoneyModule.id,
      },
      {
        title: "Different Types of Money",
        description: "Learn about cash, coins, and digital money",
        videoUrl: "https://example.com/videos/types-of-money",
        duration: "6:30",
        order: 2,
        moduleId: introToMoneyModule.id,
      },
      {
        title: "How We Use Money",
        description: "Exploring everyday uses of money",
        videoUrl: "https://example.com/videos/using-money",
        duration: "5:30",
        order: 3,
        moduleId: introToMoneyModule.id,
      },
      {
        title: "The Value of Money",
        description: "Understanding what different amounts can buy",
        videoUrl: "https://example.com/videos/money-value",
        duration: "6:00",
        order: 4,
        moduleId: introToMoneyModule.id,
      },
      {
        title: "Money Safety",
        description: "Learning how to keep money safe",
        videoUrl: "https://example.com/videos/money-safety",
        duration: "6:00",
        order: 5,
        moduleId: introToMoneyModule.id,
      }
    ];

    for (const content of moduleContents) {
      await prisma.moduleContent.upsert({
        where: {
          id: `${content.moduleId}-${content.order}`,
        },
        update: {},
        create: content,
      });
    }
  }

  console.log('Module contents seeded successfully');
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