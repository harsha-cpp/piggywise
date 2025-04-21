"use client";

import { ModuleProgress } from "@/components/module-progress";
import { TopNavigation } from "@/components/top-navigation";
import { KidChatbot } from "@/components/kid-chatbot";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { PageHeader } from "@/components/page-header";

export default function ProgressPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    } else if (session?.user && session.user.userType !== "CHILD") {
      redirect("/dashboard/parent");
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation activeTab="progress" />
      <div className="container py-6 pt-20 space-y-6 max-w-5xl mx-auto">
        <PageHeader
          heading="Your Learning Progress"
          subheading="Track your achievements and keep learning"
        />
        <ModuleProgress />
      </div>
      <KidChatbot />
    </div>
  );
} 