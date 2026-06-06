import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, TextArea, TextInput } from "@/components/admin/FormField";
import type { ArticleData, ResourceArticle, ResourceCategory } from "@/lib/resources";
import { learningModules } from "@/lib/learningModules";
import { slugify } from "@/lib/slugify";

type ResourceFormData = ResourceArticle & { isPublished: boolean };

const emptyArticleData = (): ArticleData => ({
  moduleId: undefined,
  topicOrder: undefined,
  videoUrl: undefined,
  takeaways: undefined,
});

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
  articleData: emptyArticleData(),
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
          articleData: initial.articleData ?? emptyArticleData(),
        }
      : emptyResource(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const slugTouched = useRef(false);

  const set = <K extends keyof ResourceFormData>(key: K, value: ResourceFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const setArticleData = <K extends keyof ArticleData>(key: K, value: ArticleData[K]) =>
    setData((d) => ({
      ...d,
      articleData: { ...emptyArticleData(), ...d.articleData, [key]: value },
    }));

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
      const articleData = data.articleData;
      const cleanedData: ArticleData | undefined =
        articleData?.moduleId ||
        articleData?.topicOrder !== undefined ||
        articleData?.videoUrl ||
        (articleData?.takeaways?.length ?? 0) > 0
          ? {
              moduleId: articleData?.moduleId || undefined,
              topicOrder:
                articleData?.topicOrder !== undefined && articleData.topicOrder !== null
                  ? Number(articleData.topicOrder)
                  : undefined,
              videoUrl: articleData?.videoUrl?.trim() || undefined,
              takeaways: articleData?.takeaways?.filter(Boolean),
            }
          : undefined;
      await onSubmit({ ...data, slug, articleData: cleanedData });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const takeawaysText = (data.articleData?.takeaways ?? []).join("\n");

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
      <FormField label="Learning module (optional)">
        <select
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
          value={data.articleData?.moduleId ?? ""}
          onChange={(e) => setArticleData("moduleId", e.target.value || undefined)}
        >
          <option value="">— Not linked to a module —</option>
          {learningModules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.emoji} {m.title}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Topic order in module (0-based, optional)">
        <TextInput
          type="number"
          min={0}
          value={data.articleData?.topicOrder ?? ""}
          onChange={(e) =>
            setArticleData(
              "topicOrder",
              e.target.value === "" ? undefined : Number(e.target.value),
            )
          }
          placeholder="e.g. 0 for first topic"
        />
      </FormField>
      <FormField label="Video URL (optional)">
        <TextInput
          value={data.articleData?.videoUrl ?? ""}
          onChange={(e) => setArticleData("videoUrl", e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </FormField>
      <FormField label="Key takeaways (optional, one per line)">
        <TextArea
          rows={4}
          value={takeawaysText}
          onChange={(e) =>
            setArticleData(
              "takeaways",
              e.target.value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
            )
          }
          placeholder="Bullet points shown above the article body"
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
        {saving ? "Saving…" : "Save resource"}
      </Button>
    </form>
  );
}
