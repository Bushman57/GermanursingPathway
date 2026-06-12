import type { PublicScholarshipFilters } from "@/lib/api/scholarships";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  scholarships: {
    list: (filters?: PublicScholarshipFilters) => ["scholarships", "list", filters ?? {}] as const,
    detail: (slug: string) => ["scholarships", "detail", slug] as const,
  },
  resources: {
    list: ["resources", "list"] as const,
    detail: (slug: string) => ["resources", "detail", slug] as const,
  },
  blogs: {
    list: ["blogs", "list"] as const,
    detail: (slug: string) => ["blogs", "detail", slug] as const,
  },
  partners: {
    list: ["partners", "list"] as const,
  },
  portal: {
    profile: ["portal", "profile"] as const,
    documents: ["portal", "documents"] as const,
    notifications: ["portal", "notifications"] as const,
    journey: ["portal", "journey"] as const,
    learningAccess: ["portal", "learning-access"] as const,
    subscription: ["portal", "subscription"] as const,
  },
};
