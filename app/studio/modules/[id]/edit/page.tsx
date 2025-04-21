"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function EditModulePage() {
  const params = useParams();
  const moduleId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [category, setCategory] = useState("GENERAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch module data
  const { data: module, isLoading } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      const response = await fetch(`/api/modules/${moduleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch module details");
      }
      return response.json();
    },
  });

  // Update form when module data is loaded
  useEffect(() => {
    if (module) {
      setTitle(module.title || "");
      setDescription(module.description || "");
      setTotalDuration(module.totalDuration || "");
      setDifficulty(module.difficulty || "BEGINNER");
      setCategory(module.category || "GENERAL");
    }
  }, [module]);

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update module");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module", moduleId] });
      queryClient.invalidateQueries({ queryKey: ["studio-modules"] });
      toast({
        title: "Module updated",
        description: "Your module has been updated successfully",
      });
      router.push("/studio/modules");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update module",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateModuleMutation.mutateAsync({
        title,
        description,
        totalDuration,
        difficulty,
        category,
      });
    } catch (error) {
      console.error("Error updating module:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
          <Card>
            <CardHeader>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/studio/modules" 
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Modules
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Edit Module</CardTitle>
            <CardDescription>
              Update your module details. Changes will be reflected immediately.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Module Title</Label>
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
                  placeholder="Describe what this module teaches"
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Total Duration</Label>
                <Input
                  id="duration"
                  value={totalDuration}
                  onChange={(e) => setTotalDuration(e.target.value)}
                  placeholder="e.g. 30 minutes"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="MATH">Math</SelectItem>
                    <SelectItem value="SCIENCE">Science</SelectItem>
                    <SelectItem value="READING">Reading</SelectItem>
                    <SelectItem value="WRITING">Writing</SelectItem>
                    <SelectItem value="SOCIAL_STUDIES">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/studio/modules")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 