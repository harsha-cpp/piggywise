"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LessonForm {
  title: string
  description: string
  video: File | null
}

export default function CreateMarketplaceModule() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Module form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('SAVINGS')
  const [level, setLevel] = useState('BEGINNER')
  const [instructor, setInstructor] = useState('')
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
      if (!title || !description || !instructor || !lessons.length) {
        throw new Error('Please fill in all required fields')
      }

      // Check if all lessons have required fields
      const invalidLesson = lessons.find(lesson => !lesson.title || !lesson.video)
      if (invalidLesson) {
        throw new Error('Please fill in all lesson details and upload videos')
      }

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('level', level)
      formData.append('instructor', instructor)
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

      const response = await fetch('/api/admin/marketplace/modules', {
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
      setLevel('BEGINNER')
      setInstructor('')
      setThumbnail(null)
      setLessons([{ title: '', description: '', video: null }])

      // Redirect to module list after 2 seconds
      setTimeout(() => {
        router.push('/admin/marketplace/modules')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create Marketplace Module</h1>
          <p className="text-gray-600 text-sm mt-1">Create a new learning module that will be available to all parents</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Module Details */}
          <Card>
            <CardHeader>
              <CardTitle>Module Details</CardTitle>
              <CardDescription>Basic information about the learning module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter module title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter module description"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="SPENDING">Spending</SelectItem>
                      <SelectItem value="INVESTING">Investing</SelectItem>
                      <SelectItem value="ENTREPRENEURSHIP">Entrepreneurship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Enter instructor name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>Lessons</CardTitle>
              <CardDescription>Add video lessons for this module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lessons.map((lesson, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">Lesson {index + 1}</CardTitle>
                    {lessons.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLesson(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={lesson.title}
                        onChange={(e) => updateLesson(index, 'title', e.target.value)}
                        placeholder="Enter lesson title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={lesson.description}
                        onChange={(e) => updateLesson(index, 'description', e.target.value)}
                        placeholder="Enter lesson description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Video</Label>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => updateLesson(index, 'video', e.target.files?.[0] || null)}
                        className="cursor-pointer"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddLesson}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-600 border-green-200">
              <AlertDescription>Module created successfully! Redirecting...</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Module...
              </>
            ) : (
              'Create Module'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
} 