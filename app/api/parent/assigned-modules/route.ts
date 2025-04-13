import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/parent/assigned-modules - Get modules assigned to a child
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 });
    }

    // Verify that the child is linked to this parent
    const relation = await prisma.userRelation.findFirst({
      where: {
        parentId: session.user.id,
        childId: childId,
      },
    });

    if (!relation) {
      return NextResponse.json({ error: 'Child not linked to your account' }, { status: 403 });
    }

    // Get all assigned modules for this child with module details
    const assignments = await prisma.moduleAssignment.findMany({
      where: {
        childId: childId,
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            category: true,
            ageRange: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    // Get progress info for each module
    const assignmentsWithProgress = await Promise.all(
      assignments.map(async (assignment) => {
        const progress = await prisma.moduleProgress.findFirst({
          where: {
            childId: childId,
            moduleId: assignment.moduleId,
          },
        });

        return {
          id: assignment.id,
          assignedAt: assignment.assignedAt,
          module: assignment.module,
          progress: progress ? {
            status: progress.status,
            completedLessons: progress.completedLessons,
            lastUpdated: progress.lastUpdated,
          } : {
            status: 'NOT_STARTED',
            completedLessons: 0,
            lastUpdated: null,
          },
        };
      })
    );

    return NextResponse.json({
      assignments: assignmentsWithProgress,
    });
  } catch (error) {
    console.error('Error fetching assigned modules:', error);
    return NextResponse.json({ error: 'Failed to fetch assigned modules' }, { status: 500 });
  }
} 