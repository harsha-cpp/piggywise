import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/child/module-progress - Get progress for all modules for a child
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const childId = session.user.id;

    // Get all module progress entries for this child
    const progress = await prisma.moduleProgress.findMany({
      where: {
        childId,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            category: true,
          },
        },
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    // Get assigned modules that don't have progress yet
    const assignedModules = await prisma.moduleAssignment.findMany({
      where: {
        childId,
        NOT: {
          moduleId: {
            in: progress.map(p => p.moduleId),
          },
        },
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            category: true,
          },
        },
      },
    });

    // Combine progress with assigned modules that don't have progress yet
    const completeProgress = [
      ...progress,
      ...assignedModules.map(assignment => ({
        id: undefined,
        childId,
        moduleId: assignment.moduleId,
        status: 'NOT_STARTED',
        completedLessons: 0,
        lastUpdated: null,
        module: {
          ...assignment.module,
          imageUrl: assignment.module.thumbnailUrl // Map thumbnailUrl to imageUrl for frontend compatibility
        },
      })),
    ];

    // Map thumbnailUrl to imageUrl in progress entries for frontend compatibility
    const mappedProgress = completeProgress.map(item => ({
      ...item,
      module: {
        ...item.module,
        imageUrl: item.module.thumbnailUrl
      }
    }));

    return NextResponse.json({
      progress: mappedProgress,
    });
  } catch (error) {
    console.error('Error fetching module progress:', error);
    return NextResponse.json({ error: 'Failed to fetch module progress' }, { status: 500 });
  }
}

// POST /api/child/module-progress - Update progress for a module
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const childId = session.user.id;
    const body = await req.json();
    const { moduleId, lessonId, status, completedLessons } = body;

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    // Check if this module is assigned to the child
    const assignment = await prisma.moduleAssignment.findFirst({
      where: {
        childId,
        moduleId,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Module not assigned to this child' }, { status: 403 });
    }

    // Get existing progress or create new
    let progress = await prisma.moduleProgress.findFirst({
      where: {
        childId,
        moduleId,
      },
    });

    if (progress) {
      // Update existing progress
      progress = await prisma.moduleProgress.update({
        where: {
          id: progress.id,
        },
        data: {
          status: status || progress.status,
          completedLessons: completedLessons !== undefined ? completedLessons : progress.completedLessons,
          lastUpdated: new Date(),
        },
      });
    } else {
      // Create new progress
      progress = await prisma.moduleProgress.create({
        data: {
          childId,
          moduleId,
          status: status || 'IN_PROGRESS',
          completedLessons: completedLessons || 1,
          lastUpdated: new Date(),
        },
      });
    }

    // If a lesson was completed, record it
    if (lessonId) {
      await prisma.lessonCompletion.upsert({
        where: {
          childId_lessonId: {
            childId,
            lessonId,
          },
        },
        create: {
          childId,
          lessonId,
          completedAt: new Date(),
        },
        update: {
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      progress,
    });
  } catch (error) {
    console.error('Error updating module progress:', error);
    return NextResponse.json({ error: 'Failed to update module progress' }, { status: 500 });
  }
} 