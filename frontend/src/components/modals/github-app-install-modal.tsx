"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaTimes, FaCheck, FaExternalLinkAlt, FaShieldAlt, FaRocket, FaBolt } from "react-icons/fa";

interface GitHubAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export function GitHubAppInstallModal({ isOpen, onClose, onInstalled, onShowToast }: GitHubAppInstallModalProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStep, setInstallStep] = useState(1);

  const handleInstallApp = () => {
    setIsInstalling(true);
    setInstallStep(2);
    
    // Open GitHub App installation page
    window.open('https://github.com/apps/bug-checker', '_blank');
    
    // Simulate installation process
    setTimeout(() => {
      setInstallStep(3);
      setIsInstalling(false);
    }, 3000);
  };

  const handleMarkAsInstalled = () => {
    // Store in localStorage that user has installed the app
    localStorage.setItem('githubAppInstalled', 'true');

    // Show success toast
    if (onShowToast) {
      onShowToast('success', 'GitHub App Installed! 🎉', 'You can now receive AI code reviews on your pull requests.');
    }

    onInstalled();
    onClose();
  };

  const handleSkip = () => {
    // Store in localStorage that user skipped (show again later)
    localStorage.setItem('githubAppSkipped', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative glass-card rounded-2xl p-8 max-w-2xl w-full border-gradient"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-xl glass-card hover:glow-effect transition-all duration-300 flex items-center justify-center group"
          >
            <FaTimes className="w-5 h-5 text-foreground-muted group-hover:text-foreground transition-colors" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-20 h-20 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 glow-effect"
            >
              <FaGithub className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold mb-3 text-gradient"
            >
              Install GitHub App
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-foreground-muted text-lg"
            >
              Connect BugCatcher to your repositories to start receiving AI-powered code reviews
            </motion.p>
          </div>

          {/* Installation Steps */}
          <div className="space-y-6 mb-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                installStep >= 1 ? 'glass-card' : 'opacity-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                installStep >= 2 ? 'bg-success' : 'premium-gradient'
              }`}>
                {installStep >= 2 ? (
                  <FaCheck className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-bold">1</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Click Install App</h3>
                <p className="text-foreground-muted text-sm">
                  You'll be redirected to GitHub to authorize the app
                </p>
              </div>
              <FaExternalLinkAlt className="w-4 h-4 text-foreground-muted" />
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                installStep >= 2 ? 'glass-card' : 'opacity-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                installStep >= 3 ? 'bg-success' : installStep >= 2 ? 'premium-gradient' : 'bg-muted'
              }`}>
                {installStep >= 3 ? (
                  <FaCheck className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-bold">2</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Select Repositories</h3>
                <p className="text-foreground-muted text-sm">
                  Choose which repositories you want to enable AI reviews for
                </p>
              </div>
              {installStep === 2 && (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                installStep >= 3 ? 'glass-card' : 'opacity-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                installStep >= 3 ? 'bg-success' : 'bg-muted'
              }`}>
                {installStep >= 3 ? (
                  <FaCheck className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-bold">3</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Start Reviewing</h3>
                <p className="text-foreground-muted text-sm">
                  Create a pull request to see AI reviews in action
                </p>
              </div>
            </motion.div>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="glass-card rounded-xl p-6 mb-8"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaShieldAlt className="w-5 h-5 text-success" />
              What you'll get:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FaBolt className="w-4 h-4 text-warning" />
                <span className="text-sm">Instant bug detection</span>
              </div>
              <div className="flex items-center gap-3">
                <FaShieldAlt className="w-4 h-4 text-success" />
                <span className="text-sm">Security vulnerability scanning</span>
              </div>
              <div className="flex items-center gap-3">
                <FaRocket className="w-4 h-4 text-info" />
                <span className="text-sm">Performance optimization tips</span>
              </div>
              <div className="flex items-center gap-3">
                <FaCheck className="w-4 h-4 text-primary" />
                <span className="text-sm">Code quality improvements</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {installStep < 3 ? (
              <>
                <button
                  onClick={handleInstallApp}
                  disabled={isInstalling}
                  className="flex-1 premium-gradient text-white px-6 py-4 rounded-xl font-semibold glow-effect hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isInstalling ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Installing...
                    </>
                  ) : (
                    <>
                      <FaGithub className="w-5 h-5" />
                      Install GitHub App
                    </>
                  )}
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-4 glass-card text-foreground rounded-xl font-medium hover:glow-effect transition-all duration-300"
                >
                  Skip for now
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleMarkAsInstalled}
                  className="flex-1 premium-gradient text-white px-6 py-4 rounded-xl font-semibold glow-effect hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <FaCheck className="w-5 h-5" />
                  Complete Setup
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-4 glass-card text-foreground rounded-xl font-medium hover:glow-effect transition-all duration-300"
                >
                  I'll do this later
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
