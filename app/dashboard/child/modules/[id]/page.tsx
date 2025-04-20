"use client";

import Image from "next/image"
import { ChevronLeft, PlayCircle, Check, Lock } from "lucide-react"
import Link from "next/link"
import { ModuleViewer } from "@/components/module-viewer"
import { XpHandler } from "@/components/xp-handler"
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Module and lesson interfaces
interface Lesson {
  id: string
  title: string
  duration: string
  videoUrl?: string
  isCompleted: boolean
}

interface Module {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  instructor?: string
  totalDuration?: string
  objectives?: string[]
  relatedModules?: string[]
  lessons: Lesson[]
  completedLessons: number
  totalLessons: number
  status: string
}

export default function ModulePage() {
  const params = useParams();
  const moduleId = params.id as string;
  
  // Fetch module data from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      const response = await fetch(`/api/child/modules/${moduleId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Module not found");
        }
        throw new Error("Failed to load module");
      }
      return response.json();
    }
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen pb-20">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/dashboard/child"
            className="text-black flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="mb-4">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <Skeleton className="h-40 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-1/2 mb-6" />
            
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !data?.module) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">
            {error instanceof Error ? error.message : "Module not found"}
          </p>
          <Link href="/dashboard/child" className="mt-4 px-4 py-2 inline-block bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  const module = data.module;
  
  // Calculate progress - use completed lessons count and status to determine progress
  let progressPercentage = 0;
  
  // If module has only one lesson and the lesson is completed, show 100%
  if (module.lessons.length === 1 && module.lessons[0].isCompleted) {
    progressPercentage = 100;
  } 
  // Otherwise, if module has lessons, calculate percentage
  else if (module.totalLessons > 0) {
    progressPercentage = Math.round((module.completedLessons / module.totalLessons) * 100);
  }
  
  // Force 100% if status is COMPLETED
  if (module.status === "COMPLETED") {
    progressPercentage = 100;
  }
  
  // Log for debugging
  console.log("Module data:", module);
  console.log("Progress data:", data.progress);
  console.log("Progress percentage:", progressPercentage);
  
  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-4">
        <Link 
          href="/dashboard/child"
          className="text-black flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </Link>
        
        {/* Module title and progress */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
          <div className="text-sm text-gray-600">
            <span className="font-bold">{progressPercentage}%</span> complete
          </div>
        </div>
        
        <div className="h-2 w-full bg-gray-200 rounded-full mb-6">
          <div 
            className="h-full bg-blue-600 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Pass the module data to a client component */}
        <ModuleViewer 
          module={module} 
          existingProgress={data.progress} 
        />
        <XpHandler />
      </div>
    </div>
  );
} 