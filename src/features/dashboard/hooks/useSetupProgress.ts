import { useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardStats } from './useDashboardStats';
import { useExtensionStatus } from './useExtensionStatus';
import { SetupStep } from '../types/dashboard';

export const useSetupProgress = () => {
  const { user } = useAuth();
  const { stats } = useDashboardStats();
  const { extensionInfo } = useExtensionStatus();

  const steps: SetupStep[] = useMemo(() => {
    const isProfileComplete = Boolean(user?.fullName && user?.companyName && (user?.gstin || user?.pickupAddress));
    const isTemplateCreated = stats.totalTemplates > 0;
    const isListingCreated = stats.totalListings > 0;
    const isExtensionConnected = extensionInfo.status === 'CONNECTED';
    const isCatalogExported = stats.exportedListings > 0 || stats.readyListings > 0;

    return [
      {
        id: 'step-1',
        stepNumber: 1,
        title: 'Complete Business & GST Profile',
        description: 'Provide store name, pickup pincode & GSTIN for automated invoice generation.',
        isCompleted: isProfileComplete,
        actionLabel: isProfileComplete ? 'View Profile' : 'Complete Profile',
        actionRoute: '/settings',
      },
      {
        id: 'step-2',
        stepNumber: 2,
        title: 'Create Your First Template',
        description: 'Save reusable GST rates, HSN codes, and care instructions once.',
        isCompleted: isTemplateCreated,
        actionLabel: isTemplateCreated ? 'Manage Templates' : 'Create Template',
        actionRoute: '/templates',
      },
      {
        id: 'step-3',
        stepNumber: 3,
        title: 'Create Your First Listing',
        description: 'Draft single or variant product listings mapped to saved templates.',
        isCompleted: isListingCreated,
        actionLabel: isListingCreated ? 'View Catalog' : 'Create Listing',
        actionRoute: '/listings',
      },
      {
        id: 'step-4',
        stepNumber: 4,
        title: 'Connect Chrome Extension',
        description: 'Enable 1-click autofill on Meesho seller portal using Listivo Companion.',
        isCompleted: isExtensionConnected,
        actionLabel: isExtensionConnected ? 'Extension Ready' : 'Install Guide',
        actionRoute: '/tutorials',
      },
      {
        id: 'step-5',
        stepNumber: 5,
        title: 'Export Your First Catalog',
        description: 'Download bulk CSV or auto-sync ready products directly to marketplace.',
        isCompleted: isCatalogExported,
        actionLabel: isCatalogExported ? 'Bulk Export' : 'Export Catalog',
        actionRoute: '/bulk',
      },
    ];
  }, [user, stats, extensionInfo]);

  const completedCount = useMemo(() => steps.filter((s) => s.isCompleted).length, [steps]);
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  return {
    steps,
    completedCount,
    totalSteps,
    progressPercentage,
    allCompleted: completedCount === totalSteps,
  };
};
