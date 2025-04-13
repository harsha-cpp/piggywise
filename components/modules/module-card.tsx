import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Clock, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

interface ModuleCardProps {
  module: Module
  onEdit?: () => void
  showCreator?: boolean
}

export function ModuleCard({ module, onEdit, showCreator }: ModuleCardProps) {
  return (
    <Card className="overflow-hidden">
      {module.thumbnailUrl && (
        <div className="relative h-48 w-full">
          <img
            src={module.thumbnailUrl}
            alt={module.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-2">{module.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {module.description}
            </CardDescription>
          </div>
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{module.category}</Badge>
          <Badge variant="secondary">{module.difficulty}</Badge>
          {!module.isPublished && (
            <Badge variant="destructive">Draft</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {module.totalDuration}
          </div>
          <div className="flex items-center">
            <BookOpen className="mr-1 h-4 w-4" />
            {module.contents.length} {module.contents.length === 1 ? "lesson" : "lessons"}
          </div>
        </div>
        {showCreator && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
              {module.creator.name?.[0] || module.creator.email[0]}
            </div>
            <span>{module.creator.name || module.creator.email}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(module.createdAt), { addSuffix: true })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 