import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session?.user?.userType !== "CHILD") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { moduleId, completedLessons, status } = await req.json()

    if (!moduleId || typeof completedLessons !== 'number') {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if module is assigned to child
    const assignment = await prisma.moduleAssignment.findFirst({
      where: {
        moduleId,
        childId: session.user.id,
      },
    })

    if (!assignment) {
      return new NextResponse("Module not assigned to child", { status: 404 })
    }

    // Update progress
    const progress = await prisma.moduleProgress.upsert({
      where: {
        childId_moduleId: {
          childId: session.user.id,
          moduleId,
        },
      },
      create: {
        childId: session.user.id,
        moduleId,
        completedLessons,
        status: status || "IN_PROGRESS",
      },
      update: {
        completedLessons,
        status: status || "IN_PROGRESS",
        lastUpdated: new Date(),
      },
    })

    // If all lessons are completed, update status to COMPLETED
    if (status === "COMPLETED") {
      await prisma.moduleProgress.update({
        where: {
          id: progress.id,
        },
        data: {
          status: "COMPLETED",
        },
      })
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("[MODULES_PROGRESS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const childId = searchParams.get("childId")
    const moduleId = searchParams.get("moduleId")

    // If user is a parent, they must provide a childId
    if (session.user.userType === "PARENT" && !childId) {
      return new NextResponse("Child ID required", { status: 400 })
    }

    // If user is a child, use their own ID
    const targetChildId = session.user.userType === "CHILD" ? session.user.id : childId

    // If parent, verify child belongs to them
    if (session.user.userType === "PARENT") {
      const child = await prisma.user.findFirst({
        where: {
          id: targetChildId,
          parentId: session.user.id,
        },
      })

      if (!child) {
        return new NextResponse("Child not found", { status: 404 })
      }
    }

    const whereClause = moduleId 
      ? { childId: targetChildId, moduleId }
      : { childId: targetChildId }

    const progress = await prisma.moduleProgress.findMany({
      where: whereClause,
      include: {
        module: true,
      },
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("[MODULES_PROGRESS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 