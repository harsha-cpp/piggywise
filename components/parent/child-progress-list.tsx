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
  moduleId: string
  moduleName: string
  status: string
  lastUpdated: string
  progress: number
}

interface ChildProgressListProps {
  progressData: ProgressItem[]
}

export default function ChildProgressList({ progressData }: ChildProgressListProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Validate and normalize the data
  const validProgressData = progressData?.filter(item => 
    item && typeof item === 'object' && item.moduleId && item.moduleName
  ) || [];

  if (!progressData || !Array.isArray(progressData) || validProgressData.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-purple-500" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-gray-900">No Modules Assigned</h3>
        <p className="text-sm text-gray-600">This child doesn't have any learning modules assigned yet</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
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
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "in_progress":
      case "in progress":
        return <Clock className="w-5 h-5 text-amber-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    
    switch (statusLower) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "in_progress":
      case "in progress":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">In Progress</Badge>
      default:
        return <Badge variant="outline">Not Started</Badge>
    }
  }

  // Format the status for display
  const formatStatus = (status: string): string => {
    if (!status) return "Not Started";
    
    switch(status.toLowerCase()) {
      case "completed": return "Completed";
      case "in_progress": return "In Progress";
      case "not_started": return "Not Started";
      default: return status;
    }
  };

  // Filter and sort the progress data
  let filteredData = [...validProgressData]

  if (statusFilter) {
    filteredData = filteredData.filter((item) => formatStatus(item.status) === statusFilter)
  }

  // Sort by progress
  filteredData.sort((a, b) => {
    return sortOrder === "desc" ? b.progress - a.progress : a.progress - b.progress
  })

  // Calculate overall progress
  const overallProgress = Math.round(validProgressData.reduce((sum, item) => sum + item.progress, 0) / validProgressData.length)

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
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
              <h3 className="font-medium text-gray-900">{item.moduleName}</h3>
            </div>
            {getStatusBadge(item.status)}
          </div>

          <div className="mb-2">
            <Progress value={item.progress} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-medium text-gray-900">{item.progress}%</span>
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
