import { apiRoot, parseApiError, parseJsonResponse, requireApiRoot } from "@/lib/api/apiBase";

function authBase(): string {
  const root = import.meta.env.PROD ? requireApiRoot() : apiRoot();
  return root ? `${root}/api/auth` : "/api/auth";
}

function staleApiMessage(status: number): string | null {
  if (status === 404) {
    return (
      "Portal sign-in is not available on this API yet (missing /api/auth routes). " +
      "Redeploy the latest backend on Render, then try again."
    );
  }
  if (status === 500) {
    return "Portal sign-in is temporarily unavailable on the server. Redeploy the latest backend, then try again.";
  }
  if (status === 405) {
    return "This API build is outdated. Redeploy the latest backend on Render.";
  }
  return null;
}

const fetchOpts: RequestInit = { credentials: "include" };

export type OtpRequestResponse = {
  sent?: boolean;
  message: string;
  reason?: "not_registered" | "rate_limited";
};

export async function requestOtp(email: string): Promise<OtpRequestResponse> {
  const res = await fetch(`${authBase()}/otp/request`, {
    ...fetchOpts,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  if (!res.ok) {
    throw new Error(staleApiMessage(res.status) ?? (await parseApiError(res)));
  }
  return parseJsonResponse<OtpRequestResponse>(res);
}

export async function verifyOtp(email: string, code: string): Promise<{
  message: string;
  email: string;
  fullName: string;
}> {
  const res = await fetch(`${authBase()}/otp/verify`, {
    ...fetchOpts,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<{ message: string; email: string; fullName: string }>(res);
}

export async function logoutPortal(): Promise<void> {
  const res = await fetch(`${authBase()}/logout`, { ...fetchOpts, method: "POST" });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export type PortalProfile = { email: string; fullName: string };

export class PortalUnavailableError extends Error {
  constructor() {
    super("Portal temporarily unavailable — try again shortly.");
    this.name = "PortalUnavailableError";
  }
}

type MeResponse =
  | { authenticated: false }
  | { authenticated: true; email: string; fullName: string };

export async function fetchMe(): Promise<PortalProfile | null> {
  const res = await fetch(`${authBase()}/me`, fetchOpts);
  if (res.status === 401) return null;
  if (res.status === 503 || res.status === 500) {
    throw new PortalUnavailableError();
  }
  if (!res.ok) throw new Error(await parseApiError(res));
  const data = await parseJsonResponse<MeResponse>(res);
  if (!data.authenticated) return null;
  return { email: data.email, fullName: data.fullName };
}
