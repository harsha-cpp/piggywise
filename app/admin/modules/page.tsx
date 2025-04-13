"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'

interface Module {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  isPublished: boolean
  createdAt: string
  contents: {
    id: string
    title: string
  }[]
}

export default function ModuleList() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/admin/modules')
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
        <h1 className="text-2xl font-bold">Learning Modules</h1>
        <button
          onClick={() => router.push('/admin/modules/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
            flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Module
        </button>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-white p-6 rounded-lg shadow-sm border hover:border-blue-200 cursor-pointer"
            onClick={() => router.push(`/admin/modules/${module.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
                <p className="text-gray-600 mb-4">{module.description}</p>
                
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded">
                    {module.category}
                  </span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 text-sm rounded">
                    {module.difficulty}
                  </span>
                  <span className={`px-2 py-1 text-sm rounded ${
                    module.isPublished 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {module.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  <p>{module.contents.length} Lessons</p>
                  <p>Created: {new Date(module.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No modules created yet</p>
            <button
              onClick={() => router.push('/admin/modules/create')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first module
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 