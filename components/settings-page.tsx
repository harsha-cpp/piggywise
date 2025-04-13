"use client"

import { Bell, Moon, User, Volume2, LogOut, Edit, UserCircle, LinkIcon, Copy } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { signOut } from "next-auth/react"
import { useState, ChangeEvent, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export function SettingsPage() {
  const [nickname, setNickname] = useState("Kiddo")
  const [parentName, setParentName] = useState("Your Parent") // This will be from the backend later
  const [editingNickname, setEditingNickname] = useState(false)
  const [childId, setChildId] = useState("")
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        if (userData.name) setNickname(userData.name);
        if (userData.childId) setChildId(userData.childId);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Generate a random child ID on component mount if not already set
  useEffect(() => {
    if (!childId) {
      // First check if we already have a saved childId in local storage
      const savedChildId = localStorage.getItem('piggywise_child_id');
      
      if (savedChildId) {
        // Use the saved child ID
        setChildId(savedChildId);
        saveChildId(savedChildId);
      } else {
        // Generate a new random 6-character alphanumeric code
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        saveChildId(randomId);
      }
    }
  }, [childId]);

  // Handle nickname update
  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login?force=true' })
  }

  // Copy child ID to clipboard
  const copyChildId = () => {
    navigator.clipboard.writeText(childId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Save child ID to the database
  const saveChildId = async (id: string) => {
    setIsSaving(true);
    try {
      // First save it to localStorage
      localStorage.setItem('piggywise_child_id', id);
      
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId: id }),
      });

      if (response.ok) {
        const data = await response.json();
        setChildId(data.childId);
        toast({
          title: "Child ID saved",
          description: "Your unique code is now saved to your account",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Failed to save Child ID",
          description: error.error || "Please try again",
          variant: "destructive",
        });
        // Generate a new ID if the current one is already taken
        const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setChildId(newId);
        localStorage.setItem('piggywise_child_id', newId);
      }
    } catch (error) {
      console.error("Error saving child ID:", error);
      toast({
        title: "Error",
        description: "Could not save your Child ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="bg-pink-100 p-2 rounded-full">
              <LinkIcon className="h-5 w-5 text-pink-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Child ID</h3>
              <p className="text-sm text-gray-600">Share with parents to link accounts:</p>
              <div className="mt-1 flex items-center">
                <span className="bg-gray-100 px-3 py-1 rounded-md font-mono text-base font-semibold">
                  {childId}
                </span>
                <button 
                  onClick={copyChildId}
                  className="ml-2 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </button>
                {copied && <span className="ml-2 text-xs text-green-600">Copied!</span>}
              </div>
            </div>
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
