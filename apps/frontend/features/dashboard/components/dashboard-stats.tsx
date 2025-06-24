"use client";

import { motion } from "framer-motion";
import { FaCode, FaBug, FaCheckCircle, FaClock } from "react-icons/fa";

const stats = [
  {
    icon: FaCode,
    label: "Pull Requests Reviewed",
    changeType: "positive" as const,
  },
  {
    icon: FaBug,
    label: "Bugs Detected",
    changeType: "positive" as const,
  },
  {
    icon: FaCheckCircle,
    label: "Issues Resolved",
    changeType: "positive" as const,
  },
  {
    icon: FaClock,
    label: "Avg Review Time",
    changeType: "positive" as const,
  },
];

export function DashboardStats({
  loading,
  reviewsAnalytics,
}: {
  loading: boolean;
  reviewsAnalytics: any;
}) {
  
  const data = stats.map((stat) => {
    return {
      ...stat,
      ...(reviewsAnalytics && reviewsAnalytics[stat.label]),
    }
  })
  
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="glass-card rounded-2xl p-8 border-gradient"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-muted rounded-lg shimmer-effect"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="glass-card rounded-2xl p-8 border-gradient"
    >
      <motion.h2
        className="text-3xl font-bold mb-8 text-gradient"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Performance Analytics
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            className="glass-card rounded-xl p-6 card-hover shimmer-effect group"
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center glow-effect"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.p
                  className="text-3xl font-bold text-gradient"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                >
                  {stat.value ?? 0}
                </motion.p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-semibold">{stat.label}</p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold px-2 py-1 rounded-lg ${
                    stat.changeType === 'positive'
                      ? 'text-success bg-success/20'
                      : 'text-error bg-error/20'
                  }`}
                >
                  {stat.change ?? 0}
                </span>
                <span className="text-sm text-foreground-subtle">vs last month</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
