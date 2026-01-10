// src/app/page.tsx
// This is the LANDING PAGE - first page users see
// Shows login/signup forms before entering the app

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LandingPage() {
  // useRouter lets us navigate to different pages programmatically
  const router = useRouter();

  // Track which form to show: 'login' or 'signup'
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Store form input values
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "", // Only used for signup
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload

    // In a REAL app, you'd:
    // 1. Send data to your backend API
    // 2. Verify credentials with database
    // 3. Create a session/JWT token
    // 4. Store user info in localStorage or cookies

    // For learning purposes, we'll simulate authentication
    // Store user info in localStorage (browser storage)
    const user = {
      name: formData.name || formData.email.split("@")[0], // Extract name from email if not provided
      email: formData.email,
      loggedIn: true,
    };

    // localStorage.setItem saves data in the browser
    // JSON.stringify converts JavaScript object to text
    localStorage.setItem("user", JSON.stringify(user));

    // Navigate to dashboard after "login"
    router.push("/home");
  };

  return (
    // Full screen container with gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* Main content container */}
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* LEFT SIDE - Branding & Description */}
        <div className="text-white space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold">💬 ForumHub</h1>
            <p className="text-2xl font-light">
              Connect, Share, and Learn Together
            </p>
          </div>

          <div className="space-y-4 text-lg">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="font-semibold">Share Your Ideas</h3>
                <p className="text-blue-100">
                  Start discussions on topics youre passionate about
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="font-semibold">Learn from Others</h3>
                <p className="text-blue-100">
                  Discover insights from our vibrant community
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">🤝</span>
              <div>
                <h3 className="font-semibold">Build Connections</h3>
                <p className="text-blue-100">
                  Network with like-minded individuals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Login/Signup Form */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Sign up to start sharing your ideas"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Show Name field only for signup */}
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required={mode === "signup"}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Email field - shown for both login and signup */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {/* Submit button - text changes based on mode */}
              <Button type="submit" className="w-full" size="lg">
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* Divider line */}
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            {/* Toggle between login and signup */}
            <div className="text-center text-sm">
              {mode === "login" ? (
                <p>
                  Dont have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
