"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaGithub, FaDownload, FaCheck, FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";

interface GitHubAppInstallProps {
  onOpenModal?: () => void;
}

export function GitHubAppInstall({ onOpenModal }: GitHubAppInstallProps) {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if user has already installed the app
    const hasInstalled = localStorage.getItem('githubAppInstalled') === 'true';
    setIsInstalled(hasInstalled);
  }, []);

  const handleInstallApp = () => {
    // Open GitHub App installation page
    window.open('https://github.com/apps/vibe-lint/', '_blank');
  };

  const handleMarkInstalled = () => {
    localStorage.setItem('githubAppInstalled', 'true');
    setIsInstalled(true);
  };

  const handleOpenModal = () => {
    if (onOpenModal) {
      onOpenModal();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-lg p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 fire-gradient rounded-lg flex items-center justify-center flex-shrink-0">
          <FaGithub className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">
            {isInstalled ? 'GitHub App Installed! 🎉' : 'Install GitHub App'}
          </h2>
          
          {!isInstalled ? (
            <>
              <p className="text-muted-foreground mb-4">
                Install the VibeLint GitHub App to start receiving AI-powered code reviews 
                on your pull requests. The app will automatically analyze your code and provide 
                intelligent feedback.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">What the app does:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Automatically reviews pull requests</li>
                  <li>• Detects bugs and security vulnerabilities</li>
                  <li>• Suggests code improvements</li>
                  <li>• Provides detailed feedback comments</li>
                  <li>• Integrates seamlessly with your workflow</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-2 premium-gradient text-white px-6 py-3 rounded-lg font-medium glow-effect hover:scale-105 transition-all"
                >
                  <FaInfoCircle className="w-4 h-4" />
                  Setup Guide
                </button>

                <button
                  onClick={handleInstallApp}
                  className="flex items-center gap-2 glass-card text-foreground px-6 py-3 rounded-lg font-medium hover:glow-effect transition-all"
                >
                  <FaDownload className="w-4 h-4" />
                  Install Directly
                  <FaExternalLinkAlt className="w-3 h-3" />
                </button>

                <button
                  onClick={handleMarkInstalled}
                  className="flex items-center gap-2 glass-card text-foreground px-6 py-3 rounded-lg font-medium hover:glow-effect transition-all"
                >
                  <FaCheck className="w-4 h-4" />
                  I've Installed It
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                Great! The VibeLint GitHub App is now installed. You'll start receiving 
                AI-powered code reviews on your pull requests automatically.
              </p>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-400 mb-2">✅ Installation Complete</h3>
                <p className="text-sm text-muted-foreground">
                  The app is now monitoring your repositories. Create a pull request to see it in action!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.open('https://github.com/apps/vibe-lint/', '_blank')}
                  className="flex items-center gap-2 glass-card text-foreground px-6 py-3 rounded-lg font-medium hover:glow-effect transition-all"
                >
                  <FaGithub className="w-4 h-4" />
                  Manage App Settings
                  <FaExternalLinkAlt className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem('githubAppInstalled');
                    setIsInstalled(false);
                  }}
                  className="text-sm text-foreground-muted hover:text-foreground transition-colors px-3"
                >
                  Mark as not installed
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
