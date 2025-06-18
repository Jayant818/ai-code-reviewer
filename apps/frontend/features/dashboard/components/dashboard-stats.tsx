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
        {stats.map((stat, index) => (
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
                  {stat.value}
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
                  {stat.change}
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
