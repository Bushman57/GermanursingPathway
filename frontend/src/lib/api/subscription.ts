import { apiRoot, parseApiError, parseJsonResponse } from "@/lib/api/apiBase";

export type SubscriptionStatus = {
  subscriptionsEnabled?: boolean;
  active: boolean;
  tier: "essential" | "plus" | "premium" | null;
  expiresAt: string | null;
  daysRemaining: number;
  features: {
    pathwayChat: boolean;
    resources: boolean;
    scholarships: boolean;
    scholarshipChat: boolean;
    cvRevamp: boolean;
  };
  freeTrialTurnsRemaining: number;
};

function portalBase(): string {
  const root = apiRoot();
  return root ? `${root}/api/portal` : "/api/portal";
}

export async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
  const res = await fetch(`${portalBase()}/subscription`, { credentials: "include" });
  if (res.status === 401) {
    return {
      subscriptionsEnabled: true,
      active: false,
      tier: null,
      expiresAt: null,
      daysRemaining: 0,
      features: {
        pathwayChat: false,
        resources: false,
        scholarships: false,
        scholarshipChat: false,
        cvRevamp: false,
      },
      freeTrialTurnsRemaining: 3,
    };
  }
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<SubscriptionStatus>(res);
}

export async function submitCvRevampRequest(notes?: string): Promise<{ message: string }> {
  const res = await fetch(`${portalBase()}/cv-revamp`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes: notes?.trim() || null }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<{ message: string }>(res);
}
