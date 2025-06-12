"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserProfile } from "@/src/components/dashboard/user-profile";
import { GitHubAppInstall } from "@/src/components/dashboard/github-app-install";
import { DashboardStats } from "@/src/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/src/components/dashboard/recent-activity";
import { QuickActions } from "@/src/components/dashboard/quick-actions";

interface UserData {
  username: string;
  email: string;
  githubId: number;
  avatar: string;
  stripeAccountId: string | null;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract tokens from URL parameters
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Clean up URL by removing query parameters
      router.replace('/dashboard');
      
      // Decode JWT to get user data (in a real app, you'd fetch this from your API)
      // For now, using the provided mock data
      setUserData({
        username: 'Jayant818',
        email: 'yadavjayant2003+1@gmail.com',
        githubId: 85480558,
        avatar: 'https://avatars.githubusercontent.com/u/85480558?v=4',
        stripeAccountId: null,
      });
    } else {
      // Check if tokens exist in localStorage
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (storedToken && storedRefreshToken) {
        // User is already authenticated, load user data
        setUserData({
          username: 'Jayant818',
          email: 'yadavjayant2003+1@gmail.com',
          githubId: 85480558,
          avatar: 'https://avatars.githubusercontent.com/u/85480558?v=4',
          stripeAccountId: null,
        });
      } else {
        // No authentication, redirect to home
        router.push('/');
        return;
      }
    }
    
    setIsLoading(false);
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fire-gradient w-8 h-8 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your dashboard.</p>
          <button 
            onClick={() => router.push('/')}
            className="fire-gradient text-white px-6 py-3 rounded-lg font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userData.username}! 🔥
          </h1>
          <p className="text-muted-foreground">
            Manage your AI code reviews and GitHub integrations
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* GitHub App Installation */}
            <GitHubAppInstall />
            
            {/* Dashboard Stats */}
            <DashboardStats />
            
            {/* Recent Activity */}
            <RecentActivity />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* User Profile */}
            <UserProfile userData={userData} />
            
            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
