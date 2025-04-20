"use client"

import { useState } from 'react'
import Image from "next/image"
import { PlayCircle, CheckCircle } from "lucide-react"
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
  isCompleted?: boolean
}

export function ModuleCard({ 
  id, 
  title, 
  description, 
  progress, 
  thumbnailUrl, 
  duration, 
  colorClass = "from-amber-300 to-amber-500",
  isNew,
  isCompleted = false
}: ModuleCardProps) {
  const router = useRouter()
  
  const handleModuleClick = () => {
    // Navigate to the dedicated module page
    router.push(`/dashboard/child/modules/${id}`)
  }
  
  return (
    <div 
      onClick={handleModuleClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer flex flex-col h-full border border-gray-100"
    >
      <div className={`relative aspect-video overflow-hidden bg-gradient-to-r ${colorClass}`}>
        {/* Thumbnail */}
        {thumbnailUrl ? (
          <div className="absolute inset-0">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        
        {/* Title overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <h3 className="font-bold text-lg drop-shadow-sm">{title}</h3>
        </div>
        
        {/* Duration badge */}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {duration}
        </div>
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {isNew && (
            <div className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
              NEW
            </div>
          )}
          
          {isCompleted && (
            <div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-sm">
              <CheckCircle className="h-3 w-3 mr-1" />
              COMPLETED
            </div>
          )}
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-black/30 rounded-full p-3">
            <PlayCircle className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm text-gray-600 mb-auto h-10 line-clamp-2">{description}</p>
        
        {/* Progress section with fixed position at bottom */}
        <div className="mt-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full">
              <div 
                className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${progress > 0 ? progress : 3}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
