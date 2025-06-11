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
    primary: "fire-gradient text-white font-semibold hover:fire-glow",
    secondary: "glass-card text-foreground hover:fire-glow border"
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{
        scale: 1.02,
        y: -1
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FaGithub className="w-5 h-5" />
      Continue with GitHub
    </motion.button>
  );
}
