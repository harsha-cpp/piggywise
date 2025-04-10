"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ParentDashboard() {
  const { data: session, status } = useSession();
  
  // Redirect if not logged in or not a parent
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    } else if (session?.user && session.user.userType !== "PARENT") {
      redirect("/dashboard/child");
    }
  }, [session, status]);

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🐷</div>
          <h1 className="text-2xl font-bold mb-2">Welcome, {session?.user?.name}!</h1>
          <p className="text-gray-600">Parent dashboard is under development and will be available soon.</p>
          <p className="text-gray-500 mt-4">Soon you'll be able to monitor your child's credit learning journey! 🌟</p>
        </div>
      </div>
    </div>
  );
} 