// src/app/explore/page.tsx
// Explore page shows ALL threads from all users

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare, Eye, Clock, Filter } from "lucide-react";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";

type Thread = {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  views: number;
  replies: number;
  author: {
    _id: string;
    name: string;
  };
};

export default function ExplorePage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Available categories
  const categories = [
    "All",
    "Tutorial",
    "Question",
    "Discussion",
    "Showcase",
    "Announcement",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await fetch(
          "https://forum-backend-u97g.onrender.com/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        // User is valid → now load threads
        fetchThreads();
      } catch (err) {
        console.error(err);
        router.push("/");
      }
    };

    verifyUser();
  }, [router]);

  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://forum-backend-u97g.onrender.com/api/threads",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // if (!res.ok) {
      //   throw new Error("Failed to fetch threads");
      // }

      const data = await res.json();
      setThreads(data.threads);
      setFilteredThreads(data.threads);
    } catch (err) {
      console.error(err);

      // Temporary fallback (until backend threads ready)
      setThreads([]);
      setFilteredThreads([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter threads based on search and category
  useEffect(() => {
    let result = threads;

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((thread) => thread.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (thread) =>
          thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thread.author.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredThreads(result);
  }, [searchQuery, selectedCategory, threads]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Announcement: "bg-blue-500",
      Question: "bg-green-500",
      Discussion: "bg-purple-500",
      Showcase: "bg-orange-500",
      Tutorial: "bg-pink-500",
    };

    return colors[category] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto bg-stone-100 pb-20 lg:pb-0">
        <PageTransition>
          <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  All Threads
                </h1>
                <p className="text-gray-600 text-lg">
                  Discover discussions from the community...
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-5 border-gray-300 w-full sm:w-64"
                  />
                </div>
                {/* <Button
                  variant="outline"
                  onClick={() => router.push("/create")}
                  className="p-5 w-full sm:w-auto hover:border-gray-400"
                >
                  + Create Thread
                </Button> */}
              </div>
            </div>

            {/* Search and Filter Section */}
            <Card>
              <CardContent className="space-y-4">
                {/* Category Filter */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Filter by category:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-start">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {filteredThreads.length}
                    </span>{" "}
                    threads
                  </p>
                  {filteredThreads.length > 0 ? (
                    filteredThreads.map((thread) => (
                      <Card
                        key={thread._id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => router.push(`/thread/${thread._id}`)}
                      >
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 gap-3">
                            <div className="flex items-center justify-between sm:block">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white">
                                  {getInitials(thread.author.name)}
                                </AvatarFallback>
                              </Avatar>

                              {/* Mobile-only Badge */}
                              <Badge
                                className={`sm:hidden ${getCategoryColor(
                                  thread.category,
                                )} text-white`}
                              >
                                {thread.category}
                              </Badge>
                            </div>

                            <div className="flex-1 space-y-2">
                              <CardTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                {thread.title}
                                <Badge
                                  className={`hidden sm:inline-flex ${getCategoryColor(
                                    thread.category,
                                  )} text-white`}
                                >
                                  {thread.category}
                                </Badge>
                              </CardTitle>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                                <span className="font-medium">
                                  {thread.author.name}
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {new Date(thread.createdAt).toLocaleString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            View Discussion →
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    // No results state
                    <Card className="text-center py-12">
                      <CardContent>
                        <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                          No threads found
                        </h3>
                        <p className="text-gray-600">
                          Try adjusting your search or filters
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between"></div>

            {/* Threads List */}
          </div>
        </PageTransition>
      </div>
      <MobileBottomNav />
    </div>
  );
}
