import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load workspace data',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#FEF3F2]/60 rounded-xl border border-[#FECDCA]">
      <div className="w-10 h-10 rounded-lg bg-white border border-[#FECDCA] flex items-center justify-center text-[#DC2626] mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#101828]">{title}</h3>
      <p className="text-xs text-[#667085] max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
