import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeStyles: Record<string, string> = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          rounded-full
          border-t-transparent
          border-primary
          animate-spin
          animate-pulse-glow
          border-gradient
          ${sizeStyles[size]}
          ${className}
        `}
      />
    </div>
  );
};

export default Spinner;