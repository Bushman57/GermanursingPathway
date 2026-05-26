import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, TextArea, TextInput } from "@/components/admin/FormField";
import type { ResourceArticle, ResourceCategory } from "@/lib/resources";
import { slugify } from "@/lib/slugify";

type ResourceFormData = ResourceArticle & { isPublished: boolean };

const emptyResource = (): ResourceFormData => ({
  slug: "",
  titleEn: "",
  titleDe: "",
  excerptEn: "",
  excerptDe: "",
  bodyEn: "",
  bodyDe: "",
  category: "guide",
  readMinutes: 5,
  isPublished: true,
});

type Props = {
  initial?: ResourceArticle & { isPublished?: boolean };
  isNew: boolean;
  onSubmit: (data: ResourceFormData) => Promise<void>;
};

export function ResourceForm({ initial, isNew, onSubmit }: Props) {
  const [data, setData] = useState<ResourceFormData>(
    initial
      ? {
          ...initial,
          bodyEn: initial.bodyEn ?? "",
          bodyDe: initial.bodyDe ?? "",
          isPublished: initial.isPublished ?? true,
        }
      : emptyResource(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const slugTouched = useRef(false);

  const set = <K extends keyof ResourceFormData>(key: K, value: ResourceFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const updateTitleEn = (titleEn: string) => {
    setData((d) => {
      const next = { ...d, titleEn };
      if (isNew && !slugTouched.current) {
        next.slug = slugify(titleEn);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const slug = slugify(data.slug || data.titleEn) || slugify(data.titleEn);
      await onSubmit({ ...data, slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <FormField label="Title (EN)">
        <TextInput
          value={data.titleEn}
          onChange={(e) => updateTitleEn(e.target.value)}
          required
        />
      </FormField>
      <FormField label="Slug">
        <TextInput
          value={data.slug}
          onChange={(e) => {
            slugTouched.current = true;
            set("slug", e.target.value);
          }}
          disabled={!isNew}
          placeholder="Auto-generated from English title"
        />
        {isNew && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-8 text-xs"
            onClick={() => {
              slugTouched.current = false;
              if (data.titleEn) set("slug", slugify(data.titleEn));
            }}
          >
            Regenerate slug from title
          </Button>
        )}
      </FormField>
      <FormField label="Category">
        <select
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
          value={data.category}
          onChange={(e) => set("category", e.target.value as ResourceCategory)}
        >
          <option value="language">Language</option>
          <option value="visa">Visa</option>
          <option value="story">Story</option>
          <option value="guide">Guide</option>
        </select>
      </FormField>
      <FormField label="Read time (minutes)">
        <TextInput
          type="number"
          min={1}
          value={data.readMinutes}
          onChange={(e) => set("readMinutes", Number(e.target.value) || 5)}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.isPublished}
          onChange={(e) => set("isPublished", e.target.checked)}
        />
        Published on website
      </label>
      <FormField label="Title (DE)">
        <TextInput value={data.titleDe} onChange={(e) => set("titleDe", e.target.value)} />
      </FormField>
      <FormField label="Excerpt (EN)">
        <TextArea value={data.excerptEn} onChange={(e) => set("excerptEn", e.target.value)} required />
      </FormField>
      <FormField label="Excerpt (DE)">
        <TextArea value={data.excerptDe} onChange={(e) => set("excerptDe", e.target.value)} />
      </FormField>
      <FormField label="Body (EN)">
        <TextArea rows={10} value={data.bodyEn} onChange={(e) => set("bodyEn", e.target.value)} />
      </FormField>
      <FormField label="Body (DE)">
        <TextArea rows={10} value={data.bodyDe} onChange={(e) => set("bodyDe", e.target.value)} />
      </FormField>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="warm" disabled={saving}>
        {saving ? "Saving…" : "Save resource"}
      </Button>
    </form>
  );
}
