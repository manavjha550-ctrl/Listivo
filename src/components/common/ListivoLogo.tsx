import React, { useId } from 'react';

interface ListivoLogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'auto';
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ListivoLogo: React.FC<ListivoLogoProps> = ({
  className = '',
  variant = 'dark',
  showWordmark = true,
  size = 'md',
}) => {
  const uid = useId().replace(/:/g, '');

  const sizeMap = {
    sm: { iconSize: 24, text: 'text-base', gap: 'gap-2' },
    md: { iconSize: 30, text: 'text-lg', gap: 'gap-2.5' },
    lg: { iconSize: 38, text: 'text-2xl', gap: 'gap-3' },
    xl: { iconSize: 48, text: 'text-3xl', gap: 'gap-3.5' },
  };

  const { iconSize, text, gap } = sizeMap[size];
  const textColor = variant === 'light' ? '#101828' : '#FFFFFF';

  const leftGradId = `listivo-left-${uid}`;
  const bottomGradId = `listivo-bottom-${uid}`;
  const ringGradId = `listivo-ring-${uid}`;

  return (
    <div className={`inline-flex items-center ${gap} select-none whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={leftGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="55%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          <linearGradient id={bottomGradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="55%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>

          <linearGradient id={ringGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>

        <path
          d="M 28 12 L 42 20 L 42 78 L 14 78 C 14 78 14 36 28 12 Z"
          fill={`url(#${leftGradId})`}
        />
        <path
          d="M 14 78 L 42 78 L 86 62 L 68 48 L 42 60 L 28 70 Z"
          fill={`url(#${bottomGradId})`}
        />
        <path
          d="M 28 12 L 42 20 L 42 60 L 28 70 Z"
          fill="#101828"
          fillOpacity="0.14"
        />
      </svg>

      {showWordmark && (
        <span
          className={`font-sans font-extrabold tracking-tight uppercase leading-none inline-flex items-center ${text}`}
        >
          <span style={{ color: textColor }}>LISTIV</span>
          <svg
            className="inline-block ml-[1px]"
            style={{ width: `${iconSize * 0.66}px`, height: `${iconSize * 0.66}px` }}
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r="14"
              stroke={`url(#${ringGradId})`}
              strokeWidth="7"
            />
          </svg>
        </span>
      )}
    </div>
  );
};
