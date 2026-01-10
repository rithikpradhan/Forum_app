// src/app/thread/[id]/page.tsx
// Complete chat room with image lightbox, reply system, and info sidebar

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Send,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  Heart,
  Users,
  MessageCircle,
  Pin,
  Reply as ReplyIcon,
  Info,
  Clock,
  Eye,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";

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
  image?: string;
};

type Reply = {
  id: number;
  threadId: number;
  author: string;
  content: string;
  likes: number;
  createdAt: string;
  image?: string;
  parentReplyId?: number;
  replyingTo?: {
    name: string;
    content: string;
  };
};

export default function ChatRoomThreadView() {
  const params = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Message input
  const [message, setMessage] = useState("");
  const [messageImage, setMessageImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    name: string;
    content: string;
  } | null>(null);

  // Image lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Edit/Delete
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editThreadData, setEditThreadData] = useState({
    title: "",
    content: "",
  });
  const [editThreadImage, setEditThreadImage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Right sidebar toggle
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    setUser(JSON.parse(userData));

    const threadId = Number(params.id);
    const storedThreads = localStorage.getItem("threads");

    if (storedThreads) {
      const threads = JSON.parse(storedThreads);
      const foundThread = threads.find((t: Thread) => t.id === threadId);

      if (foundThread) {
        foundThread.views = (foundThread.views || 0) + 1;
        const updatedThreads = threads.map((t: Thread) =>
          t.id === threadId ? foundThread : t
        );
        localStorage.setItem("threads", JSON.stringify(updatedThreads));
        setThread(foundThread);
        setEditThreadData({
          title: foundThread.title,
          content: foundThread.content,
        });
        setEditThreadImage(foundThread.image || null);
      }
    }

    loadReplies(threadId);
    setLoading(false);
  }, [params.id, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  const loadReplies = (threadId: number) => {
    const storedReplies = localStorage.getItem("replies");
    if (storedReplies) {
      const allReplies = JSON.parse(storedReplies);
      const threadReplies = allReplies.filter(
        (r: Reply) => r.threadId === threadId
      );
      setReplies(threadReplies);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setMessageImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !messageImage) return;

    setIsSubmitting(true);

    const newReply: Reply = {
      id: Date.now(),
      threadId: Number(params.id),
      author: user!.name,
      content: message,
      likes: 0,
      createdAt: "Just now",
      image: messageImage || undefined,
      replyingTo: replyingTo
        ? {
            name: replyingTo.name,
            content: replyingTo.content,
          }
        : undefined,
    };

    const updatedReplies = [...replies, newReply];
    setReplies(updatedReplies);

    const storedReplies = localStorage.getItem("replies");
    const allReplies = storedReplies ? JSON.parse(storedReplies) : [];
    allReplies.push(newReply);
    localStorage.setItem("replies", JSON.stringify(allReplies));

    if (thread) {
      const updatedThread = { ...thread, replies: thread.replies + 1 };
      setThread(updatedThread);

      const storedThreads = localStorage.getItem("threads");
      if (storedThreads) {
        const threads = JSON.parse(storedThreads);
        const updated = threads.map((t: Thread) =>
          t.id === updatedThread.id ? updatedThread : t
        );
        localStorage.setItem("threads", JSON.stringify(updated));
      }
    }

    setMessage("");
    setMessageImage(null);
    setReplyingTo(null);
    setIsSubmitting(false);
  };

  const handleEditThread = () => {
    if (!thread || !user || thread.author !== user.name) return;

    const updatedThread = {
      ...thread,
      title: editThreadData.title,
      content: editThreadData.content,
      image: editThreadImage || undefined,
    };

    setThread(updatedThread);

    const storedThreads = localStorage.getItem("threads");
    if (storedThreads) {
      const threads = JSON.parse(storedThreads);
      const updated = threads.map((t: Thread) =>
        t.id === updatedThread.id ? updatedThread : t
      );
      localStorage.setItem("threads", JSON.stringify(updated));
    }

    setIsEditingThread(false);
  };

  const handleDeleteThread = () => {
    if (!thread || !user || thread.author !== user.name) return;

    const storedThreads = localStorage.getItem("threads");
    if (storedThreads) {
      const threads = JSON.parse(storedThreads);
      const updated = threads.filter((t: Thread) => t.id !== thread.id);
      localStorage.setItem("threads", JSON.stringify(updated));
    }

    const storedReplies = localStorage.getItem("replies");
    if (storedReplies) {
      const allReplies = JSON.parse(storedReplies);
      const updated = allReplies.filter((r: Reply) => r.threadId !== thread.id);
      localStorage.setItem("replies", JSON.stringify(updated));
    }

    router.push("/home");
  };

  const handleThreadImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setEditThreadImage(reader.result as string);
      reader.readAsDataURL(file);
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

  const highlightMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span
            key={index}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user/${encodeURIComponent(part)}`);
            }}
          >
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  if (loading || !thread) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading chat room...</p>
      </div>
    );
  }

  const isThreadAuthor = user && thread.author === user.name;
  const participants = Array.from(
    new Set([thread.author, ...replies.map((r) => r.author)])
  );
  const participantCount = participants.length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          {/* CHAT ROOM HEADER */}
          <div className="bg-white border-b shadow-sm p-3">
            <div className="max-w-full mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="h-8 shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <Pin className="h-4 w-4 text-blue-600 shrink-0" />
                      <h1 className="">{thread.title}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                      <Badge
                        className={`${getCategoryColor(
                          thread.category
                        )} text-white h-4 text-[10px]`}
                      >
                        {thread.category}
                      </Badge>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {participantCount}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {replies.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInfo(!showInfo)}
                    className="h-8 px-2"
                  >
                    <Info className="h-4 w-4" />
                  </Button>

                  {isThreadAuthor && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingThread(true)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex overflow-y-auto scrollbar-none">
            {/* CHAT MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto bg-stone-100 scrollbar-none">
              <div className="max-w-8xl mx-auto p-3 sm:p-4 space-y-2">
                {/* THREAD STARTER */}
                <Card className="bg-linear-to-br from-blue-50 to-purple-50 border-blue-200 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <Avatar
                        className="h-9 w-9 cursor-pointer ring-2 ring-blue-300"
                        onClick={() =>
                          router.push(
                            `/user/${encodeURIComponent(thread.author)}`
                          )
                        }
                      >
                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-xs">
                          {getInitials(thread.author)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span
                            className="font-bold text-sm cursor-pointer hover:underline"
                            onClick={() =>
                              router.push(
                                `/user/${encodeURIComponent(thread.author)}`
                              )
                            }
                          >
                            {thread.author}
                          </span>
                          <span className="text-xs text-gray-600">
                            started this discussion
                          </span>
                          <span className="text-xs text-gray-500">
                            • {thread.createdAt}
                          </span>
                        </div>

                        <p className="text-sm text-gray-800 leading-relaxed mb-1">
                          {highlightMentions(thread.content)}
                        </p>

                        {thread.image && (
                          <div
                            className="relative group cursor-pointer inline-block"
                            onClick={() => setLightboxImage(thread.image!)}
                          >
                            <img
                              src={thread.image}
                              alt="Topic"
                              className="max-w-sm h-auto rounded-lg border mt-1"
                            />
                            <div className="absolute inset-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                              <ZoomIn className="h-6 w-6 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CHAT MESSAGES */}
                {replies.map((reply, index) => {
                  const isMyMessage = reply.author === user?.name;
                  const showAvatar =
                    index === 0 || replies[index - 1].author !== reply.author;

                  return (
                    <div
                      key={reply.id}
                      className={`flex items-start space-x-2 ${
                        isMyMessage ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {showAvatar ? (
                        <Avatar
                          className="h-7 w-7 cursor-pointer shrink-0"
                          onClick={() =>
                            router.push(
                              `/user/${encodeURIComponent(reply.author)}`
                            )
                          }
                        >
                          <AvatarFallback
                            className={`text-white text-[10px] ${
                              isMyMessage
                                ? "bg-linear-to-br from-green-500 to-emerald-600"
                                : "bg-linear-to-br from-gray-500 to-gray-600"
                            }`}
                          >
                            {getInitials(reply.author)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-7 w-7 shrink-0" />
                      )}

                      <div
                        className={`flex-1 max-w-[85%] sm:max-w-lg ${
                          isMyMessage ? "items-end" : "items-start"
                        } flex flex-col`}
                      >
                        {showAvatar && (
                          <div
                            className={`flex items-center space-x-1.5 mb-0.5 ${
                              isMyMessage
                                ? "flex-row-reverse space-x-reverse"
                                : ""
                            }`}
                          >
                            <span
                              className="font-semibold text-xs cursor-pointer hover:underline"
                              onClick={() =>
                                router.push(
                                  `/user/${encodeURIComponent(reply.author)}`
                                )
                              }
                            >
                              {reply.author}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {reply.createdAt}
                            </span>
                          </div>
                        )}

                        {/* REPLY REFERENCE - Shows which message was replied to */}
                        {reply.replyingTo && (
                          <div
                            className={`mb-1 ${
                              isMyMessage ? "self-end" : "self-start"
                            }`}
                          >
                            <div
                              className={`text-[14px] px-2 py-1 rounded-lg border-l-2 ${
                                isMyMessage
                                  ? "bg-blue-100 border-blue-600 text-blue-900"
                                  : "bg-slate-200 border-gray-400 text-gray-700"
                              }`}
                            >
                              <div className="flex items-center space-x-1 mb-0.5">
                                <ReplyIcon className="h-2.5 w-2.5" />
                                <span className="font-semibold">
                                  {reply.replyingTo.name}
                                </span>
                              </div>
                              <p className="line-clamp-1 opacity-75">
                                {reply.replyingTo.content}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="relative group">
                          <div
                            className={`rounded-2xl px-2.5 py-1.5 text-[16px] ${
                              isMyMessage
                                ? "bg-green-200 text-black"
                                : "bg-white border shadow-sm"
                            }`}
                          >
                            {reply.image && (
                              <div
                                className="relative cursor-pointer group/img mt-1 mb-5"
                                onClick={() => setLightboxImage(reply.image!)}
                              >
                                <img
                                  src={reply.image}
                                  alt="Message"
                                  className="max-w-xs h-auto rounded-lg"
                                />
                                <div className="absolute inset-0 bg-opacity-0 group-hover/img:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                  <ZoomIn
                                    className="h-5 w-5 text-black
                                   opacity-0 group-hover/img:opacity-100 transition-opacity"
                                  />
                                </div>
                              </div>
                            )}

                            <p
                              className={`leading-relaxed ${
                                isMyMessage ? "text-black" : "text-gray-800"
                              }`}
                            >
                              {highlightMentions(reply.content)}
                            </p>
                          </div>

                          {/* Reply Button on Hover */}
                          {!isMyMessage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setReplyingTo({
                                  name: reply.author,
                                  content: reply.content,
                                })
                              }
                              className=" opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
                            >
                              <ReplyIcon className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* MESSAGE INPUT */}
          <div className="bg-white border-t shadow-lg p-3 sm:p-4 max-w-6xl w-[90%] sm:w-[90%] mx-auto rounded-3xl sm:rounded-4xl mb-2">
            <div className="">
              {/* Reply Banner */}
              {replyingTo && (
                <div className="bg-blue-50 border-l-2 border-blue-500 px-2 py-1.5 mb-1.5 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-0.5">
                      <ReplyIcon className="h-3 w-3" />
                      <span>
                        Replying to <strong>{replyingTo.name}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {replyingTo.content}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                    className="h-6 w-6 p-0 shrink-0 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex items-end space-x-2"
              >
                <div className="flex-1">
                  {messageImage && (
                    <div className="mb-1.5 relative inline-block">
                      <img
                        src={messageImage}
                        alt="Preview"
                        className="h-16 w-auto rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => setMessageImage(null)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center space-x-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 w-8 p-0 shrink-0"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 h-9 text-sm"
                      disabled={isSubmitting}
                    />

                    <Button
                      type="submit"
                      size="sm"
                      disabled={
                        isSubmitting || (!message.trim() && !messageImage)
                      }
                      className="h-8 px-3"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* RIGHT SIDEBAR - ROOM INFO */}
        {showInfo && (
          <div className="hidden lg:block w-80 border-l bg-slate-100 overflow-auto ">
            <div className="p-3 space-y-3">
              {/* Room Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
                  Room Details
                </h3>
                <Card className="shadow-md px-4">
                  <CardContent className="p-2 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Started by</span>
                      <span
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={() =>
                          router.push(
                            `/user/${encodeURIComponent(thread.author)}`
                          )
                        }
                      >
                        {thread.author}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Created
                      </span>
                      <span>{thread.createdAt}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        Views
                      </span>
                      <span className="font-semibold">{thread.views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        Likes
                      </span>
                      <span className="font-semibold">{thread.likes || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Participants */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Participants ({participantCount})
                </h3>
                <Card className="shadow-sm">
                  <CardContent className="p-2 space-y-1.5">
                    {participants.map((participant) => (
                      <div
                        key={participant}
                        className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/user/${encodeURIComponent(participant)}`
                          )
                        }
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-[10px]">
                            {getInitials(participant)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate flex-1">
                          {participant}
                        </span>
                        {participant === thread.author && (
                          <Badge className="h-4 text-[9px] bg-blue-500">
                            Host
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Activity Stats */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase">
                  Activity
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Card className="shadow-sm">
                    <CardContent className="p-2 text-center">
                      <MessageCircle className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                      <div className="text-base font-bold">
                        {replies.length}
                      </div>
                      <div className="text-[9px] text-gray-600">Messages</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-2 text-center">
                      <Users className="h-4 w-4 mx-auto mb-1 text-green-500" />
                      <div className="text-base font-bold">
                        {participantCount}
                      </div>
                      <div className="text-[9px] text-gray-600">People</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IMAGE LIGHTBOX */}
      <Dialog
        open={!!lightboxImage}
        onOpenChange={() => setLightboxImage(null)}
      >
        <DialogContent className="max-w-full p-1">
          <Image
            src={`${lightboxImage}`}
            alt="Full size"
            className="w-full h-full rounded-lg"
            width={800}
            height={600}
            unoptimized
          />
        </DialogContent>
      </Dialog>

      {/* EDIT THREAD DIALOG */}
      <Dialog open={isEditingThread} onOpenChange={setIsEditingThread}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Discussion Topic</DialogTitle>
            <DialogDescription>
              Update the main topic of this chat room
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editThreadData.title}
                onChange={(e) =>
                  setEditThreadData({
                    ...editThreadData,
                    title: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={editThreadData.content}
                onChange={(e) =>
                  setEditThreadData({
                    ...editThreadData,
                    content: e.target.value,
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm min-h-[100px]"
              />
            </div>

            {editThreadImage && (
              <div className="relative inline-block">
                <img
                  src={editThreadImage}
                  alt="Preview"
                  className="max-w-xs h-auto rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setEditThreadImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-3 w-3 mr-2" />
              {editThreadImage ? "Change Image" : "Add Image"}
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingThread(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button onClick={handleEditThread} size="sm">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the discussion and all{" "}
              {replies.length} messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteThread}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Chat Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
