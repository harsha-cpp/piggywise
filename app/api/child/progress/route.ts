import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get session and verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch the child's assigned modules
    const assignedModules = await prisma.module.findMany({
      where: {
        moduleAssignments: {
          some: {
            childId: session.user.id
          }
        }
      },
      include: {
        lessons: true,
        progress: {
          where: {
            childId: session.user.id
          }
        }
      }
    });
    
    // Calculate total lessons and completed lessons
    let totalLessonsCompleted = 0;
    let totalModulesCompleted = 0;
    
    assignedModules.forEach(module => {
      // If there's progress data for this module
      if (module.progress && module.progress.length > 0) {
        const moduleProgress = module.progress[0];
        totalLessonsCompleted += moduleProgress.completedLessons || 0;
        
        // Check if module is completed (all lessons completed)
        if (moduleProgress.completedLessons === module.lessons.length) {
          totalModulesCompleted++;
        }
      } else if (module.status === 'COMPLETED') {
        // If module is marked as completed but no progress details
        totalModulesCompleted++;
        totalLessonsCompleted += module.lessons.length;
      }
    });
    
    // Calculate XP
    const lessonXP = totalLessonsCompleted * 25; // 25 XP per lesson
    const moduleXP = totalModulesCompleted * 20; // 20 XP bonus per module
    const totalXP = lessonXP + moduleXP;
    
    // Calculate level (100 XP per level)
    const userLevel = Math.floor(totalXP / 100) + 1;
    
    // Calculate progress to next level
    const xpForCurrentLevel = (userLevel - 1) * 100;
    const xpForNextLevel = userLevel * 100;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const currentLevelProgress = Math.min(100, Math.round(((totalXP - xpForCurrentLevel) / 100) * 100));
    
    return NextResponse.json({
      lessonsCompleted: totalLessonsCompleted,
      modulesCompleted: totalModulesCompleted,
      userXP: totalXP,
      userLevel: userLevel,
      nextLevel: userLevel + 1,
      xpToNextLevel: xpNeededForNextLevel,
      levelProgress: currentLevelProgress
    });
  } catch (error) {
    console.error('Error fetching child progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
} 