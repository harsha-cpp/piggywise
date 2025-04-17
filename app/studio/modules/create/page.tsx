"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "lucide-react";

export default function CreateModule() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [contents, setContents] = useState([
    { 
      title: "", 
      description: "", 
      video: null as File | null,
      videoName: "" 
    }
  ]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newContents = [...contents];
      newContents[index] = { 
        ...newContents[index], 
        video: file,
        videoName: file.name 
      };
      setContents(newContents);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("difficulty", difficulty);
      
      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      // Add lesson content and videos
      contents.forEach((content, index) => {
        formData.append(`lessons[${index}][title]`, content.title);
        formData.append(`lessons[${index}][description]`, content.description);
        if (content.video) {
          formData.append(`lessons[${index}][video]`, content.video);
        }
      });

      const response = await fetch("/api/studio/modules", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create module");
      }

      toast({
        title: "Success",
        description: "Module created successfully",
      });

      router.push("/dashboard/parent");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create module",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (index: number, field: "title" | "description", value: string) => {
    const newContents = [...contents];
    newContents[index] = { ...newContents[index], [field]: value };
    setContents(newContents);
  };

  const addContent = () => {
    setContents([...contents, { title: "", description: "", video: null, videoName: "" }]);
  };

  const removeContent = (index: number) => {
    setContents(contents.filter((_, i) => i !== index));
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Module</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter module title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter module description"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Thumbnail</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-32 h-32 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                    {thumbnailPreview ? (
                      <img 
                        src={thumbnailPreview} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a thumbnail image for your module
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="INVESTING">Investing</SelectItem>
                      <SelectItem value="BUDGETING">Budgeting</SelectItem>
                      <SelectItem value="ENTREPRENEURSHIP">Entrepreneurship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Lessons</label>
                  <Button type="button" variant="outline" onClick={addContent}>
                    Add Lesson
                  </Button>
                </div>

                {contents.map((content, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Lesson {index + 1}</h4>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeContent(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <Input
                      value={content.title}
                      onChange={(e) => handleContentChange(index, "title", e.target.value)}
                      placeholder="Lesson title"
                      required
                    />

                    <Textarea
                      value={content.description}
                      onChange={(e) => handleContentChange(index, "description", e.target.value)}
                      placeholder="Lesson description"
                      required
                    />

                    <div>
                      <label className="text-sm font-medium block mb-1">Lesson Video</label>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoChange(index, e)}
                        required
                      />
                      {content.videoName && (
                        <p className="text-xs text-gray-500 mt-1">
                          Selected: {content.videoName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/parent")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Module"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 