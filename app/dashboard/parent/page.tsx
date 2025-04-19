"use client";

// Updated parent dashboard without loader animations
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { ParentDashboard } from "@/components/parent/parent-dashboard";

export default function ParentDashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [forceLoader, setForceLoader] = useState(true); // Force loader to show for at least one cycle
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
      // Allow loader to disappear after a minimum time
      const timer = setTimeout(() => {
        setIsLoading(false);
        // Wait a bit longer for the loader to finish its animation
        setTimeout(() => {
          setForceLoader(false);
        }, 500);
      }, 2000); // This ensures loader is shown for at least 2 seconds
      
      // Handle navigation errors
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        // Prevent chunk load errors from being shown to the user
        if (event.reason && typeof event.reason.message === 'string' && 
            (event.reason.message.includes('ChunkLoadError') || 
            event.reason.message.includes('Loading chunk'))) {
          event.preventDefault();
        }
      };
      
      // Add event listener
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      }
    }
  }, [session, status]);

  // Use a consistent layout for both loading and loaded states
  return (
    <div className="min-h-screen bg-gray-50">
      {(status === "loading" || isLoading || forceLoader) ? (
        <div className="min-h-screen flex flex-col">
          <div className="h-16 bg-white border-b shadow-sm"></div> {/* Placeholder for header */}
          <div className="flex-1 flex items-center justify-center">
            <ParentLoader fullscreen={false} contained />
          </div>
        </div>
      ) : (
        <ParentDashboard />
      )}
    </div>
  );
} 