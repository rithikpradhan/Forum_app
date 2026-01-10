// src/app/user/[name]/page.tsx
// View any user's public profile

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";

import {
  ArrowLeft,
  User,
  MessageSquare,
  TrendingUp,
  Eye,
  Calendar,
} from "lucide-react";

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

export default function PublicUserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = decodeURIComponent(params.name as string);

  const [userThreads, setUserThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    loadUserThreads();
    setLoading(false);
  }, [router, username]);

  const loadUserThreads = () => {
    const storedThreads = localStorage.getItem("threads");
    if (storedThreads) {
      const allThreads = JSON.parse(storedThreads);
      const threads = allThreads.filter((t: Thread) => t.author === username);

      if (threads.length === 0) {
        // Check if user exists in replies
        const storedReplies = localStorage.getItem("replies");
        if (storedReplies) {
          const allReplies = JSON.parse(storedReplies);
          const hasReplies = allReplies.some((r: any) => r.author === username);
          if (!hasReplies) {
            setUserExists(false);
          }
        } else {
          setUserExists(false);
        }
      }

      setUserThreads(threads);
    }
  };

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

  // Calculate stats
  const totalThreads = userThreads.length;
  const totalReplies = userThreads.reduce((sum, t) => sum + t.replies, 0);
  const totalViews = userThreads.reduce((sum, t) => sum + t.views, 0);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!userExists) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="text-center p-8">
            <CardContent>
              <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
              <p className="text-gray-600 mb-4">
                The user {username} doesnt exist or hasnt posted anything yet.
              </p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto pb-20 lg:pb-0">
        <div className="max-w-8xl mx-auto p-8 space-y-8">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Profile Header */}
          <Card className="shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-700 to-purple-700 text-white text-4xl">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{username}</h1>
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4 text-indigo-100 mb-3">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Community Member
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member since 2025
                    </span>
                  </div>
                  <p className="text-indigo-100">
                    Active forum member sharing knowledge and engaging with the
                    community
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Threads Created
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {totalThreads}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total discussions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Replies
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {totalReplies}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Community responses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Views
                </CardTitle>
                <Eye className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {totalViews}
                </div>
                <p className="text-xs text-gray-500 mt-1">Content reach</p>
              </CardContent>
            </Card>
          </div>

          {/* User's Threads */}
          <Card>
            <CardHeader>
              <CardTitle>
                Threads by {username} ({totalThreads})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userThreads.length > 0 ? (
                  userThreads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => router.push(`/thread/${thread.id}`)}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">
                          {thread.title}
                        </h3>
                        <Badge
                          className={`${getCategoryColor(
                            thread.category
                          )} text-white`}
                        >
                          {thread.category}
                        </Badge>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {thread.content}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {thread.replies} replies
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {thread.views} views
                        </span>
                        <span>{thread.createdAt}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{username} hasnt created any threads yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
