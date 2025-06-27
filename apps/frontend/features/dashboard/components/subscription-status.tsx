"use client";

import { ISubscriptionResponse } from "@/features/subscription/api.types";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCrown, FaRocket, FaArrowUp, FaCalendarAlt } from "react-icons/fa";

export function SubscriptionStatus({
  subscriptionData,
  isSubscriptionLoading,
}: {
    subscriptionData: ISubscriptionResponse | undefined;
    isSubscriptionLoading: boolean;
}) {
  if (isSubscriptionLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card rounded-2xl p-8 border-gradient"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </motion.div>
    );
  }

  if (!subscriptionData?.subscription && !isSubscriptionLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card rounded-2xl p-8 border-gradient card-hover text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-2">
            <FaRocket className="w-7 h-7 text-foreground-muted" />
          </div>
          <h3 className="text-2xl font-bold text-gradient mb-2">
            No Subscription Found
          </h3>
          <p className="text-foreground-muted mb-6">
            You don&apos;t have an active subscription yet. Start your free trial or upgrade to Pro to unlock all features.
          </p>
          <Link
            href="/plans"
            className="premium-gradient text-white px-6 py-4 rounded-xl font-semibold glow-effect hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <FaCrown className="w-4 h-4" />
            View Plans
          </Link>
        </div>
      </motion.div>
    );
  }

  // Default to free plan if no subscription data or error
  const currentPlan = subscriptionData?.subscription?.plan;
  const isProPlan = currentPlan === 'pro';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="glass-card rounded-2xl p-8 border-gradient card-hover"
    >
      <div className="flex items-center gap-4 mb-6">
        <motion.div 
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isProPlan ? 'premium-gradient glow-effect' : 'bg-muted'
          }`}
          whileHover={{ scale: 1.1, rotate: 15 }}
          transition={{ duration: 0.3 }}
        >
          {isProPlan ? (
            <FaCrown className="w-7 h-7 text-white" />
          ) : (
            <FaRocket className="w-7 h-7 text-foreground-muted" />
          )}
        </motion.div>
        
        <div>
          <h3 className="text-2xl font-bold text-gradient">
            {isProPlan ? 'Pro Plan' : 'Free Trial'}
          </h3>
          <p className="text-foreground-muted">
            {isProPlan ? 'Unlimited AI reviews' : 'Limited to 10 reviews/month'}
          </p>
        </div>
      </div>

      {/* Plan Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 glass-card rounded-xl">
          <span className="text-foreground-muted">Status</span>
          <span className={`font-semibold ${
            isProPlan ? 'text-success' : 'text-warning'
          }`}>
            {subscriptionData?.status }
          </span>
        </div>
        
        {subscriptionData?.subscription?.expiresAt && (
          <div className="flex items-center justify-between p-4 glass-card rounded-xl">
            <span className="text-foreground-muted flex items-center gap-2">
              <FaCalendarAlt className="w-4 h-4" />
              Next Billing
            </span>
            <span className="font-semibold">
              {new Date(subscriptionData?.subscription?.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      {!isProPlan ? (
        <Link
          href="/plans"
          className="w-full premium-gradient text-white px-6 py-4 rounded-xl font-semibold glow-effect hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <FaArrowUp className="w-4 h-4" />
          Upgrade to Pro
        </Link>
      ) : (
        <div className="text-center">
          <p className="text-success font-semibold mb-2">✨ You're on Pro!</p>
          <Link
            href="/plans"
            className="text-foreground-muted hover:text-foreground transition-colors text-sm"
          >
            Manage Subscription
          </Link>
        </div>
      )}
    </motion.div>
  );
}
