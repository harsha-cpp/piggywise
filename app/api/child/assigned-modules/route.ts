import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/child/assigned-modules - Fetching assigned modules");
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("GET /api/child/assigned-modules - Unauthorized: No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify the user is a child
    if (session.user.userType !== "CHILD") {
      console.log("GET /api/child/assigned-modules - Forbidden: Not a child account");
      return NextResponse.json({ error: "Only child accounts can access this endpoint" }, { status: 403 });
    }
    
    // Find the child's parent relationship
    const childParentRelation = await prisma.userRelation.findFirst({
      where: {
        childId: session.user.id
      },
      select: {
        parentId: true
      }
    });

    if (!childParentRelation) {
      console.log("GET /api/child/assigned-modules - Child not linked to any parent");
      return NextResponse.json({ 
        modules: [],
        isLinked: false,
        message: "Child is not linked to any parent yet" 
      });
    }

    const parentId = childParentRelation.parentId;

    // Get modules explicitly assigned to the child
    const assignedModules = await prisma.moduleAssignment.findMany({
      where: {
        childId: session.user.id
      },
      include: {
        module: {
          include: {
            contents: true
          }
        }
      }
    });

    // Get modules created by the parent (even if not explicitly assigned)
    const parentCreatedModules = await prisma.module.findMany({
      where: {
        creatorId: parentId
      },
      include: {
        contents: true
      }
    });

    // Get progress data for all modules
    const progressData = await prisma.moduleProgress.findMany({
      where: {
        childId: session.user.id,
        moduleId: {
          in: [
            ...assignedModules.map(am => am.module.id),
            ...parentCreatedModules.map(m => m.id)
          ]
        }
      }
    });

    // Create a map of progress data by moduleId for easy lookup
    const progressMap = progressData.reduce((map, progress) => {
      map[progress.moduleId] = progress;
      return map;
    }, {} as Record<string, any>);
    
    // Combine and deduplicate modules (assigned + parent created)
    const assignedModuleIds = new Set(assignedModules.map(am => am.module.id));
    const allModules = [
      ...assignedModules.map(am => ({
        ...am.module,
        progress: progressMap[am.module.id] || null,
        thumbnailUrl: am.module.thumbnailUrl || null
      })),
      ...parentCreatedModules
        .filter(m => !assignedModuleIds.has(m.id))
        .map(m => ({
          ...m,
          progress: progressMap[m.id] || null,
          thumbnailUrl: m.thumbnailUrl || null
        }))
    ];

    return NextResponse.json({ 
      modules: allModules,
      isLinked: true
    });
    
  } catch (error) {
    console.error("Error fetching assigned modules:", error);
    return NextResponse.json({
      error: "Failed to fetch assigned modules",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 