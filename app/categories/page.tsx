// src/app/categories/page.tsx
// Browse threads by category

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";

import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, Layers, TrendingUp } from "lucide-react";

type Thread = {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  createdAt: string;
};

type CategoryStats = {
  name: string;
  description: string;
  icon: string;
  color: string;
  threadCount: number;
  totalReplies: number;
  totalViews: number;
};

export default function CategoriesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    // Load threads
    const storedThreads = localStorage.getItem("threads");
    if (storedThreads) {
      const allThreads = JSON.parse(storedThreads);
      setThreads(allThreads);
      calculateCategoryStats(allThreads);
    }

    setLoading(false);
  }, [router]);

  const calculateCategoryStats = (allThreads: Thread[]) => {
    const categoryData: Record<string, CategoryStats> = {
      Discussion: {
        name: "Discussion",
        description: "General discussions and debates",
        icon: "💬",
        color: "bg-purple-500",
        threadCount: 0,
        totalReplies: 0,
        totalViews: 0,
      },
      Question: {
        name: "Question",
        description: "Ask the community for help",
        icon: "❓",
        color: "bg-green-500",
        threadCount: 0,
        totalReplies: 0,
        totalViews: 0,
      },
      Tutorial: {
        name: "Tutorial",
        description: "Share learning resources and guides",
        icon: "📚",
        color: "bg-pink-500",
        threadCount: 0,
        totalReplies: 0,
        totalViews: 0,
      },
      Showcase: {
        name: "Showcase",
        description: "Show off your projects",
        icon: "🎨",
        color: "bg-orange-500",
        threadCount: 0,
        totalReplies: 0,
        totalViews: 0,
      },
      Announcement: {
        name: "Announcement",
        description: "Important updates and news",
        icon: "📢",
        color: "bg-blue-500",
        threadCount: 0,
        totalReplies: 0,
        totalViews: 0,
      },
    };

    // Calculate stats for each category
    allThreads.forEach((thread) => {
      const category = thread.category;
      if (categoryData[category]) {
        categoryData[category].threadCount++;
        categoryData[category].totalReplies += thread.replies;
        categoryData[category].totalViews += thread.views;
      }
    });

    setCategories(Object.values(categoryData));
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/categories/${categoryName.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 overflow-auto pb-20 lg:pb-0">
        <PageTransition>
          <div className="max-w-8xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Layers className="mr-3 h-10 w-10" />
                Browse Categories
              </h1>
              <p className="text-gray-600 text-lg">
                Explore threads organized by topic
              </p>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Categories
                  </CardTitle>
                  <Layers className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{categories.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Threads
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{threads.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Views
                  </CardTitle>
                  <Eye className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {threads.reduce((sum, t) => sum + t.views, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Categories</CardTitle>
                <CardDescription>
                  Browse all categories with their activity stats
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Threads</TableHead>
                      <TableHead className="text-center">Replies</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {categories.map((category) => (
                      <TableRow
                        key={category.name}
                        className="cursor-pointer hover:bg-slate-100 transition"
                        onClick={() => handleCategoryClick(category.name)}
                      >
                        <TableCell className="font-medium flex items-center gap-3">
                          <div
                            className={`${category.color} w-8 h-8 rounded-md flex items-center justify-center`}
                          >
                            {category.icon}
                          </div>
                          {category.name}
                        </TableCell>

                        <TableCell className="text-gray-600">
                          {category.description}
                        </TableCell>

                        <TableCell className="text-center font-semibold">
                          {category.threadCount}
                        </TableCell>

                        <TableCell className="text-center font-semibold">
                          {category.totalReplies}
                        </TableCell>

                        <TableCell className="text-center font-semibold">
                          {category.totalViews}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Most Active Category */}
            <Card className="bg-linear-to-r from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <TrendingUp className="mr-2 h-6 w-6" />
                  Most Active Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const mostActive = categories.reduce((prev, current) =>
                    prev.threadCount + prev.totalReplies >
                    current.threadCount + current.totalReplies
                      ? prev
                      : current
                  );
                  return (
                    <div className="flex items-center space-x-4">
                      <div className="text-5xl">{mostActive.icon}</div>
                      <div>
                        <h3 className="text-3xl font-bold mb-1">
                          {mostActive.name}
                        </h3>
                        <p className="text-blue-100">
                          {mostActive.threadCount} threads with{" "}
                          {mostActive.totalReplies} total replies
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </div>
      <MobileBottomNav />
    </div>
  );
}
