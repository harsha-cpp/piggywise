"use client"

import { useEffect, useState } from "react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, Award, Clock } from "lucide-react"
import Link from "next/link"

interface Module {
  id: string
  title: string
  description: string
  completedLessons: number
  totalLessons: number
  thumbnail: string
  lessons: {
    id: string
    title: string
    isCompleted: boolean
    duration: string
  }[]
}

interface ModuleStats {
  totalModules: number
  completedModules: number
  totalLessons: number
  completedLessons: number
  overallProgress: number
}

export function ModuleProgress() {
  const [modules, setModules] = useState<Module[]>([])
  const [stats, setStats] = useState<ModuleStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch("/api/modules");
        if (response.ok) {
          const data = await response.json();
          setModules(data.modules);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="w-20 h-20">
                <CircularProgressbar
                  value={stats?.overallProgress || 0}
                  text={`${stats?.overallProgress || 0}%`}
                  styles={buildStyles({
                    textSize: '1.5rem',
                    pathColor: `rgba(62, 152, 199, ${(stats?.overallProgress || 0) / 100})`,
                    textColor: '#3e98c7',
                    trailColor: '#d6d6d6',
                  })}
                />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats?.overallProgress || 0}%</p>
                <p className="text-xs text-gray-500">completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Modules Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats?.completedModules || 0}/{stats?.totalModules || 0}</p>
                <p className="text-xs text-gray-500">modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lessons Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats?.completedLessons || 0}/{stats?.totalLessons || 0}</p>
                <p className="text-xs text-gray-500">lessons</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Module Progress</h2>
      
      <div className="space-y-4">
        {modules.map((module) => (
          <Link href={`/dashboard/child/modules/${module.id}`} key={module.id}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      {module.thumbnail ? (
                        <img src={module.thumbnail} alt={module.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="bg-blue-100 w-full h-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{module.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{module.title}</h3>
                      <div className="mt-1 flex items-center">
                        <Progress 
                          value={(module.completedLessons / module.totalLessons) * 100} 
                          className="h-2 w-32"
                        />
                        <span className="ml-2 text-xs text-gray-500">
                          {module.completedLessons}/{module.totalLessons} lessons
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {modules.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No modules available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 