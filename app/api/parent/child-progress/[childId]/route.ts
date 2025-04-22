import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    console.log(`GET /api/parent/child-progress/${params.childId} - Fetching child progress`);
    
    // Get the child ID from route params
    const { childId } = params;
    
    if (!childId) {
      console.log('GET /api/parent/child-progress - Child ID is required');
      return NextResponse.json(
        { error: "Child ID is required" },
        { status: 400 }
      );
    }
    
    // Verify the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('GET /api/parent/child-progress - Unauthorized');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log('Parent User ID:', session.user.id);
    console.log('Child ID:', childId);
    
    // Verify the user is a parent
    if (session.user.userType !== "PARENT") {
      console.log('GET /api/parent/child-progress - Only parent accounts can access');
      return NextResponse.json(
        { error: "Only parent accounts can access child progress" },
        { status: 403 }
      );
    }
    
    // Verify this child belongs to the parent
    const child = await prisma.user.findFirst({
      where: {
        id: childId,
        OR: [
          { parentId: session.user.id },
          {
            parentRelations: {
              some: {
                parentId: session.user.id
              }
            }
          }
        ]
      }
    });

    if (!child) {
      console.log('Child not found or not linked to parent');
      return NextResponse.json(
        { error: "Child not found or not linked to this parent" },
        { status: 404 }
      );
    }

    console.log('Child found:', child.name);
    console.log("Fetching modules created by parent:", session.user.id);
    
    // Get all modules created by this parent
    const parentModules = await prisma.module.findMany({
      where: {
        creatorId: session.user.id
      },
      include: {
        contents: true
      }
    });
    
    console.log(`Found ${parentModules.length} modules created by parent`);
    
    if (parentModules.length > 0) {
      parentModules.forEach((module, index) => {
        console.log(`Module ${index+1}:`, { id: module.id, title: module.title });
      });
    }

    // Get module assignments 
    const moduleAssignments = await prisma.moduleAssignment.findMany({
      where: {
        childId: childId,
        moduleId: {
          in: parentModules.map(m => m.id)
        }
      }
    });
    
    console.log(`Found ${moduleAssignments.length} module assignments for this child`);
    
    // Get progress entries
    const progressEntries = await prisma.moduleProgress.findMany({
      where: {
        childId: childId,
        moduleId: {
          in: parentModules.map(m => m.id)
        }
      }
    });
    
    console.log(`Found ${progressEntries.length} progress entries for this child`);

    // Format progress data
    const progressData = parentModules.map(module => {
      const assignment = moduleAssignments.find(a => a.moduleId === module.id);
      const progress = progressEntries.find(p => p.moduleId === module.id);
      const totalLessons = module.totalLessons || module.contents.length || 1;
      
      // If we found progress data
      if (progress) {
        const completionPercentage = Math.round((progress.completedLessons / totalLessons) * 100);
        
        return {
          id: progress.id,
          moduleId: module.id,
          status: progress.status,
          completedLessons: progress.completedLessons,
          totalLessons: totalLessons,
          lastUpdated: progress.lastUpdated,
          completionPercentage: completionPercentage,
          isAssigned: !!assignment,
          module: {
            id: module.id,
            title: module.title,
            description: module.description,
            thumbnailUrl: module.thumbnailUrl,
            category: module.category,
            difficulty: module.difficulty
          }
        };
      }
      
      // If no progress, create default entry
      return {
        id: "",
        moduleId: module.id,
        status: "NOT_STARTED",
        completedLessons: 0,
        totalLessons: totalLessons,
        lastUpdated: null,
        completionPercentage: 0,
        isAssigned: !!assignment,
        module: {
          id: module.id,
          title: module.title,
          description: module.description,
          thumbnailUrl: module.thumbnailUrl,
          category: module.category,
          difficulty: module.difficulty
        }
      };
    });

    console.log(`Returning progress data for ${progressData.length} modules`);

    return NextResponse.json({
      child: {
        id: child.id,
        name: child.name,
        email: child.email,
        creditScore: child.creditScore || 0,
        childId: child.childId
      },
      progressData: progressData,
      isLinked: true
    });
    
  } catch (error) {
    console.error("Get child progress error:", error);
    return NextResponse.json(
      { 
        error: "Error getting child progress",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 