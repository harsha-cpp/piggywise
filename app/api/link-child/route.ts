import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(req: Request) {
  try {
    // Verify the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only parents can link children
    if (session.user.userType !== "PARENT") {
      return NextResponse.json(
        { error: "Only parent accounts can link children" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { childEmail } = body;
    
    if (!childEmail) {
      return NextResponse.json(
        { error: "Child email is required" },
        { status: 400 }
      );
    }
    
    // Find the child user
    const childUser = await prisma.user.findUnique({
      where: { email: childEmail },
    });
    
    if (!childUser) {
      return NextResponse.json(
        { error: "Child user not found" },
        { status: 404 }
      );
    }
    
    if (childUser.userType !== "CHILD") {
      return NextResponse.json(
        { error: "The specified user is not a child account" },
        { status: 400 }
      );
    }
    
    if (childUser.parentId) {
      return NextResponse.json(
        { error: "This child is already linked to a parent" },
        { status: 400 }
      );
    }
    
    // Link the child to the parent
    const updatedChild = await prisma.user.update({
      where: { id: childUser.id },
      data: { parentId: session.user.id },
    });
    
    return NextResponse.json({
      message: "Child linked successfully",
      childId: updatedChild.id,
    });
    
  } catch (error) {
    console.error("Link child error:", error);
    return NextResponse.json(
      { error: "Error linking child" },
      { status: 500 }
    );
  }
} 