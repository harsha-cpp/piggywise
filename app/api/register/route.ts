import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, userType } = await req.json();
    console.log("Registration attempt for:", email);

    // Validate input
    if (!name || !email || !password || !userType) {
      console.log("Missing required fields:", { name: !name, email: !email, password: !password, userType: !userType });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Checking for existing user...");
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists with email:", email);
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    console.log("Hashing password...");
    // Hash password
    const hashedPassword = await hash(password, 12);

    console.log("Creating new user...");
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType,
        // Initialize XP and level for child users
        xp: userType === "CHILD" ? 0 : undefined,
        level: userType === "CHILD" ? 1 : undefined,
      },
    });

    console.log("User created successfully:", user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    // Log detailed error information
    console.error("Registration error details:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        error: "Error creating user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 