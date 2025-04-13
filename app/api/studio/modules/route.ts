import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/auth"
import { uploadVideo } from "@/lib/cloudinary"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a parent
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { userType: true, id: true }
    })

    if (!user || user.userType !== 'PARENT') {
      return NextResponse.json({ error: "Only parents can create modules" }, { status: 403 })
    }

    const formData = await req.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const thumbnailUrl = formData.get("thumbnailUrl") as string
    const category = formData.get("category") as string
    const difficulty = formData.get("difficulty") as string
    const contentsStr = formData.get("contents") as string
    const videos = formData.getAll("videos") as File[]

    console.log("Received form data:", {
      title,
      description,
      thumbnailUrl,
      category,
      difficulty,
      contentsStr,
      videoCount: videos.length
    })

    // Validate required fields
    if (!title || !description || !contentsStr || !videos.length) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: {
          title: !title,
          description: !description,
          contents: !contentsStr,
          videos: !videos.length
        }
      }, { status: 400 })
    }

    // Parse contents
    let contents: any[]
    try {
      contents = JSON.parse(contentsStr)
      if (!Array.isArray(contents)) {
        throw new Error("Contents must be an array")
      }
    } catch (parseError) {
      console.error("[CONTENTS_PARSE_ERROR]", parseError)
      return NextResponse.json({ 
        error: "Invalid contents format",
        details: parseError instanceof Error ? parseError.message : String(parseError)
      }, { status: 400 })
    }

    // Upload videos to Cloudinary
    const videoUploads = await Promise.all(
      videos.map(async (video) => {
        const arrayBuffer = await video.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        return uploadVideo(buffer)
      })
    )

    // Calculate total duration
    const totalDuration = videoUploads.reduce((acc, video) => acc + video.duration, 0)
    const formattedDuration = `${Math.floor(totalDuration / 60)}:${Math.floor(totalDuration % 60).toString().padStart(2, '0')}`

    try {
      // Create module and its contents
      const module = await prisma.module.create({
        data: {
          title,
          description,
          thumbnailUrl,
          totalDuration: formattedDuration,
          category,
          difficulty,
          isPublished: true,
          creatorId: user.id,
          contents: {
            create: contents.map((content: any, index: number) => ({
              title: content.title,
              description: content.description || "",
              videoUrl: videoUploads[index].url,
              duration: `${Math.floor(videoUploads[index].duration / 60)}:${Math.floor(videoUploads[index].duration % 60).toString().padStart(2, '0')}`,
              order: index + 1,
            })),
          },
        },
        include: {
          contents: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
      })

      return NextResponse.json({ module })
    } catch (dbError) {
      console.error("[DB_ERROR]", dbError)
      return NextResponse.json({ 
        error: "Database error", 
        details: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined
      }, { status: 500 })
    }
  } catch (error) {
    console.error("[MODULE_STUDIO_CREATE]", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a parent
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { userType: true, id: true }
    })

    if (!user || user.userType !== 'PARENT') {
      return NextResponse.json({ error: "Only parents can access modules" }, { status: 403 })
    }

    // Get all modules created by this parent
    const modules = await prisma.module.findMany({
      where: {
        creatorId: user.id
      },
      include: {
        contents: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error("[MODULE_STUDIO_LIST]", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 