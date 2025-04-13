import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session?.user?.userType !== "PARENT") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { moduleId, childId } = await req.json()

    if (!moduleId || !childId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if child belongs to parent
    const child = await prisma.user.findFirst({
      where: {
        id: childId,
        parentId: session.user.id,
      },
    })

    if (!child) {
      return new NextResponse("Child not found", { status: 404 })
    }

    // Check if module exists and is published
    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        isPublished: true,
      },
    })

    if (!module) {
      return new NextResponse("Module not found", { status: 404 })
    }

    // Check if child already has this module assigned
    const existingAssignment = await prisma.moduleAssignment.findFirst({
      where: {
        moduleId,
        childId,
      },
    })

    if (existingAssignment) {
      return new NextResponse("Module already assigned to child", { status: 400 })
    }

    // Check if child has reached the maximum number of assigned modules (3)
    const assignedModulesCount = await prisma.moduleAssignment.count({
      where: {
        childId,
      },
    })

    if (assignedModulesCount >= 3) {
      return new NextResponse("Maximum number of modules (3) already assigned", { status: 400 })
    }

    // Create module assignment and progress
    const [assignment, progress] = await prisma.$transaction([
      prisma.moduleAssignment.create({
        data: {
          moduleId,
          childId,
          assignedById: session.user.id,
        },
      }),
      prisma.moduleProgress.create({
        data: {
          moduleId,
          childId,
          status: "NOT_STARTED",
          completedLessons: 0,
        },
      }),
    ])

    return NextResponse.json({ assignment, progress })
  } catch (error) {
    console.error("[MODULES_ASSIGN]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 