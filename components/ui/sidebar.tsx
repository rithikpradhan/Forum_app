"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "./page-transition";
import { socket } from "@/lib/socket";
import { Home, PlusCircle, LogOut, User, Bell } from "lucide-react";
import { useEffect, useState } from "react";

type Notification = {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
  };
  type: "reply" | "mention" | "like";
  message: string;
  thread: string;
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
  // {
  //   title: "Trending",
  //   href: "/trending",
  //   icon: Compass,
  //   description: "Discover all threads",
  // },
  // {
  //   title: "Categories",
  //   href: "/categories",
  //   icon: Layers,
  //   description: "Browse by category",
  // },
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
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load user and notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          return;
        }

        const data = await res.json();
        setUser(data.user);
        loadNotifications();
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  // Load notifications from backend
  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  // Listen for real-time notifications
  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.on("newNotification", (notification: Notification) => {
      console.log("🔔 New notification:", notification);
      setNotifications((prev) => [notification, ...prev]);

      // Optional: Show browser notification
      if (Notification.permission === "granted") {
        new Notification(notification.message, {
          body: notification.threadTitle,
          icon: "/logo.png",
        });
      }
    });

    return () => {
      socket.off("newNotification");
    };
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/notifications/mark-all-read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id);
    setShowNotifications(false);
    router.push(`/thread/${notification.thread}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    socket.disconnect();
    router.push("/");
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

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex-col h-screen w-64 hidden lg:block bg-gray-100 border-r border-gray-300 relative">
      {/* HEADER */}
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">ForumHub</h1>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="bg-stone-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION MENU */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start space-x-3 py-6 ${
                isActive ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
              onClick={() => router.push(item.href)}
            >
              <Icon className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs opacity-70">{item.description}</span>
              </div>
            </Button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 cursor-pointer hover:bg-gray-2s00"
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
            <Card className="shadow-2xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${!notification.read ? "font-semibold" : ""}`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {notification.threadTitle}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">
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
