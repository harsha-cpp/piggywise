"use client"

import { useState } from "react"
import { Eye, PlusCircle, Pencil, Unlink, BookOpen, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Child {
  id: string
  name: string
  age: number
  relation: string
  avatar: string
}

interface ChildrenListProps {
  children: Child[]
  onViewProgress: (childId: string) => void
  hasLinkedChild: boolean
  onUnlinkChild?: (childId: string) => Promise<{ success: boolean; message?: string }>
  onUpdateRelation?: (childId: string, relation: string) => Promise<{ success: boolean; message?: string }>
}

export default function ChildrenList({
  children,
  onViewProgress,
  hasLinkedChild,
  onUnlinkChild,
  onUpdateRelation,
}: ChildrenListProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [newRelation, setNewRelation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleEditRelation = (child: Child) => {
    setSelectedChild(child)
    setNewRelation(child.relation)
    setShowEditDialog(true)
  }

  const handleUnlinkChild = (child: Child) => {
    setSelectedChild(child)
    setShowUnlinkDialog(true)
  }

  const confirmUpdateRelation = async () => {
    if (!selectedChild || !newRelation || !onUpdateRelation) return

    setIsLoading(true)
    try {
      const result = await onUpdateRelation(selectedChild.id, newRelation)
      if (result.success) {
        toast({
          title: "Relation updated",
          description: "Your relation to the child has been updated successfully",
        })
        setShowEditDialog(false)
      } else {
        toast({
          title: "Update failed",
          description: result.message || "Failed to update relation",
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

  const confirmUnlinkChild = async () => {
    if (!selectedChild || !onUnlinkChild) return

    setIsLoading(true)
    try {
      const result = await onUnlinkChild(selectedChild.id)
      if (result.success) {
        toast({
          title: "Child unlinked",
          description: "The child has been unlinked from your account",
        })
        setShowUnlinkDialog(false)
      } else {
        toast({
          title: "Unlink failed",
          description: result.message || "Failed to unlink child",
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

  if (!hasLinkedChild) {
    return (
      <Card className="col-span-full">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>My Child</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-purple-100 flex items-center justify-center">
            <PlusCircle className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
          </div>
          <h3 className="mb-2 text-base sm:text-lg font-medium">No Child Linked Yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Link your child's account to start their financial education journey. You'll be able to assign learning modules and track their progress.
          </p>
          <div className="mt-3 sm:mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 max-w-md w-full">
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg flex items-start">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-left text-xs">
                <span className="font-medium block mb-0.5 sm:mb-1">Assign Modules</span>
                <span>Customize their learning path with age-appropriate financial lessons</span>
              </div>
            </div>
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg flex items-start">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-left text-xs">
                <span className="font-medium block mb-0.5 sm:mb-1">Track Progress</span>
                <span>Monitor their learning journey and celebrate their achievements</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="col-span-full">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>My Child</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            {children.map((child) => (
              <div key={child.id} className="bg-slate-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage src={child.avatar} alt={child.name} />
                      <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-base sm:text-lg">{child.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0 sm:py-0.5">{child.relation}</Badge>
                        <span className="text-xs text-muted-foreground">Age: {child.age}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 sm:mt-4">
                  <Button 
                    className="w-full flex items-center justify-center py-1.5 sm:py-2 h-auto" 
                    onClick={() => onViewProgress(child.id)}
                  >
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="text-xs sm:text-sm">View Progress</span>
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleEditRelation(child)} 
                      className="flex-1 h-8 sm:h-10" 
                      title="Edit Relation"
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="outline" 
                      size="icon"
                      className="flex-1 h-8 sm:h-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleUnlinkChild(child)}
                      title="Unlink Child"
                    >
                      <Unlink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Relation Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px] p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle>Edit Relation</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Update your relation to {selectedChild?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-2 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="relation" className="text-sm">Your Relation</Label>
              <Select value={newRelation} onValueChange={setNewRelation} disabled={isLoading}>
                <SelectTrigger id="relation" className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Select your relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOM">Mom</SelectItem>
                  <SelectItem value="DAD">Dad</SelectItem>
                  <SelectItem value="GRANDPARENT">Grandparent</SelectItem>
                  <SelectItem value="GUARDIAN">Guardian</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isLoading} className="h-8 sm:h-10 text-xs sm:text-sm">
              Cancel
            </Button>
            <Button onClick={confirmUpdateRelation} disabled={isLoading || !newRelation} className="h-8 sm:h-10 text-xs sm:text-sm">
              {isLoading ? "Updating..." : "Update Relation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Child Dialog */}
      <Dialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <DialogContent className="sm:max-w-[425px] p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle>Unlink Child</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to unlink {selectedChild?.name} from your account?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 sm:py-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              This action will remove the child from your account. You will no longer be able to track their progress or
              assign modules.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowUnlinkDialog(false)} disabled={isLoading} className="h-8 sm:h-10 text-xs sm:text-sm">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmUnlinkChild} disabled={isLoading} className="h-8 sm:h-10 text-xs sm:text-sm">
              {isLoading ? "Unlinking..." : "Unlink Child"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
