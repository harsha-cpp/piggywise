"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlignLeft, Award, HelpCircle, GraduationCap } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Child {
  id: string
  name: string
}

interface Module {
  id: string
  name: string
  description: string
  difficulty?: string
  estimatedTime?: string
  topics?: string[]
}

interface AssignModuleFormProps {
  children: Child[]
  modules: Module[]
  onAssign: (childId: string, moduleId: string) => Promise<{ success: boolean; message?: string }>
  selectedChildId?: string
}

export default function AssignModuleForm({ children, modules, onAssign, selectedChildId }: AssignModuleFormProps) {
  const [selectedModuleId, setSelectedModuleId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [noteToChild, setNoteToChild] = useState("")
  const { toast } = useToast()

  const selectedModule = modules.find((m) => m.id === selectedModuleId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedChildId || !selectedModuleId) {
      toast({
        title: "Missing information",
        description: "Please select a module",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setSuccess(false)

    try {
      const result = await onAssign(selectedChildId, selectedModuleId)

      if (result.success) {
        setSuccess(true)
        toast({
          title: "Module assigned successfully",
          description: `The module has been assigned to ${children.find((c) => c.id === selectedChildId)?.name}`,
        })
        // Reset form
        setSelectedModuleId("")
        setNoteToChild("")
      } else {
        toast({
          title: "Failed to assign module",
          description: result.message || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {success && (
        <Alert className="mb-3 sm:mb-4 bg-green-50 border-green-200 p-3 sm:p-4">
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
          <AlertTitle className="text-green-800 text-sm sm:text-base">Success</AlertTitle>
          <AlertDescription className="text-green-700 text-xs sm:text-sm">
            Module has been successfully assigned. Your child will now see this in their dashboard.
          </AlertDescription>
        </Alert>
      )}

      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 mb-3 sm:mb-4 p-3 sm:p-4">
        <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <AlertTitle className="text-sm sm:text-base">How to assign modules</AlertTitle>
        <AlertDescription className="text-xs mt-1 sm:mt-2">
          Select an age-appropriate learning module from the dropdown below. After assignment, the module will appear in your child's dashboard for them to complete.
        </AlertDescription>
      </Alert>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="module" className="flex items-center text-sm">
          <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
          Select Learning Module
        </Label>
        <Select value={selectedModuleId} onValueChange={setSelectedModuleId} disabled={isLoading}>
          <SelectTrigger id="module" className="w-full h-8 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="Choose a learning module" />
          </SelectTrigger>
          <SelectContent>
            {modules.length === 0 ? (
              <div className="p-2 text-center text-xs sm:text-sm text-muted-foreground">
                No modules available
              </div>
            ) : (
              modules.map((module) => (
                <SelectItem key={module.id} value={module.id} className="text-xs sm:text-sm">
                  {module.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedModule && (
        <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-medium text-sm sm:text-base flex items-center">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-amber-500" />
              {selectedModule.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 sm:mt-2">{selectedModule.description}</p>
            
            {(selectedModule.difficulty || selectedModule.estimatedTime) && (
              <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3">
                {selectedModule.difficulty && (
                  <div className="text-xs">
                    <span className="font-medium block mb-0.5">Difficulty</span>
                    <span className="text-slate-600">{selectedModule.difficulty}</span>
                  </div>
                )}
                {selectedModule.estimatedTime && (
                  <div className="text-xs">
                    <span className="font-medium block mb-0.5">Estimated Time</span>
                    <span className="text-slate-600">{selectedModule.estimatedTime}</span>
                  </div>
                )}
              </div>
            )}
            
            {selectedModule.topics && selectedModule.topics.length > 0 && (
              <div className="mt-2 sm:mt-3">
                <span className="text-xs font-medium block mb-0.5 sm:mb-1">Topics Covered</span>
                <div className="flex flex-wrap gap-1">
                  {selectedModule.topics.map((topic, index) => (
                    <span key={index} className="text-xs bg-slate-200 px-1.5 sm:px-2 py-0.5 rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="note" className="flex items-center text-xs sm:text-sm">
              <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
              Add a Note (Optional)
            </Label>
            <Textarea 
              id="note" 
              placeholder="Add an encouraging note for your child..."
              className="h-16 sm:h-20 resize-none text-xs sm:text-sm p-2 sm:p-3"
              value={noteToChild}
              onChange={(e) => setNoteToChild(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your child will see this note when they view the module
            </p>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full h-8 sm:h-10 text-xs sm:text-sm mt-2 sm:mt-4" 
        disabled={isLoading || !selectedModuleId}
      >
        {isLoading ? "Assigning..." : "Assign Module"}
      </Button>
    </form>
  )
}
