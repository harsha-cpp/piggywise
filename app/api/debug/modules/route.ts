import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("DEBUG: Fetching all modules in the database");
    
    // Get all modules regardless of creator
    const allModules = await prisma.module.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
          }
        },
        contents: true
      }
    });
    
    console.log(`DEBUG: Found ${allModules.length} total modules in database`);
    
    // Get all module assignments
    const allAssignments = await prisma.moduleAssignment.findMany({
      include: {
        child: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        module: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    console.log(`DEBUG: Found ${allAssignments.length} module assignments`);
    
    // Get all module progress
    const allProgress = await prisma.moduleProgress.findMany({
      include: {
        child: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        module: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    console.log(`DEBUG: Found ${allProgress.length} module progress records`);
    
    return NextResponse.json({
      moduleCount: allModules.length,
      modules: allModules,
      assignmentCount: allAssignments.length,
      assignments: allAssignments,
      progressCount: allProgress.length,
      progress: allProgress
    });
  } catch (error) {
    console.error("[DEBUG_MODULES]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
} 