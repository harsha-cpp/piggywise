import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Verify the session
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // If user is a child, use their own ID for progress data
    const childId = session.user.id;
    
    // Get module progress data for the child
    const progressData = await prisma.moduleProgress.findMany({
      where: {
        childId: childId
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            category: true,
            totalLessons: true,
            contents: {
              select: {
                id: true,
                title: true,
                duration: true
              }
            }
          }
        }
      }
    });
    
    // Get assigned modules that don't yet have progress data
    const assignedModules = await prisma.moduleAssignment.findMany({
      where: {
        childId: childId,
        NOT: {
          moduleId: {
            in: progressData.map(p => p.moduleId)
          }
        }
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            category: true,
            totalLessons: true,
            contents: {
              select: {
                id: true,
                title: true,
                duration: true
              }
            }
          }
        }
      }
    });
    
    // Format and combine module data
    const modules = [
      ...progressData.map(item => ({
        id: item.module.id,
        title: item.module.title,
        description: item.module.description,
        thumbnail: item.module.thumbnailUrl || "/placeholder.svg",
        completedLessons: item.completedLessons,
        totalLessons: item.module.totalLessons || item.module.contents?.length || 5,
        lessons: item.module.contents?.map((lesson, index) => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || "5:00",
          isCompleted: index < item.completedLessons
        })) || []
      })),
      ...assignedModules.map(item => ({
        id: item.module.id,
        title: item.module.title,
        description: item.module.description,
        thumbnail: item.module.thumbnailUrl || "/placeholder.svg",
        completedLessons: 0,
        totalLessons: item.module.totalLessons || item.module.contents?.length || 5,
        lessons: item.module.contents?.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || "5:00",
          isCompleted: false
        })) || []
      }))
    ];
    
    // Calculate overall statistics
    const totalModules = modules.length;
    const completedModules = modules.filter(m => m.completedLessons === m.totalLessons).length;
    const totalLessons = modules.reduce((sum, module) => sum + module.totalLessons, 0);
    const completedLessons = modules.reduce((sum, module) => sum + module.completedLessons, 0);
    const overallProgress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;
    
    const stats = {
      totalModules,
      completedModules,
      totalLessons,
      completedLessons,
      overallProgress
    };
    
    return NextResponse.json({ 
      modules,
      stats
    });
    
  } catch (error) {
    console.error("Error fetching modules:", error)
    return NextResponse.json(
      { error: "Error fetching modules" },
      { status: 500 }
    )
  }
} 