import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a parent
    if (session.user.userType !== 'PARENT') {
      return NextResponse.json({ error: 'Only parent accounts can update child details' }, { status: 403 });
    }

    const data = await req.json();
    const { childId, name } = data;

    if (!childId || !name) {
      return NextResponse.json({ error: 'Child ID and name are required' }, { status: 400 });
    }

    // Verify the child is linked to this parent
    const relation = await prisma.userRelation.findFirst({
      where: {
        parentId: session.user.id,
        childId: childId,
      },
    });

    if (!relation) {
      return NextResponse.json({ error: 'Child not linked to your account' }, { status: 403 });
    }

    // Update the child's name
    const updatedChild = await prisma.user.update({
      where: {
        id: childId,
      },
      data: {
        name: name,
      },
    });

    return NextResponse.json({
      message: 'Child name updated successfully',
      child: {
        id: updatedChild.id,
        name: updatedChild.name,
      },
    });
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json({ 
      error: 'Failed to update child',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 