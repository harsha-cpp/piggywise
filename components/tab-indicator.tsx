"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TabIndicatorProps {
  icon: ReactNode
  label: string
  isActive: boolean
  onClick: () => void
  color: string
}

export function TabIndicator({ icon, label, isActive, onClick, color }: TabIndicatorProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all w-20",
        isActive ? "bg-gray-100" : "hover:bg-gray-50",
      )}
    >
      <span className={cn("mb-1", color)}>{icon}</span>
      <span className="text-xs font-medium">{label}</span>
      {isActive && (
        <div
          className={cn("absolute -bottom-2 h-1 w-12 rounded-full transition-all duration-300", color.replace("text", "bg"))}
        />
      )}
    </button>
  )
}
