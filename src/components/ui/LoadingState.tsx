import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading workspace data...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[240px] bg-white rounded-xl border border-[#E4E7EC]">
      <div className="w-8 h-8 rounded-full border-2 border-[#E4E7EC] border-t-[#14B8A6] animate-spin mb-3" />
      <p className="text-xs font-semibold text-[#101828]">{message}</p>
    </div>
  );
};
