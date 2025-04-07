import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, userType } = body;

    // Basic validation
    if (!email || !password || !name || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If email exists and trying to register with same user type
      if (existingUser.userType === userType.toUpperCase()) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      // If email exists but trying to register with different user type
      return NextResponse.json(
        { error: "This email is already registered with a different account type" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user based on type
    if (userType.toUpperCase() === "PARENT") {
      // Create parent user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          userType: "PARENT",
        },
      });

      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      });
    } else if (userType.toUpperCase() === "CHILD") {
      // For child users, we may need to link to a parent
      // For now, creating without parent linkage
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          userType: "CHILD",
          creditScore: 500, // Default credit score for children
        },
      });

      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid user type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
} 