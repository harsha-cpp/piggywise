import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: { childId: string } }
) {
  try {
    console.log(`GET /api/parent/child-progress/${params.childId} - Fetching child progress`);
    
    // Get the child ID from route params
    const { childId } = params;
    
    if (!childId) {
      console.log('GET /api/parent/child-progress - Child ID is required');
      return NextResponse.json(
        { error: "Child ID is required" },
        { status: 400 }
      );
    }
    
    // Verify the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('GET /api/parent/child-progress - Unauthorized');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Verify the user is a parent
    if (session.user.userType !== "PARENT") {
      console.log('GET /api/parent/child-progress - Only parent accounts can access');
      return NextResponse.json(
        { error: "Only parent accounts can access child progress" },
        { status: 403 }
      );
    }
    
    // Mock response for development to avoid database errors
    console.log('Using mock progress data');
    return NextResponse.json({
      child: {
        id: childId,
        name: "Child",
        email: "child@example.com",
        creditScore: 500,
        childId: "CHILD123"
      },
      progress: [],
      isLinked: false,
      message: "No child progress available yet"
    });
    
  } catch (error) {
    console.error("Get child progress error:", error);
    return NextResponse.json(
      { 
        error: "Error getting child progress",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 