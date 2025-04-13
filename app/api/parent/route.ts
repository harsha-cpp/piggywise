import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

// GET /api/parent - Get parent profile with linked children
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/parent - Fetching parent profile');
    
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('GET /api/parent - Unauthorized: No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`GET /api/parent - User ID: ${session.user.id}`);
    
    // Fetch parent with their linked children through UserRelation
    const parent = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        parentRelations: {
          include: {
            child: {
              select: {
                id: true,
                name: true,
                email: true,
                creditScore: true
              }
            }
          }
        }
      }
    });

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
    }

    // Transform the data to include children with their relation
    const children = parent.parentRelations.map(relation => ({
      id: relation.child.id,
      name: relation.child.name,
      email: relation.child.email,
      creditScore: relation.child.creditScore,
      relation: relation.relation
    }));

    return NextResponse.json({
      id: parent.id,
      name: parent.name,
      email: parent.email,
      children
    });
    
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch parent profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/parent - Update parent profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { relation } = data;

    // Validate relation
    if (relation && !['MOM', 'DAD', 'OTHER'].includes(relation)) {
      return NextResponse.json({ error: 'Invalid relation type' }, { status: 400 });
    }

    // Return a mock successful response without database access
    return NextResponse.json({
      id: session.user.id,
      name: session.user.name || 'Parent',
      email: session.user.email || 'parent@example.com',
      relation: relation || 'MOM',
      children: [] // Empty children array
    });
    
  } catch (error) {
    console.error('Error updating parent profile:', error);
    return NextResponse.json({ error: 'Failed to update parent profile' }, { status: 500 });
  }
} 