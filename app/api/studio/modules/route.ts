import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/auth"
import { uploadVideo, uploadImage } from "@/lib/cloudinary"

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
    const thumbnail = formData.get("thumbnail") as File
    const category = formData.get("category") as string
    const difficulty = formData.get("difficulty") as string

    // Extract lesson data
    const lessons: Array<{
      title: string;
      description: string;
      video: File;
    }> = [];

    // Parse lesson data from formData
    let index = 0;
    while (formData.has(`lessons[${index}][title]`)) {
      const lessonTitle = formData.get(`lessons[${index}][title]`) as string;
      const lessonDescription = formData.get(`lessons[${index}][description]`) as string;
      const lessonVideo = formData.get(`lessons[${index}][video]`) as File;

      lessons.push({
        title: lessonTitle,
        description: lessonDescription,
        video: lessonVideo,
      });

      index++;
    }

    console.log("Received form data:", {
      title,
      description,
      category,
      difficulty,
      lessonCount: lessons.length
    });

    // Validate required fields
    if (!title || !description || !thumbnail || lessons.length === 0) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: {
          title: !title,
          description: !description,
          thumbnail: !thumbnail,
          lessons: lessons.length === 0
        }
      }, { status: 400 })
    }

    try {
      // Upload thumbnail to Cloudinary
      const thumbnailBuffer = await thumbnail.arrayBuffer();
      const thumbnailBase64 = Buffer.from(thumbnailBuffer).toString('base64');
      const thumbnailDataURI = `data:${thumbnail.type};base64,${thumbnailBase64}`;
      const uploadedThumbnail = await uploadImage(thumbnailDataURI);

      // Upload videos to Cloudinary
      const videoUploads = await Promise.all(
        lessons.map(async (lesson) => {
          const videoBuffer = await lesson.video.arrayBuffer();
          const videoBase64 = Buffer.from(videoBuffer).toString('base64');
          const videoDataURI = `data:${lesson.video.type};base64,${videoBase64}`;
          return uploadVideo(videoDataURI);
        })
      );

      // Calculate total duration
      const totalDuration = videoUploads.reduce((acc, video) => acc + video.duration, 0);
      const formattedDuration = `${Math.floor(totalDuration / 60)}:${Math.floor(totalDuration % 60).toString().padStart(2, '0')}`;

      // Create module and its contents
      const module = await prisma.module.create({
        data: {
          title,
          description,
          thumbnailUrl: uploadedThumbnail.url,
          totalDuration: formattedDuration,
          totalLessons: lessons.length,
          category,
          difficulty,
          isPublished: true,
          isMarketplace: true,
          creatorId: user.id,
          contents: {
            create: lessons.map((lesson, index) => ({
              title: lesson.title,
              description: lesson.description,
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
      });

      return NextResponse.json({ module });
    } catch (dbError) {
      console.error("[DB_ERROR]", dbError);
      return NextResponse.json({ 
        error: "Database error", 
        details: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[MODULE_STUDIO_CREATE]", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
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