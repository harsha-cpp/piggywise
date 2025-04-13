import Image from "next/image"
import { ChevronLeft, PlayCircle, Check, Lock } from "lucide-react"
import Link from "next/link"
import { ModuleViewer } from "@/components/module-viewer"
import { XpHandler } from "@/components/xp-handler"
import { getModuleById } from "@/lib/features/modules"

// Module and lesson interfaces
interface Lesson {
  id: string
  title: string
  duration: string
  videoUrl?: string
  isCompleted: boolean
}

interface Module {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  instructor?: string
  totalDuration?: string
  objectives?: string[]
  relatedModules?: string[]
  lessons: Lesson[]
  completedLessons: number
  totalLessons: number
}

export default async function ModulePage({ params }: { params: { id: string } }) {
  // Fetch module data from API
  const moduleId = params.id;
  
  // Mock function to fetch module data
  async function getModuleData(id: string): Promise<Module | null> {
    try {
      // Mock API response data
      const modules = [
        {
          id: "1",
          title: "Part 1",
          description: "Find hidden treasures and learn about saving",
          thumbnailUrl: "/placeholder.svg?height=200&width=200",
          instructor: "Ms. Money",
          totalDuration: "12 min",
          objectives: [
            "Understand the importance of saving money",
            "Learn how to identify small saving opportunities",
            "Create a basic saving plan"
          ],
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
          thumbnailUrl: "/placeholder.svg?height=200&width=200",
          instructor: "Mr. Budget",
          totalDuration: "14 min",
          objectives: [
            "Learn to make informed spending decisions",
            "Understand budget basics",
            "Prioritize needs vs wants"
          ],
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
          thumbnailUrl: "/placeholder.svg?height=200&width=200",
          instructor: "Dr. Market",
          totalDuration: "12 min",
          objectives: [
            "Understand how markets work",
            "Learn buying and selling basics",
            "Develop market awareness"
          ],
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
        }
      ];
      
      const foundModule = modules.find(m => m.id === id);
      return foundModule || null;
    } catch (error) {
      console.error("Error fetching module:", error);
      return null;
    }
  }
  
  const module = await getModuleData(moduleId);
  
  if (!module) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">Module not found</p>
          <Link href="/dashboard/child" className="mt-4 px-4 py-2 inline-block bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate progress
  const progressPercentage = Math.round((module.completedLessons / module.totalLessons) * 100);
  
  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-4">
        <Link 
          href="/dashboard/child"
          className="text-black flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </Link>
        
        {/* Module title and progress */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
          <div className="text-sm text-gray-600">
            <span className="font-bold">{progressPercentage}%</span> complete
          </div>
        </div>
        
        <div className="h-2 w-full bg-gray-200 rounded-full mb-6">
          <div 
            className="h-full bg-blue-600 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Pass the module data to a client component */}
        <ModuleViewer module={module} />
        <XpHandler />
      </div>
    </div>
  );
} 