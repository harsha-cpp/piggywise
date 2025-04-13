import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function PUT(req: Request) {
  try {
    // Verify the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { moduleId, childId, status } = body;
    
    if (!moduleId || !status) {
      return NextResponse.json(
        { error: "Module ID and status are required" },
        { status: 400 }
      );
    }
    
    if (!['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: "Status must be one of: NOT_STARTED, IN_PROGRESS, COMPLETED" },
        { status: 400 }
      );
    }
    
    // Mock implementation without database access
    // Simply return a success response
    
    const targetChildId = session.user.userType === "CHILD" ? session.user.id : childId;
    
    // Return a mock response
    return NextResponse.json({
      message: "Module progress updated successfully",
      progress: {
        moduleId,
        childId: targetChildId,
        status,
        lastUpdated: new Date()
      }
    });
    
  } catch (error) {
    console.error("Update module progress error:", error);
    return NextResponse.json(
      { error: "Error updating module progress" },
      { status: 500 }
    );
  }
} 