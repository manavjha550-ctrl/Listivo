import { FeatureFlag, UserProfile, PermissionCheckResult } from '../types';

/**
 * Feature availability configuration per subscription plan.
 */
const PLAN_FEATURE_MATRIX: Record<string, FeatureFlag[]> = {
  free: ['dashboard' as FeatureFlag, 'templates', 'products', 'tutorials', 'settings'],
  starter: [
    'dashboard' as FeatureFlag,
    'templates',
    'products',
    'bulk',
    'keywords',
    'tools',
    'price_calculator',
    'tutorials',
    'settings',
    'extension',
  ],
  pro: [
    'dashboard' as FeatureFlag,
    'templates',
    'products',
    'bulk',
    'keywords',
    'tools',
    'image_maker',
    'price_calculator',
    'smart_listings',
    'tutorials',
    'settings',
    'extension',
    'team',
  ],
  lifetime_free: [
    'templates',
    'products',
    'bulk',
    'keywords',
    'tools',
    'image_maker',
    'price_calculator',
    'smart_listings',
    'tutorials',
    'settings',
    'team',
    'extension',
  ],
};

/**
 * Core Permission Check function enforcing Owner Account override
 * and Subscription-based Authorization.
 */
export function canAccessFeature(
  user: UserProfile | null,
  feature: FeatureFlag
): PermissionCheckResult {
  if (!user) {
    return {
      allowed: false,
      reason: 'Authentication required to access this feature.',
    };
  }

  // OWNER ACCOUNT OVERRIDE
  // Section 2 & 32 requirement: Owner has lifetime free access, all features unlocked,
  // no subscription requirements, no feature limits.
  if (user.role === 'owner' || user.plan === 'lifetime_free' || user.isOwner) {
    return {
      allowed: true,
      isOwnerOverride: true,
    };
  }

  // Check subscription status
  if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') {
    return {
      allowed: false,
      reason: 'An active subscription is required to use this feature. Please update your account plan.',
    };
  }

  // Check plan feature matrix
  const allowedFeatures = PLAN_FEATURE_MATRIX[user.plan] || [];
  if (allowedFeatures.includes(feature)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `The '${feature}' feature is available on higher tier plans. Upgrade your plan in Settings.`,
  };
}

/**
 * Utility to check if current user is the special primary owner
 */
export function isOwnerAccount(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'owner' || user.plan === 'lifetime_free' || user.isOwner;
}
