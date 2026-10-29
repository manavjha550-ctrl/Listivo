import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  padding = 'md',
  hoverable = false,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#E4E7EC] transition-colors duration-150 ${
        hoverable ? 'hover:border-[#CBD5E1]' : ''
      } ${paddingStyles[padding]} ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E4E7EC]">
          <div>
            {title && <h3 className="text-sm font-semibold text-[#101828]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#667085] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
