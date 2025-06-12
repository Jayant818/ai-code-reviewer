"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft, FaQuestionCircle, FaGithub, FaEnvelope } from "react-icons/fa";

const faqs = [
  {
    question: "How do I install the GitHub App?",
    answer: "Go to your dashboard and click on 'Install GitHub App'. You'll be redirected to GitHub where you can authorize and install the app on your repositories."
  },
  {
    question: "What does the AI reviewer check for?",
    answer: "Our AI reviews code for bugs, security vulnerabilities, performance issues, code quality, and best practices. It provides detailed feedback and suggestions for improvement."
  },
  {
    question: "How do I connect my Stripe account?",
    answer: "Visit your profile page and click on 'Connect Stripe' in the Payment Integration section. You'll be guided through the Stripe Connect flow."
  },
  {
    question: "Is my code data secure?",
    answer: "Yes! We only analyze pull requests in real-time and never store your code on our servers. Your data privacy and security are our top priorities."
  },
  {
    question: "How much does it cost?",
    answer: "We offer a free tier with basic features. Premium features are available through our paid plans. Check our pricing page for more details."
  }
];

export default function Help() {
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
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">
            Find answers to common questions and get support
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaQuestionCircle className="w-5 h-5 fire-accent" />
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                    className="glass-card rounded-lg p-4"
                  >
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <a
                  href="mailto:support@bugcatcher.dev"
                  className="flex items-center gap-3 p-3 glass-card rounded-lg hover:fire-glow transition-all duration-300"
                >
                  <FaEnvelope className="w-5 h-5 fire-accent" />
                  <div>
                    <p className="font-medium text-sm">Email Support</p>
                    <p className="text-xs text-muted-foreground">support@bugcatcher.dev</p>
                  </div>
                </a>
                
                <a
                  href="https://github.com/jayant818/ai-code-reviewer/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 glass-card rounded-lg hover:fire-glow transition-all duration-300"
                >
                  <FaGithub className="w-5 h-5 fire-accent" />
                  <div>
                    <p className="font-medium text-sm">GitHub Issues</p>
                    <p className="text-xs text-muted-foreground">Report bugs or request features</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="glass-card rounded-lg p-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/try" className="block text-sm fire-accent hover:underline">
                  Try the AI Reviewer
                </Link>
                <Link href="/dashboard" className="block text-sm fire-accent hover:underline">
                  Dashboard
                </Link>
                <Link href="/profile" className="block text-sm fire-accent hover:underline">
                  Profile Settings
                </Link>
                <a 
                  href="https://github.com/apps/bug-checker" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm fire-accent hover:underline"
                >
                  GitHub App
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
