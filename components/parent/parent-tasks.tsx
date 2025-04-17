import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, PlusCircle, Trash2, Calendar, CheckSquare, Square, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: "PENDING" | "COMPLETED";
  childId: string;
  createdAt: string;
}

interface ParentTasksProps {
  tasks: Task[];
  children: Array<{ id: string; name: string }>;
}

export default function ParentTasks({ tasks = [], children = [] }: ParentTasksProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    childId: children.length ? children[0].id : ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate task completion stats
  const completedTasks = tasks.filter(task => task.status === "COMPLETED").length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Toggle task status mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: "PENDING" | "COMPLETED" }) => {
      const response = await fetch(`/api/parent/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update both caches immediately and optimistically
      const updateCache = (queryKey: string) => {
        const cachedData = queryClient.getQueryData([queryKey]) as { tasks?: Task[] } || { tasks: [] };
        if (cachedData && cachedData.tasks) {
          const updatedTasks = cachedData.tasks.map((t: Task) => 
            t.id === data.task.id ? {...t, status: data.task.status} : t
          );
          queryClient.setQueryData([queryKey], {...cachedData, tasks: updatedTasks});
        }
      };
      
      // Update both caches
      updateCache('parentTasks');
      updateCache('childTasks');
      
      // Then invalidate and refetch to ensure server sync
      setTimeout(() => {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['parentTasks'] }),
          queryClient.invalidateQueries({ queryKey: ['childTasks'] }),
          queryClient.refetchQueries({ queryKey: ['parentTasks'] }),
          queryClient.refetchQueries({ queryKey: ['childTasks'] })
        ]);
      }, 100);
      
      toast({
        title: data.task.status === "COMPLETED" ? "Task completed" : "Task marked as pending",
        description: "Task status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, "id" | "status" | "createdAt">) => {
      console.log("Sending task data:", task);
      try {
        const response = await fetch('/api/parent/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Error response:', response.status, errorData);
          throw new Error(`Failed to add task: ${response.status} ${errorData?.error || ''}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Error in task mutation:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      // Get current task lists
      const parentTasks = queryClient.getQueryData(['parentTasks']) as { tasks?: Task[] } || { tasks: [] };
      const childTasks = queryClient.getQueryData(['childTasks']) as { tasks?: Task[] } || { tasks: [] };
      
      // Add the new task to both caches
      if (parentTasks.tasks) {
        queryClient.setQueryData(['parentTasks'], { 
          ...parentTasks, 
          tasks: [response.task, ...parentTasks.tasks] 
        });
      }
      
      if (childTasks.tasks) {
        queryClient.setQueryData(['childTasks'], { 
          ...childTasks, 
          tasks: [response.task, ...childTasks.tasks] 
        });
      }
      
      // Invalidate both parent and child task queries to keep them in sync
      setTimeout(() => {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['parentTasks'] }),
          queryClient.invalidateQueries({ queryKey: ['childTasks'] }),
          queryClient.refetchQueries({ queryKey: ['parentTasks'] }),
          queryClient.refetchQueries({ queryKey: ['childTasks'] })
        ]);
      }, 100);
      
      setIsAddingTask(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        childId: children.length ? children[0].id : ""
      });
      
      toast({
        title: "Success",
        description: "Task added successfully",
      });
    },
    onError: (error) => {
      console.error('Task mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add task",
        variant: "destructive",
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/parent/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      return { taskId };  // Return the taskId for use in onSuccess
    },
    onSuccess: (result) => {
      // Get current task lists
      const parentTasks = queryClient.getQueryData(['parentTasks']) as { tasks?: Task[] } || { tasks: [] };
      const childTasks = queryClient.getQueryData(['childTasks']) as { tasks?: Task[] } || { tasks: [] };
      
      // Remove the deleted task from both caches
      if (parentTasks.tasks) {
        queryClient.setQueryData(['parentTasks'], { 
          ...parentTasks, 
          tasks: parentTasks.tasks.filter(t => t.id !== result.taskId) 
        });
      }
      
      if (childTasks.tasks) {
        queryClient.setQueryData(['childTasks'], { 
          ...childTasks, 
          tasks: childTasks.tasks.filter(t => t.id !== result.taskId) 
        });
      }
      
      // Invalidate both parent and child task queries to keep them in sync
      setTimeout(() => {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['parentTasks'] }),
          queryClient.invalidateQueries({ queryKey: ['childTasks'] }),
          queryClient.refetchQueries({ queryKey: ['parentTasks'] }),
          queryClient.refetchQueries({ queryKey: ['childTasks'] })
        ]);
      }, 100);
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
  });

  // Handle task status toggle
  const handleToggleTaskStatus = (task: Task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    toggleTaskMutation.mutate({ taskId: task.id, status: newStatus });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newTask.childId) {
      toast({
        title: "Error",
        description: "Please select a child",
        variant: "destructive",
      });
      return;
    }
    
    // Debug the child selection
    console.log("Selected child:", children.find(child => child.id === newTask.childId));
    console.log("All available children:", children);
    
    addTaskMutation.mutate(newTask);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  return (
    <div className="space-y-6">
      {/* Tasks Progress Overview */}
      <div className="p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Tasks Progress</h3>
        <Progress value={completionPercentage} className="h-3 mb-2" />
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">
            {completedTasks} of {totalTasks} tasks completed
          </span>
          <span className="text-sm font-medium">{completionPercentage}%</span>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Tasks</h3>
        <Button 
          onClick={() => setIsAddingTask(!isAddingTask)} 
          variant={isAddingTask ? "outline" : "default"}
          size="sm"
        >
          {isAddingTask ? "Cancel" : <><PlusCircle className="w-4 h-4 mr-2" /> Add Task</>}
        </Button>
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <Card className="p-4">
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <Label htmlFor="childSelect">Assign to</Label>
              <Select 
                value={newTask.childId} 
                onValueChange={(value) => setNewTask({...newTask, childId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="e.g., Complete Module 1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Provide details about this task"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input 
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddingTask(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addTaskMutation.isPending}>
                {addTaskMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Task List */}
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map(task => {
            const assignedChild = children.find(child => child.id === task.childId);
            
            return (
              <Card key={task.id} className={`p-4 transition-colors ${
                task.status === "COMPLETED" ? "bg-green-50" : ""
              }`}>
                <div className="flex justify-between">
                  <div className="flex-grow">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full mt-0.5"
                        onClick={() => handleToggleTaskStatus(task)}
                      >
                        {task.status === "COMPLETED" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500" />
                        )}
                      </Button>
                      
                      <div>
                        <h4 className={`font-medium text-base ${
                          task.status === "COMPLETED" ? "line-through text-gray-500" : ""
                        }`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {assignedChild && (
                            <Badge variant="outline" className="text-xs bg-blue-50">
                              Assigned to: {assignedChild.name}
                            </Badge>
                          )}
                          
                          {task.dueDate && (
                            <Badge variant="outline" className="text-xs bg-amber-50 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                          
                          <Badge variant={task.status === "COMPLETED" ? "default" : "outline"} 
                            className={`text-xs ${task.status === "COMPLETED" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}`}
                          >
                            {task.status === "COMPLETED" ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> Completed</>
                            ) : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 text-center text-gray-500">
          <div className="mb-3">No tasks created yet</div>
          <Button onClick={() => setIsAddingTask(true)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Your First Task
          </Button>
        </Card>
      )}
    </div>
  );
} 