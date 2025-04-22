"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProgressItem {
  id: string
  moduleId: string
  status: string
  completedLessons: number
  totalLessons: number
  lastUpdated: string | null
  completionPercentage: number
  isAssigned?: boolean
  module: {
    id: string
    title: string
    description: string
    thumbnailUrl?: string
    category: string
    difficulty: string
  }
}

interface ChildProgressListProps {
  progressData: ProgressItem[]
}

export default function ChildProgressList({ progressData }: ChildProgressListProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [assignedFilter, setAssignedFilter] = useState<boolean | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Validate and normalize the data
  const validProgressData = progressData?.filter(item => 
    item && typeof item === 'object' && item.moduleId && item.module?.title
  ) || [];

  if (!progressData || !Array.isArray(progressData) || validProgressData.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-purple-500" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-gray-900">No Modules Available</h3>
        <p className="text-sm text-gray-600">No modules have been created for this child yet</p>
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not started yet";
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return "Invalid date";
    }
  }

  const getStatusIcon = (status: string) => {
    switch (formatStatus(status).toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "in progress":
        return <Clock className="w-5 h-5 text-amber-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const formattedStatus = formatStatus(status).toLowerCase();
    
    switch (formattedStatus) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "in progress":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">In Progress</Badge>
      default:
        return <Badge variant="outline">Not Started</Badge>
    }
  }

  // Format the status for display
  const formatStatus = (status: string): string => {
    if (!status) return "Not Started";
    
    switch(status.toUpperCase()) {
      case "COMPLETED": return "Completed";
      case "IN_PROGRESS": return "In Progress";
      case "NOT_STARTED": return "Not Started";
      default: return status;
    }
  };

  // Filter and sort the progress data
  let filteredData = [...validProgressData]

  if (statusFilter) {
    filteredData = filteredData.filter((item) => formatStatus(item.status) === statusFilter)
  }
  
  if (assignedFilter !== null) {
    filteredData = filteredData.filter((item) => item.isAssigned === assignedFilter)
  }

  // Sort by progress
  filteredData.sort((a, b) => {
    return sortOrder === "desc" 
      ? b.completionPercentage - a.completionPercentage 
      : a.completionPercentage - b.completionPercentage
  })

  // Calculate overall progress
  const overallProgress = validProgressData.length > 0 
    ? Math.round(validProgressData.reduce((sum, item) => sum + item.completionPercentage, 0) / validProgressData.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="p-4">
        <h3 className="font-medium mb-2 text-gray-900">Overall Progress</h3>
        <Progress value={overallProgress} className="h-3" />
        <div className="flex justify-between mt-1">
          <span className="text-sm text-gray-600">Progress across all modules</span>
          <span className="text-sm font-medium text-gray-900">{overallProgress}%</span>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("In Progress")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Not Started")}>Not Started</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Assignment
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Assignment</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setAssignedFilter(null)}>All Modules</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssignedFilter(true)}>Assigned Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssignedFilter(false)}>Unassigned Only</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Highest Progress First</SelectItem>
            <SelectItem value="asc">Lowest Progress First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 bg-green-50">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900">Completed</span>
          </div>
          <p className="text-center text-xl font-bold text-gray-900">
            {validProgressData.filter((item) => formatStatus(item.status) === "Completed").length}
          </p>
        </Card>

        <Card className="p-3 bg-amber-50">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-900">In Progress</span>
          </div>
          <p className="text-center text-xl font-bold text-gray-900">
            {validProgressData.filter((item) => formatStatus(item.status) === "In Progress").length}
          </p>
        </Card>

        <Card className="p-3 bg-slate-50">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-gray-900">Not Started</span>
          </div>
          <p className="text-center text-xl font-bold text-gray-900">
            {validProgressData.filter((item) => formatStatus(item.status) === "Not Started").length}
          </p>
        </Card>
      </div>

      {/* Module progress cards */}
      {filteredData.map((item) => (
        <Card key={item.moduleId} className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(item.status)}
              <h3 className="font-medium text-gray-900">{item.module.title}</h3>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(item.status)}
              {item.isAssigned !== undefined && (
                item.isAssigned ? 
                <Badge className="bg-blue-100 text-blue-800">Assigned</Badge> : 
                <Badge variant="outline">Not Assigned</Badge>
              )}
            </div>
          </div>

          <div className="mb-2">
            <Progress value={item.completionPercentage} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600">
                {item.completedLessons} of {item.totalLessons} lessons completed
              </span>
              <span className="text-xs font-medium text-gray-900">{item.completionPercentage}%</span>
            </div>
          </div>

          <div className="text-xs text-gray-600">Last updated: {formatDate(item.lastUpdated)}</div>
        </Card>
      ))}

      {filteredData.length === 0 && (
        <div className="p-6 text-center text-gray-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No modules match the selected filters</p>
        </div>
      )}
    </div>
  )
}
