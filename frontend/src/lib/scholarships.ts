import { isGermanLocale } from "./locale";
import type { ScholarshipDeFields } from "./scholarship-de";

export type ProgramType =
  | "nursing_scholarship"
  | "ausbildung"
  | "caregiver_pathway"
  | "internship"
  | "vocational_training"
  | "other";

export type ScholarshipQuestionnaire = {
  verificationStatus?: string;
  dataVerificationStatus?: string;
  applicationStatus?: string;
  germanLevelRequired?: string;
  visaSponsorship?: string;
  accommodationSupport?: string;
  intakeMonth?: string;
  programDuration?: string;
  recognitionSupport?: string;
  interviewRequired?: string;
  applicationMethod?: string;
  providerType?: string;
  languagesOfInstruction?: string[];
  targetApplicants?: string[];
  tags?: string[];
};

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
} & ScholarshipDeFields &
  ScholarshipQuestionnaire;

/** Card/list fields only — returned by GET /api/scholarships */
export type ScholarshipSummary = Pick<
  Scholarship,
  | "slug"
  | "title"
  | "provider"
  | "degreeLevel"
  | "funding"
  | "deadline"
  | "shortDescription"
  | "category"
  | "hostCountry"
  | "officialLink"
  | "programType"
  | "verified"
  | "applicationStatus"
  | "germanLevelRequired"
  | "tags"
  | "verificationStatus"
> &
  Partial<
    Pick<
      ScholarshipDeFields,
      | "titleDe"
      | "providerDe"
      | "degreeLevelDe"
      | "fundingDe"
      | "deadlineDe"
      | "shortDescriptionDe"
      | "categoryDe"
    >
  > & {
    applicationLink?: string;
  };

export type ScholarshipTextSource = Scholarship | ScholarshipSummary;

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
  s: ScholarshipTextSource,
  field: ScholarshipTextField,
  lang?: string,
): string {
  const de = isGermanLocale(lang ?? (typeof document !== "undefined" ? document.documentElement.lang : "en"));
  if (de) {
    const deKey = TEXT_DE_MAP[field];
    const value = s[deKey as keyof typeof s];
    if (typeof value === "string" && value) return value;
  }
  const en = s[field as keyof typeof s];
  return typeof en === "string" ? en : "";
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
