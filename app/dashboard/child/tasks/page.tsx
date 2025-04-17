"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import ChildTasks from "@/components/child/child-tasks"
import { Loader2 } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function ChildTasksPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not logged in or not a child
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    } else if (session?.user && session.user.userType !== "CHILD") {
      redirect("/dashboard/parent")
    } else if (status === "authenticated") {
      setIsLoading(false)
    }
  }, [session, status])

  // Fetch tasks
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["childTasks"],
    queryFn: async () => {
      // Use the real API endpoint
      const response = await fetch(`/api/child/tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 1000, // Faster poll for better responsiveness
    staleTime: 0, // Consider data always stale to enable immediate refetches
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount to ensure fresh data
  })

  if (isLoading || isTasksLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24">
      <div className="mt-6">
        <ChildTasks 
          tasks={tasksData?.tasks || []} 
          childId={session?.user?.id || ""}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="tasks" />
    </div>
  )
} 