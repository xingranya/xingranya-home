import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({ children, className }) => {
  const [location] = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (location === '/') return;
    let disposed = false;
    let cleanup = () => {};
    void import('gsap').then(({ gsap }) => {
      if (disposed || !mainRef.current) return;
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', (context) => {
        const observer = new IntersectionObserver((entries) => {
          entries.filter((entry) => entry.isIntersecting).forEach((entry, index) => {
            observer.unobserve(entry.target);
            context.add(() => gsap.fromTo(entry.target, { y: 16, opacity: 0.6 }, { y: 0, opacity: 1, duration: 0.65, delay: Math.min(index, 4) * 0.055, ease: 'power3.out', clearProps: 'transform,opacity' }));
          });
        }, { threshold: 0.1 });
        mainRef.current?.querySelectorAll('.paper-card, h2').forEach((node) => { if (!node.parentElement?.closest('.paper-card')) observer.observe(node); });
        return () => observer.disconnect();
      });
      cleanup = () => media.revert();
    });
    return () => { disposed = true; cleanup(); };
  }, [location]);
  return (
    <main
      ref={mainRef}
      key={location}
      className={`page-transition min-h-[calc(100vh-14rem)] pt-1 pb-1 sm:pt-5 sm:pb-2 ${className || ''}`}
    >
      {children}
    </main>
  );
};
