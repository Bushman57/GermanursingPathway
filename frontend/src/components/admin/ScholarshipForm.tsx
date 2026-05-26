import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, TextArea, TextInput, linesToList, listToLines } from "@/components/admin/FormField";
import type { ProgramType, Scholarship } from "@/lib/scholarships";
import { slugify } from "@/lib/slugify";

const emptyScholarship = (): Record<string, unknown> => ({
  slug: "",
  title: "",
  provider: "",
  degreeLevel: "",
  funding: "",
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
  applicationLink: "",
  officialLink: "",
  programType: "other",
  verified: false,
});

function scholarshipToForm(s: Scholarship): Record<string, unknown> {
  return { ...s };
}

type Props = {
  initial?: Scholarship;
  isNew: boolean;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
};

export function ScholarshipForm({ initial, isNew, onSubmit }: Props) {
  const [data, setData] = useState<Record<string, unknown>>(
    initial ? scholarshipToForm(initial) : emptyScholarship(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const slugTouched = useRef(false);

  const set = (key: string, value: unknown) => setData((d) => ({ ...d, [key]: value }));

  const updateTitle = (title: string) => {
    setData((d) => {
      const next = { ...d, title };
      if (isNew && !slugTouched.current) {
        next.slug = slugify(title);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const rawSlug = String(data.slug || data.title || "");
      const payload = {
        ...data,
        slug: slugify(rawSlug) || slugify(String(data.title || "")),
        benefits: linesToList(String(data.benefitsText ?? listToLines(data.benefits as string[]))),
        eligibility: linesToList(String(data.eligibilityText ?? listToLines(data.eligibility as string[]))),
        requiredDocuments: linesToList(
          String(data.requiredDocumentsText ?? listToLines(data.requiredDocuments as string[])),
        ),
        applicationProcess: linesToList(
          String(data.applicationProcessText ?? listToLines(data.applicationProcess as string[])),
        ),
        benefitsDe: linesToList(String(data.benefitsDeText ?? listToLines(data.benefitsDe as string[]))),
        eligibilityDe: linesToList(String(data.eligibilityDeText ?? listToLines(data.eligibilityDe as string[]))),
        requiredDocumentsDe: linesToList(
          String(data.requiredDocumentsDeText ?? listToLines(data.requiredDocumentsDe as string[])),
        ),
        applicationProcessDe: linesToList(
          String(data.applicationProcessDeText ?? listToLines(data.applicationProcessDe as string[])),
        ),
      };
      delete payload.benefitsText;
      delete payload.eligibilityText;
      delete payload.requiredDocumentsText;
      delete payload.applicationProcessText;
      delete payload.benefitsDeText;
      delete payload.eligibilityDeText;
      delete payload.requiredDocumentsDeText;
      delete payload.applicationProcessDeText;
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const init = initial ? scholarshipToForm(initial) : emptyScholarship();
  const benefitsText = listToLines((init.benefits as string[]) ?? []);
  const eligibilityText = listToLines((init.eligibility as string[]) ?? []);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">Basics</h2>
        <FormField label="Program type">
          <select
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            value={String(data.programType ?? "other")}
            onChange={(e) => set("programType", e.target.value as ProgramType)}
          >
            <option value="nursing_scholarship">Nursing scholarship</option>
            <option value="ausbildung">Ausbildung</option>
            <option value="other">Other</option>
          </select>
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(data.verified)}
            onChange={(e) => set("verified", e.target.checked)}
          />
          Verified program
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">English</h2>
        <FormField label="Title">
          <TextInput
            value={String(data.title ?? "")}
            onChange={(e) => updateTitle(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Slug (URL)">
          <TextInput
            value={String(data.slug ?? "")}
            onChange={(e) => {
              slugTouched.current = true;
              set("slug", e.target.value);
            }}
            disabled={!isNew}
            placeholder="Auto-generated from title; uppercase, spaces, and ü → ue OK"
          />
          {isNew && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-8 text-xs"
              onClick={() => {
                slugTouched.current = false;
                const title = String(data.title ?? "");
                if (title) set("slug", slugify(title));
              }}
            >
              Regenerate slug from title
            </Button>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Saved as lowercase with hyphens (e.g. Dülmen Ausbildung 2027 → duelmen-ausbildung-2027).
          </p>
        </FormField>
        <FormField label="Provider">
          <TextInput value={String(data.provider ?? "")} onChange={(e) => set("provider", e.target.value)} />
        </FormField>
        <FormField label="Short description">
          <TextArea value={String(data.shortDescription ?? "")} onChange={(e) => set("shortDescription", e.target.value)} required />
        </FormField>
        <FormField label="About">
          <TextArea rows={6} value={String(data.about ?? "")} onChange={(e) => set("about", e.target.value)} />
        </FormField>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Funding">
            <TextInput value={String(data.funding ?? "")} onChange={(e) => set("funding", e.target.value)} />
          </FormField>
          <FormField label="Deadline">
            <TextInput value={String(data.deadline ?? "")} onChange={(e) => set("deadline", e.target.value)} />
          </FormField>
          <FormField label="Location">
            <TextInput value={String(data.location ?? "")} onChange={(e) => set("location", e.target.value)} />
          </FormField>
          <FormField label="Degree level">
            <TextInput value={String(data.degreeLevel ?? "")} onChange={(e) => set("degreeLevel", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Benefits (one per line)">
          <TextArea
            rows={5}
            defaultValue={benefitsText}
            onChange={(e) => set("benefitsText", e.target.value)}
          />
        </FormField>
        <FormField label="Eligibility (one per line)">
          <TextArea
            rows={5}
            defaultValue={eligibilityText}
            onChange={(e) => set("eligibilityText", e.target.value)}
          />
        </FormField>
        <FormField label="Required documents (one per line)">
          <TextArea
            rows={4}
            defaultValue={listToLines(data.requiredDocuments as string[])}
            onChange={(e) => set("requiredDocumentsText", e.target.value)}
          />
        </FormField>
        <FormField label="Application process (one per line)">
          <TextArea
            rows={4}
            defaultValue={listToLines(data.applicationProcess as string[])}
            onChange={(e) => set("applicationProcessText", e.target.value)}
          />
        </FormField>
        <FormField label="Application URL">
          <TextInput
            value={String(data.applicationLink ?? "")}
            onChange={(e) => set("applicationLink", e.target.value)}
            placeholder="https://program.example/apply or /register"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Used for the Apply button on scholarship cards and the detail page. Use a full https URL for external applications, or /register for German Nursing Pathway registration.
          </p>
        </FormField>
        <FormField label="Official institution / program URL">
          <TextInput
            type="url"
            value={String(data.officialLink ?? "")}
            onChange={(e) => set("officialLink", e.target.value)}
            placeholder="https://university-or-program.example"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Shown on the detail page as the official program page (https only). Used as the Apply fallback if the application URL is empty, then /register if both are empty.
          </p>
        </FormField>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold text-lg">German (optional)</h2>
        <FormField label="Title (DE)">
          <TextInput value={String(data.titleDe ?? "")} onChange={(e) => set("titleDe", e.target.value)} />
        </FormField>
        <FormField label="Short description (DE)">
          <TextArea value={String(data.shortDescriptionDe ?? "")} onChange={(e) => set("shortDescriptionDe", e.target.value)} />
        </FormField>
        <FormField label="About (DE)">
          <TextArea rows={5} value={String(data.aboutDe ?? "")} onChange={(e) => set("aboutDe", e.target.value)} />
        </FormField>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="warm" disabled={saving}>
        {saving ? "Saving…" : "Save scholarship"}
      </Button>
    </form>
  );
}
