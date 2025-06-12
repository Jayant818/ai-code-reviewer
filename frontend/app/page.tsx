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
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl floating" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-32"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="text-gradient">AI-Powered</span>
              <br />
              <span className="text-white">Code Reviews</span>
            </h1>
            <div className="w-24 h-1 premium-gradient mx-auto rounded-full mb-8"></div>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-foreground-muted max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Transform your development workflow with intelligent code analysis.
            Catch bugs before they ship, improve code quality, and accelerate your team's velocity
            with AI that understands your codebase.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <GitHubLoginButton size="lg" />
            <Link
              className="group flex gap-3 items-center px-8 py-4 glass-card text-foreground rounded-xl glow-effect transition-all duration-500 text-lg font-medium border-gradient"
              href="/try"
            >
              <span>Experience Demo</span>
              <IoIosLink className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-8 text-foreground-subtle text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Real-time Analysis</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="grid md:grid-cols-2 gap-8 mb-32"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 + 0.1 * index }}
              className="glass-card rounded-xl p-8 card-hover group shimmer-effect"
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <motion.div
                    className="w-16 h-16 premium-gradient rounded-xl flex items-center justify-center glow-effect"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3 text-gradient">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-muted leading-relaxed text-lg">
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
          transition={{ duration: 0.8, delay: 1.4 }}
          className="glass-card rounded-2xl p-12 mb-24 border-gradient"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
              How it Works
            </h2>
            <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
              Get started in minutes with our streamlined integration process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              <motion.div
                className="w-20 h-20 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 glow-effect group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 15 }}
              >
                <span className="text-white font-bold text-2xl">1</span>
              </motion.div>
              <h3 className="font-bold mb-4 text-xl text-gradient">Connect GitHub</h3>
              <p className="text-foreground-muted leading-relaxed">
                Seamlessly integrate with your GitHub repositories using secure OAuth authentication
              </p>
            </motion.div>

            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.6 }}
            >
              <motion.div
                className="w-20 h-20 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 glow-effect group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: -15 }}
              >
                <span className="text-white font-bold text-2xl">2</span>
              </motion.div>
              <h3 className="font-bold mb-4 text-xl text-gradient">Install App</h3>
              <p className="text-foreground-muted leading-relaxed">
                Deploy our intelligent GitHub App to monitor and analyze your code repositories
              </p>
            </motion.div>

            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            >
              <motion.div
                className="w-20 h-20 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 glow-effect group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: 15 }}
              >
                <span className="text-white font-bold text-2xl">3</span>
              </motion.div>
              <h3 className="font-bold mb-4 text-xl text-gradient">Get Reviews</h3>
              <p className="text-foreground-muted leading-relaxed">
                Receive instant, intelligent code reviews with actionable insights on every pull request
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Security & Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4 }}
          className="text-center"
        >
          <motion.div
            className="glass-card rounded-2xl p-8 max-w-4xl mx-auto border-gradient"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-gradient">Enterprise-Grade Security</h3>
            </div>
            <p className="text-lg text-foreground-muted leading-relaxed max-w-3xl mx-auto">
              Your code remains completely private and secure. We analyze pull requests in real-time
              without storing any of your source code. Built with enterprise-grade security standards
              and SOC 2 compliance.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-foreground-subtle">Zero Data Storage</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-foreground-subtle">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-foreground-subtle">End-to-End Encryption</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}