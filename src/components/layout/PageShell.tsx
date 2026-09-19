import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({ children, className }) => {
  const shellRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.fromTo(shellRef.current, 
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', clearProps: 'transform' }
    );
  }, []);

  return (
    <main
      ref={shellRef}
      className={`min-h-[calc(100vh-14rem)] pt-1 pb-1 sm:pt-5 sm:pb-2 ${className || ''}`}
    >
      {children}
    </main>
  );
};
