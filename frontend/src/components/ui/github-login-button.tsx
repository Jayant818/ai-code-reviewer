"use client";

import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { cn } from "@/src/lib/utils";

interface GitHubLoginButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

export function GitHubLoginButton({ 
  className, 
  size = "md", 
  variant = "primary",
  onClick 
}: GitHubLoginButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Redirect to GitHub OAuth
      window.location.href = "http://localhost:3001/auth/github/login";
    }
  };

  const sizeClasses = {
    sm: "px-6 py-3 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg"
  };

  const variantClasses = {
    primary: "premium-gradient text-white font-semibold glow-effect shimmer-effect",
    secondary: "glass-card text-foreground border-gradient"
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-3 rounded-xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{
        scale: 1.05,
        y: -3
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <FaGithub className="w-6 h-6" />
      </motion.div>
      <span className="font-bold">Continue with GitHub</span>
    </motion.button>
  );
}
