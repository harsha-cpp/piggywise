"use client"

import { useState, useEffect } from "react"
import { Bell, ChevronDown, User, Award, AlertTriangle, RefreshCw, WifiOff, ServerCrash, LogOut, Home, ShoppingBag, TrendingUp, BookOpen, Medal, PlusCircle, Pencil, Unlink, Eye, MoreVertical, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useSession, signOut } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import LinkChildForm from "./link-child-form"
import AssignModuleForm from "./assign-module-form"
import ChildProgressList from "./child-progress-list"
import ChildrenList from "./children-list"
import ModuleMarketplace from "./module-marketplace"
import ModuleStudio from "./module-studio"
import ParentTasks from "./parent-tasks"

// Add type definitions
interface Child {
  id: string
  name: string
  avatar?: string
  relation: string
}

interface ParentProfile {
  name: string
  email: string
  children: Child[]
}

interface ModuleData {
  id: string
  name: string
  description: string
  modules: any[]
}

// Update the error type definition
interface ApiError {
  message: string;
}

// Update mutation return type
interface MutationResponse {
  success: boolean;
  message?: string;
}

// Mock tasks data - these would be moved to an API endpoint later
const mockTasks = [
  {
    id: "t1",
    title: "Complete Module 1",
    description: "Finish all lessons in Module 1",
    status: "COMPLETED" as const,
    childId: "", // Will be filled dynamically
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "Practice budgeting exercise",
    description: "Complete the weekly budget assignment",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "PENDING" as const,
    childId: "", // Will be filled dynamically
    createdAt: new Date().toISOString(),
  },
  {
    id: "t3",
    title: "Read financial literacy story",
    description: "Read the story about saving money",
    status: "PENDING" as const,
    childId: "", // Will be filled dynamically
    createdAt: new Date().toISOString(),
  },
]

// Fallback component when persistent connection issues occur
const ConnectionErrorFallback = ({ error, onRetry }: { error: string, onRetry: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-6">
          {error.includes('timed out') ? (
            <ServerCrash className="h-7 w-7 text-red-600" />
          ) : (
            <WifiOff className="h-7 w-7 text-red-600" />
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Connection Failed</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        
        <div className="space-y-4">
          <button 
            onClick={onRetry}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Troubleshooting Tips:</h3>
            <ul className="text-sm text-gray-600 text-left space-y-2">
              <li>• Check your internet connection</li>
              <li>• Refresh the page and try again</li>
              <li>• The server might be temporarily down for maintenance</li>
              <li>• Try again in a few minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ParentDashboard({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { data: session } = useSession();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("children");
  const [notificationCount, setNotificationCount] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [moduleToAssign, setModuleToAssign] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [newChildName, setNewChildName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch parent profile
  const { data: parentProfile, isLoading: isParentLoading, error: parentError } = useQuery<ParentProfile, ApiError>({
    queryKey: ['parentProfile'],
    queryFn: async () => {
      const response = await fetch('/api/parent');
      if (!response.ok) {
        throw new Error('Failed to fetch parent profile');
      }
      return response.json();
    },
    enabled: !!session?.user,
  });

  // Fetch marketplace modules
  const { data: modulesData, isLoading: isModulesLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await fetch('/api/modules/marketplace');
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace modules');
      }
      const data = await response.json();
      console.log('Marketplace modules:', data);
      return data;
    },
    enabled: !!session?.user,
  });

  // Fetch created modules
  const { data: createdModulesData, isLoading: isCreatedModulesLoading } = useQuery({
    queryKey: ['createdModules'],
    queryFn: async () => {
      const response = await fetch('/api/studio/modules');
      if (!response.ok) {
        throw new Error('Failed to fetch created modules');
      }
      const data = await response.json();
      console.log('Created modules:', data);
      return data;
    },
    enabled: !!session?.user,
  });

  // Fetch parent tasks
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['parentTasks'],
    queryFn: async () => {
      const response = await fetch('/api/parent/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      // Make sure both task lists are in sync
      queryClient.setQueryData(['childTasks'], data);
      return data;
    },
    enabled: !!session?.user,
    refetchInterval: 2000, // Poll every 2 seconds to keep in sync
    staleTime: 0, // Consider data always stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Combine modules data with proper type checking
  const marketplaceModules = Array.isArray(modulesData?.modules) ? modulesData.modules : [];
  const createdModules = Array.isArray(createdModulesData?.modules) ? createdModulesData.modules : [];
  const modules = [...marketplaceModules, ...createdModules];
  
  console.log('Combined modules:', modules);
  const isLoadingModules = isModulesLoading || isCreatedModulesLoading;

  // Fetch child progress
  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: ['childProgress', selectedChildId],
    queryFn: async () => {
      if (!selectedChildId) return null;
      const response = await fetch(`/api/parent/child-progress/${selectedChildId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch child progress');
      }
      return response.json();
    },
    enabled: !!selectedChildId,
  });

  // Link child mutation
  const linkChildMutation = useMutation({
    mutationFn: async ({ childEmail, relation }: { childEmail: string; relation: string }) => {
      const response = await fetch('/api/parent/link-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childEmail, relation }),
      });
      if (!response.ok) {
        throw new Error('Failed to link child');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentProfile'] });
      toast({
        title: "Success",
        description: "Child linked successfully",
      });
    },
  });

  // Unlink child mutation
  const unlinkChildMutation = useMutation({
    mutationFn: async (childId: string) => {
      const response = await fetch(`/api/parent/unlink-child/${childId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to unlink child');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentProfile'] });
      toast({
        title: "Success",
        description: "Child unlinked successfully",
      });
    },
  });

  // Update child name mutation
  const updateChildNameMutation = useMutation({
    mutationFn: async ({ childId, newName }: { childId: string; newName: string }) => {
      const response = await fetch(`/api/parent/update-child/${childId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) {
        throw new Error('Failed to update child name');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentProfile'] });
      toast({
        title: "Success",
        description: "Child name updated successfully",
      });
    },
  });

  // Assign module mutation
  const assignModuleMutation = useMutation({
    mutationFn: async ({ childId, moduleId }: { childId: string; moduleId: string }) => {
      const response = await fetch('/api/parent/assign-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, moduleId }),
      });
      if (!response.ok) {
        throw new Error('Failed to assign module');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['childProgress', selectedChildId] });
      toast({
        title: "Success",
        description: "Module assigned successfully",
      });
    },
  });

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // If there's a persistent error, show the error fallback
  if (parentError) {
    return (
      <ConnectionErrorFallback 
        error={parentError.message} 
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['parentProfile'] })} 
      />
    );
  }

  if (isParentLoading || !parentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Loading parent dashboard...</p>
        </div>
      </div>
    );
  }

  const children = parentProfile.children || [];

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full">
              <span className="text-white font-bold">P</span>
            </div>
            <h1 className="text-xl font-bold text-indigo-600">PiggyWise</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5 text-gray-700" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </div>

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto p-1">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={parentProfile.name} />
                      <AvatarFallback>{parentProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium">{parentProfile.name}</p>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-xs font-medium text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium truncate">{parentProfile.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-specific top menu bar - Only visible on small screens */}
      <div className="sticky top-16 z-10 w-full bg-white border-b shadow-sm block sm:hidden">
        <div className="flex px-0.5 py-0.5 gap-0.5 min-w-full">
          <Button 
            variant="ghost"
            size="sm" 
            className={`flex-1 h-12 rounded-md text-xs font-medium flex flex-col items-center justify-center py-1 px-0 ${activeTab === "children" ? "bg-indigo-100 text-indigo-700" : ""}`}
            onClick={() => setActiveTab("children")}
          >
            <Home className="h-3.5 w-3.5 mb-0.5" />
            <span>Child</span>
          </Button>
          <Button 
            variant="ghost"
            size="sm" 
            className={`flex-1 h-12 rounded-md text-xs font-medium flex flex-col items-center justify-center py-1 px-0 ${activeTab === "marketplace" ? "bg-indigo-100 text-indigo-700" : ""}`}
            onClick={() => setActiveTab("marketplace")}
          >
            <ShoppingBag className="h-3.5 w-3.5 mb-0.5" />
            <span>Market</span>
          </Button>
          <Button 
            variant="ghost"
            size="sm" 
            className={`flex-1 h-12 rounded-md text-xs font-medium flex flex-col items-center justify-center py-1 px-0 ${activeTab === "progress" ? "bg-indigo-100 text-indigo-700" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            <TrendingUp className="h-3.5 w-3.5 mb-0.5" />
            <span>Progress</span>
          </Button>
          <Button 
            variant="ghost"
            size="sm" 
            className={`flex-1 h-12 rounded-md text-xs font-medium flex flex-col items-center justify-center py-1 px-0 ${activeTab === "studio" ? "bg-indigo-100 text-indigo-700" : ""}`}
            onClick={() => setActiveTab("studio")}
          >
            <BookOpen className="h-3.5 w-3.5 mb-0.5" />
            <span>Studio</span>
          </Button>
          <Button 
            variant="ghost"
            size="sm" 
            className={`flex-1 h-12 rounded-md text-xs font-medium flex flex-col items-center justify-center py-1 px-0 ${activeTab === "tasks" ? "bg-indigo-100 text-indigo-700" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            <CheckSquare className="h-3.5 w-3.5 mb-0.5" />
            <span>Tasks</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container px-2 sm:px-4 mx-auto mt-2 sm:mt-6 max-w-6xl">
        {/* Welcome Banner */}
        <Card className="mb-4 sm:mb-6 bg-indigo-600 text-white">
          <CardContent className="flex items-center p-3 sm:p-6">
            <div className="flex-1">
              <h2 className="text-lg sm:text-2xl font-bold">Welcome back, {parentProfile.name} 👋</h2>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-base text-indigo-100">
                Track your child's learning progress and assign modules.
              </p>
            </div>
            <div className="hidden md:block">
              <img src="/placeholder.svg?height=120&width=200" alt="Education illustration" className="h-24 sm:h-32" />
            </div>
          </CardContent>
        </Card>

        {/* Error state */}
        {parentError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base text-red-900">Connection Error</h3>
                <p className="text-xs sm:text-sm text-red-700 truncate">
                  {(parentError as ApiError).message || 'An error occurred'}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['parentProfile'] })}
                className="border-red-200 text-red-700 hover:bg-red-100 h-7 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isParentLoading ? (
          <div className="py-10 sm:py-20 text-center">
            <div className="inline-block animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading your dashboard...</p>
          </div>
        ) : (
          /* Dashboard Tabs - Only visible on non-mobile screens */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 hidden sm:block">
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <TabsList className="w-full sm:w-auto grid grid-cols-5 min-w-[600px] sm:min-w-0">
                <TabsTrigger value="children" onClick={() => onTabChange?.('children')}>My Child</TabsTrigger>
                <TabsTrigger value="marketplace" onClick={() => onTabChange?.('marketplace')}>Marketplace</TabsTrigger>
                <TabsTrigger value="progress" onClick={() => onTabChange?.('progress')}>Progress</TabsTrigger>
                <TabsTrigger value="studio" onClick={() => onTabChange?.('studio')}>Module Studio</TabsTrigger>
                <TabsTrigger value="tasks" onClick={() => onTabChange?.('tasks')}>Tasks</TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content is rendered below */}
          </Tabs>
        )}
        
        {/* Tab Content - Works with both mobile menu and desktop tabs */}
        {!isParentLoading && (
          <div className="mt-2 sm:mt-4">
            {/* Children List Tab */}
            {activeTab === "children" && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <Card className="col-span-full">
                    <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                      <CardTitle className="text-base sm:text-lg text-gray-900">My Child</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                      {!children.length ? (
                        <div className="flex flex-col items-center justify-center p-3 sm:p-6 text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                            <PlusCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                          </div>
                          <h3 className="mb-1 sm:mb-2 text-sm sm:text-lg font-medium text-gray-900">No Child Linked Yet</h3>
                          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                            Link your child's account to start their financial education journey.
                          </p>
                          <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 max-w-md w-full">
                            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg flex items-start">
                              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                              <div className="text-left text-xs">
                                <span className="font-medium block mb-0.5">Assign Modules</span>
                                <span>Customize learning with age-appropriate lessons</span>
                              </div>
                            </div>
                            <div className="bg-green-50 p-2 sm:p-3 rounded-lg flex items-start">
                              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                              <div className="text-left text-xs">
                                <span className="font-medium block mb-0.5">Track Progress</span>
                                <span>Monitor learning journey and achievements</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {children.map((child: Child) => (
                            <div key={child.id} className="bg-slate-50 rounded-lg p-3 sm:p-4">
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                    <AvatarImage src={child.avatar} alt={child.name} />
                                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium text-sm sm:text-lg text-gray-900">{child.name}</h3>
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 sm:py-0.5 text-gray-700">{child.relation}</Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 sm:mt-4">
                                <Button 
                                  className="w-full flex items-center justify-center py-1.5 sm:py-2 h-auto" 
                                  onClick={() => setSelectedChildId(child.id)}
                                >
                                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                  <span className="text-xs sm:text-sm">View Progress</span>
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full h-8 sm:h-10"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedChild(child);
                                        setNewChildName(child.name);
                                        setShowEditNameDialog(true);
                                      }}
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Edit Name
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedChild(child);
                                        setShowUnlinkDialog(true);
                                      }}
                                    >
                                      <Unlink className="w-4 h-4 mr-2" />
                                      Unlink Child
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {children.length ? (
                    <Card className="col-span-full">
                      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                        <CardTitle className="text-base sm:text-lg">Assign Learning Module</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Select a module to assign to your child</CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                        <AssignModuleForm
                          children={children}
                          modules={modulesData?.modules || []}
                          createdModules={createdModulesData?.modules || []}
                          onAssign={async (childId: string, moduleId: string) => {
                            const result = await assignModuleMutation.mutateAsync({ childId, moduleId });
                            return { success: true, message: "Module assigned successfully" };
                          }}
                          selectedChildId={selectedChildId || children[0]?.id}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="col-span-full">
                      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                        <CardTitle className="text-base sm:text-lg">Link Your Child</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Enter your child's email and select your relation
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                        <LinkChildForm 
                          onLinkChild={async (childEmail: string, relation: string) => {
                            const result = await linkChildMutation.mutateAsync({ childEmail, relation });
                            return { success: true, message: "Child linked successfully" };
                          }}
                          hasLinkedChild={children.length > 0} 
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Module Marketplace Tab */}
            {activeTab === "marketplace" && (
              <ModuleMarketplace
                modules={modulesData?.modules || []}
                createdModules={createdModulesData?.modules || []}
                onAssignModule={(moduleId) => {
                  if (children.length > 0) {
                    assignModuleMutation.mutate({ childId: children[0].id, moduleId });
                  } else {
                    toast({
                      title: "No child linked",
                      description: "Please link a child to your account first",
                      variant: "destructive",
                    })
                    setActiveTab("children")
                  }
                }}
                hasLinkedChild={children.length > 0}
                setModuleToAssign={setModuleToAssign}
                setShowAssignModal={setShowAssignModal}
              />
            )}

            {/* Progress Tab */}
            {activeTab === "progress" && (
              <Card>
                <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                  <CardTitle className="text-base sm:text-lg">Learning Progress</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {children.length > 0 ? `Viewing progress for ${children.find((c: Child) => c.id === selectedChildId)?.name || 'your child'}` : "Link a child to view their progress"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                  {children.length > 0 ? (
                    <>
                      {progressData?.progressData?.length > 0 ? (
                        <ChildProgressList progressData={progressData?.progressData || []} />
                      ) : (
                        <div className="p-4 sm:p-8 text-center text-muted-foreground">
                          <Award className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                          <p className="text-sm">No modules have been assigned to this child yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-3 sm:mt-4 text-xs sm:text-sm h-8 sm:h-10" 
                            onClick={() => setActiveTab("marketplace")}
                          >
                            Browse Modules
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 sm:p-8 text-center text-muted-foreground">
                      <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                      <p className="text-sm">Please link a child to view their progress</p>
                      <Button 
                        variant="outline" 
                        className="mt-3 sm:mt-4 text-xs sm:text-sm h-8 sm:h-10" 
                        onClick={() => setActiveTab("children")}
                      >
                        Go to Link Child
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Module Studio Tab */}
            {activeTab === "studio" && (
              <ModuleStudio />
            )}

            {/* Tasks Tab */}
            {activeTab === "tasks" && (
              <Card>
                <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        Manage Tasks <CheckSquare className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Assign and track tasks for your child</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                  {children.length > 0 ? (
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Tasks</h3>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                      <p className="text-sm">Please link a child to manage tasks</p>
                      <Button 
                        variant="outline" 
                        className="mt-3 sm:mt-4 text-xs sm:text-sm h-8 sm:h-10" 
                        onClick={() => setActiveTab("children")}
                      >
                        Go to Link Child
                      </Button>
                    </div>
                  )}
                  {children.length > 0 ? (
                    <ParentTasks 
                      tasks={isTasksLoading ? [] : (tasksData?.tasks || [])} 
                      children={children}
                    />
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                      <p className="text-sm">Please link a child to manage tasks</p>
                      <Button 
                        variant="outline" 
                        className="mt-3 sm:mt-4 text-xs sm:text-sm h-8 sm:h-10" 
                        onClick={() => setActiveTab("children")}
                      >
                        Go to Link Child
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Module Assignment Modal */}
      {showAssignModal && moduleToAssign && (
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="px-4 pt-5 pb-4 sm:p-6 max-w-sm sm:max-w-md mx-auto">
            <DialogHeader className="space-y-1 sm:space-y-2">
              <DialogTitle className="text-base sm:text-lg">Assign Module</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">Confirm module assignment to your child</DialogDescription>
            </DialogHeader>
            <div className="py-2 sm:py-4">
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-muted rounded-md">
                <h4 className="font-medium text-sm sm:text-base">{modules.find((m) => m.id === moduleToAssign)?.name}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {modules.find((m) => m.id === moduleToAssign)?.description}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="note" className="text-xs sm:text-sm">Add a note (optional)</Label>
                <Textarea id="note" placeholder="Add an encouraging note for your child..." className="text-xs sm:text-sm min-h-[60px] sm:min-h-[80px]" />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowAssignModal(false)} className="h-8 sm:h-10 text-xs sm:text-sm">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (children.length > 0) {
                    assignModuleMutation.mutate({ childId: children[0].id, moduleId: moduleToAssign });
                    setShowAssignModal(false)
                    setModuleToAssign(null)
                  }
                }}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              >
                Confirm Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Name Dialog */}
      <Dialog open={showEditNameDialog} onOpenChange={setShowEditNameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Child's Name</DialogTitle>
            <DialogDescription>
              Update the display name for your child's account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditNameDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (selectedChild && newChildName.trim()) {
                  updateChildNameMutation.mutate({ childId: selectedChild.id, newName: newChildName.trim() });
                  setShowEditNameDialog(false);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Confirmation Dialog */}
      <Dialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unlink Child</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlink {selectedChild?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlinkDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (selectedChild) {
                  unlinkChildMutation.mutate(selectedChild.id);
                  setShowUnlinkDialog(false);
                }
              }}
            >
              Unlink
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
