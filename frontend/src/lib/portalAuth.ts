import { fetchMe, logoutPortal, type PortalProfile } from "@/lib/api/auth";

export type PortalSession = PortalProfile;

export async function getPortalSession(): Promise<PortalSession | null> {
  try {
    return await fetchMe();
  } catch {
    return null;
  }
}

export async function signOutPortal(): Promise<void> {
  await logoutPortal();
}
