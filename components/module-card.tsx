"use client"

import Image from "next/image"
import { Progress } from "@/components/ui/progress"

interface Module {
  id: number
  title: string
  description: string
  progress: number
  image: string
  color: string
}

interface ModuleCardProps {
  module: Module
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <div className="w-full h-full group">
      <div
        className={`bg-gradient-to-r ${module.color} rounded-xl p-5 shadow-md h-full flex flex-col relative overflow-hidden`}
      >
        <div className="flex-1 mb-3">
          <h3 className="font-bold text-white text-xl mb-1">{module.title}</h3>
          <p className="text-white/90 text-sm">
            {module.description}
          </p>
        </div>

        <div className="relative h-28 w-full rounded-lg overflow-hidden bg-white/20 mb-3">
          <Image
            src={module.image || "/placeholder.svg"}
            alt={module.title}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 rounded-full p-2 shadow-md">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor" className={`text-${module.color.split('-')[1]}-500`} />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-white text-sm font-medium">Progress</span>
            <span className="text-white text-sm font-bold">{module.progress}%</span>
          </div>
          <Progress value={module.progress} className="h-2.5 bg-white/30" indicatorClassName="bg-white" />
        </div>
      </div>
    </div>
  )
}
