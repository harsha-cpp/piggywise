"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VideoPlayer } from "./video-player"
import { CheckCircle, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  title: string
  description: string
  videoUrl: string
  duration: string
  order: number
  isCompleted?: boolean
}

interface ModuleContentProps {
  module: {
    id: string
    title: string
    description: string
    contents: Lesson[]
  }
  onComplete?: (lessonId: string) => void
}

export function ModuleContent({ module, onComplete }: ModuleContentProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    module.contents.length > 0 ? module.contents[0] : null
  )

  const handleLessonComplete = () => {
    if (selectedLesson && onComplete) {
      onComplete(selectedLesson.id)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Lesson List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Lessons</CardTitle>
          <CardDescription>Complete all lessons to finish the module</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {module.contents.map((lesson) => (
            <Button
              key={lesson.id}
              variant={selectedLesson?.id === lesson.id ? "default" : "outline"}
              className={cn(
                "w-full justify-start gap-2 h-auto py-3",
                lesson.isCompleted && "border-green-200"
              )}
              onClick={() => setSelectedLesson(lesson)}
            >
              {lesson.isCompleted ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <PlayCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">{lesson.title}</span>
                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Video Player */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">{selectedLesson?.title}</CardTitle>
          <CardDescription>{selectedLesson?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedLesson ? (
            <VideoPlayer
              videoUrl={selectedLesson.videoUrl}
              title={selectedLesson.title}
              onComplete={handleLessonComplete}
              className="aspect-video"
            />
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">No lesson selected</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 