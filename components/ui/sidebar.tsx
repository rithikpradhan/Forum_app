// src/components/sidebar.tsx
// Updated sidebar with notification system

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "./page-transition";
import {
  Home,
  Compass,
  PlusCircle,
  LogOut,
  User,
  Bell,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";

// Type for notifications
type Notification = {
  id: number;
  type: "reply" | "mention" | "like";
  message: string;
  threadId: number;
  threadTitle: string;
  read: boolean;
  createdAt: string;
};

const menuItems = [
  {
    title: "Home",
    href: "/home",
    icon: Home,
    description: "Your threads overview",
  },
  {
    title: "Trending",
    href: "/trending",
    icon: Compass,
    description: "Discover all threads",
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Layers,
    description: "Browse by category",
  },
  {
    title: "Create Thread",
    href: "/create",
    icon: PlusCircle,
    description: "Start a new discussion",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "View your profile",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load user and notifications
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      loadNotifications();
    }
  }, []);

  // Load notifications from localStorage
  const loadNotifications = () => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      // Create sample notifications
      const sampleNotifications: Notification[] = [
        {
          id: 1,
          type: "reply",
          message: "Sarah Chen replied to your thread",
          threadId: 1,
          threadTitle: "Getting Started with Next.js",
          read: false,
          createdAt: "5 minutes ago",
        },

        {
          id: 2,
          type: "mention",
          message: "Mike Johnson mentioned you in a comment",
          threadId: 2,
          threadTitle: "Best practices for React hooks?",
          read: false,
          createdAt: "1 hour ago",
        },

        {
          id: 3,
          type: "like",
          message: "Your thread received 10 new likes",
          threadId: 1,
          threadTitle: "Getting Started with Next.js",
          read: true,
          createdAt: "2 hours ago",
        },
      ];
      setNotifications(sampleNotifications);
      localStorage.setItem(
        "notifications",
        JSON.stringify(sampleNotifications)
      );
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId: number) => {
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);
    router.push(`/thread/${notification.threadId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reply":
        return "💬";
      case "mention":
        return "👤";
      case "like":
        return "❤️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="flex-col h-screen w-64 hidden lg:block bg-gray-100 border-r border-gray-300 relative ">
      {/* HEADER */}
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 linear-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">💬</span>
          </div>
          <h1 className="text-xl font-bold">ForumHub</h1>
        </div>

        {/* User Profile Card with Notification Bell */}
        {user && (
          <div className="bg-stone-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-stone-950">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-800 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors text-purple-400"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION MENU */}
      <nav className="flex-1 p-4 space-y-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start space-x-3 py-6 ${
                isActive
                  ? "bg-gray-200 hover:bg-gray-400 cursor-pointer"
                  : "text-black hover:bg-gray-300 cursor-pointer"
              }`}
              onClick={() => router.push(item.href)}
            >
              <Icon className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs opacity-70 ">{item.description}</span>
              </div>
            </Button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>

      {/* NOTIFICATIONS DROPDOWN */}
      {showNotifications && (
        <div className="absolute top-24 left-full ml-4 w-96 z-50">
          <PageTransition>
            <Card className="shadow-2xl border-slate-300 bg-stone-200">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-500">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto scrollbar-none">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left p-4 border-b border-gray-400 hover:bg-slate-300 transition-colors ${
                          !notification.read ? "bg-slate-400" : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                !notification.read ? "font-semibold" : ""
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 truncate mt-1">
                              {notification.threadTitle}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {notification.createdAt}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        </div>
      )}
    </div>
  );
}
