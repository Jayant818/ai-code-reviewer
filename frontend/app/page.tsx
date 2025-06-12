"use client";
import Link from "next/link";
import { IoIosLink } from "react-icons/io";
import { motion } from "framer-motion";
import { GitHubLoginButton } from "@/src/components/ui";
import { FaCode, FaShieldAlt, FaRocket, FaUsers } from "react-icons/fa";

const features = [
  {
    icon: FaRocket,
    title: "Fast Setup",
    description: "Connect your GitHub repositories and start getting AI reviews in under 2 minutes"
  },
  {
    icon: FaCode,
    title: "Smart Analysis",
    description: "Advanced AI detects bugs, security issues, and suggests improvements automatically"
  },
  {
    icon: FaShieldAlt,
    title: "Secure & Private",
    description: "Your code stays in GitHub. We only analyze pull requests, never store your data"
  },
  {
    icon: FaUsers,
    title: "Team Ready",
    description: "Works seamlessly with your existing GitHub workflow and team collaboration"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            AI Code Reviews
            <span className="fire-accent"> 🔥</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Get instant, intelligent code reviews on every GitHub pull request.
            Catch bugs, improve quality, and ship with confidence.
          </motion.p>

          {/* Main CTA */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <GitHubLoginButton size="lg" />
            <Link
              className="flex gap-2 items-center px-8 py-4 glass-card text-foreground rounded-lg hover:fire-glow transition-all duration-300 text-lg font-medium text-center"
              href="/try"
            >
              Try Demo <IoIosLink />
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + 0.1 * index }}
              className="glass-card rounded-lg p-6 hover:fire-glow transition-all duration-300 group"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 fire-gradient rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* How it Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="glass-card rounded-lg p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            How it Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <div className="w-16 h-16 fire-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold mb-3 text-lg">Connect GitHub</h3>
              <p className="text-muted-foreground">
                Authorize BugCatcher to access your repositories with GitHub OAuth
              </p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <div className="w-16 h-16 fire-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold mb-3 text-lg">Install App</h3>
              <p className="text-muted-foreground">
                Install the GitHub App on repositories you want to review
              </p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="w-16 h-16 fire-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold mb-3 text-lg">Get Reviews</h3>
              <p className="text-muted-foreground">
                Receive AI-powered code reviews automatically on every pull request
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="text-center"
        >
          <div className="glass-card rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-muted-foreground">
              🔒 <strong>Privacy First:</strong> Your code is never stored on our servers.
              We only analyze pull requests in real-time and respect your data privacy.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}