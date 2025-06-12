"use client";

import { motion } from "framer-motion";
import { FaCode, FaBug, FaCheckCircle, FaClock } from "react-icons/fa";

const stats = [
  {
    icon: FaCode,
    label: "Pull Requests Reviewed",
    value: "24",
    change: "+12%",
    changeType: "positive" as const,
  },
  {
    icon: FaBug,
    label: "Bugs Detected",
    value: "18",
    change: "-8%",
    changeType: "positive" as const,
  },
  {
    icon: FaCheckCircle,
    label: "Issues Resolved",
    value: "15",
    change: "+25%",
    changeType: "positive" as const,
  },
  {
    icon: FaClock,
    label: "Avg Review Time",
    value: "2.3m",
    change: "-15%",
    changeType: "positive" as const,
  },
];

export function DashboardStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="glass-card rounded-lg p-6"
    >
      <h2 className="text-xl font-bold mb-6">Your Stats</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            className="glass-card rounded-lg p-4 hover:fire-glow transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 fire-gradient rounded-lg flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">{stat.label}</p>
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-medium ${
                    stat.changeType === 'positive' 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
