import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/child/link-status - Checking child link status");
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("GET /api/child/link-status - Unauthorized: No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify the user is a child
    if (session.user.userType !== "CHILD") {
      console.log("GET /api/child/link-status - Forbidden: Not a child account");
      return NextResponse.json({ error: "Only child accounts can access this endpoint" }, { status: 403 });
    }
    
    // Mock implementation for development
    console.log("GET /api/child/link-status - Using mock implementation");
    
    return NextResponse.json({ 
      isLinked: false,
      parentId: null,
      message: "Child is not linked to any parent yet" 
    });
    
  } catch (error) {
    console.error("Error checking link status:", error);
    return NextResponse.json({
      error: "Failed to check link status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 