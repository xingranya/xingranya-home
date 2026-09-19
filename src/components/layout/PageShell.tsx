import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({ children, className }) => {
  return (
    <main
      className={`min-h-[calc(100vh-14rem)] pt-1 pb-1 sm:pt-5 sm:pb-2 ${className || ''}`}
    >
      {children}
    </main>
  );
};
