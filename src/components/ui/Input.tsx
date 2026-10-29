import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#101828]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full text-xs bg-white border rounded-lg px-3.5 py-2 text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 transition-colors ${
            icon ? 'pl-9' : ''
          } ${
            error
              ? 'border-[#FDA29B] focus:ring-[#DC2626]/20 focus:border-[#DC2626] bg-[#FEF3F2]/30'
              : 'border-[#E4E7EC] focus:ring-[#14B8A6]/20 focus:border-[#14B8A6]'
          } disabled:bg-[#F8FAFC] disabled:text-[#667085] ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#B42318] font-medium">{error}</p>}
      {hint && !error && <p className="text-[11px] text-[#667085]">{hint}</p>}
    </div>
  );
};
