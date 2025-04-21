import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/modules/[id] - Get module details by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const moduleId = params.id;

    if (!moduleId) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 });
    }

    const module = await prisma.module.findUnique({
      where: {
        id: moduleId,
      },
      include: {
        contents: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    );
  }
}

// PATCH /api/modules/[id] - Update module details
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const moduleId = params.id;
    const data = await req.json();
    const { title, description, totalDuration, difficulty, category } = data;

    // Check module ownership
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!existingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (existingModule.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this module" },
        { status: 403 }
      );
    }

    // Update module
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title,
        description,
        totalDuration,
        difficulty: difficulty as any,
        category: category as any,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Module updated successfully",
      module: updatedModule,
    });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    );
  }
} 