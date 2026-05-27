import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, TextArea, TextInput, linesToList, listToLines } from "@/components/admin/FormField";
import { AdminCheckboxGroup } from "@/components/admin/AdminCheckboxGroup";
import { AdminRadioGroup } from "@/components/admin/AdminRadioGroup";
import { AdminSelect } from "@/components/admin/AdminSelect";
import type { ProgramType, Scholarship } from "@/lib/scholarships";
import {
  ACCOMMODATION_SUPPORT_OPTIONS,
  APPLICATION_METHOD_OPTIONS,
  APPLICATION_STATUS_OPTIONS,
  DATA_VERIFICATION_STATUS_OPTIONS,
  DEGREE_LEVEL_OPTIONS,
  FUNDING_TYPE_OPTIONS,
  GERMAN_LEVEL_OPTIONS,
  INTAKE_MONTH_OPTIONS,
  INTERVIEW_REQUIRED_OPTIONS,
  LANGUAGE_OF_INSTRUCTION_OPTIONS,
  PROGRAM_DURATION_OPTIONS,
  PROGRAM_TYPE_OPTIONS,
  PROVIDER_TYPE_OPTIONS,
  RECOGNITION_SUPPORT_OPTIONS,
  REQUIRED_DOCUMENTS_OPTIONS,
  SCHOLARSHIP_BENEFITS_OPTIONS,
  SCHOLARSHIP_TAGS_OPTIONS,
  TARGET_APPLICANTS_OPTIONS,
  VERIFICATION_STATUS_OPTIONS,
  VISA_SPONSORSHIP_OPTIONS,
} from "@/lib/scholarshipFieldOptions";
import { slugify } from "@/lib/slugify";

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function normalizeSingleEnumValue(value: unknown, options: { value: string; label: string }[], fallback: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;

  // Normalize for legacy values that may be labels ("Not Specified") instead of enum values ("not_specified").
  const normalize = (s: string) =>
    s
      .trim()
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();

  const normRaw = normalize(raw);

  // Exact enum match first.
  const byValue = options.find((o) => o.value === raw);
  if (byValue) return byValue.value;

  // Legacy label match (case-insensitive).
  const byLabel = options.find((o) => normalize(o.label) === normRaw);
  if (byLabel) return byLabel.value;

  // Last resort: try normalizing enum values too.
  const byEnumNorm = options.find((o) => normalize(o.value) === normRaw);
  return byEnumNorm?.value ?? fallback;
}

function emptyScholarship(): Record<string, unknown> {
  return {
    slug: "",
    title: "",
    provider: "",
    degreeLevel: "not_specified",
    funding: "fully_funded",
    deadline: "",
    location: "",
    shortDescription: "",
    about: "",
    hostCountry: "Germany",
    studyIn: "",
    category: "",
    eligibleCountries: "Kenya",
    benefits: [],
    eligibility: [],
    requiredDocuments: [],
    applicationProcess: [],
    languagesOfInstruction: [],
    targetApplicants: [],
    tags: [],
    applicationLink: "",
    officialLink: "",
    programType: "other",
    verified: false,
    verificationStatus: "pending",
    dataVerificationStatus: "draft",
    applicationStatus: "open",
    germanLevelRequired: "none",
    visaSponsorship: "not_specified",
    accommodationSupport: "not_specified",
    intakeMonth: "",
    programDuration: "",
    recognitionSupport: "not_applicable",
    interviewRequired: "no",
    applicationMethod: "agency_application",
    providerType: "",
  };
}

function normalizeInitial(s: Scholarship): Record<string, unknown> {
  const base = { ...s } as Record<string, unknown>;
  if (!base.verificationStatus) {
    base.verificationStatus = s.verified ? "yes" : "no";
  }
  base.dataVerificationStatus = normalizeSingleEnumValue(
    base.dataVerificationStatus,
    DATA_VERIFICATION_STATUS_OPTIONS,
    "draft",
  );
  base.applicationStatus = normalizeSingleEnumValue(
    base.applicationStatus,
    APPLICATION_STATUS_OPTIONS,
    "open",
  );
  base.funding = normalizeSingleEnumValue(base.funding, FUNDING_TYPE_OPTIONS, "fully_funded");
  base.degreeLevel = normalizeSingleEnumValue(
    base.degreeLevel,
    DEGREE_LEVEL_OPTIONS,
    "not_specified",
  );
  base.germanLevelRequired = normalizeSingleEnumValue(base.germanLevelRequired, GERMAN_LEVEL_OPTIONS, "none");
  base.accommodationSupport = normalizeSingleEnumValue(
    base.accommodationSupport,
    ACCOMMODATION_SUPPORT_OPTIONS,
    "not_specified",
  );
  base.recognitionSupport = normalizeSingleEnumValue(
    base.recognitionSupport,
    RECOGNITION_SUPPORT_OPTIONS,
    "not_applicable",
  );
  base.applicationMethod = normalizeSingleEnumValue(
    base.applicationMethod,
    APPLICATION_METHOD_OPTIONS,
    "agency_application",
  );
  base.benefits = asStringArray(base.benefits);
  base.requiredDocuments = asStringArray(base.requiredDocuments);
  base.tags = asStringArray(base.tags);
  base.languagesOfInstruction = asStringArray(base.languagesOfInstruction);
  base.targetApplicants = asStringArray(base.targetApplicants);
  return base;
}

type Props = {
  initial?: Scholarship;
  isNew: boolean;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
};

export function ScholarshipForm({ initial, isNew, onSubmit }: Props) {
  const [data, setData] = useState<Record<string, unknown>>(
    initial ? normalizeInitial(initial) : emptyScholarship(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const slugTouched = useRef(false);

  const set = (key: string, value: unknown) => {
    setData((d) => ({ ...d, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const defaults = {
    title: "",
    shortDescription: "",
    degreeLevel: "not_specified",
    programType: "other",
    verificationStatus: "pending",
    dataVerificationStatus: "draft",
    applicationStatus: "open",
    funding: "fully_funded",
    germanLevelRequired: "none",
    visaSponsorship: "not_specified",
    accommodationSupport: "not_specified",
    recognitionSupport: "not_applicable",
    interviewRequired: "no",
    applicationMethod: "agency_application",
  } as const;

  const effective = (key: keyof typeof defaults): string =>
    String((data as Record<string, unknown>)[key] ?? defaults[key]).trim();

  const requiredFieldErrors = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!effective("title")) next.title = "Title is required.";
    if (!effective("shortDescription")) next.shortDescription = "Short description is required.";
    if (!effective("degreeLevel")) next.degreeLevel = "Degree level is required.";
    if (!effective("programType")) next.programType = "Program type is required.";
    if (!effective("verificationStatus"))
      next.verificationStatus = "Verification status is required.";
    if (!effective("dataVerificationStatus"))
      next.dataVerificationStatus = "Data verification status is required.";
    if (!effective("applicationStatus")) next.applicationStatus = "Application status is required.";
    if (!effective("funding")) next.funding = "Funding type is required.";
    if (!effective("germanLevelRequired")) next.germanLevelRequired = "German level is required.";
    if (!effective("visaSponsorship")) next.visaSponsorship = "Visa sponsorship is required.";
    if (!effective("accommodationSupport"))
      next.accommodationSupport = "Accommodation support is required.";
    if (!effective("recognitionSupport")) next.recognitionSupport = "Recognition support is required.";
    if (!effective("interviewRequired")) next.interviewRequired = "Interview required is required.";
    if (!effective("applicationMethod")) next.applicationMethod = "Application method is required.";
    return next;
  };

  const mapBackendFieldErrors = (message: string): Record<string, string> => {
    const next: Record<string, string> = {};
    const snakeToCamel: Record<string, string> = {
      degree_level: "degreeLevel",
      short_description: "shortDescription",
      program_type: "programType",
    };

    if (/title and shortDescription are required/i.test(message)) {
      next.title = "Title is required.";
      next.shortDescription = "Short description is required.";
      return next;
    }

    const invalidMatch = message.match(/Invalid\s+([A-Za-z_][A-Za-z0-9_]*)/);
    if (invalidMatch?.[1]) {
      const raw = invalidMatch[1];
      const field = snakeToCamel[raw] ?? raw;
      next[field] = message;
    }
    return next;
  };

  const setVerificationStatus = (verificationStatus: string) => {
    setData((d) => ({
      ...d,
      verificationStatus,
      verified: verificationStatus === "yes",
    }));
    setFieldErrors((prev) => {
      if (!prev.verificationStatus) return prev;
      const next = { ...prev };
      delete next.verificationStatus;
      return next;
    });
  };

  const updateTitle = (title: string) => {
    setData((d) => {
      const next = { ...d, title };
      if (isNew && !slugTouched.current) {
        next.slug = slugify(title);
      }
      return next;
    });
    setFieldErrors((prev) => {
      if (!prev.title) return prev;
      const next = { ...prev };
      delete next.title;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const missing = requiredFieldErrors();
    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing);
      setSaving(false);
      return;
    }
    try {
      const rawSlug = String(data.slug || data.title || "");
      const vStatus = effective("verificationStatus");
      const payload: Record<string, unknown> = {
        ...data,
        slug: slugify(rawSlug) || slugify(String(data.title || "")),
        verified: vStatus === "yes",
        verificationStatus: vStatus,
        programType: effective("programType"),
        dataVerificationStatus: normalizeSingleEnumValue(
          effective("dataVerificationStatus"),
          DATA_VERIFICATION_STATUS_OPTIONS,
          "draft",
        ),
        applicationStatus: normalizeSingleEnumValue(
          effective("applicationStatus"),
          APPLICATION_STATUS_OPTIONS,
          "open",
        ),
        funding: normalizeSingleEnumValue(effective("funding"), FUNDING_TYPE_OPTIONS, "fully_funded"),
        degreeLevel: normalizeSingleEnumValue(effective("degreeLevel"), DEGREE_LEVEL_OPTIONS, "not_specified"),
        germanLevelRequired: normalizeSingleEnumValue(
          effective("germanLevelRequired"),
          GERMAN_LEVEL_OPTIONS,
          "none",
        ),
        visaSponsorship: normalizeSingleEnumValue(
          effective("visaSponsorship"),
          VISA_SPONSORSHIP_OPTIONS,
          "not_specified",
        ),
        accommodationSupport: normalizeSingleEnumValue(
          effective("accommodationSupport"),
          ACCOMMODATION_SUPPORT_OPTIONS,
          "not_specified",
        ),
        recognitionSupport: normalizeSingleEnumValue(
          effective("recognitionSupport"),
          RECOGNITION_SUPPORT_OPTIONS,
          "not_applicable",
        ),
        interviewRequired: effective("interviewRequired"),
        applicationMethod: normalizeSingleEnumValue(
          effective("applicationMethod"),
          APPLICATION_METHOD_OPTIONS,
          "agency_application",
        ),
        benefits: asStringArray(data.benefits),
        requiredDocuments: asStringArray(data.requiredDocuments),
        tags: asStringArray(data.tags),
        languagesOfInstruction: asStringArray(data.languagesOfInstruction),
        targetApplicants: asStringArray(data.targetApplicants),
        eligibility: linesToList(String(data.eligibilityText ?? listToLines(data.eligibility as string[]))),
        applicationProcess: linesToList(
          String(data.applicationProcessText ?? listToLines(data.applicationProcess as string[])),
        ),
        eligibilityDe: linesToList(String(data.eligibilityDeText ?? listToLines(data.eligibilityDe as string[]))),
        applicationProcessDe: linesToList(
          String(data.applicationProcessDeText ?? listToLines(data.applicationProcessDe as string[])),
        ),
      };
      delete payload.eligibilityText;
      delete payload.applicationProcessText;
      delete payload.eligibilityDeText;
      delete payload.applicationProcessDeText;
      await onSubmit(payload);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      const mapped = mapBackendFieldErrors(msg);
      if (Object.keys(mapped).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...mapped }));
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const eligibilityText = listToLines(asStringArray(data.eligibility));
  const applicationProcessText = listToLines(asStringArray(data.applicationProcess));

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">Classification</h2>
        <FormField label="Program type" required error={fieldErrors.programType}>
          <AdminSelect
            options={PROGRAM_TYPE_OPTIONS}
            value={String(data.programType ?? "other")}
            onChange={(v) => set("programType", v as ProgramType)}
          />
        </FormField>
        <FormField label="Provider type" error={fieldErrors.providerType}>
          <AdminSelect
            options={PROVIDER_TYPE_OPTIONS}
            value={String(data.providerType ?? "")}
            onChange={(v) => set("providerType", v)}
            allowEmpty
            placeholder="Select provider type"
          />
        </FormField>
        <FormField label="Verified program" required error={fieldErrors.verificationStatus}>
          <AdminRadioGroup
            name="verificationStatus"
            options={VERIFICATION_STATUS_OPTIONS}
            value={String(data.verificationStatus ?? "pending")}
            onChange={setVerificationStatus}
          />
        </FormField>
        <FormField label="Data verification status (admin)" required error={fieldErrors.dataVerificationStatus}>
          <AdminSelect
            options={DATA_VERIFICATION_STATUS_OPTIONS}
            value={String(data.dataVerificationStatus ?? "draft")}
            onChange={(v) => set("dataVerificationStatus", v)}
          />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">Application & intake</h2>
        <FormField label="Application status" required error={fieldErrors.applicationStatus}>
          <AdminSelect
            options={APPLICATION_STATUS_OPTIONS}
            value={String(data.applicationStatus ?? "open")}
            onChange={(v) => set("applicationStatus", v)}
          />
        </FormField>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Intake month">
            <AdminSelect
              options={INTAKE_MONTH_OPTIONS}
              value={String(data.intakeMonth ?? "")}
              onChange={(v) => set("intakeMonth", v)}
              allowEmpty
              placeholder="Not specified"
            />
          </FormField>
          <FormField label="Program duration">
            <AdminSelect
              options={PROGRAM_DURATION_OPTIONS}
              value={String(data.programDuration ?? "")}
              onChange={(v) => set("programDuration", v)}
              allowEmpty
              placeholder="Not specified"
            />
          </FormField>
        </div>
        <FormField label="Application method" required error={fieldErrors.applicationMethod}>
          <AdminSelect
            options={APPLICATION_METHOD_OPTIONS}
            value={String(data.applicationMethod ?? "")}
            onChange={(v) => set("applicationMethod", v)}
            allowEmpty
          />
        </FormField>
        <FormField label="Interview required" required error={fieldErrors.interviewRequired}>
          <AdminRadioGroup
            name="interviewRequired"
            options={INTERVIEW_REQUIRED_OPTIONS}
            value={String(data.interviewRequired ?? "no")}
            onChange={(v) => set("interviewRequired", v)}
          />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">Requirements</h2>
        <FormField label="German language requirement" required error={fieldErrors.germanLevelRequired}>
          <AdminSelect
            options={GERMAN_LEVEL_OPTIONS}
            value={String(data.germanLevelRequired ?? "none")}
            onChange={(v) => set("germanLevelRequired", v)}
          />
        </FormField>
        <FormField label="Language of instruction">
          <AdminCheckboxGroup
            options={LANGUAGE_OF_INSTRUCTION_OPTIONS}
            value={asStringArray(data.languagesOfInstruction)}
            onChange={(v) => set("languagesOfInstruction", v)}
          />
        </FormField>
        <FormField label="Visa sponsorship" required error={fieldErrors.visaSponsorship}>
          <AdminRadioGroup
            name="visaSponsorship"
            options={VISA_SPONSORSHIP_OPTIONS}
            value={String(data.visaSponsorship ?? "not_specified")}
            onChange={(v) => set("visaSponsorship", v)}
          />
        </FormField>
        <FormField label="Accommodation support" required error={fieldErrors.accommodationSupport}>
          <AdminSelect
            options={ACCOMMODATION_SUPPORT_OPTIONS}
            value={String(data.accommodationSupport ?? "not_specified")}
            onChange={(v) => set("accommodationSupport", v)}
          />
        </FormField>
        <FormField label="Recognition support" required error={fieldErrors.recognitionSupport}>
          <AdminSelect
            options={RECOGNITION_SUPPORT_OPTIONS}
            value={String(data.recognitionSupport ?? "not_applicable")}
            onChange={(v) => set("recognitionSupport", v)}
          />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">Funding</h2>
        <FormField label="Funding type" required error={fieldErrors.funding}>
          <AdminSelect
            options={FUNDING_TYPE_OPTIONS}
            value={String(data.funding ?? "")}
            onChange={(v) => set("funding", v)}
            allowEmpty
          />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">Audience & tags</h2>
        <FormField label="Target applicants">
          <AdminCheckboxGroup
            options={TARGET_APPLICANTS_OPTIONS}
            value={asStringArray(data.targetApplicants)}
            onChange={(v) => set("targetApplicants", v)}
          />
        </FormField>
        <FormField label="Scholarship tags">
          <AdminCheckboxGroup
            options={SCHOLARSHIP_TAGS_OPTIONS}
            value={asStringArray(data.tags)}
            onChange={(v) => set("tags", v)}
          />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">Benefits & documents</h2>
        <FormField label="Scholarship benefits" error={fieldErrors.benefits}>
          <AdminCheckboxGroup
            options={SCHOLARSHIP_BENEFITS_OPTIONS}
            value={asStringArray(data.benefits)}
            onChange={(v) => set("benefits", v)}
          />
        </FormField>
        <FormField label="Required documents" error={fieldErrors.requiredDocuments}>
          <AdminCheckboxGroup
            options={REQUIRED_DOCUMENTS_OPTIONS}
            value={asStringArray(data.requiredDocuments)}
            onChange={(v) => set("requiredDocuments", v)}
          />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">English content</h2>
        <FormField label="Title" required error={fieldErrors.title}>
          <TextInput value={String(data.title ?? "")} onChange={(e) => updateTitle(e.target.value)} required />
        </FormField>
        <FormField label="Slug (URL)">
          <TextInput
            value={String(data.slug ?? "")}
            onChange={(e) => {
              slugTouched.current = true;
              set("slug", e.target.value);
            }}
            disabled={!isNew}
          />
        </FormField>
        <FormField label="Provider (institution name)">
          <TextInput value={String(data.provider ?? "")} onChange={(e) => set("provider", e.target.value)} />
        </FormField>
        <FormField label="Short description" required error={fieldErrors.shortDescription}>
          <TextArea
            value={String(data.shortDescription ?? "")}
            onChange={(e) => set("shortDescription", e.target.value)}
            required
          />
        </FormField>
        <FormField label="About">
          <TextArea rows={6} value={String(data.about ?? "")} onChange={(e) => set("about", e.target.value)} />
        </FormField>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Degree level" required error={fieldErrors.degreeLevel}>
            <AdminSelect
              options={DEGREE_LEVEL_OPTIONS}
              value={String(data.degreeLevel ?? "not_specified")}
              onChange={(v) => set("degreeLevel", v)}
            />
          </FormField>
          <FormField label="Deadline">
            <TextInput value={String(data.deadline ?? "")} onChange={(e) => set("deadline", e.target.value)} />
          </FormField>
          <FormField label="Location">
            <TextInput value={String(data.location ?? "")} onChange={(e) => set("location", e.target.value)} />
          </FormField>
          <FormField label="Category">
            <TextInput value={String(data.category ?? "")} onChange={(e) => set("category", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Eligibility (one per line)">
          <TextArea rows={4} defaultValue={eligibilityText} onChange={(e) => set("eligibilityText", e.target.value)} />
        </FormField>
        <FormField label="Application process (one per line)">
          <TextArea
            rows={4}
            defaultValue={applicationProcessText}
            onChange={(e) => set("applicationProcessText", e.target.value)}
          />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">German (optional)</h2>
        <FormField label="Title (DE)">
          <TextInput value={String(data.titleDe ?? "")} onChange={(e) => set("titleDe", e.target.value)} />
        </FormField>
        <FormField label="Short description (DE)">
          <TextArea
            value={String(data.shortDescriptionDe ?? "")}
            onChange={(e) => set("shortDescriptionDe", e.target.value)}
          />
        </FormField>
        <FormField label="About (DE)">
          <TextArea rows={5} value={String(data.aboutDe ?? "")} onChange={(e) => set("aboutDe", e.target.value)} />
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">Links</h2>
        <FormField label="Application URL">
          <TextInput
            value={String(data.applicationLink ?? "")}
            onChange={(e) => set("applicationLink", e.target.value)}
            placeholder="https://… or /register"
          />
        </FormField>
        <FormField label="Official program URL">
          <TextInput
            type="url"
            value={String(data.officialLink ?? "")}
            onChange={(e) => set("officialLink", e.target.value)}
            placeholder="https://…"
          />
        </FormField>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="warm" disabled={saving}>
        {saving ? "Saving…" : "Save scholarship"}
      </Button>
    </form>
  );
}
