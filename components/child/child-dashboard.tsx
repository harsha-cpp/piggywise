import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession, signOut } from 'next-auth/react';
import { Home, CheckSquare, BarChart2, Headphones, Settings, LogOut, Menu, X } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';

interface ChildDashboardProps {
  initialTab?: string;
}

export default function ChildDashboard({ initialTab = 'home' }: ChildDashboardProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState(initialTab);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Update activePage when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActivePage(initialTab);
    }
  }, [initialTab]);

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

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const childNavItems = [
    { id: "home", label: "Home", icon: Home, color: "text-blue-600", path: "/dashboard/child" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, color: "text-green-600", path: "/dashboard/child/tasks" },
    { id: "progress", label: "Progress", icon: BarChart2, color: "text-indigo-600", path: "/dashboard/child/progress" },
    { id: "podcasts", label: "Podcasts", icon: Headphones, color: "text-purple-600", path: "/dashboard/child/podcasts" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-orange-600", path: "/dashboard/child/settings" },
  ];

  const handleTabChange = (itemId) => {
    setActivePage(itemId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard/child" className="flex items-center space-x-1">
                  <Image 
                    src="/peppapig.png" 
                    alt="Peppa Pig" 
                    width={36} 
                    height={36} 
                    className="object-contain w-9 h-9"
                  />
                  <span className="text-xl font-bold text-gray-900">Piggywise</span>
                </Link>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {childNavItems.map((item) => (
                  <Link 
                    key={item.id}
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      activePage === item.id 
                        ? `border-${item.color.split('-')[1]}-500 ${item.color}`
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <item.icon className="mr-1 h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Sign Out
              </button>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {childNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    activePage === item.id
                      ? `border-${item.color.split('-')[1]}-500 bg-${item.color.split('-')[1]}-50 ${item.color}`
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => {
                    handleTabChange(item.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.label}
                  </div>
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <div className="flex items-center">
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </div>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content with padding for top navbar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        {/* Your existing child dashboard content goes here */}
      </main>
    </div>
  );
} 