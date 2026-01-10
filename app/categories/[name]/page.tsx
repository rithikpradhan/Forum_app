// src/app/categories/[name]/page.tsx
// View all threads in a specific category with sorting

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Eye, Clock, Heart } from "lucide-react";

type Thread = {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  likes?: number;
  createdAt: string;
};

type SortOption = "recent" | "popular" | "mostReplies" | "mostViews";

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryName = params.name as string;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [sortedThreads, setSortedThreads] = useState<Thread[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [loading, setLoading] = useState(true);

  // Category info
  const categoryInfo: Record<
    string,
    { icon: string; color: string; description: string }
  > = {
    discussion: {
      icon: "💬",
      color: "bg-purple-500",
      description: "General discussions and debates",
    },
    question: {
      icon: "❓",
      color: "bg-green-500",
      description: "Ask the community for help",
    },
    tutorial: {
      icon: "📚",
      color: "bg-pink-500",
      description: "Share learning resources",
    },
    showcase: {
      icon: "🎨",
      color: "bg-orange-500",
      description: "Show off your projects",
    },
    announcement: {
      icon: "📢",
      color: "bg-blue-500",
      description: "Important updates",
    },
  };

  // Sort threads whenever sortBy or threads change

  const loadThreads = () => {
    const storedThreads = localStorage.getItem("threads");
    if (storedThreads) {
      const allThreads = JSON.parse(storedThreads);
      // Filter by category (case-insensitive)
      const categoryThreads = allThreads.filter(
        (t: Thread) => t.category.toLowerCase() === categoryName.toLowerCase()
      );
      setThreads(categoryThreads);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    loadThreads();
    setLoading(false);
  }, [router, categoryName]);

  const sortThreads = () => {
    const sorted = [...threads];

    switch (sortBy) {
      case "recent":
        // Most recent first (in real app, would sort by timestamp)
        sorted.reverse();
        break;

      case "popular":
        // Sort by likes
        sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;

      case "mostReplies":
        // Sort by reply count
        sorted.sort((a, b) => b.replies - a.replies);
        break;

      case "mostViews":
        // Sort by view count
        sorted.sort((a, b) => b.views - a.views);
        break;
    }

    setSortedThreads(sorted);
  };

  useEffect(() => {
    sortThreads();
  }, [sortBy, threads]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const category = categoryInfo[categoryName.toLowerCase()];
  const capitalizedName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageTransition>
          <Card className="text-center p-8">
            <CardContent>
              <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
              <Button onClick={() => router.push("/categories")}>
                Back to Categories
              </Button>
            </CardContent>
          </Card>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <PageTransition>
          <div className="max-w-8xl mx-auto p-8 space-y-8">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => router.push("/categories")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>

            {/* Category Header */}
            <Card className={`${category.color} text-white shadow-lg`}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">{category.icon}</div>
                  <div>
                    <CardTitle className="text-4xl mb-2">
                      {capitalizedName}
                    </CardTitle>
                    <p className="text-xl text-blue-100">
                      {category.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">{threads.length}</div>
                    <div className="text-sm">Threads</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {threads.reduce((sum, t) => sum + t.replies, 0)}
                    </div>
                    <div className="text-sm">Replies</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {threads.reduce((sum, t) => sum + t.views, 0)}
                    </div>
                    <div className="text-sm">Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sort Controls */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                All Threads ({sortedThreads.length})
              </h2>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="mostReplies">Most Replies</SelectItem>
                    <SelectItem value="mostViews">Most Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Threads List */}
            <div className="space-y-4">
              {sortedThreads.length > 0 ? (
                sortedThreads.map((thread) => (
                  <Card
                    key={thread.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/thread/${thread.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <Avatar className="mt-1">
                          <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white">
                            {getInitials(thread.author)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {thread.title}
                          </CardTitle>

                          <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600">
                            <span className="font-medium">{thread.author}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {thread.createdAt}
                            </span>
                            <span>•</span>
                            <span className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {thread.replies}
                            </span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {thread.views}
                            </span>
                            {thread.likes && thread.likes > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                                  {thread.likes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-gray-700 line-clamp-2">
                        {thread.content}
                      </p>
                    </CardContent>

                    <CardFooter>
                      <Button variant="outline" size="sm">
                        View Thread →
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No threads yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Be the first to start a discussion in this category!
                    </p>
                    <Button onClick={() => router.push("/create")}>
                      Create Thread
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
