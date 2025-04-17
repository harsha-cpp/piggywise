'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Award, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type ModuleProgress = {
  moduleId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completedLessons: number;
  module: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    thumbnailUrl?: string;
    category: string;
  };
};

export default function ModuleProgress() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchModuleProgress() {
      try {
        setLoading(true);
        const res = await fetch('/api/child/module-progress');
        
        if (!res.ok) {
          throw new Error('Failed to fetch module progress');
        }
        
        const data = await res.json();
        console.log('Module progress data:', data);
        setProgress(data.progress || []);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError('Could not load your progress. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchModuleProgress();
  }, []);

  function getStatusColor(status: string) {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  }

  function navigateToModule(moduleId: string) {
    router.push(`/dashboard/child/modules/${moduleId}`);
  }

  if (loading) {
    return (
      <div className="w-full p-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full border border-gray-200 animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort modules: In Progress first, then Not Started, then Completed
  const sortedProgress = [...progress].sort((a, b) => {
    const order = { 'IN_PROGRESS': 0, 'NOT_STARTED': 1, 'COMPLETED': 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
        My Learning Journey
      </h2>
      
      {sortedProgress.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">No modules assigned yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedProgress.map((item) => (
            <Card 
              key={item.moduleId} 
              className="w-full border border-gray-200 hover:border-blue-300 transition-all"
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row w-full">
                  <div className="w-full sm:w-1/4 h-32 sm:h-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20" />
                    {(item.module.imageUrl || item.module.thumbnailUrl) ? (
                      <Image
                        src={item.module.imageUrl || item.module.thumbnailUrl || '/placeholder.svg'}
                        alt={item.module.title}
                        width={300}
                        height={200}
                        className="object-cover h-full w-full rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-t-lg sm:rounded-l-lg sm:rounded-t-none">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <Badge 
                      className={`absolute top-2 right-2 ${getStatusColor(item.status)} text-white`}
                    >
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                  
                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{item.module.title}</h3>
                        <Badge variant="outline" className="ml-2">
                          {item.module.category}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{item.module.description}</p>
                    </div>
                    
                    <div className="mt-auto">
                      {item.status === 'COMPLETED' ? (
                        <div className="flex items-center text-green-600">
                          <Award className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">Complete!</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span>Progress</span>
                            <span>{Math.round((item.completedLessons / 5) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(item.completedLessons / 5) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => navigateToModule(item.moduleId)}
                        variant="ghost" 
                        className="mt-4 w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        {item.status === 'NOT_STARTED' ? 'Start Learning' : 'Continue Learning'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 