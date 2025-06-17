"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaGithub, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "@/lib/hooks";

interface UserData {
  username: string;
  email: string;
  githubId: number;
  avatar: string;
}

export default function Profile() {
  const router = useRouter();
  const { session, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    // Load user data (in a real app, fetch from API)
    setUserData({
      username: 'Jayant818',
      email: 'yadavjayant2003+1@gmail.com',
      githubId: 85480558,
      avatar: 'https://avatars.githubusercontent.com/u/85480558?v=4',
    });
    
    setIsLoading(false);
  }, [isAuthenticated]);

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and integrations
          </p>
        </motion.div>

          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 glass-card rounded-lg p-6"
          >
            <h2 className="text-xl font-bold mb-6">Account Information</h2>
            
            <div className="flex items-center gap-6 mb-8">
              {/* <Image
                src={userData.avatar}
                alt={userData.username}
                width={80}
                height={80}
                className="rounded-full ring-2 ring-primary/20"
              /> */}
              <div>
                <h3 className="text-2xl font-bold">{userData.username}</h3>
                <p className="text-muted-foreground">{userData.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <FaGithub className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">GitHub ID: {userData.githubId}</span>
                </div>
              </div>
            </div>

            {/* GitHub Integration */}
            <div className="space-y-6">
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaGithub className="w-6 h-6" />
                    <div>
                      <h3 className="font-semibold">GitHub Integration</h3>
                      <p className="text-sm text-muted-foreground">Connected and active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
      </div>
    </div>
  );
}
