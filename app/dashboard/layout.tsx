"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
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
      {/* Dashboard Navbar - Hidden for Child Dashboard */}
      {!isChildDashboard && (
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <div className="w-7 h-7 relative">
                  <Image
                    src="/peppapig.png"
                    alt="Peppa Pig"
                    fill
                    sizes="30px"
                    className="rounded-full object-contain"
                    priority
                  />
                </div>
                <span className="ml-2 text-xl font-semibold text-black">Piggywise</span>
              </div>
              
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <span className="text-sm font-medium">{session?.user?.name}</span>
                  <svg
                    className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={`w-full ${isChildDashboard ? '' : 'pt-4'}`}>
        {children}
      </main>
    </div>
  );
} 