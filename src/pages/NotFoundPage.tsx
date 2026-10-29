import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center p-6">
      <div className="px-3.5 py-1.5 bg-[#101828] text-[#14B8A6] rounded-lg font-mono font-bold tabular-nums text-sm mb-4">
        404
      </div>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">Page Not Found</h1>
      <p className="text-xs sm:text-sm text-[#667085] mt-1.5 max-w-sm">
        The requested workspace route does not exist or may have moved.
      </p>
      <Button
        variant="primary"
        size="sm"
        className="mt-6"
        icon={<Home className="w-4 h-4 text-[#14B8A6]" />}
        onClick={() => navigate('/dashboard')}
      >
        Return to Dashboard
      </Button>
    </div>
  );
};
