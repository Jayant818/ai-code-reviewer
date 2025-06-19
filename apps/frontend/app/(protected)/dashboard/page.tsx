"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserProfile } from "@/features/dashboard/components/user-profile";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { SubscriptionStatus } from "@/features/dashboard/components/subscription-status";
import { GitHubAppInstallModal } from "@/src/components/modals/github-app-install-modal";
import { useGitHubAppModal } from "@/src/hooks/useGitHubAppModal";
import { ToastContainer, useToast } from "@/src/components/ui/toast";
import { useGetCurrentUserDetailQuery } from "@/features/user/useUserQuery";
import { useGetOrgIntegrationQuery } from "@/features/integration/useIntegrationQuery";

export default function Dashboard() {
  const router = useRouter();

  // GitHub App Modal
  const { isModalOpen, shouldShowModal, closeModal, markAsInstalled, } = useGitHubAppModal();

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();


  const { data: userData, isLoading: isUserLoading } = useGetCurrentUserDetailQuery();

const { data: orgIntegration, isLoading: isOrgIntegrationLoading, error: orgIntegrationError } = useGetOrgIntegrationQuery({
  orgId: userData?.orgId?.toString() || "", 
  customConfig: {
    enabled: !isUserLoading && !!userData?.orgId, // Only run if userData.orgId exists
  },
});

  if (isUserLoading && isOrgIntegrationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="premium-gradient w-12 h-12 rounded-2xl animate-spin glow-effect"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          className="text-center glass-card p-12 rounded-2xl border-gradient"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4 text-gradient">Authentication Required</h1>
          <p className="text-foreground-muted mb-8 text-lg">Please sign in to access your dashboard.</p>
          <button
            onClick={() => router.push('/')}
            className="premium-gradient text-white px-8 py-4 rounded-xl font-semibold glow-effect hover:scale-105 transition-transform duration-300"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* GitHub App Install Modal */}
      {shouldShowModal && !orgIntegration && (
        <GitHubAppInstallModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onInstalled={markAsInstalled}
          onShowToast={(type, title, message) => {
            if (type === 'success') showSuccess(title, message);
            else if (type === 'error') showError(title, message);
            else showInfo(title, message);
          }}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

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
            Welcome back, <span className="text-gradient">{userData.username}</span>! ⚡
          </motion.h1>
          <motion.p
            className="text-xl text-foreground-muted max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Manage your AI code reviews, monitor performance, and optimize your development workflow
          </motion.p>
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
            {/* GitHub App Installation */}
            {/* <GitHubAppInstall onOpenModal={openModal} /> */}

            {/* Dashboard Stats */}
            <DashboardStats />

            {/* Recent Activity */}
            <RecentActivity />
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* User Profile */}
            <UserProfile userData={userData} />

            {/* Subscription Status */}
            <SubscriptionStatus />

            {/* Quick Actions */}
            <QuickActions />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
