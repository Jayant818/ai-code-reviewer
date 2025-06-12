"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaCode, FaCog, FaQuestionCircle, FaSignOutAlt, FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";

const actions = [
  {
    icon: FaCode,
    label: "Try Code Review",
    description: "Test the AI reviewer",
    href: "/try",
    color: "fire-gradient",
  },
  {
    icon: FaGithub,
    label: "View Repositories",
    description: "Manage GitHub repos",
    href: "https://github.com",
    color: "bg-gray-700",
    external: true,
  },
  {
    icon: FaCog,
    label: "Settings",
    description: "Configure preferences",
    href: "/profile",
    color: "bg-blue-600",
  },
  {
    icon: FaQuestionCircle,
    label: "Help & Support",
    description: "Get assistance",
    href: "/help",
    color: "bg-green-600",
  },
];

export function QuickActions() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to home
    router.push('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card rounded-lg p-6"
    >
      <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
          >
            {action.external ? (
              <a
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 glass-card rounded-lg hover:fire-glow transition-all duration-300 group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </a>
            ) : (
              <Link
                href={action.href}
                className="flex items-center gap-3 p-3 glass-card rounded-lg hover:fire-glow transition-all duration-300 group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            )}
          </motion.div>
        ))}
        
        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 + actions.length * 0.05 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 glass-card rounded-lg hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 group"
        >
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <FaSignOutAlt className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-sm">Sign Out</p>
            <p className="text-xs text-muted-foreground">End your session</p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
