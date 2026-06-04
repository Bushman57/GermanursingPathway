const KEY = "gnp_eligibility_prefill";

export type EligibilityPrefill = {
  full_name: string;
  german_level: string;
  nursing_qualification: string;
  message?: string;
  german_level_filter?: string;
  score?: number;
  status?: string;
};

const QUALIFICATION_MAP: Record<string, string> = {
  highschool: "other",
  diploma: "diploma",
  bachelors: "bsc",
  masters: "bsc",
  phd: "bsc",
};

const GERMAN_MAP: Record<string, string> = {
  none: "none",
  a1: "a1",
  a2: "a2",
  "b1+": "b1",
};

export function saveEligibilityPrefill(data: {
  name: string;
  qualification: string;
  germanLevel: string;
  score: number;
  status: string;
}) {
  const prefill: EligibilityPrefill = {
    full_name: data.name.trim(),
    german_level: GERMAN_MAP[data.germanLevel] ?? "none",
    nursing_qualification: QUALIFICATION_MAP[data.qualification] ?? "other",
    message: `Eligibility score: ${data.score}% (${data.status})`,
    german_level_filter: GERMAN_MAP[data.germanLevel] ?? "",
    score: data.score,
    status: data.status,
  };
  sessionStorage.setItem(KEY, JSON.stringify(prefill));
  return prefill;
}

export function loadEligibilityPrefill(): EligibilityPrefill | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as EligibilityPrefill) : null;
  } catch {
    return null;
  }
}

export function clearEligibilityPrefill() {
  sessionStorage.removeItem(KEY);
}
