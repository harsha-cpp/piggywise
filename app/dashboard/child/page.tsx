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
import ChildLoader from "@/components/loaders/ChildLoader";

import { CharacterPanel } from "@/components/character-panel"
import { ModuleCard } from "@/components/module-card"
import { FirstTimeExperience } from "@/components/first-time-experience"
import { TopNavigation } from "@/components/top-navigation"
import { PodcastsPage } from "@/components/podcasts-page"
import { SettingsPage } from "@/components/settings-page"
import { KidChatbot } from "@/components/kid-chatbot"

export default function ChildDashboardPage() {
  const { data: session, status } = useSession();
  const [expandedTab, setExpandedTab] = useState<string | null>("tasks");
  const [activePage, setActivePage] = useState("home");
  const [hasCharacter, setHasCharacter] = useState(true); // Set to true by default to skip first-time experience for now
  const [isLoading, setIsLoading] = useState(true);
  const [forceLoader, setForceLoader] = useState(true); // Force loader to show for at least one cycle
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

  // Fetch modules assigned to the child
  const { data: modulesData, isLoading: isModulesLoading } = useQuery({
    queryKey: ["childModules"],
    queryFn: async () => {
      const response = await fetch(`/api/child/assigned-modules`);
      if (!response.ok) {
        throw new Error("Failed to fetch modules");
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  const tasks = tasksData?.tasks || [];
  const childTasks = tasks.filter((task: Task) => task.childId === session?.user?.id);
  const completedTasks = childTasks.filter((task: Task) => task.status === "COMPLETED").length;
  const totalTasks = childTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate lessons completed and modules completed
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [modulesCompleted, setModulesCompleted] = useState(0);

  // Update lessons completed count based on module data
  useEffect(() => {
    if (modulesData?.modules) {
      let totalLessonsCompleted = 0;
      let totalModulesCompleted = 0;
      
      modulesData.modules.forEach((module: any) => {
        // If module has progress data
        if (module.progress) {
          totalLessonsCompleted += module.progress.completedLessons || 0;
          
          // If all lessons are completed, count module as completed
          if (module.progress.completedLessons === module.contents?.length) {
            totalModulesCompleted++;
          }
        } else if (module.status === "COMPLETED") {
          // If no detailed progress but module is marked complete
          totalModulesCompleted++;
          // Estimate lesson count (if module has contents)
          totalLessonsCompleted += module.contents?.length || 0;
        }
      });
      
      setLessonsCompleted(totalLessonsCompleted);
      setModulesCompleted(totalModulesCompleted);
    }
  }, [modulesData]);

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

  // Calculate XP based on lessons completed and modules completed
  useEffect(() => {
    // Calculate XP based on lessons and modules
    const lessonXP = lessonsCompleted * 25; // 25 XP per lesson
    const moduleXP = modulesCompleted * 20; // 20 XP bonus per module
    const totalXP = lessonXP + moduleXP;
    
    // Set XP and calculate level (100 XP per level)
    setUserXP(totalXP);
    const calculatedLevel = Math.floor(totalXP / 100) + 1;
    setUserLevel(calculatedLevel);
  }, [lessonsCompleted, modulesCompleted]);

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
      
      // Allow loader to disappear after a minimum time
      const timer = setTimeout(() => {
        setForceLoader(false);
      }, 2500); // This ensures loader is shown for at least 2.5 seconds
      
      // Add listener to handle navigation errors
      window.addEventListener('unhandledrejection', (event) => {
        // Prevent chunk load errors from being shown to the user
        if (event.reason && typeof event.reason.message === 'string' && 
            event.reason.message.includes('ChunkLoadError') || 
            event.reason.message.includes('Loading chunk')) {
          event.preventDefault();
        }
      });
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('unhandledrejection', () => {});
      }
    }
  }, [session, status]);

  const handleCharacterCreated = () => {
    setHasCharacter(true)
  }

  // Tab accordion components
  const tabAccordions = [
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
    }
  ];
  
  // Always keep the Tasks accordion expanded
  useEffect(() => {
    setExpandedTab("tasks");
  }, []);

  // Handle accordion toggle
  const toggleAccordion = (id: string) => {
    if (id === "tasks") {
      // Keep tasks always expanded
      setExpandedTab("tasks");
    } else {
      setExpandedTab(expandedTab === id ? null : id);
    }
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content Area (70%) */}
                <div className="md:col-span-2">
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
                          </button>
                          {expandedTab === tab.id && tab.content}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modules Section */}
                  <section className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Learning Modules</h2>
                    </div>
                    
                    {isModulesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : modulesData?.modules && modulesData.modules.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modulesData.modules.map((module: any) => {
                          // Calculate progress - if module has a status, use that to determine progress
                          let progress = 0;
                          if (module.progress) {
                            // If we have progress data
                            progress = module.progress.completedLessons / (module.contents?.length || 1) * 100;
                          } else if (module.status === "COMPLETED") {
                            progress = 100;
                          } else if (module.status === "IN_PROGRESS") {
                            progress = 50; // Default for in progress
                          }
                          
                          // Determine if the module is completed
                          const isCompleted = progress === 100;
                          
                          // Use a placeholder image if no thumbnailUrl is provided
                          const thumbnailUrl = module.thumbnailUrl || "/images/placeholder-module.jpg";
                          
                          // Determine appropriate color class based on category
                          let cardColorClass;
                          switch(module.category) {
                            case 'SAVINGS':
                              cardColorClass = 'from-amber-400 to-amber-600';
                              break;
                            case 'INVESTING':
                              cardColorClass = 'from-emerald-400 to-emerald-600';
                              break;
                            case 'BUDGETING':
                              cardColorClass = 'from-blue-400 to-blue-600';
                              break;
                            case 'ENTREPRENEURSHIP':
                              cardColorClass = 'from-purple-400 to-purple-600';
                              break;
                            default:
                              cardColorClass = 'from-sky-400 to-sky-600';
                          }
                          
                          return (
                            <ModuleCard 
                              key={module.id}
                              id={String(module.id)}
                              title={module.title || "Learning Module"}
                              description={module.description || "Start your learning journey"}
                              progress={progress} // Use calculated progress
                              thumbnailUrl={thumbnailUrl}
                              duration={module.totalDuration || `${(module.contents?.length || 1) * 5} min`}
                              colorClass={cardColorClass}
                              isNew={false}
                              isCompleted={isCompleted}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="mb-4 text-4xl">📚</div>
                        <h3 className="text-lg font-semibold mb-2">No modules assigned</h3>
                        <p className="text-gray-500 mb-4">Relax! Your parent hasn't assigned any modules yet.</p>
                      </div>
                    )}
                  </section>
                </div>

                {/* Character Panel Sidebar (30%) */}
                <div className="md:col-span-1 md:h-screen">
                  <div className="md:sticky md:top-[4.5rem]">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 md:block hidden">Your Character</h2>
                    <CharacterPanel lessonsCompleted={lessonsCompleted} />
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

  if (!hasCharacter) {
    return <FirstTimeExperience onComplete={handleCharacterCreated} />;
  }

  if (isLoading || !session || forceLoader) {
    return <ChildLoader fullscreen minPlayCount={1} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation activeTab={activePage} onTabChange={setActivePage} />
      <div className="container pt-20 pb-6 max-w-6xl mx-auto px-2 sm:px-3">
        {renderPage()}
      </div>
      
      {/* Kid-friendly Gemini Chatbot */}
      <KidChatbot />
    </div>
  );
} 