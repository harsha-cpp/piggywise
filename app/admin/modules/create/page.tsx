"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Loader2 } from 'lucide-react'

interface LessonForm {
  title: string
  description: string
  video: File | null
}

export default function CreateModule() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Module form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('SAVINGS')
  const [difficulty, setDifficulty] = useState('BEGINNER')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  
  // Lessons state
  const [lessons, setLessons] = useState<LessonForm[]>([
    { title: '', description: '', video: null }
  ])

  const handleAddLesson = () => {
    setLessons([...lessons, { title: '', description: '', video: null }])
  }

  const handleRemoveLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index))
  }

  const updateLesson = (index: number, field: keyof LessonForm, value: any) => {
    const updatedLessons = [...lessons]
    updatedLessons[index] = { ...updatedLessons[index], [field]: value }
    setLessons(updatedLessons)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate form
      if (!title || !description || !lessons.length) {
        throw new Error('Please fill in all required fields')
      }

      // Check if all lessons have required fields
      const invalidLesson = lessons.find(lesson => !lesson.title || !lesson.description || !lesson.video)
      if (invalidLesson) {
        throw new Error('Please fill in all lesson details and upload videos')
      }

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('difficulty', difficulty)
      if (thumbnail) {
        formData.append('thumbnail', thumbnail)
      }

      // Add lesson data
      formData.append('contents', JSON.stringify(
        lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.description
        }))
      ))

      // Add videos
      lessons.forEach((lesson, index) => {
        if (lesson.video) {
          formData.append('videos', lesson.video)
        }
      })

      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create module')
      }

      setSuccess(true)
      // Reset form
      setTitle('')
      setDescription('')
      setCategory('SAVINGS')
      setDifficulty('BEGINNER')
      setThumbnail(null)
      setLessons([{ title: '', description: '', video: null }])

      // Redirect to module list after 2 seconds
      setTimeout(() => {
        router.push('/admin/modules')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Module</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Module Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Module Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="SAVINGS">Savings</option>
                  <option value="INVESTING">Investing</option>
                  <option value="BUDGETING">Budgeting</option>
                  <option value="ENTREPRENEURSHIP">Entrepreneurship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Thumbnail Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lessons</h2>
            <button
              type="button"
              onClick={handleAddLesson}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Lesson
            </button>
          </div>

          <div className="space-y-6">
            {lessons.map((lesson, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md relative">
                <div className="absolute right-2 top-2">
                  {lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Lesson {index + 1} Title
                    </label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(index, 'title', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Lesson Description
                    </label>
                    <textarea
                      value={lesson.description}
                      onChange={(e) => updateLesson(index, 'description', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Lesson Video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => updateLesson(index, 'video', e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      required={!lesson.video}
                    />
                    {lesson.video && (
                      <p className="mt-1 text-sm text-gray-500">
                        Selected: {lesson.video.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md
              hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed
              flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Module...
              </>
            ) : (
              'Create Module'
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 text-green-600 rounded-md">
            Module created successfully! Redirecting...
          </div>
        )}
      </form>
    </div>
  )
} 