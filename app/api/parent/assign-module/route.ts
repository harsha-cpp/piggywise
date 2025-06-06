import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// POST /api/parent/assign-module - Assign a module to a child
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { childId, moduleId } = data;

    if (!childId || !moduleId) {
      return NextResponse.json({ error: 'Child ID and module ID are required' }, { status: 400 });
    }

    console.log(`Assigning module ${moduleId} to child ${childId}`);

    // Check if module assignment already exists
    const existingAssignment = await prisma.moduleAssignment.findFirst({
      where: {
        childId,
        moduleId,
      },
    });

    if (existingAssignment) {
      return NextResponse.json({
        message: 'Module already assigned to this child',
        assignment: existingAssignment,
      });
    }

    // Create new module assignment
    const assignment = await prisma.moduleAssignment.create({
      data: {
        moduleId,
        childId,
        assignedById: session.user.id,
      },
    });

    return NextResponse.json({
      message: 'Module assigned successfully',
      assignment,
    });
  } catch (error) {
    console.error('Error assigning module:', error);
    return NextResponse.json({ error: 'Failed to assign module' }, { status: 500 });
  }
}

// DELETE /api/parent/assign-module - Remove a module assignment
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get('childId');
    const moduleId = searchParams.get('moduleId');

    if (!childId || !moduleId) {
      return NextResponse.json({ error: 'Child ID and module ID are required' }, { status: 400 });
    }

    console.log(`Removing module ${moduleId} assignment from child ${childId}`);

    // Find and delete the assignment
    const assignment = await prisma.moduleAssignment.findFirst({
      where: {
        childId,
        moduleId,
      },
    });

    if (!assignment) {
      return NextResponse.json({ 
        message: 'Module assignment not found' 
      }, { status: 404 });
    }

    await prisma.moduleAssignment.delete({
      where: {
        id: assignment.id,
      },
    });

    return NextResponse.json({ 
      message: 'Module assignment removed successfully' 
    });
  } catch (error) {
    console.error('Error removing module assignment:', error);
    return NextResponse.json({ error: 'Failed to remove module assignment' }, { status: 500 });
  }
} 