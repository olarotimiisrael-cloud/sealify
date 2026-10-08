/**
 * Feature tier definitions for Sealify platform
 * Defines what features are available to unauthenticated vs authenticated users
 */

export const FEATURE_TIERS = {
  BASIC: [
    'text-to-image-generation-basic',
    'simple-image-editing',
    'ai-chat-basic',
    'template-based-designs',
    'basic-image-filter',
    'low-resolution-output',
    'watermarked-output' // All output is watermarked regardless of tier
  ],
  PREMIUM: [
    'advanced-image-generation',
    'video-generation',
    'image-upscaling',
    'background-removal',
    'style-transfer',
    'batch-processing',
    'high-resolution-output',
    'commercial-use-license',
    'priority-processing',
    'custom-model-access',
    'api-access'
  ]
} as const;

export type FeatureTier = keyof typeof FEATURE_TIERS;
export type BasicFeature = typeof FEATURE_TIERS.BASIC[number];
export type PremiumFeature = typeof FEATURE_TIERS.PREMIUM[number];
export type AllFeature = BasicFeature | PremiumFeature;

/**
 * Check if a feature is available to a user based on their authentication status
 * @param feature - The feature to check
 * @param user - The user object (null if unauthenticated)
 * @returns boolean indicating if feature is available
 */
export const isFeatureAvailable = (feature: string, user: any | null): boolean => {
  if (!user) {
    // Unauthenticated users only get basic features
    return FEATURE_TIERS.BASIC.includes(feature as BasicFeature);
  }
  
  // Authenticated users get all features
  return [...FEATURE_TIERS.BASIC, ...FEATURE_TIERS.PREMIUM].includes(feature as AllFeature);
};

/**
 * Get list of features available to a user based on their authentication status
 * @param user - The user object (null if unauthenticated)
 * @returns Array of feature strings available to the user
 */
export const getAvailableFeatures = (user: any | null): string[] => {
  if (!user) {
    return [...FEATURE_TIERS.BASIC];
  }
  
  return [...FEATURE_TIERS.BASIC, ...FEATURE_TIERS.PREMIUM];
};

/**
 * Get the user's access tier
 * @param user - The user object (null if unauthenticated)
 * @returns 'basic' or 'premium'
 */
export const getUserTier = (user: any | null): FeatureTier => {
  return user ? 'PREMIUM' : 'BASIC';
};

/**
 * Check if user has premium access
 * @param user - The user object (null if unauthenticated)
 * @returns boolean indicating if user has premium access
 */
export const hasPremiumAccess = (user: any | null): boolean => {
  return user !== null;
};