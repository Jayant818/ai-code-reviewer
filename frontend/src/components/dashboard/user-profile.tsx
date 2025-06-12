"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaStripe, FaCog } from "react-icons/fa";

interface UserData {
  username: string;
  email: string;
  githubId: number;
  avatar: string;
  stripeAccountId: string | null;
}

interface UserProfileProps {
  userData: UserData;
}

export function UserProfile({ userData }: UserProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-card rounded-lg p-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          {/* <Image
            src={userData.avatar}
            alt={userData.username}
            width={64}
            height={64}
            className="rounded-full ring-2 ring-primary/20"
          /> */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold">{userData.username}</h3>
          <p className="text-muted-foreground text-sm">{userData.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* GitHub Connection */}
        <div className="flex items-center justify-between p-3 glass-card rounded-lg">
          <div className="flex items-center gap-3">
            <FaGithub className="w-5 h-5 text-foreground" />
            <div>
              <p className="font-medium">GitHub</p>
              <p className="text-sm text-muted-foreground">ID: {userData.githubId}</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>

        {/* Stripe Connection */}
        <div className="flex items-center justify-between p-3 glass-card rounded-lg">
          <div className="flex items-center gap-3">
            <FaStripe className="w-5 h-5 text-foreground" />
            <div>
              <p className="font-medium">Stripe</p>
              <p className="text-sm text-muted-foreground">
                {userData.stripeAccountId ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          {userData.stripeAccountId ? (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          ) : (
            <Link
              href="/profile"
              className="text-xs fire-accent hover:underline font-medium"
            >
              Connect
            </Link>
          )}
        </div>
      </div>

      {/* Profile Actions */}
      <div className="mt-6 pt-6 border-t border-border">
        <Link
          href="/profile"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FaCog className="w-4 h-4" />
          Manage Profile
        </Link>
      </div>
    </motion.div>
  );
}
