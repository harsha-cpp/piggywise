import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Verify the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { amount } = await req.json();
    
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, xp: true, level: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Calculate new XP and level
    const currentXp = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXp = currentXp + amount;
    
    // Simple level calculation: 100 XP per level, starting at level 1 with 0 XP
    const newLevel = Math.floor(newXp / 100) + 1;
    const leveledUp = newLevel > currentLevel;
    
    // Update user with new XP and level
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        xp: newXp,
        level: newLevel
      }
    });
    
    // Calculate XP needed for next level
    const xpForNextLevel = newLevel * 100;
    const xpToNextLevel = xpForNextLevel - newXp;
    const nextLevel = newLevel + 1;
    
    return NextResponse.json({
      success: true,
      newXp,
      newLevel,
      leveledUp,
      xpToNextLevel,
      nextLevel
    });
    
  } catch (error) {
    console.error("Error updating XP:", error);
    return NextResponse.json(
      { error: "Error updating XP" },
      { status: 500 }
    );
  }
} 