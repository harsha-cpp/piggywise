import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

// POST /api/parent/link-child - Link a child to a parent account
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/parent/link-child - Linking child');
    
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('POST /api/parent/link-child - Unauthorized: No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a parent
    if (session.user.userType !== 'PARENT') {
      return NextResponse.json({ error: 'Only parent accounts can link children' }, { status: 403 });
    }

    const data = await req.json();
    const { childEmail, relation } = data;

    if (!childEmail) {
      console.log('POST /api/parent/link-child - Child email is required');
      return NextResponse.json({ error: 'Child email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(childEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    console.log(`POST /api/parent/link-child - Looking for child with email: ${childEmail}`);
    
    // Find the child user by email
    const childUser = await prisma.user.findFirst({
      where: {
        email: childEmail,
        userType: 'CHILD'
      },
    });

    if (!childUser) {
      console.log('POST /api/parent/link-child - No child account found with that email');
      return NextResponse.json({ 
        error: 'No child account found with that email address. Please make sure your child has created an account first.' 
      }, { status: 404 });
    }

    console.log(`POST /api/parent/link-child - Found child: ${childUser.id}`);
    
    // Check if child is already linked to this parent
    const existingRelation = await prisma.userRelation.findFirst({
      where: {
        parentId: session.user.id,
        childId: childUser.id,
      },
    });

    if (existingRelation) {
      console.log('POST /api/parent/link-child - Child already linked to this parent');
      return NextResponse.json({ error: 'This child is already linked to your account' }, { status: 400 });
    }

    // Check if child is already linked to another parent
    const otherParentRelation = await prisma.userRelation.findFirst({
      where: {
        childId: childUser.id,
      },
    });

    if (otherParentRelation) {
      console.log('POST /api/parent/link-child - Child already linked to another parent');
      return NextResponse.json({ 
        error: 'This child is already linked to another parent account. Please contact support for assistance.' 
      }, { status: 400 });
    }

    // Create relation with the specified relation type
    try {
      const newRelation = await prisma.userRelation.create({
        data: {
          parentId: session.user.id,
          childId: childUser.id,
          relation: relation || 'OTHER',
        },
      });

      console.log(`POST /api/parent/link-child - Created relation: ${newRelation.id}`);
      
      return NextResponse.json({ 
        message: 'Child linked successfully',
        childId: childUser.id,
        childName: childUser.name,
        childEmail: childUser.email
      });
    } catch (dbError) {
      console.error('Database error creating relation:', dbError);
      return NextResponse.json({ 
        error: 'Failed to create relation',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error linking child:', error);
    return NextResponse.json({ 
      error: 'Failed to link child',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/parent/link-child - Unlink a child from a parent account
export async function DELETE(req: NextRequest) {
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

    // Check if relation exists
    const existingRelation = await prisma.userRelation.findFirst({
      where: {
        parentId: session.user.id,
        childId: childId,
      },
    });

    if (!existingRelation) {
      return NextResponse.json({ error: 'Child not linked to your account' }, { status: 404 });
    }

    // Delete relation
    await prisma.userRelation.delete({
      where: {
        id: existingRelation.id,
      },
    });

    return NextResponse.json({ message: 'Child unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking child:', error);
    return NextResponse.json({ error: 'Failed to unlink child' }, { status: 500 });
  }
} 