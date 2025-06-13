"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserProfile } from "@/src/components/dashboard/user-profile";
import { GitHubAppInstall } from "@/src/components/dashboard/github-app-install";
import { DashboardStats } from "@/src/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/src/components/dashboard/recent-activity";
import { QuickActions } from "@/src/components/dashboard/quick-actions";
import { SubscriptionStatus } from "@/src/components/dashboard/subscription-status";

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
    }

    // Always load user data for demo purposes
    setUserData({
      username: 'Jayant818',
      email: 'yadavjayant2003+1@gmail.com',
      githubId: 85480558,
      avatar: 'https://avatars.githubusercontent.com/u/85480558?v=4',
      stripeAccountId: null,
    });

    setIsLoading(false);
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="premium-gradient w-12 h-12 rounded-2xl animate-spin glow-effect"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center glass-card p-12 rounded-2xl border-gradient"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4 text-gradient">Authentication Required</h1>
          <p className="text-foreground-muted mb-8 text-lg">Please sign in to access your dashboard.</p>
          <button
            onClick={() => router.push('/')}
            className="premium-gradient text-white px-8 py-4 rounded-xl font-semibold glow-effect hover:scale-105 transition-transform duration-300"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome back, <span className="text-gradient">{userData.username}</span>! ⚡
          </motion.h1>
          <motion.p
            className="text-xl text-foreground-muted max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Manage your AI code reviews, monitor performance, and optimize your development workflow
          </motion.p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <motion.div
            className="lg:col-span-2 space-y-12"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* GitHub App Installation */}
            <GitHubAppInstall />

            {/* Dashboard Stats */}
            <DashboardStats />

            {/* Recent Activity */}
            <RecentActivity />
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* User Profile */}
            <UserProfile userData={userData} />

            {/* Subscription Status */}
            <SubscriptionStatus />

            {/* Quick Actions */}
            <QuickActions />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
