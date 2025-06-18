"use client";

import { useState, useEffect } from "react";

export function useGitHubAppModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already installed the app or skipped
    const hasInstalled = localStorage.getItem('githubAppInstalled') === 'true';
    const hasSkipped = localStorage.getItem('githubAppSkipped') === 'true';
    const lastSkippedTime = localStorage.getItem('githubAppSkippedTime');
    
    // If user has installed, don't show modal
    if (hasInstalled) {
      setShouldShowModal(false);
      return;
    }

    // If user skipped, check if it's been more than 24 hours
    if (hasSkipped && lastSkippedTime) {
      const skipTime = parseInt(lastSkippedTime);
      const now = Date.now();
      const hoursSinceSkip = (now - skipTime) / (1000 * 60 * 60);
      
      // Show modal again after 24 hours
      if (hoursSinceSkip < 24) {
        setShouldShowModal(false);
        return;
      } else {
        // Reset skip status after 24 hours
        localStorage.removeItem('githubAppSkipped');
        localStorage.removeItem('githubAppSkippedTime');
      }
    }

    // Show modal for new users or users who haven't seen it recently
    setShouldShowModal(true);
    
    // Small delay to let the dashboard load first
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    // Store skip timestamp
    localStorage.setItem('githubAppSkipped', 'true');
    localStorage.setItem('githubAppSkippedTime', Date.now().toString());
  };

  const markAsInstalled = () => {
    localStorage.setItem('githubAppInstalled', 'true');
    // Remove skip flags
    localStorage.removeItem('githubAppSkipped');
    localStorage.removeItem('githubAppSkippedTime');
    setIsModalOpen(false);
    setShouldShowModal(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return {
    isModalOpen,
    shouldShowModal,
    closeModal,
    markAsInstalled,
    openModal,
  };
}
