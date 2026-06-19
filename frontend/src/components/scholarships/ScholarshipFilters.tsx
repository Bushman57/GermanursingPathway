import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  APPLICATION_STATUS_OPTIONS,
  GERMAN_LEVEL_OPTIONS,
  INTAKE_MONTH_OPTIONS,
  SCHOLARSHIP_TAGS_OPTIONS,
  type FieldOption,
} from "@/lib/scholarshipFieldOptions";
import {
  countActiveScholarshipFilters,
  defaultScholarshipsSearch,
  type ScholarshipsSearch,
} from "@/lib/scholarshipSearch";
import { cn } from "@/lib/utils";

type Props = {
  search: ScholarshipsSearch;
  onChange: (patch: Partial<ScholarshipsSearch>) => void;
  onApply: (next: ScholarshipsSearch) => void;
  onClear: () => void;
};

const selectClass =
  "px-2 py-1.5 rounded-lg border border-border bg-background text-xs sm:text-sm";

const chipBase =
  "px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] inline-flex items-center justify-center";

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warm/40 min-h-[44px]"
        role="searchbox"
      />
    </div>
  );
}

function FilterChipSection({
  label,
  value,
  allLabel,
  options,
  onChange,
}: {
  label: string;
  value: string;
  allLabel: string;
  options: FieldOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("")}
          className={cn(chipBase, !value ? "bg-warm text-warm-foreground" : "bg-muted text-muted-foreground border border-border")}
        >
          {allLabel}
        </button>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              chipBase,
              value === o.value
                ? "bg-warm text-warm-foreground"
                : "bg-muted text-muted-foreground border border-border",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScholarshipFiltersDesktop({ search, onChange }: Pick<Props, "search" | "onChange">) {
  const { t } = useTranslation("scholarshipsPage");

  return (
    <div className="hidden md:flex flex-col gap-4">
      <SearchInput
        value={search.q ?? ""}
        onChange={(q) => onChange({ q })}
        placeholder={t("searchPlaceholder")}
      />
      <div className="flex flex-wrap gap-3">
        <label className="text-xs">
          <span className="text-muted-foreground block mb-1">{t("filters.applicationStatus")}</span>
          <select
            className={selectClass}
            value={search.status ?? ""}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="">{t("filters.allStatuses")}</option>
            {APPLICATION_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="text-muted-foreground block mb-1">{t("filters.germanLevel")}</span>
          <select
            className={selectClass}
            value={search.german ?? ""}
            onChange={(e) => onChange({ german: e.target.value })}
          >
            <option value="">{t("filters.allLevels")}</option>
            {GERMAN_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="text-muted-foreground block mb-1">{t("filters.intake")}</span>
          <select
            className={selectClass}
            value={search.intake ?? ""}
            onChange={(e) => onChange({ intake: e.target.value })}
          >
            <option value="">{t("filters.allIntakes")}</option>
            {INTAKE_MONTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="text-muted-foreground block mb-1">{t("filters.tag")}</span>
          <select
            className={selectClass}
            value={search.tag ?? ""}
            onChange={(e) => onChange({ tag: e.target.value })}
          >
            <option value="">{t("filters.allTags")}</option>
            {SCHOLARSHIP_TAGS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function ScholarshipFiltersMobile({ search, onChange, onApply, onClear }: Props) {
  const { t } = useTranslation("scholarshipsPage");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [localQ, setLocalQ] = useState(search.q ?? "");
  const [draft, setDraft] = useState<ScholarshipsSearch>(() => ({
    ...defaultScholarshipsSearch,
    ...search,
  }));

  const activeCount = countActiveScholarshipFilters(search);

  useEffect(() => {
    setLocalQ(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if ((search.q ?? "") !== localQ) {
        onChange({ q: localQ });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [localQ, search.q, onChange]);

  useEffect(() => {
    if (sheetOpen) {
      setDraft({ ...defaultScholarshipsSearch, ...search });
    }
  }, [sheetOpen, search]);

  const patchDraft = (patch: Partial<ScholarshipsSearch>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleApply = () => {
    onApply({ ...defaultScholarshipsSearch, ...draft, q: localQ });
    setSheetOpen(false);
  };

  return (
    <div className="md:hidden flex flex-col gap-3">
      <SearchInput
        value={localQ}
        onChange={setLocalQ}
        placeholder={t("searchPlaceholder")}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full min-h-[44px] justify-between gap-2"
        onClick={() => setSheetOpen(true)}
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          {t("filters.open")}
        </span>
        {activeCount > 0 ? (
          <Badge className="bg-warm/15 text-warm border-warm/30 hover:bg-warm/15">
            {t("filters.activeCount", { count: activeCount })}
          </Badge>
        ) : null}
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] overflow-y-auto rounded-t-2xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="text-left pb-2">
            <SheetTitle>{t("filters.open")}</SheetTitle>
            <SheetDescription>
              {countActiveScholarshipFilters(draft) > 0
                ? t("filters.activeCount", { count: countActiveScholarshipFilters(draft) })
                : t("filters.sheetHint")}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-4">
            <FilterChipSection
              label={t("filters.applicationStatus")}
              value={draft.status ?? ""}
              allLabel={t("filters.allStatuses")}
              options={APPLICATION_STATUS_OPTIONS}
              onChange={(status) => patchDraft({ status })}
            />
            <FilterChipSection
              label={t("filters.germanLevel")}
              value={draft.german ?? ""}
              allLabel={t("filters.allLevels")}
              options={GERMAN_LEVEL_OPTIONS}
              onChange={(german) => patchDraft({ german })}
            />
            <FilterChipSection
              label={t("filters.intake")}
              value={draft.intake ?? ""}
              allLabel={t("filters.allIntakes")}
              options={INTAKE_MONTH_OPTIONS}
              onChange={(intake) => patchDraft({ intake })}
            />
            <FilterChipSection
              label={t("filters.tag")}
              value={draft.tag ?? ""}
              allLabel={t("filters.allTags")}
              options={SCHOLARSHIP_TAGS_OPTIONS}
              onChange={(tag) => patchDraft({ tag })}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={() => {
                onClear();
                setSheetOpen(false);
              }}
            >
              {t("filters.clear")}
            </Button>
            <Button type="button" variant="warm" className="flex-1 min-h-[44px]" onClick={handleApply}>
              {t("filters.apply")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function ScholarshipFilters({ search, onChange, onApply, onClear }: Props) {
  return (
    <section className="pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
          <ScholarshipFiltersMobile
            search={search}
            onChange={onChange}
            onApply={onApply}
            onClear={onClear}
          />
          <ScholarshipFiltersDesktop search={search} onChange={onChange} />
        </div>
      </div>
    </section>
  );
}
