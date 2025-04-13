import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

// GET /api/user - Get current user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only return specific fields to avoid exposing sensitive info
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      childId: user.childId,
      creditScore: user.creditScore
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

// PATCH /api/user - Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { name, childId } = data;

    // Validate data
    if (childId && childId.length < 4) {
      return NextResponse.json({ error: 'Child ID must be at least 4 characters' }, { status: 400 });
    }

    // Check if childId is already in use by another user
    if (childId) {
      const existingUser = await prisma.user.findUnique({
        where: {
          childId: childId,
        },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: 'Child ID is already in use' }, { status: 400 });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...(name && { name }),
        ...(childId && { childId }),
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      childId: updatedUser.childId,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
} 