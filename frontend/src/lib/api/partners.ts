import { apiRoot, parseApiError } from "@/lib/api/apiBase";

export type PartnerSchool = {
  slug: string;
  nameEn: string;
  nameDe?: string | null;
  descriptionEn: string;
  descriptionDe?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  city?: string | null;
  verified: boolean;
};

export async function fetchPartnerSchools(): Promise<PartnerSchool[]> {
  const root = apiRoot();
  const url = root ? `${root}/api/partner-schools` : "/api/partner-schools";
  const res = await fetch(url);
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as PartnerSchool[];
}
