// src/app/trending/page.tsx
// Trending discussions and hot topics

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";

import {
  TrendingUp,
  Flame,
  Zap,
  MessageSquare,
  Eye,
  Heart,
  Activity,
} from "lucide-react";

type Thread = {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  likes: number;
  createdAt: string;
};

export default function TrendingPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    const storedThreads = localStorage.getItem("threads");
    if (storedThreads) {
      setThreads(JSON.parse(storedThreads));
    }

    setLoading(false);
  }, [router]);

  // const getInitials = (name: string) => {
  //   return (
  //     name
  //       // .split(" ")
  //       .map((w) => w[0])
  //       .join("")
  //       .toUpperCase()
  //       .slice(0, 2)
  //   );
  // };

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

  // Calculate trending threads (most active)
  const trendingThreads = [...threads]
    .sort((a, b) => {
      const scoreA = a.replies * 2 + a.views * 0.5 + (a.likes || 0);
      const scoreB = b.replies * 2 + b.views * 0.5 + (b.likes || 0);
      return scoreB - scoreA;
    })
    .slice(0, 10);

  // Hot discussions (most replies recently)
  const hotThreads = [...threads]
    .sort((a, b) => b.replies - a.replies)
    .slice(0, 10);

  // Rising threads (good engagement, fewer views - "hidden gems")
  const risingThreads = [...threads]
    .filter((t) => t.views < 200 && t.replies > 2)
    .sort(
      (a, b) =>
        b.replies / Math.max(b.views, 1) - a.replies / Math.max(a.views, 1),
    )
    .slice(0, 10);

  // Popular threads (most views)
  const popularThreads = [...threads]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const ThreadCard = ({
    thread,
    index,
    icon,
  }: {
    thread: Thread;
    index: number;
    icon: React.ReactNode;
  }) => (
    <Card
      className="hover:shadow-md transition-all cursor-pointer shadow-sm"
      onClick={() => router.push(`/thread/${thread.id}`)}
    >
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-sm shrink-0">
            {index + 1}
          </div>

          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
              {getInitials(thread.author)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm line-clamp-1 flex-1">
                {thread.title}
              </h3>
              <div className="flex items-center shrink-0">{icon}</div>
            </div>

            <p className="text-xs text-gray-600 line-clamp-1 mb-2">
              {thread.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-gray-600">
                <span className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {thread.replies}
                </span>
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {thread.views}
                </span>
                <span className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {thread.likes || 0}
                </span>
              </div>

              <Badge
                className={`${getCategoryColor(
                  thread.category,
                )} text-white text-[10px] h-4`}
              >
                {thread.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading trending...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto pb-20 lg:pb-0">
        <div className="max-w-8xl mx-auto p-4 space-y-4">
          {/* Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center">
              <TrendingUp className="mr-2 h-8 w-8 text-orange-500" />
              Trending Discussions
            </h1>
            <p className="text-gray-600 text-sm">
              Discover the hottest topics and rising discussions
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="shadow-sm">
              <CardContent className="p-3 text-center">
                <Flame className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                <div className="text-xl font-bold">{hotThreads.length}</div>
                <div className="text-xs text-gray-600">Hot Topics</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3 text-center">
                <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                <div className="text-xl font-bold">{risingThreads.length}</div>
                <div className="text-xs text-gray-600">Rising</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3 text-center">
                <Eye className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                <div className="text-xl font-bold">
                  {threads.reduce((sum, t) => sum + t.views, 0)}
                </div>
                <div className="text-xs text-gray-600">Total Views</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-3 text-center">
                <MessageSquare className="h-6 w-6 mx-auto mb-1 text-green-500" />
                <div className="text-xl font-bold">
                  {threads.reduce((sum, t) => sum + t.replies, 0)}
                </div>
                <div className="text-xs text-gray-600">Total Replies</div>
              </CardContent>
            </Card>
          </div>

          {/* Trending Tabs */}
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="trending" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="hot" className="text-xs">
                <Flame className="h-3 w-3 mr-1" />
                Hot
              </TabsTrigger>
              <TabsTrigger value="rising" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Rising
              </TabsTrigger>
              <TabsTrigger value="popular" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Popular
              </TabsTrigger>
            </TabsList>

            {/* TRENDING TAB */}
            <TabsContent value="trending" className="space-y-2 mt-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  🔥 Most Active Discussions
                </h2>
                <span className="text-xs text-gray-500">
                  Based on replies, views, and likes
                </span>
              </div>

              {trendingThreads.length > 0 ? (
                <div className="space-y-2">
                  {trendingThreads.map((thread, index) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      index={index}
                      icon={<Activity className="h-4 w-4 text-orange-500" />}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <TrendingUp className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      No trending discussions yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* HOT TAB */}
            <TabsContent value="hot" className="space-y-2 mt-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  🔥 Hottest Conversations
                </h2>
                <span className="text-xs text-gray-500">
                  Most replies right now
                </span>
              </div>

              {hotThreads.length > 0 ? (
                <div className="space-y-2">
                  {hotThreads.map((thread, index) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      index={index}
                      icon={<Flame className="h-4 w-4 text-red-500" />}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <Flame className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      No hot discussions yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* RISING TAB */}
            <TabsContent value="rising" className="space-y-2 mt-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  ⚡ Rising Fast
                </h2>
                <span className="text-xs text-gray-500">
                  Hidden gems gaining traction
                </span>
              </div>

              {risingThreads.length > 0 ? (
                <div className="space-y-2">
                  {risingThreads.map((thread, index) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      index={index}
                      icon={<Zap className="h-4 w-4 text-yellow-500" />}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <Zap className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      No rising discussions yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* POPULAR TAB */}
            <TabsContent value="popular" className="space-y-2 mt-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  👁️ Most Viewed
                </h2>
                <span className="text-xs text-gray-500">
                  Highest view count
                </span>
              </div>

              {popularThreads.length > 0 ? (
                <div className="space-y-2">
                  {popularThreads.map((thread, index) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      index={index}
                      icon={<Eye className="h-4 w-4 text-blue-500" />}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-8">
                  <CardContent>
                    <Eye className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      No popular discussions yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
