"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { ParentDashboard } from "@/components/parent/parent-dashboard";
import { Loader2 } from "lucide-react";

export default function ParentDashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTime, setLoadingTime] = useState(0);
  
  // Track loading time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLoading]);
  
  // Redirect if not logged in or not a parent
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    } else if (session?.user && session.user.userType !== "PARENT") {
      redirect("/dashboard/child");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [session, status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Parent Dashboard</h2>
          <p className="text-gray-600 mb-4">This may take a few moments...</p>
          
          {loadingTime > 5 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <p className="font-medium">Taking longer than expected?</p>
              <p className="mt-1">The server might be waking up from sleep mode. Please wait a moment.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ParentDashboard />
    </div>
  );
} 