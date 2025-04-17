import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/react';

export default function ChildDashboard() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Fetch child tasks
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['childTasks'],
    queryFn: async () => {
      const response = await fetch('/api/child/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      // Ensure parent dashboard is updated with the latest task data
      queryClient.setQueryData(['parentTasks'], data);
      return data;
    },
    enabled: !!session?.user,
    refetchInterval: 2000, // Poll every 2 seconds to keep in sync
    staleTime: 0, // Consider data always stale
    refetchOnWindowFocus: true,
  });

  // Handle task completion toggle
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }) => {
      // First try the toggle endpoint for backward compatibility
      try {
        const toggleResponse = await fetch(`/api/child/tasks/${taskId}/toggle`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed }),
        });
        
        if (toggleResponse.ok) {
          return toggleResponse.json();
        }
      } catch (error) {
        console.log("Toggle endpoint not available, trying PATCH endpoint instead");
      }
      
      // If toggle endpoint fails, use the PATCH endpoint
      const status = completed ? "COMPLETED" : "PENDING";
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
    onSuccess: (data) => {
      // Update both caches immediately
      const currentChildTasks = queryClient.getQueryData(['childTasks']) as { tasks?: any[] } || { tasks: [] };
      const currentParentTasks = queryClient.getQueryData(['parentTasks']) as { tasks?: any[] } || { tasks: [] };
      
      // Update both parent and child caches to ensure proper sync
      if (currentChildTasks && currentChildTasks.tasks) {
        queryClient.setQueryData(['childTasks'], currentChildTasks);
      }
      
      if (currentParentTasks && currentParentTasks.tasks) {
        queryClient.setQueryData(['parentTasks'], currentParentTasks);
      }
      
      // Invalidate and refetch both parent and child queries with a slight delay
      // to ensure the server has time to process the update
      setTimeout(() => {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['childTasks'] }),
          queryClient.invalidateQueries({ queryKey: ['parentTasks'] }),
          queryClient.refetchQueries({ queryKey: ['childTasks'] }),
          queryClient.refetchQueries({ queryKey: ['parentTasks'] })
        ]);
      }, 300);
    },
  });

  // Rest of the component...
} 