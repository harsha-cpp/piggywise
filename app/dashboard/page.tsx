"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
    // No auto-redirect to specific dashboards - let the confirmation screen handle it
  }, [session, status]);
  
  // Loading state while checking authentication
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Loading your dashboard...</h2>
        <p className="text-gray-500">Please wait while we prepare your personalized dashboard.</p>
      </div>
    </div>
  );
}