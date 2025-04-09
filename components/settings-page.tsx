"use client"

import { Bell, Moon, User, Volume2, LogOut, Edit, UserCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { signOut } from "next-auth/react"
import { useState, ChangeEvent } from "react"

export function SettingsPage() {
  const [nickname, setNickname] = useState("Kiddo")
  const [parentName, setParentName] = useState("Your Parent") // This will be from the backend later
  const [editingNickname, setEditingNickname] = useState(false)

  // Handle nickname update
  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login?force=true' })
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">Customize your experience</p>
      </header>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Profile</h3>
              <p className="text-sm text-gray-600">Edit your profile information</p>
            </div>
            <button className="text-sm font-medium text-blue-600">Edit</button>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Edit className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Nickname</h3>
              {editingNickname ? (
                <div className="mt-1">
                  <input 
                    type="text" 
                    value={nickname} 
                    onChange={handleNicknameChange}
                    className="border rounded-md px-2 py-1 text-sm w-full max-w-xs"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-600">Currently shown as: <span className="font-semibold">{nickname}</span></p>
              )}
            </div>
            <button 
              className="text-sm font-medium text-green-600"
              onClick={() => setEditingNickname(!editingNickname)}
            >
              {editingNickname ? "Save" : "Edit"}
            </button>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-full">
              <UserCircle className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Parent</h3>
              <p className="text-sm text-gray-600">Your parent: <span className="font-semibold">{parentName}</span></p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Notifications</h3>
              <p className="text-sm text-gray-600">Get reminders about lessons</p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <Volume2 className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Sound Effects</h3>
              <p className="text-sm text-gray-600">Play sounds during activities</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <Moon className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-gray-600">Switch to dark theme</p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="p-4">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full text-left hover:bg-red-50 p-2 rounded-lg transition-colors"
          >
            <div className="bg-red-100 p-2 rounded-full">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Sign Out</h3>
              <p className="text-sm text-gray-600">Log out of your account</p>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">App Version 1.0.0</p>
      </div>
    </div>
  )
}
