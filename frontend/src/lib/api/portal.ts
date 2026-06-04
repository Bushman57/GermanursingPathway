import { apiRoot, parseApiError } from "@/lib/api/apiBase";

function portalBase() {
  const root = apiRoot();
  return root ? `${root}/api/portal` : "/api/portal";
}

export type PortalProfile = {
  email: string;
  fullName: string;
  phone?: string | null;
  germanLevel?: string | null;
  notifyDeadlines?: boolean;
  notifyDocuments?: boolean;
  hasAvatar?: boolean;
  avatarUpdatedAt?: number | null;
};

export function portalAvatarUrl(avatarUpdatedAt?: number | null): string {
  const base = `${portalBase()}/avatar`;
  return avatarUpdatedAt ? `${base}?v=${avatarUpdatedAt}` : base;
}

export type PortalDocument = {
  id: string;
  docType: string;
  filename: string;
  status: string;
  createdAt?: string | null;
};

export type PortalNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
};

export async function fetchPortalProfile(): Promise<PortalProfile> {
  const res = await fetch(`${portalBase()}/profile`, { credentials: "include" });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as PortalProfile;
}

export async function updatePortalProfile(body: Partial<PortalProfile>): Promise<void> {
  const res = await fetch(`${portalBase()}/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: body.fullName,
      phone: body.phone,
      german_level: body.germanLevel,
      notify_deadlines: body.notifyDeadlines,
      notify_documents: body.notifyDocuments,
    }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function uploadPortalAvatar(file: File): Promise<{ avatarUpdatedAt: number }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${portalBase()}/avatar`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  const data = (await res.json()) as { avatarUpdatedAt?: number };
  return { avatarUpdatedAt: data.avatarUpdatedAt ?? Date.now() };
}

export async function deletePortalAvatar(): Promise<void> {
  const res = await fetch(`${portalBase()}/avatar`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok && res.status !== 204) throw new Error(await parseApiError(res));
}

export async function fetchPortalDocuments(): Promise<PortalDocument[]> {
  const res = await fetch(`${portalBase()}/documents`, { credentials: "include" });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as PortalDocument[];
}

export async function uploadPortalDocument(docType: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("doc_type", docType);
  form.append("file", file);
  const res = await fetch(`${portalBase()}/documents`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function fetchPortalNotifications(): Promise<PortalNotification[]> {
  const res = await fetch(`${portalBase()}/notifications`, { credentials: "include" });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as PortalNotification[];
}
