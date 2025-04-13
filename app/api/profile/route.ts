import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// GET /api/profile - Get current user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a child ID based on session user ID to ensure consistency
    const childId = session.user.userType === 'CHILD' 
      ? `CHILD${session.user.id.substring(0, 5)}` 
      : null;

    // Return a simple mock profile with the essential data
    return NextResponse.json({
      id: session.user.id,
      name: session.user.name || 'User',
      email: session.user.email,
      userType: session.user.userType,
      childId: childId || 'CHILD123', // Always provide a childId for child users
      creditScore: 500
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 