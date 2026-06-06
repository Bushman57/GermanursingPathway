import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, TextArea, TextInput } from "@/components/admin/FormField";
import type { BlogCategory, BlogPost } from "@/lib/blogs";
import { learningModules } from "@/lib/learningModules";
import { slugify } from "@/lib/slugify";

type BlogFormData = BlogPost & { isPublished: boolean };

const emptyBlog = (): BlogFormData => ({
  slug: "",
  titleEn: "",
  titleDe: "",
  excerptEn: "",
  excerptDe: "",
  bodyEn: "",
  bodyDe: "",
  moduleId: null,
  topicIndex: null,
  category: "guide",
  author: "",
  readMinutes: 5,
  featuredImageUrl: "",
  externalUrl: "",
  isPublished: true,
});

type Props = {
  initial?: BlogPost & { isPublished?: boolean };
  isNew: boolean;
  onSubmit: (data: BlogFormData) => Promise<void>;
};

export function BlogForm({ initial, isNew, onSubmit }: Props) {
  const [data, setData] = useState<BlogFormData>(
    initial
      ? {
          ...initial,
          bodyEn: initial.bodyEn ?? "",
          bodyDe: initial.bodyDe ?? "",
          author: initial.author ?? "",
          featuredImageUrl: initial.featuredImageUrl ?? "",
          externalUrl: initial.externalUrl ?? "",
          isPublished: initial.isPublished ?? true,
        }
      : emptyBlog(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const slugTouched = useRef(false);

  const set = <K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) =>
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
      await onSubmit({
        ...data,
        slug,
        moduleId: data.moduleId || null,
        topicIndex: data.topicIndex ?? null,
        author: data.author?.trim() || null,
        featuredImageUrl: data.featuredImageUrl?.trim() || null,
        externalUrl: data.externalUrl?.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <FormField label="Title (EN)">
        <TextInput value={data.titleEn} onChange={(e) => updateTitleEn(e.target.value)} required />
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
      </FormField>
      <FormField label="Category">
        <select
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
          value={data.category}
          onChange={(e) => set("category", e.target.value as BlogCategory)}
        >
          <option value="language">Language</option>
          <option value="visa">Visa</option>
          <option value="story">Story</option>
          <option value="guide">Guide</option>
        </select>
      </FormField>
      <FormField label="Learning module (optional)">
        <select
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
          value={data.moduleId ?? ""}
          onChange={(e) => set("moduleId", e.target.value || null)}
        >
          <option value="">— Not linked to a module —</option>
          {learningModules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.emoji} {m.title}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Topic index in module (0-based, optional)">
        <TextInput
          type="number"
          min={0}
          value={data.topicIndex ?? ""}
          onChange={(e) =>
            set("topicIndex", e.target.value === "" ? null : Number(e.target.value))
          }
        />
      </FormField>
      <FormField label="Author (optional)">
        <TextInput value={data.author ?? ""} onChange={(e) => set("author", e.target.value)} />
      </FormField>
      <FormField label="Featured image URL (optional)">
        <TextInput
          value={data.featuredImageUrl ?? ""}
          onChange={(e) => set("featuredImageUrl", e.target.value)}
        />
      </FormField>
      <FormField label="External URL (optional)">
        <TextInput
          value={data.externalUrl ?? ""}
          onChange={(e) => set("externalUrl", e.target.value)}
          placeholder="https://..."
        />
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
        {saving ? "Saving…" : "Save blog"}
      </Button>
    </form>
  );
}
