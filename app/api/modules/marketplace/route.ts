import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/auth"

export async function GET() {
  try {
    console.log("Fetching marketplace modules...");
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log("No session found");
      return new NextResponse("Unauthorized", { status: 401 })
    }

    console.log("User authenticated, querying modules...");

    // Get all published marketplace modules
    const modules = await prisma.module.findMany({
      where: {
        isPublished: true,
        isMarketplace: true,
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
        creator: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`Found ${modules.length} modules`);

    // Transform the data to match the expected format
    const transformedModules = modules.map(module => ({
      id: module.id,
      title: module.title,
      description: module.description,
      duration: module.totalDuration,
      instructor: module.creator?.name || 'Unknown Instructor',
      level: module.difficulty,
      thumbnail: module.thumbnailUrl,
      category: module.category,
      contents: module.contents,
    }))

    console.log("Returning transformed modules:", transformedModules);

    return NextResponse.json({ modules: transformedModules })
  } catch (error) {
    console.error("[MODULES_MARKETPLACE] Error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 