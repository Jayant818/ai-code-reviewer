
import { ILoggedInUser } from '@/features/user/api.types'
import React from 'react'
import { FaGithub } from 'react-icons/fa'

interface IConnectGithubCard {
  className?: string;
  user?: ILoggedInUser;
}

const ConnectGithubCard: React.FC<IConnectGithubCard> = ({ className = '', user }) => {
  return (
    <div
      className={`
        glass-card
        rounded-xl
        p-6
        max-w-md
        mx-auto
        card-hover
        ${className}
      `}
    >
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <FaGithub className="w-5 h-5 text-foreground-muted" />
        Connect with GitHub
      </h2>
      <p className="text-foreground-muted mb-6 text-font-size-base leading-relaxed">
        To get started, please install the GitHub App to enable integration with your repositories.
      </p>
      <a
        href="https://github.com/apps/code-sentinel-1"
        target="_blank"
        rel="noopener noreferrer"
        className="
          inline-flex
          items-center
          gap-2
          premium-gradient
          text-primary-foreground
          font-medium
          py-3
          px-5
          rounded-radius-md
          glow-effect
          premium-button
        "
      >
        <FaGithub className="w-4 h-4" />
        Install GitHub App
      </a>
      {user && (
        <div className="mt-6 p-3 rounded-radius-sm bg-background-tertiary border border-glass-border">
          <p className="text-foreground-secondary text-font-size-sm">
            Logged in as: <span className="font-semibold text-foreground">{user.name}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectGithubCard;

