"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { PlayCircle, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
  status?: string
}

interface Progress {
  id: string
  childId: string
  moduleId: string
  status: string
  completedLessons: number
  lastUpdated: string
}

interface ModuleViewerProps {
  module: Module
  existingProgress?: Progress | null
}

export function ModuleViewer({ module, existingProgress }: ModuleViewerProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [updatedModule, setUpdatedModule] = useState<Module>(module)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()
  
  // Initialize with first lesson or first incomplete lesson
  useEffect(() => {
    console.log("Module in ModuleViewer:", module);
    console.log("Existing progress:", existingProgress);
    
    // Start with the first incomplete lesson, or first lesson if all are complete
    const firstIncomplete = module.lessons.find(l => !l.isCompleted)
    setSelectedLesson(firstIncomplete || module.lessons[0])
  }, [module, existingProgress])
  
  // Handle video completion
  const handleVideoRef = (ref: HTMLVideoElement | null) => {
    if (!ref) return
    
    videoRef.current = ref
    
    const handleVideoEnded = async () => {
      if (!selectedLesson) return
      
      // Mark lesson as completed if not already
      if (!selectedLesson.isCompleted) {
        // Create updated lesson
        const updatedLesson = { ...selectedLesson, isCompleted: true }
        
        // Create updated lessons array
        const updatedLessons = updatedModule.lessons.map(lesson => 
          lesson.id === selectedLesson.id ? updatedLesson : lesson
        )
        
        // Update module state with new lessons and completion count
        const newCompletedLessons = updatedModule.completedLessons + 1
        
        // For modules with only one lesson, mark as COMPLETED when that lesson is done
        let newStatus = "IN_PROGRESS";
        if (updatedModule.lessons.length === 1 || newCompletedLessons >= updatedModule.totalLessons) {
          newStatus = "COMPLETED";
        }
        
        const newModule = {
          ...updatedModule,
          lessons: updatedLessons,
          completedLessons: newCompletedLessons,
          status: newStatus
        }
        
        setUpdatedModule(newModule)
        setSelectedLesson(updatedLesson)
        
        // Award XP for completing the lesson (25 XP per lesson)
        if (typeof window !== 'undefined' && window.earnXP) {
          window.earnXP(25)
        }

        // Save progress to the server
        try {
          const response = await fetch('/api/child/save-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              moduleId: updatedModule.id,
              completedLessons: newCompletedLessons,
              status: newStatus,
              lessonId: selectedLesson.id
            }),
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            console.error('Failed to update progress:', result.error);
            console.error('Details:', result.details);
          } else {
            console.log('Progress saved successfully:', result);
            // Show a toast notification
            toast({
              title: "Progress saved!",
              description: "Your progress has been updated.",
              duration: 3000,
            });
          }
        } catch (error) {
          console.error('Error saving progress:', error);
        }
        
        // Auto-advance to next lesson if available
        const currentIndex = updatedLessons.findIndex(l => l.id === selectedLesson.id)
        if (currentIndex < updatedLessons.length - 1) {
          setSelectedLesson(updatedLessons[currentIndex + 1])
        } else {
          // Completed all lessons in the module, award additional XP
          if (typeof window !== 'undefined' && window.earnXP) {
            window.earnXP(50) // Bonus XP for completing the entire module
            
            // Show completion toast
            toast({
              title: "Module completed!",
              description: "Congratulations! You've completed this learning module.",
              duration: 5000,
            })
          }
        }
      }
    }
    
    // Add event listener for video completion
    ref.addEventListener('ended', handleVideoEnded)
    
    // Clean up event listener on unmount
    return () => {
      ref.removeEventListener('ended', handleVideoEnded)
    }
  }
  
  // Handle lesson selection
  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    // Reset video playback
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }
  
  if (!selectedLesson) {
    return <div>Loading lesson...</div>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Video Player (2/3 width on desktop) */}
      <div className="md:col-span-2">
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
          <div className="p-1 relative aspect-video">
            {selectedLesson.videoUrl ? (
              <video
                key={selectedLesson.id}
                ref={handleVideoRef}
                src={selectedLesson.videoUrl}
                className="w-full h-full rounded-lg object-contain"
                controls
                controlsList="nodownload"
                poster="/placeholder.svg"
                autoPlay
                preload="auto"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Video not available</p>
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
              {selectedLesson.duration}
            </div>
          </div>
        </div>
        
        {/* Current lesson info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold mb-1">{selectedLesson.title}</h2>
          <p className="text-gray-600 mb-4">Lesson {updatedModule.lessons.findIndex(l => l.id === selectedLesson.id) + 1} of {updatedModule.lessons.length}</p>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Module Description</h3>
            <p className="text-gray-600">{updatedModule.description}</p>
          </div>
        </div>
        
        {/* Learning Objectives */}
        {updatedModule.objectives && updatedModule.objectives.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-lg font-bold mb-4">Learning Objectives</h2>
            <ul className="space-y-2">
              {updatedModule.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="text-green-500 mt-1">✓</div>
                  <div>{objective}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Sidebar with Lessons */}
      <div className="md:col-span-1">
        {/* Module lessons list */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-bold mb-4 px-2">Lessons</h2>
          <div className="space-y-2">
            {updatedModule.lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => handleLessonSelect(lesson)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  selectedLesson && selectedLesson.id === lesson.id 
                    ? 'bg-blue-50 border border-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  lesson.isCompleted 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
                }`}>
                  {lesson.isCompleted ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="text-sm text-gray-700">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${selectedLesson && selectedLesson.id === lesson.id ? 'text-blue-600' : ''}`}>
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-gray-500">{lesson.duration}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 