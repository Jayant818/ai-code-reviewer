import { ILoggedInUser } from "@/features/user/api.types";
import { IUser } from "@/features/user/user.schema";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaCog } from "react-icons/fa";


interface IUserProfile {
  userData: IUser | undefined;
  className?: string;
  isConnected?: boolean;
}

export function UserProfile({ userData, isConnected = false }: IUserProfile) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="glass-card rounded-2xl p-8 card-hover border-gradient"
    >
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={userData?.avatar}
              alt={userData?.username}
              width={80}
              height={80}
              className="rounded-2xl ring-4 ring-primary/30 glow-effect"
            />
          </motion.div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-background flex items-center justify-center glow-effect">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gradient">{userData?.username}</h3>
          <p className="text-foreground-muted text-lg">{userData?.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* GitHub Connection */}
        <motion.div
          className="flex items-center justify-between p-5 glass-card rounded-xl card-hover"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center">
              <FaGithub className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">GitHub</p>
              <p className="text-sm text-foreground-muted">ID: {userData?.githubId}</p>
            </div>
          </div>
          {
            isConnected ? (
              <span className="bg-green-500 w-3 h-3 rounded-full"></span>
            ): (
              <span className="text-warning text-sm">Not Connected</span>
            )
          }
        </motion.div>
      </div>

      {/* Profile Actions */}
      <div className="mt-8 pt-8 border-t border-glass-border">
        <Link
          href="/profile"
          className="flex items-center gap-3 text-foreground-muted hover:text-foreground transition-all duration-300 group"
        >
          <FaCog className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium">Manage Profile</span>
        </Link>
      </div>
    </motion.div>
  );
}
