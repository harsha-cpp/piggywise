"use client"

import { Home, CheckSquare, Headphones, Settings, BarChart2, Users, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface BottomNavigationProps {
  activeTab: string
  onTabChange?: (tab: string) => void
  parentView?: boolean
}

export function BottomNavigation({ activeTab, onTabChange, parentView = false }: BottomNavigationProps) {
  const router = useRouter()
  
  const childNavItems = [
    { id: "home", label: "Home", icon: Home, color: "text-blue-600", bgColor: "bg-blue-100", path: "/dashboard/child" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, color: "text-green-600", bgColor: "bg-green-100", path: "/dashboard/child/tasks" },
    { id: "progress", label: "Progress", icon: BarChart2, color: "text-indigo-600", bgColor: "bg-indigo-100", path: "/dashboard/child/progress" },
    { id: "podcasts", label: "Podcasts", icon: Headphones, color: "text-purple-600", bgColor: "bg-purple-100", path: "/dashboard/child/podcasts" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-orange-600", bgColor: "bg-orange-100", path: "/dashboard/child/settings" },
  ]

  const parentNavItems = [
    { id: "home", label: "Home", icon: Home, color: "text-blue-600", bgColor: "bg-blue-100", path: "/dashboard/parent" },
    { id: "children", label: "Children", icon: Users, color: "text-purple-600", bgColor: "bg-purple-100", path: "/dashboard/parent" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, color: "text-green-600", bgColor: "bg-green-100", path: "/dashboard/parent" },
    { id: "finances", label: "Finances", icon: Wallet, color: "text-amber-600", bgColor: "bg-amber-100", path: "/dashboard/parent/finances" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-orange-600", bgColor: "bg-orange-100", path: "/dashboard/parent/settings" },
  ]

  const navItems = parentView ? parentNavItems : childNavItems;

  const handleTabChange = (item: typeof navItems[0]) => {
    if (onTabChange) {
      onTabChange(item.id)
    }
    router.push(item.path)
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full py-2 px-6 shadow-lg z-50 border border-gray-100">
      <div className="flex justify-around gap-6">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            className="flex flex-col items-center" 
            onClick={() => handleTabChange(item)}
          >
            <div
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                activeTab === item.id 
                  ? `${item.bgColor} ${item.color}` 
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-xs mt-1 font-medium",
              activeTab === item.id ? item.color : "text-gray-500"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
