"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { ParentDashboard } from "@/components/parent/parent-dashboard";
import dynamic from "next/dynamic";

// Import ParentLoader dynamically with SSR disabled
const ParentLoader = dynamic(() => import("@/components/loaders/ParentLoader"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

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
      setIsLoading(false);
      
      // Allow loader to disappear after a minimum time
      const timer = setTimeout(() => {
        setForceLoader(false);
      }, 2500); // This ensures loader is shown for at least 2.5 seconds
      
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

  if (status === "loading" || isLoading || forceLoader) {
    return <ParentLoader fullscreen minPlayCount={1} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ParentDashboard />
    </div>
  );
} 