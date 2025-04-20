import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/child/save-progress - Saving progress");
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("POST /api/child/save-progress - Unauthorized: No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify the user is a child
    if (session.user.userType !== "CHILD") {
      console.log("POST /api/child/save-progress - Forbidden: Not a child account");
      return NextResponse.json({ error: "Only child accounts can access this endpoint" }, { status: 403 });
    }

    // Parse the request body
    const { moduleId, completedLessons, status, lessonId } = await req.json();

    console.log("Progress update request:", { moduleId, completedLessons, status, lessonId });

    if (!moduleId) {
      console.log("POST /api/child/save-progress - Bad request: Missing moduleId");
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 });
    }

    // Find existing progress
    const existingProgress = await prisma.moduleProgress.findFirst({
      where: {
        childId: session.user.id,
        moduleId: moduleId
      }
    });

    // Update or create progress
    let progress;
    if (existingProgress) {
      // Update existing record
      progress = await prisma.moduleProgress.update({
        where: {
          id: existingProgress.id
        },
        data: {
          completedLessons: completedLessons,
          status: status || "IN_PROGRESS",
          lastUpdated: new Date()
        }
      });
    } else {
      // Create new record
      progress = await prisma.moduleProgress.create({
        data: {
          childId: session.user.id,
          moduleId: moduleId,
          completedLessons: completedLessons,
          status: status || "IN_PROGRESS",
          lastUpdated: new Date()
        }
      });
    }

    console.log("Progress saved:", progress);
    
    return NextResponse.json({ 
      success: true,
      progress 
    });
    
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json({
      error: "Failed to save progress",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 