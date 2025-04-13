"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react"

interface LinkChildFormProps {
  onLinkChild: (childId: string, relation: string) => Promise<{ success: boolean; message?: string }>
  hasLinkedChild: boolean
}

export default function LinkChildForm({ onLinkChild, hasLinkedChild }: LinkChildFormProps) {
  const [childEmail, setChildEmail] = useState("")
  const [relation, setRelation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hasLinkedChild) {
      toast({
        title: "Already linked",
        description: "You can only link one child to your account",
        variant: "destructive",
      })
      return
    }

    if (!childEmail || !relation) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(childEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const result = await onLinkChild(childEmail, relation)
      setResult(result)

      if (result.success) {
        toast({
          title: "Child linked successfully",
          description: "You can now assign modules and track progress",
        })
        setChildEmail("")
        setRelation("")
      } else {
        toast({
          title: "Failed to link child",
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

  if (hasLinkedChild) {
    return (
      <Alert className="p-3 sm:p-4">
        <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <AlertTitle className="text-sm sm:text-base">Already linked</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm">
          You can only link one child to your account. To link a different child, please contact support.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {result && (
        <Alert variant={result.success ? "default" : "destructive"} className="p-3 sm:p-4">
          {result.success ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          <AlertTitle className="text-sm sm:text-base">{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            {result.success
              ? "Child has been successfully linked to your account"
              : result.message || "Failed to link child. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 p-3 sm:p-4">
        <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <AlertTitle className="text-sm sm:text-base">How to link your child</AlertTitle>
        <AlertDescription className="text-xs mt-1.5 sm:mt-2">
          <ol className="list-decimal pl-3 sm:pl-4 space-y-0.5 sm:space-y-1">
            <li>Have your child create an account using the signup page</li>
            <li>Ask them for the email address they used to register</li>
            <li>Enter that email address below to connect their account</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="childEmail" className="text-sm">Child's Email Address</Label>
        <Input
          id="childEmail"
          type="email"
          placeholder="Enter your child's email address"
          value={childEmail}
          onChange={(e) => setChildEmail(e.target.value)}
          disabled={isLoading}
          className="h-8 sm:h-10 text-xs sm:text-sm"
        />
        <p className="text-xs text-muted-foreground">
          This is the email your child used to create their Piggywise account
        </p>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="relation" className="text-sm">Your Relation to Child</Label>
        <Select value={relation} onValueChange={setRelation} disabled={isLoading}>
          <SelectTrigger id="relation" className="h-8 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="Select your relation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MOM" className="text-xs sm:text-sm">Mom</SelectItem>
            <SelectItem value="DAD" className="text-xs sm:text-sm">Dad</SelectItem>
            <SelectItem value="GRANDPARENT" className="text-xs sm:text-sm">Grandparent</SelectItem>
            <SelectItem value="GUARDIAN" className="text-xs sm:text-sm">Guardian</SelectItem>
            <SelectItem value="OTHER" className="text-xs sm:text-sm">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full h-8 sm:h-10 text-xs sm:text-sm mt-2 sm:mt-4" disabled={isLoading}>
        {isLoading ? "Linking..." : "Link Child"}
      </Button>
    </form>
  )
}
