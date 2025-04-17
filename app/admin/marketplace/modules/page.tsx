"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Module {
  id: string
  title: string
  description: string
  category: string
  level: string
  instructor: string
  isPublished: boolean
  createdAt: string
  contents: {
    id: string
    title: string
  }[]
}

export default function MarketplaceModuleList() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/admin/marketplace/modules')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch modules')
      }

      setModules(data.modules)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Marketplace Modules</h1>
          <p className="text-gray-600 text-sm mt-1">Manage learning modules available to all parents</p>
        </div>
        <Button
          onClick={() => router.push('/admin/marketplace/modules/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Module
        </Button>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription className="mt-1">{module.description}</CardDescription>
                </div>
                <Badge variant={module.isPublished ? "default" : "secondary"}>
                  {module.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-blue-50">
                  {module.category}
                </Badge>
                <Badge variant="outline" className="bg-purple-50">
                  {module.level}
                </Badge>
                <Badge variant="outline" className="bg-amber-50">
                  {module.instructor}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                <p>{module.contents.length} Lessons</p>
                <p>Created: {new Date(module.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/marketplace/modules/${module.id}`)}
                className="w-full"
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}

        {modules.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No marketplace modules created yet</p>
            <Button
              onClick={() => router.push('/admin/marketplace/modules/create')}
              variant="outline"
            >
              Create your first module
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 