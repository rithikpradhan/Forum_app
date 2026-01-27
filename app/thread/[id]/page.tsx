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
import { createSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";

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
  Users,
  MessageCircle,
  Pin,
  Reply as ReplyIcon,
  Info,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";

type Thread = {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  views: number;
  replies: number;
  likes?: number;
  image?: string;
  author: {
    _id: string;
    name: string;
  };
};

type Reply = {
  _id: string;
  thread: string;
  content: string;
  image?: string;
  createdAt: string;
  author: {
    _id: string;
    name: string;
  };
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
  const threadId = params.id as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [onlineUsers, setOnlineUsers] = useState<
    Array<{ userId: string; userName: string }>
  >([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [localSocket, setLocalSocket] = useState<Socket | null>(null);

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
    const newSocket = createSocket();
    setLocalSocket(newSocket);

    return () => {
      newSocket.disconnect();
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const loadThread = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://forum-backend-u97g.onrender.com/api/threads/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Thread not found");
        console.log("Thread id from URL: ", params.id);

        const data = await res.json();
        setThread(data.thread);
        setReplies(data.messages);
      } catch (err) {
        console.error(err);
        router.push("/home");
      } finally {
        setLoading(false);
      }
    };

    loadThread();
  }, [params.id, router]);

  useEffect(() => {
    // Fetch user info
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://forum-backend-u97g.onrender.com/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to load user info", err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies.length]);

  useEffect(() => {
    if (!threadId || !user || !thread || !localSocket) return;

    const token = localStorage.getItem("token");
    localSocket.auth = { token };
    localSocket.connect();

    const handleConnect = () => {
      console.log("✅ Socket connected:", localSocket.id, "as", user.name);
      localSocket.emit("joinThread", threadId);
    };

    const handleNewMessage = (newReply: Reply) => {
      console.log("📨 New message received:", newReply);
      setReplies((prev) => [...prev, newReply]);
    };

    // Online users handler
    const handleOnlineUsers = (
      users: Array<{ userId: string; userName: string }>,
    ) => {
      console.log("👥 Online users received:", users);
      console.log("👥 Number of users:", users.length);
      users.forEach((u, i) => {
        console.log(`User ${i + 1}:`, {
          userId: u.userId,
          userName: u.userName,
        });
      });
      setOnlineUsers(users);
    };

    // Typing indicator handler
    const handleUserTyping = ({
      userName,
      isTyping,
    }: {
      userName: string;
      isTyping: boolean;
    }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userName);
        } else {
          newSet.delete(userName);
        }
        return newSet;
      });
    };

    localSocket.on("connect", handleConnect);
    localSocket.on("newMessage", handleNewMessage);
    localSocket.on("onlineUsers", handleOnlineUsers);
    localSocket.on("userTyping", handleUserTyping);

    return () => {
      localSocket.off("connect", handleConnect);
      localSocket.off("newMessage", handleNewMessage);
      localSocket.off("onlineUsers", handleOnlineUsers);
      localSocket.off("userTyping", handleUserTyping);
      localSocket.disconnect();
    };
  }, [threadId, user, thread, localSocket]);

  // Typing indicator logic
  const handleTyping = (value: string) => {
    setMessage(value);

    if (!localSocket || !threadId) return;

    // Emit typing start
    if (!isTyping) {
      setIsTyping(true);
      localSocket.emit("typing", { threadId, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      localSocket.emit("typing", { threadId, isTyping: false });
    }, 2000);
  };

  // Send message with proper reply handling
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !messageImage) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://forum-backend-u97g.onrender.com/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          threadId,
          content: message,
          image: messageImage,
          replyingTo: replyingTo
            ? {
                name: replyingTo.name,
                content: replyingTo.content,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await res.json();
      console.log("✅ Message sent:", newMessage);

      setMessage("");
      setMessageImage(null);
      setReplyingTo(null);
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingArray = Array.from(typingUsers);
    const typingText =
      typingArray.length === 1
        ? `${typingArray[0]} is typing...`
        : `${typingArray.join(", ")} are typing...`;

    return (
      <div className="px-4 py-2 text-sm text-gray-500 italic flex items-center space-x-2">
        <div className="flex space-x-1">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span>{typingText}</span>
      </div>
    );
  };

  // Render online users count in header
  const renderOnlineUsers = () => {
    return (
      <div className="flex items-center space-x-1 text-xs text-gray-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>{onlineUsers.length} online</span>
      </div>
    );
  };

  const getInitials = (name: string) => {
    console.log("🔍 getInitials called with:", name);
    if (!name) {
      console.log(" Name is undefined ");
      return "??";
    }

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

  const isThreadAuthor = user?.name === thread.author.name;
  const participants = Array.from(
    new Set([thread.author.name, ...replies.map((r) => r.author.name)]),
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
                          thread.category,
                        )} text-white h-4 text-[10px]`}
                      >
                        {thread.category}
                      </Badge>
                      {renderOnlineUsers()}
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
                            `/user/${encodeURIComponent(thread.author.name)}`,
                          )
                        }
                      >
                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-xs">
                          {getInitials(thread.author.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span
                            className="font-bold text-sm cursor-pointer hover:underline"
                            onClick={() =>
                              router.push(
                                `/user/${encodeURIComponent(thread.author.name)}`,
                              )
                            }
                          >
                            {thread.author.name}
                          </span>
                          <span className="text-xs text-gray-600">
                            started this discussion
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(thread.createdAt).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}{" "}
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
                  const isMyMessage = reply.author.name === user?.name;
                  const showAvatar =
                    index === 0 ||
                    replies[index - 1].author.name !== reply.author.name;

                  return (
                    <div
                      key={reply._id}
                      className={`flex items-start space-x-2 ${
                        isMyMessage ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {showAvatar ? (
                        <Avatar
                          className="h-7 w-7 cursor-pointer shrink-0"
                          onClick={() =>
                            router.push(
                              `/user/${encodeURIComponent(reply.author.name)}`,
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
                            {getInitials(reply.author.name)}
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
                                  `/user/${encodeURIComponent(reply.author.name)}`,
                                )
                              }
                            >
                              {reply.author.name}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {new Date(thread.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}{" "}
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

                        <div className="relative group flex gap-1">
                          <div
                            className={`rounded-2xl  px-2.5 py-1 text-[16px] ${
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
                          {!isMyMessage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setReplyingTo({
                                  name: reply.author.name,
                                  content: reply.content,
                                })
                              }
                              className=" opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
                            >
                              <ReplyIcon className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Reply Button on Hover */}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {renderTypingIndicator()}

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
                      // onChange={handleImageUpload}
                      className="hidden"
                    />

                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => handleTyping(e.target.value)}
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
                <h3 className="text-sm font-semibold text-gray-700 mb-2  flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse text-gray-500" />
                  Online Now ({onlineUsers.length})
                </h3>
                <Card className="shadow-md px-4">
                  <CardContent className="p-2 space-y-2 text-sm">
                    {onlineUsers.length > 0 ? (
                      onlineUsers.map((onlineUser) => (
                        <div
                          key={onlineUser.userId}
                          className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-linear-to-br from-green-500 to-emerald-600 text-white text-[10px]">
                              {getInitials(onlineUser.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate flex-1">
                            {onlineUser.userName || "Unknown User"}
                          </span>
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 p-2">
                        No users online
                      </p>
                    )}
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
                            `/user/${encodeURIComponent(participant)}`,
                          )
                        }
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-[10px]">
                            {getInitials(participant)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate flex-1">
                          {participant}
                        </span>
                        {participant === thread.author.name && (
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
            {/* <Button onClick={handleEditThread} size="sm">
              Save Changes
            </Button> */}
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
            {/* <AlertDialogAction
              onClick={handleDeleteThread}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Chat Room
            </AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
