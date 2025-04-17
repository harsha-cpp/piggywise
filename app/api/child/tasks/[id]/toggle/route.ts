import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to update tasks" },
        { status: 401 }
      );
    }

    // Check user type
    if (session.user.userType !== "CHILD") {
      return NextResponse.json(
        { error: "Only children can update their task status" },
        { status: 403 }
      );
    }

    const taskId = params.id;
    const data = await req.json();

    // Validate input
    if (typeof data.completed !== 'boolean') {
      return NextResponse.json(
        { error: "Completed status is required" },
        { status: 400 }
      );
    }

    // Check if task is assigned to this child
    const taskExists = await prisma.task.findFirst({
      where: {
        id: taskId,
        childId: session.user.id,
      },
    });

    if (!taskExists) {
      return NextResponse.json(
        { error: "Task not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Update task status
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: data.completed ? "COMPLETED" : "PENDING",
        completedAt: data.completed ? new Date() : null,
      },
    });

    // If the task is marked as completed, award experience points to the child
    if (data.completed && taskExists.status !== "COMPLETED") {
      // Award 20 XP for completing a task
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          xp: {
            increment: 20,
          },
        },
      });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
} 