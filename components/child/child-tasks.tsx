import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, CheckSquare, Square, Trophy, Award } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "../parent/parent-tasks";
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from "framer-motion";

interface ChildTasksProps {
  tasks: Task[];
  childId: string;
}

export default function ChildTasks({ tasks = [], childId }: ChildTasksProps) {
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update local tasks when props change, but preserve completed status
  useEffect(() => {
    if (tasks.length > 0) {
      // If we already have local tasks, preserve their status when new tasks come in
      if (localTasks.length > 0) {
        const updatedTasks = tasks.map(newTask => {
          // Try to find this task in our local state
          const existingTask = localTasks.find(t => t.id === newTask.id);
          // If found and completed locally, preserve that status
          if (existingTask && existingTask.status === "COMPLETED") {
            return { ...newTask, status: "COMPLETED" as const };
          }
          return newTask;
        });
        setLocalTasks(updatedTasks);
      } else {
        // First load, just use the server data
        setLocalTasks(tasks);
      }
    }
  }, [tasks]);
  
  // Filter tasks for this child only
  const childTasks = localTasks.filter(task => task.childId === childId);
  
  // Calculate task completion stats
  const completedTasks = childTasks.filter(task => task.status === "COMPLETED").length;
  const pendingTasks = childTasks.filter(task => task.status === "PENDING").length;
  const totalTasks = childTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
    mutationFn: async ({ taskId, status, completed }: { taskId: string; status: "PENDING" | "COMPLETED"; completed: boolean }) => {
      if (process.env.NODE_ENV === "development") {
        // In development, just return mock success without API call
        return { success: true, task: { id: taskId, status } };
      }
      
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
    onMutate: ({ taskId, status }) => {
      // Optimistically update the UI
      setLocalTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );
      
      // Save the status to localStorage for persistence
      try {
        // Get existing completed tasks
        const completedTasksString = localStorage.getItem('childCompletedTasks');
        const completedTasksMap = completedTasksString ? JSON.parse(completedTasksString) : {};
        
        // Update the map with the new status
        if (status === "COMPLETED") {
          completedTasksMap[taskId] = true;
        } else {
          delete completedTasksMap[taskId];
        }
        
        // Save back to localStorage
        localStorage.setItem('childCompletedTasks', JSON.stringify(completedTasksMap));
      } catch (error) {
        console.error("Failed to save task status to localStorage", error);
      }
    },
    onSuccess: async (_, variables) => {
      // Ensure task data is fully synchronized
      syncTaskStatus(variables.taskId, variables.status);
      
      if (variables.status === "COMPLETED") {
        setRecentlyCompleted(variables.taskId);
        triggerConfetti();
        toast({
          title: "Great job! 🎉",
          description: "You've completed a task!",
          variant: "default",
        });
        
        // Reset the recently completed highlight after 3 seconds
        setTimeout(() => {
          setRecentlyCompleted(null);
        }, 3000);
      }
    },
    onError: (_, variables) => {
      // Revert the optimistic update if the API call fails
      setLocalTasks(prev => 
        prev.map(task => 
          task.id === variables.taskId 
            ? { ...task, status: task.status === "COMPLETED" ? "PENDING" : "COMPLETED" } 
            : task
        )
      );
      
      // Also revert the localStorage change
      try {
        const completedTasksString = localStorage.getItem('childCompletedTasks');
        const completedTasksMap = completedTasksString ? JSON.parse(completedTasksString) : {};
        
        if (variables.status === "PENDING") {
          completedTasksMap[variables.taskId] = true;
        } else {
          delete completedTasksMap[variables.taskId];
        }
        
        localStorage.setItem('childCompletedTasks', JSON.stringify(completedTasksMap));
      } catch (error) {
        console.error("Failed to revert task status in localStorage", error);
      }
      
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Load completed tasks from localStorage on initial render
  useEffect(() => {
    try {
      const completedTasksString = localStorage.getItem('childCompletedTasks');
      if (completedTasksString) {
        const completedTasksMap = JSON.parse(completedTasksString);
        
        setLocalTasks(prevTasks => 
          prevTasks.map(task => 
            completedTasksMap[task.id] ? { ...task, status: "COMPLETED" as const } : task
          )
        );
      }
    } catch (error) {
      console.error("Failed to load task status from localStorage", error);
    }
  }, []);

  // Function to update and refetch tasks across components for synchronization
  const syncTaskStatus = (taskId: string, newStatus: "PENDING" | "COMPLETED") => {
    // First update local state
    setLocalTasks(prev => 
      prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );
    
    // Then update caches for immediate visual feedback
    const updateCache = (queryKey: string) => {
      const cachedData = queryClient.getQueryData([queryKey]) as { tasks?: Task[] } || { tasks: [] };
      if (cachedData && cachedData.tasks) {
        const updatedTasks = cachedData.tasks.map((t: Task) => 
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

  const handleToggleTaskStatus = (task: Task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    
    // Sync task status across all UI components
    syncTaskStatus(task.id, newStatus);
    
    // Then trigger the mutation to update the server
    toggleTaskMutation.mutate({ 
      taskId: task.id, 
      status: newStatus,
      completed: newStatus === "COMPLETED" 
    });
  };

  // Sort tasks: pending first, then by due date (if available)
  const sortedTasks = [...childTasks].sort((a, b) => {
    // First sort by status (pending before completed)
    if (a.status === "PENDING" && b.status === "COMPLETED") return -1;
    if (a.status === "COMPLETED" && b.status === "PENDING") return 1;
    
    // Then sort by due date if both have one
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Put tasks with due dates before those without
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // Default to sorting by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-md border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-100 to-blue-300">
          <CardTitle className="text-xl flex items-center gap-2 text-[#1E40AF]/90">
            <Trophy className="h-5 w-5" /> My Tasks
          </CardTitle>
          <CardDescription className="text-[#1E40AF]/80">Complete tasks to earn rewards!</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Tasks Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-amber-50 p-4 rounded-lg border border-amber-100 shadow-sm"
            >
              <h4 className="text-sm font-medium text-amber-800 mb-1">Total Tasks</h4>
              <p className="text-2xl font-bold text-amber-900">{totalTasks}</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm"
            >
              <h4 className="text-sm font-medium text-green-800 mb-1">Completed</h4>
              <p className="text-2xl font-bold text-green-900">{completedTasks}</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm"
            >
              <h4 className="text-sm font-medium text-blue-800 mb-1">Pending</h4>
              <p className="text-2xl font-bold text-blue-900">{pendingTasks}</p>
            </motion.div>
          </div>
          
          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
            >
              <Progress value={completionPercentage} className="h-3" />
            </motion.div>
            
            {completionPercentage === 100 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 mt-3 p-2 bg-green-100 text-green-800 rounded-md"
              >
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">All tasks completed! Amazing job!</span>
              </motion.div>
            )}
          </div>

          {/* Task List - View Only (No Checkboxes) */}
          {sortedTasks.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {sortedTasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={`p-4 transition-all ${
                        task.status === "COMPLETED" 
                          ? "bg-green-50 border-green-100" 
                          : "border-gray-200"
                      } ${
                        recentlyCompleted === task.id
                          ? "ring-2 ring-offset-2 ring-green-500 animate-pulse"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-grow">
                          <h4 className={`font-medium ${
                            task.status === "COMPLETED" ? "line-through text-gray-500" : "text-gray-900"
                          }`}>
                            {task.title}
                          </h4>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {task.dueDate && (
                              <Badge variant="outline" className="text-xs bg-amber-50 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </Badge>
                            )}
                            
                            <Badge 
                              variant={task.status === "COMPLETED" ? "default" : "outline"} 
                              className={`text-xs ${
                                task.status === "COMPLETED" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                  : ""
                              }`}
                            >
                              {task.status === "COMPLETED" ? (
                                <><CheckCircle className="w-3 h-3 mr-1" /> Completed</>
                              ) : "Pending"}
                            </Badge>
                          </div>
                        </div>
                        
                        {task.status === "COMPLETED" && (
                          <Trophy className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium">No tasks yet!</h3>
              <p className="text-gray-500 mt-2">Your parent will assign tasks for you to complete.</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}