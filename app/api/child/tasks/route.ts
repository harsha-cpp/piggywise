import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to view tasks" },
        { status: 401 }
      );
    }

    // Check user type
    if (session.user.userType !== "CHILD") {
      return NextResponse.json(
        { error: "Only children can view their assigned tasks" },
        { status: 403 }
      );
    }

    // Get all tasks assigned to the child
    const tasks = await prisma.task.findMany({
      where: {
        childId: session.user.id,
      },
      orderBy: [
        {
          status: "asc", // PENDING first, then COMPLETED
        },
        {
          dueDate: "asc", // Earlier due dates first
        },
        {
          createdAt: "desc", // Newer tasks first
        },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
} 