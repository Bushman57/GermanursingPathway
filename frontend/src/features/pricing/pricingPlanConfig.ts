export type SubscriptionTier = "essential" | "plus" | "premium";

export type PricingPlanConfig = {
  id: SubscriptionTier;
  priceKes: number;
  popular?: boolean;
  featureKeys: string[];
  shortDescriptionKey: string;
  inheritsFrom?: SubscriptionTier;
  ctaKey: string;
  paymentPurpose: `subscription_${SubscriptionTier}`;
};

export const PRICING_PLANS: PricingPlanConfig[] = [
  {
    id: "essential",
    priceKes: 300,
    featureKeys: [
      "features.pathwayAi",
      "features.resources",
      "features.introClasses",
    ],
    shortDescriptionKey: "shortDescription.essential",
    ctaKey: "cta.essential",
    paymentPurpose: "subscription_essential",
  },
  {
    id: "plus",
    priceKes: 500,
    popular: true,
    inheritsFrom: "essential",
    featureKeys: [
      "features.inheritsEssential",
      "features.scholarshipAi",
      "features.verifiedPrograms",
    ],
    shortDescriptionKey: "shortDescription.plus",
    ctaKey: "cta.plus",
    paymentPurpose: "subscription_plus",
  },
  {
    id: "premium",
    priceKes: 700,
    inheritsFrom: "plus",
    featureKeys: [
      "features.inheritsPlus",
      "features.cvRevamp",
    ],
    shortDescriptionKey: "shortDescription.premium",
    ctaKey: "cta.premium",
    paymentPurpose: "subscription_premium",
  },
];

export function planByTier(tier: SubscriptionTier): PricingPlanConfig {
  const plan = PRICING_PLANS.find((p) => p.id === tier);
  if (!plan) throw new Error(`Unknown tier: ${tier}`);
  return plan;
}

export function purposeForTier(tier: SubscriptionTier): PricingPlanConfig["paymentPurpose"] {
  return planByTier(tier).paymentPurpose;
}
