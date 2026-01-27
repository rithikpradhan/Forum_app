"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { PageTransition } from "@/components/ui/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import imageCompression from "browser-image-compression";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
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
  Award,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type Thread = {
  _id: string;
  title: string;
  content: string;
  category: string;
  replies: number;
  createdAt: string;
  author: {
    _id: string;
    name: string;
  };
};

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  bio: string;
  avatar?: string;
  joinedDate: string;
};

type Stats = {
  totalThreads: number;
  totalMessages: number;
  totalViews: number;
  totalReplies: number;
  avgReplies: number;
};

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    avatar: "",
  });
  const [filterCategory, setFilterCategory] = useState("all");

  // Load profile data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://forum-backend-u97g.onrender.com/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await res.json();
      console.log("📋 Profile loaded:", data);

      setUser(data.user);
      setStats(data.stats);
      setThreads(data.threads);
      setEditForm({
        name: data.user.name,
        bio: data.user.bio,
        avatar: data.user.avatar || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://forum-backend-u97g.onrender.com/api/users/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editForm.name,
            bio: editForm.bio,
            avatar: editForm.avatar,
          }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const data = await res.json();
      setUser(data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 🔹 Compress image BEFORE converting to base64
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      // 🔹 Convert compressed image to base64
      const base64 = await toBase64(compressedFile as File);

      // 🔹 Save in state (same as before)
      setEditForm((prev) => ({
        ...prev,
        avatar: base64,
      }));
    } catch (error) {
      console.error("Image processing failed:", error);
      toast.error("Failed to process image");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatThreadDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !stats) return null;

  // Filter threads by category
  const filteredThreads =
    filterCategory === "all"
      ? threads
      : threads.filter((t) => t.category === filterCategory);

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto pb-20 lg:pb-0">
        <PageTransition>
          <div className="max-w-8xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* PROFILE HEADER CARD */}
            <Card className="shadow-lg bg-gradient-to-tl from-red-50 to-indigo-600 text-white">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {/* Avatar */}
                  <Avatar className="h-24 sm:h-32 w-24 sm:w-32 border-4 border-white shadow-xl relative group">
                    {(isEditing ? editForm.avatar : user.avatar) ? (
                      <img
                        src={isEditing ? editForm.avatar : user.avatar}
                        alt="Profile"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-700 to-purple-700 text-white text-2xl sm:text-4xl">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    )}

                    {isEditing && (
                      <label className="absolute inset-0 bg-black/40 text-white text-xs sm:text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition">
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
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                          {user.name}
                        </h1>
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4 text-blue-100 mb-3 text-sm">
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.email}
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Joined {formatDate(user.joinedDate)}
                          </span>
                        </div>
                        <p className="text-blue-100 max-w-2xl text-sm sm:text-base">
                          {user.bio}
                        </p>
                      </>
                    ) : (
                      <div className="space-y-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <div>
                          <Label className="text-white mb-2 block text-sm">
                            Name
                          </Label>
                          <Input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                            maxLength={50}
                          />
                        </div>
                        <div>
                          <Label className="text-white mb-2 block text-sm">
                            Bio
                          </Label>
                          <Textarea
                            value={editForm.bio}
                            onChange={(e) =>
                              setEditForm({ ...editForm, bio: e.target.value })
                            }
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/60 min-h-[80px]"
                            maxLength={500}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {!isEditing ? (
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="w-full sm:w-auto"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              name: user.name,
                              bio: user.bio,
                              avatar: user.avatar || "",
                            });
                          }}
                          disabled={isSaving}
                          className="text-white hover:bg-white/20 w-full sm:w-auto"
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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Threads
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {stats.totalThreads}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Started</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Messages
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {stats.totalMessages}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Sent</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Replies
                  </CardTitle>
                  <Award className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {stats.totalReplies}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Received</p>
                </CardContent>
              </Card>
            </div>

            {/* MY THREADS SECTION */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-lg sm:text-xl">
                    My Threads ({filteredThreads.length})
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Select
                      value={filterCategory}
                      onValueChange={setFilterCategory}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Discussion">Discussion</SelectItem>
                        <SelectItem value="Question">Question</SelectItem>
                        <SelectItem value="Tutorial">Tutorial</SelectItem>
                        <SelectItem value="Showcase">Showcase</SelectItem>
                        <SelectItem value="Announcement">
                          Announcement
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => router.push("/create")}
                      className="w-full sm:w-auto"
                    >
                      + Create New
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredThreads.length > 0 ? (
                    filteredThreads.map((thread) => (
                      <div
                        key={thread._id}
                        onClick={() => router.push(`/thread/${thread._id}`)}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg">
                            {thread.title}
                          </h3>
                          <Badge
                            className={`${getCategoryColor(thread.category)} text-white w-fit`}
                          >
                            {thread.category}
                          </Badge>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {thread.content}
                        </p>

                        <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {thread.replies}
                          </span>

                          <span>{formatThreadDate(thread.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-base">
                        {filterCategory === "all"
                          ? "No threads yet. Start sharing your ideas!"
                          : `No ${filterCategory} threads yet.`}
                      </p>
                      <Button
                        onClick={() => router.push("/create")}
                        className="mt-4"
                      >
                        Create Your First Thread
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </div>
      <MobileBottomNav />
    </div>
  );
}
