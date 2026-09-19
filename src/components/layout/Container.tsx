import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'reading' | 'wide' | 'diary';
}

export const Container: React.FC<ContainerProps> = ({
  size = 'default',
  className,
  children,
  ...props
}) => {
  const sizeClasses = {
    diary: 'max-w-[720px]',
    narrow: 'max-w-3xl',
    reading: 'max-w-[800px]',
    default: 'max-w-5xl',
    wide: 'max-w-[1400px]',
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};
