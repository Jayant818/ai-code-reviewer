"use client";

import { motion } from "framer-motion";
import { UserProfile } from "@/features/dashboard/components/user-profile";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { SubscriptionStatus } from "@/features/dashboard/components/subscription-status";
import { useGetCurrentUserDetailQuery } from "@/features/user/useUserQuery";
import { useGetOrgIntegrationQuery } from "@/features/integration/useIntegrationQuery";
import { useGetRecentReviewQuery, useGetReviewsAnalyticsQuery } from "@/features/review/useReviewQuery";
import { useGetOrgSubscriptionQuery } from "@/features/subscription/useSubscriptionQuery";

export default function DashboardWrapper() {

  const { data: userData, isLoading: isUserLoading } = useGetCurrentUserDetailQuery();

  const { data: orgIntegration, isLoading: isOrgIntegrationLoading } = useGetOrgIntegrationQuery({
    customConfig: {
      enabled: !isUserLoading && !!userData?.orgId,
    },
  });

  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useGetOrgSubscriptionQuery();

  const { data: reviewsAnalytics, isLoading: isReviewsAnalyticsLoading } = useGetReviewsAnalyticsQuery()
  
  const {data:recentReviews, isLoading: isRecentReviewsLoading} = useGetRecentReviewQuery()
  
  if (isUserLoading ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="premium-gradient w-12 h-12 rounded-2xl animate-spin glow-effect"></div>
      </div>
    );
  }

  const isConnected = orgIntegration && Object.keys(orgIntegration).length > 0;

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
            Welcome back, <span className="text-gradient">{userData?.username}</span>! ⚡
          </motion.h1>
          <motion.p
            className="text-xl text-foreground-muted max-w-2xl mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Manage your AI code reviews, monitor performance, and optimize your development workflow
          </motion.p>
          
          {/* Reviews Left Display */}
          {subscriptionData?.reviewsLeft !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                subscriptionData.reviewsLeft < 2 
                  ? "bg-red-500/10 border-red-500/20" 
                  : "bg-primary/10 border-primary/20"
              }`}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                subscriptionData.reviewsLeft < 2 ? "bg-red-500" : "bg-primary"
              }`}></div>
              <span className="text-sm font-medium">
                Reviews Remaining: <span className={`font-bold ${
                  subscriptionData.reviewsLeft < 2 ? "text-red-500" : "text-primary"
                }`}>{subscriptionData.reviewsLeft}</span>
              </span>
            </motion.div>
          )}
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
            {/* Dashboard Stats */}
            <DashboardStats loading={isReviewsAnalyticsLoading} reviewsAnalytics={reviewsAnalytics} />

            {/* Recent Activity */}
            <RecentActivity isLoading={isRecentReviewsLoading} recentReviews={recentReviews} />
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* User Profile */}
            <UserProfile userData={userData} isConnected={isConnected} />

            {/* Subscription Status */}
            <SubscriptionStatus isSubscriptionLoading={isSubscriptionLoading} subscriptionData={subscriptionData} />

            {/* Quick Actions */}
            <QuickActions />
          </motion.div>
        </div>
      </div>
    </div>
  );
}