"use client";
import Link from "next/link";
import { IoIosLink } from "react-icons/io";
import { motion } from "framer-motion";
import { GitHubLoginButton } from "@/features/home/components";
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
      {/* Simplified Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <div className="mb-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI-Powered</span>
              <br />
              <span className="text-white">Code Reviews</span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-8"></div>
          </div>

          <motion.p
            className="text-xl text-foreground-muted max-w-3xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Transform your development workflow with intelligent code analysis.
            Catch bugs before they ship and improve code quality with AI that understands your codebase.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-5 mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <GitHubLoginButton size="lg" />
            <Link
              className="flex items-center justify-center px-6 py-3.5 bg-foreground-muted/10 hover:bg-foreground-muted/20 border border-foreground-muted/20 rounded-lg text-foreground transition-all duration-300 text-base font-medium gap-2"
              href="/try"
              target="_blank"
            >
              <span>Experience Demo</span>
              <IoIosLink className="transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6 mb-24"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + 0.1 * index }}
              className="bg-foreground-muted/5 backdrop-blur-sm rounded-xl p-6 border border-foreground-muted/10 hover:border-foreground-muted/20 transition-colors"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-muted">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* How it Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="bg-foreground-muted/5 backdrop-blur-sm rounded-xl p-8 mb-20 border border-foreground-muted/10"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              How it Works
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Get started in minutes with our streamlined integration process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((step, index) => (
              <motion.div
                key={step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + 0.2 * index, duration: 0.5 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-5">
                  <span className="text-white font-bold text-xl">{step}</span>
                </div>
                <h3 className="font-semibold mb-3 text-lg">
                  {index === 0 && "Connect GitHub"}
                  {index === 1 && "Install App"}
                  {index === 2 && "Get Reviews"}
                </h3>
                <p className="text-foreground-muted text-sm">
                  {index === 0 && "Seamlessly integrate with your GitHub repositories using secure OAuth"}
                  {index === 1 && "Deploy our intelligent GitHub App to monitor and analyze your code"}
                  {index === 2 && "Receive instant, intelligent code reviews with actionable insights"}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="bg-foreground-muted/5 backdrop-blur-sm rounded-xl p-8 border border-foreground-muted/10">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold">Advanced Security</h3>
            </div>
            <p className="text-foreground-muted">
              Your code remains completely private and secure. We analyze pull requests in real-time
              without storing any of your source code.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}