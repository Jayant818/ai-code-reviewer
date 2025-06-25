"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaGithub, FaArrowLeft } from "react-icons/fa";
import { useGetCurrentUserDetailQuery } from "@/features/user/useUserQuery";
import Image from "next/image";
import { useGetOrgIntegrationQuery } from "@/features/integration/useIntegrationQuery";
import Spinner from "@/components/shared/Spinner";

export default function Profile() {
  const router = useRouter();
  const { data: userData, isLoading: isUserLoading } = useGetCurrentUserDetailQuery();
  const { data: orgIntegration, isLoading: isOrgIntegrationLoading } = useGetOrgIntegrationQuery({
    customConfig: {
      enabled: !isUserLoading && !!userData?.orgId,
    },
  });

  if (isUserLoading) {
    return (
      <Spinner/>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and integrations
          </p>
        </motion.div>

          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 glass-card rounded-lg p-6"
          >
            <h2 className="text-xl font-bold mb-6">Account Information</h2>
            
            <div className="flex items-center gap-6 mb-8">
              <Image
                src={userData.avatar}
                alt={userData.username}
                width={80}
                height={80}
                className="rounded-full ring-2 ring-primary/20"
              />
              <div>
                <h3 className="text-2xl font-bold">{userData.username}</h3>
                <p className="text-muted-foreground">{userData.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <FaGithub className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">GitHub ID: {userData.githubId}</span>
                </div>
              </div>
            </div>

            {/* GitHub Integration */}
            <div className="space-y-6">
              <div className="p-4 glass-card rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaGithub className="w-6 h-6" />
                    <div>
                      <h3 className="font-semibold">GitHub Integration</h3>
                    </div>
                  </div>
                <div className="flex items-center gap-2">
                  {
                    isOrgIntegrationLoading ? (
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    ) : orgIntegration ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )
                  }
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
      </div>
    </div>
  );
}
