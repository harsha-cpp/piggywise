import { Sparkles, Lightbulb, BrainCircuit, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ModuleCard } from "@/components/modules/module-card"
import { useQuery } from "@tanstack/react-query"

interface Module {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  totalDuration: string
  category: string
  difficulty: string
  isPublished: boolean
  createdAt: string
  creator: {
    id: string
    name: string
    email: string
  }
  contents: Array<{
    id: string
    title: string
    description: string
    videoUrl: string
    duration: string
    order: number
  }>
}

export default function ModuleStudio() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { data: modules, isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: ["modules"],
    queryFn: async () => {
      const response = await fetch("/api/studio/modules")
      if (!response.ok) {
        throw new Error("Failed to fetch modules")
      }
      const data = await response.json()
      console.log("Studio modules API response:", data)
      
      // Ensure we have an array of modules
      if (!data || !data.modules || !Array.isArray(data.modules)) {
        console.warn("Invalid modules data:", data)
        return []
      }
      
      return data.modules
    },
  })

  // Ensure modulesList is always an array
  const modulesList = Array.isArray(modules) ? modules : []
  
  // Debug logging
  console.log("ModuleStudio - modules:", modules)
  console.log("ModuleStudio - modulesList:", modulesList)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                Module Studio <Sparkles className="ml-2 h-5 w-5 text-amber-500" />
              </CardTitle>
              <CardDescription>Create custom learning modules for your child</CardDescription>
            </div>
            <Button 
              onClick={() => router.push("/studio/modules/create")}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingModules ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : !Array.isArray(modulesList) || modulesList.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="mb-6 rounded-full bg-purple-100 p-6 inline-block">
                  <BrainCircuit className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold">Create Your First Module</h3>
                <p className="mb-6 max-w-md mx-auto text-muted-foreground">
                  Start creating personalized learning modules for your child. Click the "Create Module" button to begin.
                </p>
              </div>
            ) : (
              modulesList.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onEdit={() => router.push(`/studio/modules/${module.id}/edit`)}
                  showCreator
                />
              ))
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mt-12">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h4 className="mb-2 text-center text-lg font-medium">Personalized Learning</h4>
                <p className="text-center text-sm text-muted-foreground">
                  Create modules that adapt to your child's learning style, interests, and pace.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-green-100 p-2">
                    <Sparkles className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h4 className="mb-2 text-center text-lg font-medium">AI-Generated Content</h4>
                <p className="text-center text-sm text-muted-foreground">
                  Let our AI generate engaging educational content based on your specifications.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
