"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckSquare, TrendingUp, ChevronDown, ChevronUp, Square, CheckCircle, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import confetti from 'canvas-confetti';
import { Task } from "@/components/parent/parent-tasks";

import { CharacterPanel } from "@/components/character-panel"
import { ModuleCard } from "@/components/module-card"
import { FirstTimeExperience } from "@/components/first-time-experience"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PodcastsPage } from "@/components/podcasts-page"
import { SettingsPage } from "@/components/settings-page"
import { KidChatbot } from "@/components/kid-chatbot"

export default function ChildDashboard() {
  const { data: session, status } = useSession();
  const [expandedTab, setExpandedTab] = useState<string | null>("stats");
  const [activePage, setActivePage] = useState("home");
  const [hasCharacter, setHasCharacter] = useState(true); // Set to true by default to skip first-time experience for now
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState(""); // Default empty
  const [parentName, setParentName] = useState("Mom"); // Default parent name
  const [userXP, setUserXP] = useState(350); // User's XP points
  const [userLevel, setUserLevel] = useState(3); // User's level
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["childTasks"],
    queryFn: async () => {
      const response = await fetch(`/api/child/tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 2000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const tasks = tasksData?.tasks || [];
  const childTasks = tasks.filter((task: Task) => task.childId === session?.user?.id);
  const completedTasks = childTasks.filter((task: Task) => task.status === "COMPLETED").length;
  const totalTasks = childTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Sort tasks: pending first, then by due date
  const sortedTasks = [...childTasks].sort((a: Task, b: Task) => {
    if (a.status === "PENDING" && b.status === "COMPLETED") return -1;
    if (a.status === "COMPLETED" && b.status === "PENDING") return 1;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Function to trigger confetti effect
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Toggle task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: "PENDING" | "COMPLETED" }) => {
      const response = await fetch(`/api/child/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      return response.json();
    },
    onSuccess: async (data, variables) => {
      // Ensure task data is fully synchronized - double-check
      syncTaskStatus(variables.taskId, variables.status);
      
      if (variables.status === "COMPLETED") {
        setRecentlyCompleted(variables.taskId);
        triggerConfetti();
        toast({
          title: "Great job! 🎉",
          description: "You've completed a task!",
          variant: "default",
        });
        
        setTimeout(() => {
          setRecentlyCompleted(null);
        }, 3000);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle task status toggle
  const handleToggleTaskStatus = (task: Task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    
    // First sync all UI components through shared caches
    syncTaskStatus(task.id, newStatus);
    
    // Then trigger server update
    toggleTaskMutation.mutate({ taskId: task.id, status: newStatus });
  };

  // Calculate level and progress based on XP
  useEffect(() => {
    // Simple level calculation: 100 XP per level, with level 1 starting at 0 XP
    const calculatedLevel = Math.floor(userXP / 100) + 1;
    setUserLevel(calculatedLevel);
  }, [userXP]);
  
  // Calculate level progress percentage
  const calculateLevelProgress = () => {
    const xpForCurrentLevel = (userLevel - 1) * 100;
    const xpForNextLevel = userLevel * 100;
    const xpInCurrentLevel = userXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);
  };

  // Redirect if not logged in or not a child
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    } else if (session?.user && session.user.userType !== "CHILD") {
      redirect("/dashboard/parent");
    } else if (status === "authenticated") {
      setIsLoading(false);
      // Set nickname from session if available
      if (session?.user?.name) {
        setNickname(session.user.name);
      }
    }
  }, [session, status]);

  // Mock data for modules
  const modules = [
    {
      id: "1",
      title: "Part 1",
      description: "Find hidden treasures and learn about saving",
      progress: 40,
      image: "/placeholder.svg?height=200&width=200",
      color: "from-amber-300 to-amber-500",
      lessons: [
        {
          id: "p1-l1",
          title: "Introduction to Saving",
          duration: "5 min",
          videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          isCompleted: true
        },
        {
          id: "p1-l2",
          title: "Finding Hidden Money",
          duration: "7 min",
          videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          isCompleted: false
        }
      ],
      completedLessons: 1,
      totalLessons: 2
    },
    {
      id: "2",
      title: "Part 2",
      description: "Climb to the top by making smart choices",
      progress: 40,
      image: "/placeholder.svg?height=200&width=200",
      color: "from-emerald-300 to-emerald-500",
      lessons: [
        {
          id: "p2-l1",
          title: "Smart Money Choices",
          duration: "6 min",
          videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          isCompleted: true
        },
        {
          id: "p2-l2",
          title: "Budgeting Basics",
          duration: "8 min",
          videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          isCompleted: false
        }
      ],
      completedLessons: 1,
      totalLessons: 2
    },
    {
      id: "3",
      title: "Part 3",
      description: "Buy and sell to learn about markets",
      progress: 40,
      image: "/placeholder.svg?height=200&width=200",
      color: "from-sky-300 to-sky-500",
      lessons: [
        {
          id: "p3-l1",
          title: "Introduction to Markets",
          duration: "5 min",
          videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          isCompleted: true
        },
        {
          id: "p3-l2",
          title: "Buying and Selling",
          duration: "7 min",
          videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          isCompleted: false
        }
      ],
      completedLessons: 1,
      totalLessons: 2
    },
  ]

  const handleCharacterCreated = () => {
    setHasCharacter(true)
  }

  // Tab accordion components
  const tabAccordions = [
    {
      id: "stats",
      title: "Stats",
      color: "bg-red-200",
      activeColor: "bg-red-300",
      content: (
        <div className="bg-white rounded-xl p-4 shadow-md mt-2">
          <h3 className="font-bold text-lg mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm font-medium">Experience (XP)</p>
              <p className="text-xl font-bold">{userXP}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium">Current Level</p>
              <p className="text-xl font-bold">{userLevel}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium">Lessons Completed</p>
              <p className="text-xl font-bold">7</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm font-medium">Current Streak</p>
              <p className="text-xl font-bold">5 days</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between mb-1 text-xs text-gray-600">
              <span>Level {userLevel} Progress</span>
              <span>{calculateLevelProgress()}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${calculateLevelProgress()}%` }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-500">
              {100 - (userXP % 100)} XP until level {userLevel + 1}
            </p>
          </div>
        </div>
      )
    },
    {
      id: "tasks",
      title: "Tasks",
      color: "bg-red-200/90",
      activeColor: "bg-red-300/90",
      content: (
        <div className="bg-white rounded-xl p-4 shadow-md mt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Your Tasks</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{completedTasks} of {totalTasks} completed</span>
              <Progress value={completionPercentage} className="w-24 h-2" />
            </div>
          </div>
          <div className="space-y-3">
            {sortedTasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  task.status === "COMPLETED" 
                    ? "bg-green-50 border-green-100" 
                    : "bg-white border-gray-200 hover:border-blue-200"
                } ${
                  recentlyCompleted === task.id
                    ? "ring-2 ring-offset-2 ring-green-500 animate-pulse"
                    : ""
                }`}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 rounded-full ${task.status === "PENDING" ? "hover:bg-green-100" : ""}`}
                  onClick={() => handleToggleTaskStatus(task)}
                >
                  {task.status === "COMPLETED" ? (
                    <CheckSquare className="h-5 w-5 text-green-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                <div className="flex-1">
                  <span className={`text-sm ${
                    task.status === "COMPLETED" ? "line-through text-gray-500" : "text-gray-900"
                  }`}>
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs bg-amber-50 flex items-center gap-1 w-fit">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  )}
                </div>
                <Badge 
                  variant={task.status === "COMPLETED" ? "default" : "outline"} 
                  className={`text-xs ${
                    task.status === "COMPLETED" 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : ""
                  }`}
                >
                  {task.status === "COMPLETED" ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Done</>
                  ) : "To Do"}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button 
              onClick={() => window.location.href = '/dashboard/child/tasks'}
              className="w-full py-2 text-sm font-medium rounded-lg bg-[#1E40AF]/10 text-[#1E40AF] hover:bg-[#1E40AF]/20 transition-colors"
            >
              View All Tasks
            </Button>
          </div>
        </div>
      )
    },
    {
      id: "achievements",
      title: "Achievements",
      color: "bg-red-200/80",
      activeColor: "bg-red-300/80",
      content: (
        <div className="bg-white rounded-xl p-4 shadow-md mt-2">
          <h3 className="font-bold text-lg mb-3">Your Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-sm font-medium text-center">First Savings</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center">
              <div className="text-2xl mb-1">🌟</div>
              <p className="text-sm font-medium text-center">Budget Master</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg flex flex-col items-center opacity-50">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-sm font-medium text-center">Investor (Locked)</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg flex flex-col items-center opacity-50">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-sm font-medium text-center">Money Wizard (Locked)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "todo",
      title: "To-Do",
      color: "bg-red-200/70",
      activeColor: "bg-red-300/70",
      content: (
        <div className="bg-white rounded-xl p-4 shadow-md mt-2">
          <h3 className="font-bold text-lg mb-3">Your To-Do List</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input type="checkbox" className="h-4 w-4 rounded" />
              <span>Complete Money Mountain level 3</span>
            </li>
            <li className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input type="checkbox" className="h-4 w-4 rounded" />
              <span>Watch video about saving</span>
            </li>
            <li className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input type="checkbox" className="h-4 w-4 rounded" />
              <span>Set a savings goal</span>
            </li>
          </ul>
        </div>
      )
    }
  ];
  
  // Handle accordion toggle
  const toggleAccordion = (id: string) => {
    setExpandedTab(expandedTab === id ? null : id);
  };

  // Render different pages based on active page
  const renderPage = () => {
    const pageVariants = {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 }
    };

    const pageTransition = {
      type: "tween",
      ease: "easeInOut",
      duration: 0.3
    };

    switch (activePage) {
      case "home":
        return (
          <AnimatePresence mode="wait">
            <motion.div 
              key="home"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="pb-12"
            >
              {/* Main Content with Sidebar Layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Main Content Area (75%) */}
                <div className="md:col-span-3">
                  {/* Header Section */}
                  <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                      Hey {nickname || "there"},
                    </h1>

                    {/* Accordion Tabs */}
                    <div className="space-y-3">
                      {tabAccordions.map((tab) => (
                        <div key={tab.id} className="rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleAccordion(tab.id)}
                            className={`w-full p-3 flex items-center justify-between transition-colors ${
                              expandedTab === tab.id ? tab.activeColor : tab.color
                            }`}
                          >
                            <div className="flex items-center">
                              <div className="h-4 w-4 bg-gray-500 rounded-full mr-2"></div>
                              <span className="font-medium">{tab.title}</span>
                            </div>
                            {expandedTab === tab.id ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                          {expandedTab === tab.id && tab.content}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modules Section */}
                  <section className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Jump Right Back In</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modules.map((module) => (
                        <ModuleCard 
                          key={module.id}
                          id={String(module.id)}
                          title={module.title}
                          description={module.description}
                          progress={module.progress}
                          thumbnailUrl={module.image}
                          duration="10 min"
                          colorClass={module.color}
                        />
                      ))}
                    </div>
                  </section>
                </div>

                {/* Character Panel Sidebar (25%) */}
                <div className="md:col-span-1 md:h-screen">
                  <div className="md:sticky md:top-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 md:block hidden">Your Character</h2>
                    <CharacterPanel />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )
      case "podcasts":
        return (
          <AnimatePresence mode="wait">
            <motion.div 
              key="podcasts"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="pb-12"
            >
              <PodcastsPage />
            </motion.div>
          </AnimatePresence>
        )
      case "settings":
        return (
          <AnimatePresence mode="wait">
            <motion.div 
              key="settings"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="pb-12"
            >
              <SettingsPage />
            </motion.div>
          </AnimatePresence>
        )
      default:
        return null
    }
  }

  // Function to update and refetch tasks across components for synchronization
  const syncTaskStatus = (taskId: string, newStatus: "PENDING" | "COMPLETED") => {
    // First update caches for immediate visual feedback
    const updateCache = (queryKey: string) => {
      const cachedData = queryClient.getQueryData([queryKey]) as { tasks?: any[] } || { tasks: [] };
      if (cachedData && cachedData.tasks) {
        const updatedTasks = cachedData.tasks.map((t: any) => 
          t.id === taskId ? {...t, status: newStatus} : t
        );
        queryClient.setQueryData([queryKey], {...cachedData, tasks: updatedTasks});
      }
    };
    
    // Update both caches
    updateCache('childTasks');
    updateCache('parentTasks');
    
    // Force refetches to ensure latest data
    setTimeout(() => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['childTasks'] }),
        queryClient.invalidateQueries({ queryKey: ['parentTasks'] }),
        queryClient.refetchQueries({ queryKey: ['childTasks'] }),
        queryClient.refetchQueries({ queryKey: ['parentTasks'] })
      ]);
    }, 200);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!hasCharacter ? (
        <FirstTimeExperience onComplete={handleCharacterCreated} />
      ) : (
        <>
          <div className="container mx-auto px-4 py-6">
            {renderPage()}
          </div>
          {/* Bottom Navigation */}
          <BottomNavigation activeTab={activePage} onTabChange={setActivePage} />
          
          {/* Kid-friendly Gemini Chatbot */}
          <KidChatbot />
        </>
      )}
    </div>
  )
} 