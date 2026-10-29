import { useState, useEffect, useCallback } from 'react';
import { ExtensionConnectionInfo } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';

export const useExtensionStatus = () => {
  const [extensionInfo, setExtensionInfo] = useState<ExtensionConnectionInfo>({
    status: 'NOT_CONNECTED',
    message: 'Checking extension status...',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const info = await dashboardService.getExtensionStatus();
      setExtensionInfo(info);
    } catch {
      setExtensionInfo({
        status: 'NOT_CONNECTED',
        message: 'Unable to detect Chrome Companion extension.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return { extensionInfo, isLoading, refetch: checkStatus };
};
