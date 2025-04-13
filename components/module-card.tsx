"use client"

import { useState } from 'react'
import Image from "next/image"
import { PlayCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ModuleCardProps {
  id: string
  title: string
  description: string
  progress: number
  thumbnailUrl: string
  duration: string
  colorClass?: string
  isNew?: boolean
}

export function ModuleCard({ 
  id, 
  title, 
  description, 
  progress, 
  thumbnailUrl, 
  duration, 
  colorClass = "from-amber-300 to-amber-500",
  isNew 
}: ModuleCardProps) {
  const router = useRouter()
  
  const handleModuleClick = () => {
    // Navigate to the dedicated module page
    router.push(`/dashboard/child/modules/${id}`)
  }
  
  return (
    <div 
      onClick={handleModuleClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer flex flex-col h-full"
    >
      <div className={`relative aspect-video overflow-hidden bg-gradient-to-r ${colorClass}`}>
        {thumbnailUrl && (
          <div className="absolute inset-0 bg-black/10">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover mix-blend-overlay opacity-70"
            />
          </div>
        )}
        
        {/* Title overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        
        {/* Duration badge */}
        <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          {duration}
        </div>
        
        {/* New tag */}
        {isNew && (
          <div className="absolute top-3 left-3 bg-white text-amber-600 text-xs font-medium px-2 py-1 rounded-full">
            NEW
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm text-gray-600 mb-auto h-10 line-clamp-2">{description}</p>
        
        {/* Progress section with fixed position at bottom */}
        <div className="mt-4">
          {progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
