import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  completed: boolean
  progress: number
}

interface ParentAchievementsProps {
  achievements: Achievement[]
}

export default function ParentAchievements({ achievements }: ParentAchievementsProps) {
  // Calculate overall achievement progress
  const completedCount = achievements.filter((a) => a.completed).length
  const totalCount = achievements.length
  const overallProgress = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="space-y-6">
      {/* Overall Achievement Progress */}
      <div className="p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Achievement Progress</h3>
        <Progress value={overallProgress} className="h-3 mb-2" />
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} achievements completed
          </span>
          <span className="text-sm font-medium">{overallProgress}%</span>
        </div>
      </div>

      {/* Achievement Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`p-4 relative overflow-hidden ${
              achievement.completed ? "bg-gradient-to-br from-amber-50 to-amber-100" : ""
            }`}
          >
            {achievement.completed && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle className="w-3 h-3 mr-1" /> Completed
                </Badge>
              </div>
            )}

            <div className="flex items-center mb-3">
              <div className="text-3xl mr-3">{achievement.icon}</div>
              <div>
                <h4 className="font-medium">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            </div>

            <Progress value={achievement.progress} className="h-2" />
            <div className="flex justify-end mt-1">
              <span className="text-xs font-medium">{achievement.progress}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
