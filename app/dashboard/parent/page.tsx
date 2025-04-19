"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { ParentDashboard } from "@/components/parent/parent-dashboard";
import ParentLoader from "@/components/loaders/ParentLoader";

export default function ParentDashboardPage() {
  const { data: session, status } = useSession();
  const [showLoader, setShowLoader] = useState(true);
  
  // Handle redirects and loader timing
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    } else if (session?.user && session.user.userType !== "PARENT") {
      redirect("/dashboard/child");
    } else if (status === "authenticated") {
      // Show loader for at least 3 seconds for smooth animation
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 3000);
      
      // Add listener to handle navigation errors
      window.addEventListener('unhandledrejection', (event) => {
        // Prevent chunk load errors from being shown to the user
        if (event.reason && 
            typeof event.reason.message === 'string' && 
            (event.reason.message.includes('ChunkLoadError') || 
             event.reason.message.includes('Loading chunk'))) {
          event.preventDefault();
        }
      });
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('unhandledrejection', () => {});
      }
    }
  }, [session, status]);

  // Show loader during authentication or for minimum animation time
  if (status === "loading" || showLoader) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <ParentLoader fullscreen minPlayCount={1} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ParentDashboard />
    </div>
  );
} 