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
  const isParentDashboard = pathname === "/dashboard/parent";
  const isMainDashboard = pathname === "/dashboard";
  
  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    redirect("/login");
  }
  
  // Only redirect users if they're trying to access the wrong dashboard type
  // For example, a child user trying to access parent dashboard
  if (session?.user?.userType === "CHILD" && pathname.startsWith("/dashboard/parent")) {
    redirect("/dashboard/child");
  }
  
  // Only redirect parent users if they're trying to access child dashboard
  if (session?.user?.userType === "PARENT" && pathname.startsWith("/dashboard/child")) {
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