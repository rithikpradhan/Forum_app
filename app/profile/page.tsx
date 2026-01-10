// src/app/profile/page.tsx
// User profile page showing stats, threads, and edit functionality

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { PageTransition } from "@/components/ui/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  MessageSquare,
  TrendingUp,
  Eye,
  Award,
  CheckCircle2,
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    bio?: string;
    joinedDate?: string;
    avatar?: string;
  } | null>(null);
  const [userThreads, setUserThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
  });

  // Load user data and threads
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    const parsedUser = JSON.parse(userData);

    // Add default values if they don't exist
    if (!parsedUser.bio) {
      parsedUser.bio =
        "Passionate about technology and learning. Love to share knowledge with the community!";
    }
    if (!parsedUser.joinedDate) {
      parsedUser.joinedDate = "January 2025";
    }

    setUser(parsedUser);
    setEditForm({
      name: parsedUser.name,
      bio: parsedUser.bio || "",
    });

    // Load user's threads
    const storedThreads = localStorage.getItem("threads");
    if (storedThreads) {
      const allThreads = JSON.parse(storedThreads);
      const myThreads = allThreads.filter(
        (t: Thread) => t.author === parsedUser.name
      );
      setUserThreads(myThreads);
    }

    setLoading(false);
  }, [router]);

  // Calculate user statistics
  const totalThreads = userThreads.length;
  const totalReplies = userThreads.reduce((sum, t) => sum + t.replies, 0);
  const totalViews = userThreads.reduce((sum, t) => sum + t.views, 0);
  const avgReplies =
    totalThreads > 0 ? Math.round(totalReplies / totalThreads) : 0;

  // Handle profile update
  const handleSaveProfile = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: editForm.name,
      bio: editForm.bio,
    };

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);

    // Show success message
    alert("Profile updated successfully!");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedUser = {
        ...user!,
        avatar: reader.result as string,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    };

    reader.readAsDataURL(file);
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <PageTransition>
          <div className="max-w-8xl mx-auto p-8 space-y-8">
            {/* PROFILE HEADER CARD */}
            <Card className="shadow-lg bg-linear-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* Large Avatar */}
                  {/* <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                    <AvatarFallback className="bg-linear-to-br from-blue-700 to-purple-700 text-white text-4xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar> */}

                  <Avatar className="h-32 w-32 border-4 border-white shadow-xl relative group">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="bg-linear-to-br from-blue-700 to-purple-700 text-white text-4xl">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    )}

                    {/* Upload Overlay */}

                    {isEditing && (
                      <label className="absolute inset-0 bg-black/40 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition">
                        Change
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                    )}
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    {!isEditing ? (
                      <>
                        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4 text-blue-100 mb-3">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.email}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Joined {user.joinedDate}
                          </span>
                        </div>
                        <p className="text-blue-100 max-w-2xl">{user.bio}</p>
                      </>
                    ) : (
                      <div className="space-y-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <div>
                          <Label className="text-white mb-2 block">Name</Label>
                          <Input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                          />
                        </div>
                        <div>
                          <Label className="text-white mb-2 block">Bio</Label>
                          <Input
                            value={editForm.bio}
                            onChange={(e) =>
                              setEditForm({ ...editForm, bio: e.target.value })
                            }
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit Button */}
                  <div className="flex space-x-2">
                    {!isEditing ? (
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={handleSaveProfile}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              name: user.name,
                              bio: user.bio || "",
                            });
                          }}
                          className="text-white hover:bg-white/20"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* STATISTICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Threads
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {totalThreads}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Discussions started
                  </p>
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
                    Community engagement
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
                  <p className="text-xs text-gray-500 mt-1">People reached</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg. Replies
                  </CardTitle>
                  <Award className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {avgReplies}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Per thread</p>
                </CardContent>
              </Card>
            </div>

            {/* ACHIEVEMENTS SECTION */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle2 className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-semibold">First Thread</p>
                      <p className="text-sm text-gray-600">
                        Posted your first discussion
                      </p>
                    </div>
                  </div>

                  {totalThreads >= 5 && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-semibold">Active Contributor</p>
                        <p className="text-sm text-gray-600">
                          Created 5+ threads
                        </p>
                      </div>
                    </div>
                  )}

                  {totalViews >= 100 && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <CheckCircle2 className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="font-semibold">Popular Creator</p>
                        <p className="text-sm text-gray-600">
                          100+ total views
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* MY THREADS SECTION */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Threads ({totalThreads})</CardTitle>
                  <div className="flex gap-3">
                    <Select>
                      <span className="text-xs text-gray-600 mt-3">
                        Category :
                      </span>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">All</SelectItem>
                        <SelectItem value="recent">Discussion</SelectItem>
                        <SelectItem value="popular">Question</SelectItem>
                        <SelectItem value="mostReplies">Tutorial</SelectItem>
                        <SelectItem value="mostViews">Showcase</SelectItem>
                        <SelectItem value="mostViews">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => router.push("/create")}>
                      + Create New
                    </Button>
                  </div>
                </div>
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
                      <p>No threads yet. Start sharing your ideas!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
