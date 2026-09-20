import React from 'react';

interface TechIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

export const TechIcon: React.FC<TechIconProps> = ({ name, className = 'h-4 w-4', ...props }) => {
  const tech = name.trim().toLowerCase();

  if (tech.includes('java') && !tech.includes('script')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path d="M8 17.5c2.2.8 7.5.8 9.6-.4M7 14.7c2.7 1 8.2.9 10.7-.5M9.2 11.7c-1.8 1.1-.9 2 2.8 2.1" stroke="#5382A1" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12.3 3.2c2.5 2.2-2.9 3.1-.8 5.6M15.4 5.2c1.7 1.7-1.8 2.5-.8 3.8" stroke="#E76F51" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M6.2 19.4c2.8 1.8 10.2 1.9 12.8-.1" stroke="#5382A1" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (tech.includes('spring')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <circle cx="12" cy="12" r="9" fill="#6DB33F" />
        <path d="M6.8 13.7c3.2 1.6 7.1.7 9.3-2.2M8.3 16.6c1.7.7 3.8.8 5.7.2M16.2 7.3c-4.5-.7-7.7 1.3-8.9 4.8" stroke="#fff" strokeWidth="1.45" strokeLinecap="round" />
      </svg>
    );
  }

  if (tech.includes('node')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path d="M12 2.2 20.5 7v10L12 21.8 3.5 17V7L12 2.2Z" fill="#5FA04E" />
        <path d="M8.2 16.4V8.1l7.6 7.8V7.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (tech.includes('kotlin')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path d="M3 3h18L3 21V3Z" fill="#7F52FF" />
        <path d="M3 21 12 12l9 9H3Z" fill="#F88909" />
        <path d="m12 12 9-9v18l-9-9Z" fill="#C711E1" />
      </svg>
    );
  }

  if (tech.includes('mybatis')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <ellipse cx="12" cy="6" rx="7.5" ry="3" fill="#C63C32" />
        <path d="M4.5 6v11.5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" fill="#C63C32" fillOpacity=".18" stroke="#C63C32" strokeWidth="1.4" />
        <path d="M8.2 10.2h5.1a2 2 0 0 1 0 4H9.8v2.4" stroke="#C63C32" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (tech.includes('vue')) {
    return (
      <svg viewBox="0 0 24 24" className={className} {...props}>
        <path d="M1.8 3.5h4.4L12 13.6l5.8-10.1h4.4L12 21.2 1.8 3.5Z" fill="#41B883" />
        <path d="M6.2 3.5h3.1L12 8.2l2.7-4.7h3.1L12 13.6 6.2 3.5Z" fill="#35495E" />
      </svg>
    );
  }

  if (tech.includes('react')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#61DAFB" strokeWidth="1.5" {...props}>
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.8" fill="#61DAFB" stroke="none" />
      </svg>
    );
  }

  if (tech.includes('javascript') || tech === 'js') {
    return (
      <svg viewBox="0 0 24 24" className={className} {...props}>
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#F7DF1E" />
        <path d="M12.4 17.2c.5.9 1.2 1.5 2.4 1.5 1 0 1.6-.5 1.6-1.2 0-.8-.6-1.1-1.7-1.6l-.6-.3c-1.7-.7-2.8-1.6-2.8-3.4 0-1.7 1.3-3 3.3-3 1.4 0 2.5.5 3.2 1.8l-1.8 1.1c-.4-.7-.8-.9-1.4-.9-.6 0-1 .4-1 1 0 .7.4 1 1.5 1.4l.6.3c2 .9 3.1 1.7 3.1 3.5 0 2-1.6 3.2-3.9 3.2-2.2 0-3.6-1-4.3-2.5l1.8-.9ZM5.6 9.4H8v6.5c0 1.7-.7 2.1-2.2 2.1-.2 0-.5 0-.8-.1v2.1c.3.1.8.1 1.2.1 2.8 0 4.2-1.4 4.2-4.2V9.4H8" fill="#111827" />
      </svg>
    );
  }

  if (tech.includes('html') || tech.includes('css')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path d="M2.5 3h8.3l-.8 16-3.4 1-3.3-1L2.5 3Z" fill="#E44D26" />
        <path d="M13.2 3h8.3l-.8 16-3.4 1-3.3-1-.8-16Z" fill="#1572B6" />
        <path d="m5 7 .2 2.4h3.3l-.2 4.4-1.7.5-1.7-.5-.1-1.6" stroke="#fff" strokeWidth="1.2" />
        <path d="M15.2 7h4.3l-.2 2h-2.8l.1 1.6H19l-.2 3.2-1.6.5-1.5-.5-.1-1.4" stroke="#fff" strokeWidth="1.2" />
      </svg>
    );
  }

  if (tech.includes('mysql')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <ellipse cx="10.2" cy="6" rx="6.8" ry="3" fill="#4479A1" />
        <path d="M3.4 6v10.5c0 1.7 3 3 6.8 3s6.8-1.3 6.8-3V6" fill="#4479A1" fillOpacity=".17" stroke="#4479A1" strokeWidth="1.4" />
        <path d="M15.5 10.2c2.7.2 4.4 1.4 5.1 3.8-1.4-.8-2.5-.8-3.5-.1" stroke="#F29111" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (tech.includes('redis')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path d="m12 2 9 5-9 5-9-5 9-5Z" fill="#DC382D" />
        <path d="m3 11 9 5 9-5M3 15l9 5 9-5" stroke="#DC382D" strokeWidth="2" strokeLinejoin="round" />
        <path d="m8.5 7 3.5-2 3.5 2-3.5 2-3.5-2Z" fill="#fff" />
      </svg>
    );
  }

  if (tech === 'git') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path d="m12 1.8 10.2 10.1L12 22.2 1.8 12 12 1.8Z" fill="#F05032" />
        <path d="m8 8 8 8M8.2 8.2h5v4.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="8" cy="8" r="1.5" fill="#fff" /><circle cx="16" cy="16" r="1.5" fill="#fff" /><circle cx="13.2" cy="13.1" r="1.5" fill="#fff" />
      </svg>
    );
  }

  if (tech.includes('maven') || tech.includes('gradle')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <path d="M3 18 7.2 6l4.8 7 4.8-7L21 18" stroke="#C71A36" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5.2 18h13.6" stroke="#23A566" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (tech.includes('docker')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="#2496ED" {...props}>
        <path d="M4 10h3V7H4v3Zm4 0h3V7H8v3Zm4 0h3V7h-3v3Zm-8 4h3v-3H4v3Zm4 0h3v-3H8v3Zm4 0h3v-3h-3v3Zm4-4h3V7h-3v3Zm6.8 1.2c-.5-.3-1.6-.5-2.5-.2-.2-1-1-1.7-1.8-2.2l-.4-.2-.3.4c-.5.7-.7 1.8-.6 2.7.1.7.3 1.3.8 1.8-.6.3-1.6.4-2.1.4H2.3c-.4 2.3.3 5.3 2.2 7.3 1.9 2 4.8 2.8 8.5 2.8 8.1 0 11.9-3.7 13.7-10.4.9.1 2.6 0 3.5-1.8-.9-.5-2.1-.7-3.4-.6Z" transform="scale(.82) translate(-1 -1)" />
      </svg>
    );
  }

  if (tech.includes('linux')) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
        <ellipse cx="12" cy="14" rx="7" ry="8" fill="#1E293B" />
        <ellipse cx="12" cy="15" rx="5" ry="6" fill="#F8FAFC" />
        <circle cx="9.5" cy="7" r="1.35" fill="#F8FAFC" /><circle cx="14.5" cy="7" r="1.35" fill="#F8FAFC" />
        <path d="m12 8 2 2.2-2 1.2-2-1.2L12 8Z" fill="#FCC624" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
    </svg>
  );
};
