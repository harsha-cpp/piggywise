import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Get session and verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { amount } = await req.json();
    
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid XP amount provided' },
        { status: 400 }
      );
    }
    
    // Get current user's XP data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, xp: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate old and new levels
    const oldXP = user.xp || 0;
    const newXP = oldXP + amount;
    
    const oldLevel = Math.floor(oldXP / 100) + 1;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > oldLevel;
    
    // Calculate XP needed for next level
    const xpForNextLevel = newLevel * 100;
    const xpToNextLevel = xpForNextLevel - newXP;
    
    // Update user's XP in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: newXP }
    });
    
    // Return updated XP data
    return NextResponse.json({
      oldXP,
      newXP,
      earned: amount,
      oldLevel,
      newLevel,
      leveledUp,
      xpToNextLevel,
      nextLevel: newLevel + 1
    });
  } catch (error) {
    console.error('Error updating user XP:', error);
    return NextResponse.json(
      { error: 'Failed to update XP' },
      { status: 500 }
    );
  }
} 