import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create tasks" },
        { status: 401 }
      );
    }

    // Check user type
    if (session.user.userType !== "PARENT") {
      return NextResponse.json(
        { error: "Only parents can create tasks" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { title, description, dueDate, childId } = data;

    // Validate input
    if (!title || !childId) {
      return NextResponse.json(
        { error: "Title and child ID are required" },
        { status: 400 }
      );
    }

    // Check if child belongs to parent
    console.log("Checking child relationship. Child ID:", childId, "Parent ID:", session.user.id);
    const childExists = await prisma.user.findFirst({
      where: {
        id: childId,
        parentId: session.user.id,
      },
    });

    if (!childExists) {
      console.log("Child not found for parent. Child ID:", childId, "Parent ID:", session.user.id);
      
      // For debugging, check if the child exists at all
      const childRecord = await prisma.user.findUnique({
        where: { id: childId },
        select: { id: true, name: true, parentId: true }
      });
      
      console.log("Child record:", childRecord);
      
      return NextResponse.json(
        { error: "Child not found or not linked to you" },
        { status: 404 }
      );
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: "PENDING",
        childId,
        parentId: session.user.id,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

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
    if (session.user.userType !== "PARENT") {
      return NextResponse.json(
        { error: "Only parents can view their assigned tasks" },
        { status: 403 }
      );
    }

    // Get all tasks created by the parent
    const tasks = await prisma.task.findMany({
      where: {
        parentId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
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