import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
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
    if (session.user.userType !== "PARENT") {
      return NextResponse.json(
        { error: "Only parents can update tasks" },
        { status: 403 }
      );
    }

    const taskId = params.id;
    const data = await req.json();

    // Check if task belongs to parent
    const taskExists = await prisma.task.findFirst({
      where: {
        id: taskId,
        parentId: session.user.id,
      },
    });

    if (!taskExists) {
      return NextResponse.json(
        { error: "Task not found or not created by you" },
        { status: 404 }
      );
    }

    // Update task
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        dueDate: data.dueDate !== undefined ? new Date(data.dueDate) : undefined,
        status: data.status !== undefined ? data.status : undefined,
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to delete tasks" },
        { status: 401 }
      );
    }

    // Check user type
    if (session.user.userType !== "PARENT") {
      return NextResponse.json(
        { error: "Only parents can delete tasks" },
        { status: 403 }
      );
    }

    const taskId = params.id;

    // Check if task belongs to parent
    const taskExists = await prisma.task.findFirst({
      where: {
        id: taskId,
        parentId: session.user.id,
      },
    });

    if (!taskExists) {
      return NextResponse.json(
        { error: "Task not found or not created by you" },
        { status: 404 }
      );
    }

    // Delete task
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
} 