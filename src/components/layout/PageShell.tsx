import React from 'react';
import { useLocation } from 'wouter';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({ children, className }) => {
  const [location] = useLocation();
  return (
    <main
      key={location}
      className={`page-transition min-h-[calc(100vh-14rem)] pt-1 pb-1 sm:pt-5 sm:pb-2 ${className || ''}`}
    >
      {children}
    </main>
  );
};
