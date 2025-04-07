import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";

// Log Resend API key status
console.log('Resend API Key status:', process.env.RESEND_API_KEY ? 'configured' : 'not configured');

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    console.log('Received reset password request for:', email);

    if (!email) {
      console.log('Error: Email is required');
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      // For security reasons, don't reveal if the email exists
      return NextResponse.json(
        { message: "If your email is registered, you will receive a password reset link" },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    try {
      // Save reset token to user
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpires,
        },
      });
      console.log('Reset token saved successfully');
    } catch (prismaError) {
      console.error('Error saving reset token:', prismaError);
      throw prismaError;
    }

    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
    console.log('Reset URL created:', resetUrl);
    
    try {
      // Send email using Resend
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: email,
        subject: "Reset your Piggywise password",
        html: `
          <h1>Reset Your Password</h1>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,</p>
          <p>The Piggywise Team</p>
        `,
      });
      console.log('Reset email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    return NextResponse.json({
      message: "If your email is registered, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Error processing password reset" },
      { status: 500 }
    );
  }
} 