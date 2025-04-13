import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all published modules
    const modules = await prisma.module.findMany({
      where: {
        isPublished: true,
      },
      include: {
        contents: {
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error("[MODULES_MARKETPLACE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 