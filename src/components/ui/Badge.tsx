import React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'amber'
  | 'outline'
  | 'emerald'
  | 'indigo'
  | 'slate'
  | 'teal'
  | 'sky';

export type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    primary: 'bg-[#14B8A6]/10 text-[#0F766E] border-[#14B8A6]/25',
    teal: 'bg-[#14B8A6]/10 text-[#0F766E] border-[#14B8A6]/25',
    emerald: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
    success: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
    secondary: 'bg-[#F8FAFC] text-[#475467] border-[#E4E7EC]',
    slate: 'bg-[#F8FAFC] text-[#475467] border-[#E4E7EC]',
    sky: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
    indigo: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
    purple: 'bg-[#F8FAFC] text-[#101828] border-[#D0D5DD]',
    warning: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
    amber: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
    danger: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
    outline: 'bg-white text-[#475467] border-[#E4E7EC]',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium',
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border whitespace-nowrap shrink-0 transition-colors ${
        variantStyles[variant] || variantStyles.primary
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
