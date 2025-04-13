"use client";

import { SettingsPage } from "@/components/settings-page";
import { BottomNavigation } from "@/components/bottom-navigation";
import { KidChatbot } from "@/components/kid-chatbot";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Settings() {
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
      <div className="container py-6 max-w-5xl mx-auto">
        <SettingsPage />
      </div>
      <BottomNavigation activeTab="settings" />
      <KidChatbot />
    </div>
  );
} 