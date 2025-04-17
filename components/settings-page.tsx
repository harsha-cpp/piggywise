"use client"

import { Bell, Moon, User, Volume2, LogOut, Edit, UserCircle, LinkIcon, Copy } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { signOut } from "next-auth/react"
import { useState, ChangeEvent, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

export function SettingsPage() {
  const { data: session } = useSession()
  const [nickname, setNickname] = useState("Kiddo")
  const [parentName, setParentName] = useState("Your Parent") // This will be from the backend later
  const [editingNickname, setEditingNickname] = useState(false)
  const [childEmail, setChildEmail] = useState("")
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
    // Set email from session
    if (session?.user?.email) {
      setChildEmail(session.user.email);
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        if (userData.name) setNickname(userData.name);
        if (userData.email) setChildEmail(userData.email);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Handle nickname update
  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login?force=true' })
  }

  // Copy child email to clipboard
  const copyChildEmail = () => {
    navigator.clipboard.writeText(childEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Email copied",
      description: "Email has been copied to clipboard",
    });
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
            <div className="bg-pink-100 p-2 rounded-full">
              <LinkIcon className="h-5 w-5 text-pink-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Child Email</h3>
              <p className="text-sm text-gray-600">Share with parents to link accounts:</p>
              <div className="mt-1 flex items-center flex-wrap gap-2">
                <span className="bg-gray-100 px-3 py-2 rounded-md font-mono text-sm font-semibold break-all max-w-full">
                  {childEmail || "Loading email..."}
                </span>
                <button 
                  onClick={copyChildEmail}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Copy email"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </button>
                {copied && <span className="text-xs text-green-600">Copied!</span>}
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
              <h3 className="font-medium">Name</h3>
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
