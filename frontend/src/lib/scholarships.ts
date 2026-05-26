import { isGermanLocale } from "./locale";
import type { ScholarshipDeFields } from "./scholarship-de";

export type ProgramType = "nursing_scholarship" | "ausbildung" | "other";

export type Scholarship = {
  slug: string;
  title: string;
  provider: string;
  degreeLevel: string;
  funding: string;
  deadline: string;
  location: string;
  shortDescription: string;
  about: string;
  hostCountry: string;
  studyIn: string;
  category: string;
  eligibleCountries: string;
  benefits: string[];
  eligibility: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  officialLink: string;
  applicationLink?: string;
  programType: ProgramType;
  verified: boolean;
} & ScholarshipDeFields;

export type ScholarshipTextField =
  | "title"
  | "provider"
  | "degreeLevel"
  | "funding"
  | "deadline"
  | "location"
  | "shortDescription"
  | "about"
  | "category";

export type ScholarshipListField =
  | "benefits"
  | "eligibility"
  | "requiredDocuments"
  | "applicationProcess";

const TEXT_DE_MAP: Record<ScholarshipTextField, keyof ScholarshipDeFields> = {
  title: "titleDe",
  provider: "providerDe",
  degreeLevel: "degreeLevelDe",
  funding: "fundingDe",
  deadline: "deadlineDe",
  location: "locationDe",
  shortDescription: "shortDescriptionDe",
  about: "aboutDe",
  category: "categoryDe",
};

const LIST_DE_MAP: Record<ScholarshipListField, keyof ScholarshipDeFields> = {
  benefits: "benefitsDe",
  eligibility: "eligibilityDe",
  requiredDocuments: "requiredDocumentsDe",
  applicationProcess: "applicationProcessDe",
};

export function scholarshipText(
  s: Scholarship,
  field: ScholarshipTextField,
  lang?: string,
): string {
  const de = isGermanLocale(lang ?? (typeof document !== "undefined" ? document.documentElement.lang : "en"));
  if (de) {
    const deKey = TEXT_DE_MAP[field];
    const value = s[deKey];
    if (typeof value === "string" && value) return value;
  }
  return s[field];
}

export function scholarshipList(
  s: Scholarship,
  field: ScholarshipListField,
  lang?: string,
): string[] {
  const de = isGermanLocale(lang ?? (typeof document !== "undefined" ? document.documentElement.lang : "en"));
  if (de) {
    const deKey = LIST_DE_MAP[field];
    const value = s[deKey];
    if (Array.isArray(value) && value.length > 0) return value;
  }
  return s[field] ?? [];
}
