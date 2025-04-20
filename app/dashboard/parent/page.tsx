"use client";

// Updated parent dashboard without loader animations
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { ParentDashboard } from "@/components/parent/parent-dashboard";

export default function ParentDashboardPage() {
  const { data: session, status } = useSession();
  
  // Redirect if not logged in or not a parent
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    } else if (session?.user && session.user.userType !== "PARENT") {
      redirect("/dashboard/child");
    }
  }, [session, status]);

  // Show simple loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show the dashboard directly
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentDashboard />
    </div>
  );
} 