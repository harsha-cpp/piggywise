"use client"

import { useState, useEffect } from "react"
import { Bell, ChevronDown, User, Award, AlertTriangle, RefreshCw, WifiOff, ServerCrash, LogOut, Home, ShoppingBag, TrendingUp, BookOpen, Medal, PlusCircle, Pencil, Unlink, Eye, MoreVertical } from "lucide-react"
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

import LinkChildForm from "./link-child-form"
import AssignModuleForm from "./assign-module-form"
import ChildProgressList from "./child-progress-list"
import ChildrenList from "./children-list"
import ModuleMarketplace from "./module-marketplace"
import ModuleStudio from "./module-studio"
import ParentAchievements from "./parent-achievements"

// Mock parent achievements - these would be moved to an API endpoint later
const mockAchievements = [
  {
    id: "a1",
    title: "Getting Started",
    description: "Link your first child to your account",
    icon: "🏆",
    completed: true,
    progress: 100,
  },
  {
    id: "a2",
    title: "Module Master",
    description: "Assign 5 modules to your child",
    icon: "📚",
    completed: false,
    progress: 40, // 2 out of 5
  },
  {
    id: "a3",
    title: "Engaged Parent",
    description: "Check your child's progress 10 times",
    icon: "👀",
    completed: false,
    progress: 30, // 3 out of 10
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

export function ParentDashboard() {
  const { data: session } = useSession();
  const [parentData, setParentData] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("children");
  const [notificationCount, setNotificationCount] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [moduleToAssign, setModuleToAssign] = useState<string | null>(null);
  const [childProgress, setChildProgress] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persistentError, setPersistentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [newChildName, setNewChildName] = useState("");

  // Fetch parent profile and children
  useEffect(() => {
    if (session?.user) {
      fetchParentProfile();
      fetchModules();
    }
  }, [session]);

  // Fetch parent profile with timeout
  const fetchParentProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a promise that rejects after 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });
      
      // Create the fetch promise
      const fetchPromise = fetch('/api/parent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Race the fetch against the timeout
      const response: Response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (response.ok) {
        const data = await response.json();
        setParentData({
          id: data.id,
          name: data.name || session?.user?.name || 'Parent',
          email: data.email || session?.user?.email || '',
          relation: data.relation
        });
        
        if (data.children && data.children.length > 0) {
          setChildren(data.children.map((child: any) => ({
            id: child.id,
            name: child.name || `Child ${child.id.substring(0, 4)}`,
            email: child.email,
            creditScore: child.creditScore,
            relation: data.relation,
            avatar: "/placeholder.svg?height=40&width=40",
          })));
          
          // Auto-select the first child
          setSelectedChildId(data.children[0].id);
          
          // Fetch progress for each child
          console.log(`Found ${data.children.length} children, fetching progress...`);
          data.children.forEach((child: any) => {
            if (child && child.id) {
              safeFetchChildProgress(child.id);
            }
          });
        }
        
        // Reset error states on successful load
        setPersistentError(null);
        setRetryCount(0);
      } else {
        console.error('Failed to fetch parent profile');
        setError('Could not load parent profile. Please try again later.');
        
        // After 3 retries, set persistent error
        if (retryCount >= 2) {
          setPersistentError('Could not load parent profile. The server might be down or experiencing issues.');
        } else {
          setRetryCount(prev => prev + 1);
        }
        
        toast({
          title: "Connection Error",
          description: "Could not load parent profile. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching parent profile:', error);
      let errorMessage = 'Could not connect to the server. Please check your internet connection.';
      
      if (error instanceof Error && error.message === 'Request timed out') {
        errorMessage = 'Connection to server timed out. Please try again later.';
      }
      
      setError(errorMessage);
      
      // After 3 retries, set persistent error
      if (retryCount >= 2) {
        setPersistentError(errorMessage);
      } else {
        setRetryCount(prev => prev + 1);
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/parent/modules', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setModules(data.modules);
      } else {
        console.error('Failed to fetch modules');
        toast({
          title: "Error",
          description: "Failed to fetch available modules",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: "Could not load available modules",
        variant: "destructive",
      });
    }
  };

  const fetchChildProgress = async (childId: string) => {
    try {
      console.log(`Fetching progress for child: ${childId}`);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000);
      });
      
      // Create the fetch promise
      const fetchPromise = fetch(`/api/parent/child-progress/${childId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Race the fetch against the timeout
      const response: Response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (response.ok) {
        const data = await response.json();
        
        // Check if the child is linked
        if (!data.isLinked) {
          console.log(`Child ${childId} not linked yet`);
          return; // Exit early, nothing to process
        }
        
        // Process progress data if available
        if (data.progressData && Array.isArray(data.progressData)) {
          const formattedProgress = data.progressData.map((item: any) => ({
            moduleId: item.moduleId,
            moduleName: item.moduleName,
            description: item.description,
            status: item.status,
            completedLessons: item.completedLessons,
            totalLessons: item.totalLessons,
            progress: item.progress,
            lastUpdated: item.lastUpdated,
            category: item.category,
            difficulty: item.difficulty,
          }));
          
          setChildProgress(prev => ({
            ...prev,
            [childId]: formattedProgress
          }));
        } else {
          // Handle empty progress
          setChildProgress(prev => ({
            ...prev,
            [childId]: []
          }));
        }
      } else {
        // Handle various error responses
        const errorData = await response.json();
        console.error('Failed to fetch child progress:', errorData.error);
        
        if (response.status === 404) {
          // Child not found - this is normal if the child hasn't been linked yet
          console.log('Child not found or not linked yet');
        } else {
          // Other API errors - show toast
          toast({
            title: "Error",
            description: errorData.error || "Failed to fetch child progress",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      // Handle connection errors
      console.error('Error fetching child progress:', error);
      
      if (error instanceof Error && error.message === 'Request timed out') {
        toast({
          title: "Connection Timeout",
          description: "The request for child progress took too long to respond",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Could not fetch child's progress information",
          variant: "destructive",
        });
      }
    }
  };

  // Safely fetch child progress - only if there are linked children
  const safeFetchChildProgress = (childId: string | undefined) => {
    if (!childId) {
      console.log('No child ID provided, skipping progress fetch');
      return;
    }
    
    // Make sure we don't have an existing error state when trying to fetch progress
    setError(null);
    
    // Call the actual fetch function
    fetchChildProgress(childId);
  };

  // Function to link a child
  const linkChild = async (childEmail: string, relation: string) => {
    try {
      setError(null);
      const response = await fetch('/api/parent/link-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childEmail, relation }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh parent profile to get updated children list
        fetchParentProfile();
        return { success: true, message: "Child linked successfully" };
      } else {
        setError(`Failed to link child: ${data.error || "Unknown error"}`);
        return { success: false, message: data.error || "Failed to link child" };
      }
    } catch (error) {
      console.error('Error linking child:', error);
      setError('Could not connect to the server. Please check your internet connection.');
      return { success: false, message: "An error occurred while linking the child" };
    }
  };

  // Function to unlink a child
  const unlinkChild = async (childId: string) => {
    try {
      const response = await fetch(`/api/parent/link-child?childId=${childId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh parent profile to get updated children list
        fetchParentProfile();
        return { success: true, message: "Child unlinked successfully" };
      } else {
        setError(`Failed to unlink child: ${data.error || "Unknown error"}`);
        return { success: false, message: data.error || "Failed to unlink child" };
      }
    } catch (error) {
      console.error('Error unlinking child:', error);
      setError('Could not connect to the server. Please check your internet connection.');
      return { success: false, message: "An error occurred while unlinking the child" };
    }
  };

  // Function to update parent relation
  const updateChildRelation = async (childId: string, newRelation: string) => {
    try {
      const response = await fetch('/api/parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ relation: newRelation }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setParentData({ ...parentData, relation: newRelation });
        setChildren(children.map(child => ({ ...child, relation: newRelation })));
        return { success: true, message: "Relation updated successfully" };
      } else {
        return { success: false, message: data.error || "Failed to update relation" };
      }
    } catch (error) {
      console.error('Error updating relation:', error);
      return { success: false, message: "An error occurred while updating relation" };
    }
  };

  // Function to assign a module
  const assignModule = async (childId: string, moduleId: string) => {
    try {
      const response = await fetch('/api/parent/assign-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId, moduleId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update progress data after assignment
        fetchChildProgress(childId);
        return { success: true };
      } else {
        return { success: false, message: data.error || "Failed to assign module" };
      }
    } catch (error) {
      console.error('Error assigning module:', error);
      return { success: false, message: "An error occurred while assigning the module" };
    }
  };

  const handleViewProgress = (childId: string) => {
    setSelectedChildId(childId);
    setActiveTab("progress");
  };

  // Check if parent has a linked child
  const hasLinkedChild = children.length > 0;

  // Handle retry from the fallback screen
  const handleRetry = () => {
    setPersistentError(null);
    setRetryCount(0);
    fetchParentProfile();
  };
  
  // If we have a persistent error, show the fallback
  if (persistentError) {
    return <ConnectionErrorFallback error={persistentError} onRetry={handleRetry} />;
  }

  // Handle user sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Add new function to update child name
  const updateChildName = async (childId: string, newName: string) => {
    try {
      const response = await fetch('/api/parent/update-child', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId, name: newName }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setChildren(children.map(child => 
          child.id === childId ? { ...child, name: newName } : child
        ));
        toast({
          title: "Success",
          description: "Child's name updated successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update child's name",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating child name:', error);
      toast({
        title: "Error",
        description: "Failed to update child's name",
        variant: "destructive",
      });
      return false;
    }
  };

  if (isLoading || !parentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Loading parent dashboard...</p>
        </div>
      </div>
    );
  }

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
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </div>

            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={parentData.name} />
                  <AvatarFallback>{parentData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{parentData.name}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              
              {/* User dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {parentData.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </button>
                </div>
              )}
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
            className={`flex-1 h-12 rounded-md text-xs font-medium flex flex-col items-center justify-center py-1 px-0 ${activeTab === "achievements" ? "bg-indigo-100 text-indigo-700" : ""}`}
            onClick={() => setActiveTab("achievements")}
          >
            <Medal className="h-3.5 w-3.5 mb-0.5" />
            <span>Awards</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container px-2 sm:px-4 mx-auto mt-2 sm:mt-6 max-w-6xl">
        {/* Welcome Banner */}
        <Card className="mb-4 sm:mb-6 bg-indigo-600 text-white">
          <CardContent className="flex items-center p-3 sm:p-6">
            <div className="flex-1">
              <h2 className="text-lg sm:text-2xl font-bold">Welcome back, {parentData.name} 👋</h2>
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
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base text-red-900">Connection Error</h3>
                <p className="text-xs sm:text-sm text-red-700 truncate">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchParentProfile()}
                className="border-red-200 text-red-700 hover:bg-red-100 h-7 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="py-10 sm:py-20 text-center">
            <div className="inline-block animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 h-8 w-8 sm:h-12 sm:w-12 mb-2 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading your dashboard...</p>
          </div>
        ) : (
          /* Dashboard Tabs - Only visible on non-mobile screens */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 hidden sm:block">
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <TabsList className="w-full sm:w-auto grid grid-cols-5 min-w-[600px] sm:min-w-0">
                <TabsTrigger value="children">My Child</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="studio">Module Studio</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content is rendered below */}
          </Tabs>
        )}
        
        {/* Tab Content - Works with both mobile menu and desktop tabs */}
        {!isLoading && (
          <div className="mt-2 sm:mt-4">
            {/* Children List Tab */}
            {activeTab === "children" && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <Card className="col-span-full">
                    <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                      <CardTitle className="text-base sm:text-lg">My Child</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                      {!hasLinkedChild ? (
                        <div className="flex flex-col items-center justify-center p-3 sm:p-6 text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                            <PlusCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                          </div>
                          <h3 className="mb-1 sm:mb-2 text-sm sm:text-lg font-medium">No Child Linked Yet</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
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
                          {children.map((child) => (
                            <div key={child.id} className="bg-slate-50 rounded-lg p-3 sm:p-4">
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                    <AvatarImage src={child.avatar} alt={child.name} />
                                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium text-sm sm:text-lg">{child.name}</h3>
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 sm:py-0.5">{child.relation}</Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 sm:mt-4">
                                <Button 
                                  className="w-full flex items-center justify-center py-1.5 sm:py-2 h-auto" 
                                  onClick={() => handleViewProgress(child.id)}
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

                  {hasLinkedChild ? (
                    <Card className="col-span-full">
                      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                        <CardTitle className="text-base sm:text-lg">Assign Learning Module</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Select a module to assign to your child</CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                        <AssignModuleForm
                          children={children}
                          modules={modules}
                          onAssign={assignModule}
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
                        <LinkChildForm onLinkChild={linkChild} hasLinkedChild={hasLinkedChild} />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Module Marketplace Tab */}
            {activeTab === "marketplace" && (
              <ModuleMarketplace
                modules={modules}
                onAssignModule={(moduleId) => {
                  if (hasLinkedChild) {
                    assignModule(children[0].id, moduleId).then((result) => {
                      if (result.success) {
                        toast({
                          title: "Module assigned successfully",
                          description: `The module has been assigned to ${children[0].name}`,
                        })
                      }
                    })
                  } else {
                    toast({
                      title: "No child linked",
                      description: "Please link a child to your account first",
                      variant: "destructive",
                    })
                    setActiveTab("children")
                  }
                }}
                hasLinkedChild={hasLinkedChild}
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
                    {hasLinkedChild ? `Viewing progress for ${children.find(c => c.id === (selectedChildId || children[0].id))?.name || 'your child'}` : "Link a child to view their progress"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                  {hasLinkedChild ? (
                    <>
                      {childProgress[selectedChildId || children[0].id]?.length > 0 ? (
                        <ChildProgressList progressData={childProgress[selectedChildId || children[0].id] || []} />
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

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <Card>
                <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        Parent Achievements <Award className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Track your progress as an engaged parent</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                  <ParentAchievements achievements={mockAchievements} />
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
                  if (hasLinkedChild) {
                    assignModule(children[0].id, moduleToAssign).then((result) => {
                      if (result.success) {
                        toast({
                          title: "Module assigned successfully",
                          description: `The module has been assigned to ${children[0].name}`,
                        })
                        setShowAssignModal(false)
                        setModuleToAssign(null)
                      }
                    })
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
                  const success = await updateChildName(selectedChild.id, newChildName.trim());
                  if (success) {
                    setShowEditNameDialog(false);
                  }
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
                  const result = await unlinkChild(selectedChild.id);
                  if (result.success) {
                    setShowUnlinkDialog(false);
                    toast({
                      title: "Success",
                      description: "Child unlinked successfully",
                    });
                  }
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
