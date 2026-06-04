import { useTranslation } from "react-i18next";
import { X, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { ScholarshipSummary } from "@/lib/scholarships";
import { scholarshipText } from "@/lib/scholarships";
import { fundingDisplayLabel, optionLabel } from "@/lib/scholarshipFieldOptions";

type Props = {
  slugs: string[];
  items: ScholarshipSummary[];
  lang: string;
  onClear: () => void;
  onRemove: (slug: string) => void;
};

export function ScholarshipCompareBar({ slugs, items, lang, onClear, onRemove }: Props) {
  const { t } = useTranslation("scholarshipsPage");
  if (slugs.length === 0) return null;

  const selected = slugs
    .map((slug) => items.find((s) => s.slug === slug))
    .filter((s): s is ScholarshipSummary => Boolean(s));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-warm" />
          {t("compare.selected", { count: slugs.length })}
        </span>
        <div className="flex items-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="warm" size="sm" disabled={selected.length < 2}>
                {t("compare.open")}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>{t("compare.title")}</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-x-auto px-4 pb-8">
                <table className="w-full text-sm border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground font-medium">{t("compare.field")}</th>
                      {selected.map((s) => (
                        <th key={s.slug} className="text-left p-2 font-medium max-w-[200px]">
                          {scholarshipText(s, "title", lang)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["provider", (s) => scholarshipText(s, "provider", lang)],
                        ["funding", (s) => fundingDisplayLabel(s.funding) || scholarshipText(s, "funding", lang)],
                        ["deadline", (s) => scholarshipText(s, "deadline", lang)],
                        ["host", (s) => s.hostCountry],
                        ["german", (s) => optionLabel(s.germanLevelRequired ?? "") || "—"],
                        ["status", (s) => optionLabel(s.applicationStatus ?? "") || "—"],
                      ] as const
                    ).map(([key, fn]) => (
                      <tr key={key} className="border-b border-border/60">
                        <td className="p-2 text-muted-foreground capitalize">{t(`compare.rows.${key}`)}</td>
                        {selected.map((s) => (
                          <td key={s.slug} className="p-2 align-top">
                            {fn(s)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DrawerContent>
          </Drawer>
          <Button variant="ghost" size="sm" onClick={onClear}>
            {t("compare.clear")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {slugs.map((slug) => (
            <span
              key={slug}
              className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
            >
              {slug}
              <button type="button" onClick={() => onRemove(slug)} aria-label="Remove">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
