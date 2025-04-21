"use client";

import { PodcastsPage } from "@/components/podcasts-page";
import { TopNavigation } from "@/components/top-navigation";
import { KidChatbot } from "@/components/kid-chatbot";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Podcasts() {
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
      <TopNavigation activeTab="podcasts" />
      <div className="container py-6 pt-20 max-w-5xl mx-auto">
        <PodcastsPage />
      </div>
      <KidChatbot />
    </div>
  );
} 