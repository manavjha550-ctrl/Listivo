import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'navy'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'amber'
  | 'emerald'
  | 'indigo'
  | 'teal';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-2xs',
    teal: 'bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-2xs',
    emerald: 'bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-2xs',
    indigo: 'bg-[#101828] hover:bg-[#1D2939] text-white shadow-2xs',
    navy: 'bg-[#101828] hover:bg-[#1D2939] text-white shadow-2xs',
    secondary: 'bg-[#F8FAFC] hover:bg-[#EEF2F6] text-[#101828] border border-[#E4E7EC]',
    outline: 'border border-[#E4E7EC] bg-white text-[#101828] hover:bg-[#F8FAFC] hover:border-[#D0D5DD]',
    ghost: 'bg-transparent text-[#667085] hover:bg-[#F8FAFC] hover:text-[#101828]',
    danger: 'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-2xs',
    amber: 'bg-[#101828] hover:bg-[#1D2939] text-white shadow-2xs',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'text-[11px] px-2.5 py-1 gap-1.5 min-h-[28px]',
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-xs px-4 py-2 gap-2 min-h-[38px]',
    lg: 'text-sm px-5 py-2.5 gap-2 min-h-[42px]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
