import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`GET /api/child/modules/${params.id} - Fetching specific module`);
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log(`GET /api/child/modules/${params.id} - Unauthorized: No session`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify the user is a child
    if (session.user.userType !== "CHILD") {
      console.log(`GET /api/child/modules/${params.id} - Forbidden: Not a child account`);
      return NextResponse.json({ error: "Only child accounts can access this endpoint" }, { status: 403 });
    }

    // Find the module by ID
    const module = await prisma.module.findUnique({
      where: {
        id: params.id
      },
      include: {
        contents: {
          orderBy: {
            order: 'asc'
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!module) {
      console.log(`GET /api/child/modules/${params.id} - Module not found`);
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Get module progress for this user
    const progress = await prisma.moduleProgress.findFirst({
      where: {
        moduleId: params.id,
        childId: session.user.id
      }
    });

    // Transform contents into lessons format
    const lessons = module.contents.map(content => {
      // Check if we have progress data
      let isCompleted = false;
      
      // Set lessons as completed if:
      // 1. We have progress data and status is COMPLETED
      // 2. We have progress data, there's only one lesson, and completedLessons > 0
      if (progress) {
        if (progress.status === "COMPLETED") {
          isCompleted = true;
        } else if (module.contents.length === 1 && progress.completedLessons > 0) {
          isCompleted = true;
        }
      }
      
      return {
        id: content.id,
        title: content.title,
        description: content.description,
        duration: content.duration || "5 min",
        videoUrl: content.videoUrl,
        isCompleted: isCompleted // Set completion status based on progress data
      };
    });

    // Calculate completed lessons from progress data
    // Special case: for single-lesson modules, completedLessons should be 1 if the lesson is completed
    let completedLessons = progress?.completedLessons || 0;
    const totalLessons = lessons.length;
    
    // If there's only one lesson and it's marked as completed, set completedLessons to 1
    if (totalLessons === 1 && lessons[0].isCompleted) {
      completedLessons = 1;
    }
    
    // Set status based on completion
    let status = progress?.status || "NOT_STARTED";
    if (completedLessons >= totalLessons && totalLessons > 0) {
      status = "COMPLETED";
    } else if (completedLessons > 0) {
      status = "IN_PROGRESS";
    }

    // Format the module data for the client
    const formattedModule = {
      id: module.id,
      title: module.title,
      description: module.description,
      thumbnailUrl: module.thumbnailUrl,
      instructor: module.creator?.name || "Instructor",
      totalDuration: module.totalDuration || `${totalLessons * 5} min`,
      objectives: [
        "Learn about " + module.title,
        "Understand key concepts",
        "Practice financial skills"
      ],
      lessons,
      completedLessons,
      totalLessons,
      status
    };

    return NextResponse.json({ 
      module: formattedModule,
      progress: progress || null 
    });
    
  } catch (error) {
    console.error(`Error fetching module ${params.id}:`, error);
    return NextResponse.json({
      error: "Failed to fetch module",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 