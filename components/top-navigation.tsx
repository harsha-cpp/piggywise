"use client"

import { Home, CheckSquare, Headphones, Settings, BarChart2, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface TopNavigationProps {
  activeTab: string
  onTabChange?: (tab: string) => void
}

export function TopNavigation({ activeTab, onTabChange }: TopNavigationProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const navItems = [
    { id: "home", label: "Home", icon: Home, color: "text-blue-600", bgColor: "bg-blue-100", path: "/dashboard/child" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, color: "text-green-600", bgColor: "bg-green-100", path: "/dashboard/child/tasks" },
    { id: "progress", label: "Progress", icon: BarChart2, color: "text-indigo-600", bgColor: "bg-indigo-100", path: "/dashboard/child/progress" },
    { id: "podcasts", label: "Podcasts", icon: Headphones, color: "text-purple-600", bgColor: "bg-purple-100", path: "/dashboard/child/podcasts" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-orange-600", bgColor: "bg-orange-100", path: "/dashboard/child/settings" },
  ]

  const handleTabChange = (item: typeof navItems[0]) => {
    if (onTabChange) {
      onTabChange(item.id)
    }
    setIsMenuOpen(false)
    router.push(item.path)
  }
  
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-3">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard/child" className="flex items-center space-x-1">
                <Image 
                  src="/peppapig.png" 
                  alt="Peppa Pig" 
                  width={36} 
                  height={36} 
                  className="object-contain w-9 h-9"
                />
                <span className="text-xl font-bold">Piggywise</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16",
                    activeTab === item.id
                      ? `border-${item.color.split('-')[1]}-500 ${item.color}`
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                  onClick={() => handleTabChange(item)}
                >
                  <item.icon className="mr-1 h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Sign out button (desktop) */}
          <div className="hidden md:flex md:items-center">
            <button
              onClick={handleSignOut}
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50"
            >
              <span className="flex items-center">
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign Out
              </span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 px-2 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "w-full flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                  activeTab === item.id
                    ? `border-${item.color.split('-')[1]}-500 bg-${item.color.split('-')[1]}-50 ${item.color}`
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                )}
                onClick={() => handleTabChange(item)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.label}
              </button>
            ))}
            
            {/* Mobile sign out button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  )
} 