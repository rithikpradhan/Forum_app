// src/app/create/page.tsx
// Page where users create new threads

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PenSquare, CheckCircle2, Image as ImageIcon, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { create } from "domain";

type Thread = {
  id: number;
  title: string;
  content: string;
  avatar?: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  createdAt: number;
  image?: string;
};

export default function CreateThreadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Discussion",
  });

  // Available categories with descriptions
  const categories = [
    { value: "Discussion", description: "General discussions and debates" },
    { value: "Question", description: "Ask the community for help" },
    { value: "Tutorial", description: "Share learning resources" },
    { value: "Showcase", description: "Show off your projects" },
    { value: "Announcement", description: "Important updates" },
  ];

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay (in real app, this would be an API call)
    setTimeout(() => {
      // Get existing threads
      const storedThreads = localStorage.getItem("threads");
      const threads: Thread[] = storedThreads ? JSON.parse(storedThreads) : [];

      // Create new thread object
      const newThread: Thread = {
        id: threads.length + 1,
        title: formData.title,
        content: formData.content,
        author: user!.name,
        avatar: user!.avatar,
        category: formData.category,
        replies: 0,
        views: 0,
        createdAt: Date.now(),
        image: imagePreview || undefined,
      };

      // Add to threads array
      threads.unshift(newThread); // Add to beginning

      // Save back to localStorage
      localStorage.setItem("threads", JSON.stringify(threads));

      // Show success message
      setIsSubmitting(false);
      setShowSuccess(true);

      // Reset form
      setFormData({
        title: "",
        content: "",
        category: "Discussion",
      });
      setImagePreview(null);

      // Redirect to dashboard after 2 seconds

      setTimeout(() => {
        router.push("/home");
      }, 2000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <PageTransition>
          <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                <PenSquare className="mr-2 h-6 w-6" />
                Create New Thread
              </h1>
              <p className="text-gray-600 text-lg">
                Share your thoughts, questions, or ideas with the community
              </p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <Card className="border-green-500 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 text-green-700">
                    <CheckCircle2 className="h-6 w-6" />
                    <div>
                      <p className="font-semibold">
                        Thread created successfully!
                      </p>
                      <p className="text-sm">Redirecting to your Home...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create Thread Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Thread Details</CardTitle>
                <CardDescription>
                  Fill in the information below to create your thread
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Thread Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      required
                      placeholder="Enter a clear and descriptive title..."
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className={`"border-slate-700 text-base sm:text-lg`}
                    />
                    <p className="text-sm text-gray-500">
                      A good title helps others understand your topic quickly
                    </p>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, category: cat.value })
                          }
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            formData.category === cat.value
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{cat.value}</span>
                            {formData.category === cat.value && (
                              <CheckCircle2 className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {cat.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      required
                      placeholder="Share your thoughts, provide context, ask your question..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="min-h-[160px] sm:min-h-[200px] text-base"
                    />
                    <p className="text-sm text-gray-500">
                      Be detailed and specific. The more context you provide,
                      the better responses youll get.
                    </p>
                  </div>

                  {/* Preview Section */}
                  {(formData.title || formData.content) && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <Card className="bg-slate-50">
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <CardTitle className="text-lg">
                              {formData.title || "Your title here..."}
                            </CardTitle>
                            <Badge className="w-fit">{formData.category}</Badge>
                          </div>
                          <CardDescription>
                            by {user?.name} • Just now
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">
                            {formData.content ||
                              "Your content will appear here..."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className=" bg-indigo-500 hover:bg-indigo-600 w-full sm:flex-1"
                    >
                      {isSubmitting ? "Creating Thread..." : "Publish Thread"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => router.push("/home")}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className=" border-t-2 bg-linear-to-br from-blue-50 to-purple-50 border-blue-200 shadow-sm ">
              <CardHeader>
                <CardTitle className="text-lg">
                  💡 Tips for Creating Great Threads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm sm:text-base">
                <p>
                  • <strong>Be specific:</strong> Clear titles get more
                  engagement
                </p>
                <p>
                  • <strong>Provide context:</strong> Explain your situation or
                  question in detail
                </p>
                <p>
                  • <strong>Choose the right category:</strong> Helps others
                  find your thread
                </p>
                <p>
                  • <strong>Be respectful:</strong> Foster positive community
                  discussions
                </p>
                <p>
                  • <strong>Proofread:</strong> Check for typos and clarity
                  before posting
                </p>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
