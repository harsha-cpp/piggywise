"use client";

// Updated parent dashboard without loader animations
import { useSession, signOut } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ParentDashboard } from "@/components/parent/parent-dashboard";

export default function ParentDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Redirect if not logged in or not a parent
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    } else if (session?.user && session.user.userType !== "PARENT") {
      redirect("/dashboard/child");
    }
  }, [session, status]);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const goToDashboard = () => {
    setShowDashboard(true);
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ParentDashboard />
      </div>
    );
  }

  // Always show the confirmation screen first
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 bg-gray-50">
      <div className="w-full max-w-md p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl font-bold">Login Success</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            You're currently logged in as {session?.user?.name || session?.user?.email} ({session?.user?.userType || 'USER'})
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <button
            onClick={goToDashboard}
            className="w-full p-2.5 sm:p-3 bg-green-800 text-white text-sm sm:text-base rounded hover:bg-green-900 transition-colors"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full p-2.5 sm:p-3 bg-gray-200 text-gray-800 text-sm sm:text-base rounded hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Login with a different account"}
          </button>
        </div>
      </div>
    </div>
  );
} 