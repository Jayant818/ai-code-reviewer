"use client";

import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";

// const activities = [
//   {
//     id: 1,
//     type: "review",
//     icon: FaGithub,
//     title: "Code review completed",
//     description: "PR #123 in jayant818/my-awesome-project",
//     time: "2 minutes ago",
//     status: "completed",
//   },
//   {
//     id: 2,
//     type: "bug",
//     icon: FaBug,
//     title: "Bug detected",
//     description: "Potential null pointer exception in auth.js",
//     time: "15 minutes ago",
//     status: "warning",
//   },
//   {
//     id: 3,
//     type: "resolved",
//     icon: FaCheckCircle,
//     title: "Issue resolved",
//     description: "Fixed security vulnerability in dependencies",
//     time: "1 hour ago",
//     status: "success",
//   },
//   {
//     id: 4,
//     type: "review",
//     icon: FaGithub,
//     title: "Code review completed",
//     description: "PR #122 in jayant818/bug-catcher-frontend",
//     time: "3 hours ago",
//     status: "completed",
//   },
//   {
//     id: 5,
//     type: "warning",
//     icon: FaExclamationTriangle,
//     title: "Code quality warning",
//     description: "Complex function detected in utils.ts",
//     time: "5 hours ago",
//     status: "warning",
//   },
// ];

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "text-green-400";
    case "warning":
      return "text-yellow-400";
    case "completed":
      return "text-blue-400";
    default:
      return "text-muted-foreground";
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-500/20";
    case "warning":
      return "bg-yellow-500/20";
    case "completed":
      return "bg-blue-500/20";
    default:
      return "bg-muted/20";
  }
};

export function RecentActivity({ isLoading, recentReviews }: { isLoading: boolean; recentReviews: any[] }) {
  // console.log(JSON.stringify(recentReviews));
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-card rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <button className="text-sm fire-accent hover:underline">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {(recentReviews || []).length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg font-semibold mb-2">No recent activity found</p>
            <p className="text-sm">Your recent code reviews will appear here.</p>
          </div>
        ) : (
          recentReviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="flex items-start gap-3 p-3 glass-card rounded-lg hover:fire-glow transition-all duration-300"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusBg(review.status)}`}>
                <FaGithub className={`w-4 h-4 ${getStatusColor(review.status)}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{review.pullRequestTitle}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {review.author}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(review.reviewRequestedAt).toString()}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
