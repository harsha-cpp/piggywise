"use client"

import { useState } from "react"
import { Search, Clock, User, Award, Star, BookOpen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { setActiveTab } from "@/lib/features/uiSlice"
import { useAppDispatch } from "@/lib/hooks"
import { useRouter } from "next/navigation"

interface Module {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  totalDuration: string;
  category: string;
  difficulty: string;
  instructor?: string;
  isPublished: boolean;
  createdAt: string;
  rating?: number;
  keyLearnings?: string[];
  creator: {
    name: string;
  };
  contents: Array<{
    id: string;
    title: string;
    duration: string;
    order: number;
  }>;
}

// Add these props to the component definition
interface ModuleMarketplaceProps {
  modules: Module[]
  createdModules?: Module[]
  onAssignModule: (moduleId: string) => void
  hasLinkedChild: boolean
  setModuleToAssign: (moduleId: string | null) => void
  setShowAssignModal: (show: boolean) => void
}

// Update the component parameters
export default function ModuleMarketplace({
  modules,
  createdModules = [],
  onAssignModule,
  hasLinkedChild,
  setModuleToAssign,
  setShowAssignModal,
}: ModuleMarketplaceProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState<"marketplace" | "created">("marketplace")

  const filteredModules = (currentTab === "marketplace" ? modules : createdModules).filter(
    (module) =>
      module?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module?.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module?.creator?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewDetails = (module: Module) => {
    setSelectedModule(module)
    setIsDialogOpen(true)
  }

  // Update the handleAssign function to use the modal
  const handleAssign = (moduleId: string) => {
    if (hasLinkedChild) {
      // Instead of directly assigning, set the module and show the modal
      setModuleToAssign(moduleId)
      setShowAssignModal(true)
    } else {
      toast({
        title: "No child linked",
        description: "Please link a child to your account first",
        variant: "destructive",
      })
      dispatch(setActiveTab("children"))
    }
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <Card>
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg text-gray-900">Module Marketplace</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600">Browse and assign learning modules for your child</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={currentTab === "marketplace" ? "default" : "outline"}
                onClick={() => setCurrentTab("marketplace")}
                className="text-xs sm:text-sm h-8 sm:h-10"
              >
                Marketplace
              </Button>
              <Button 
                variant={currentTab === "created" ? "default" : "outline"}
                onClick={() => setCurrentTab("created")}
                className="text-xs sm:text-sm h-8 sm:h-10"
              >
                Your Modules
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-2 sm:left-3 top-2 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${currentTab === "marketplace" ? "marketplace" : "your"} modules...`}
              className="pl-8 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((module) => (
              <Card key={module.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={module.thumbnailUrl || "/placeholder.svg"}
                    alt={module.title}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                </div>
                <CardHeader className="p-3 sm:p-4">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm sm:text-lg text-gray-900">{module.title}</CardTitle>
                    <Badge variant="outline" className="text-xs px-1.5 py-0 sm:py-0.5 whitespace-nowrap text-gray-700">{module.difficulty}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1 text-gray-600">{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0 space-y-1 sm:space-y-2">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <Clock className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{module.totalDuration}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{module.instructor || "You"}</span>
                  </div>
                  {module.rating && (
                    <div className="flex items-center text-xs sm:text-sm">
                      <div className="flex items-center text-amber-500">
                        <Star className="mr-1 h-3 w-3 sm:h-4 sm:w-4 fill-current flex-shrink-0" />
                        <span>{module.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4" 
                    onClick={() => handleViewDetails(module)}
                  >
                    View Details
                  </Button>
                  <Button 
                    className="w-full text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4" 
                    onClick={() => handleAssign(module.id)} 
                    disabled={!hasLinkedChild}
                  >
                    Assign
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-6 sm:py-12">
              <BookOpen className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 opacity-20" />
              <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-medium text-gray-900">No modules found</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {currentTab === "marketplace" 
                  ? "Try adjusting your search query" 
                  : createdModules.length === 0 
                    ? "You haven't created any modules yet" 
                    : "Try adjusting your search query"
                }
              </p>
              {currentTab === "created" && createdModules.length === 0 && (
                <Button 
                  onClick={() => router.push("/studio/modules/create")}
                  className="mt-4 text-xs sm:text-sm h-8 sm:h-10"
                >
                  Create Your First Module
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Module Details Dialog */}
      {selectedModule && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-w-[90vw] p-4 sm:p-6">
            <DialogHeader className="space-y-1 sm:space-y-2">
              <DialogTitle className="text-base sm:text-lg">{selectedModule.title}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">{selectedModule.description}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
              <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                <img
                  src={selectedModule.thumbnailUrl || "/placeholder.svg"}
                  alt={selectedModule.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-medium flex items-center">
                    <Clock className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Duration
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedModule.totalDuration}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-medium flex items-center">
                    <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Instructor
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{selectedModule.instructor || "You"}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-medium flex items-center">
                    <Award className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Level
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedModule.difficulty}</p>
                </div>

                {selectedModule.rating && (
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-medium flex items-center">
                      <Star className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Rating
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{selectedModule.rating.toFixed(1)} / 5.0</p>
                  </div>
                )}
              </div>

              {selectedModule.keyLearnings && selectedModule.keyLearnings.length > 0 && (
                <div className="space-y-1 sm:space-y-2">
                  <h4 className="text-xs sm:text-sm font-medium">Key Learnings</h4>
                  <ul className="list-disc pl-4 sm:pl-5 text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1">
                    {selectedModule.keyLearnings.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                        <span className="text-xs sm:text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleAssign(selectedModule.id)} 
                disabled={!hasLinkedChild}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              >
                {hasLinkedChild ? "Assign to Child" : "Link a Child First"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
