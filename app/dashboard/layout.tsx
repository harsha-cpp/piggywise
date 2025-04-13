"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  // Check if this is the child dashboard
  const isChildDashboard = pathname.startsWith("/dashboard/child");
  
  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    redirect("/login");
  }
  
  // User is logged in, determine if they're in the correct dashboard
  if (session?.user?.userType === "CHILD" && !pathname.startsWith("/dashboard/child")) {
    redirect("/dashboard/child");
  }
  
  if (session?.user?.userType === "PARENT" && !pathname.startsWith("/dashboard/parent")) {
    redirect("/dashboard/parent");
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 ${isChildDashboard ? 'overflow-x-hidden overflow-y-auto' : ''}`}>
      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
} 