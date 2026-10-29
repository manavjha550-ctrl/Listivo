import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <PackageOpen className="w-6 h-6 text-[#14B8A6]" />,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-[#F8FAFC] rounded-xl border border-[#E4E7EC]">
      <div className="w-12 h-12 rounded-xl bg-white border border-[#E4E7EC] flex items-center justify-center mb-3.5 text-[#14B8A6]">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[#101828]">{title}</h3>
      <p className="text-xs text-[#667085] max-w-md mt-1.5 leading-relaxed">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
