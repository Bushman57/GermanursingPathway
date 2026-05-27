import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { ChatWidget } from "@/components/ChatWidget";
import { Badge } from "@/components/ui/badge";
import { fetchScholarships } from "@/lib/api/scholarships";
import { scholarshipText, type ScholarshipSummary } from "@/lib/scholarships";
import { metaFromScholarshipsPage } from "@/lib/pageMeta";
import { Calendar, Award, Search, BadgeCheck } from "lucide-react";
import { ScholarshipApplyButton, ScholarshipTitleLink } from "@/components/scholarships/ScholarshipCardLinks";
import { ScholarshipsGridSkeleton } from "@/components/scholarships/ScholarshipsGridSkeleton";
import { useState, type ReactNode } from "react";

const SCHOLARSHIPS_STALE_MS = 1000 * 60 * 5;
const universitiesImage = `${import.meta.env.BASE_URL}images/german-universities.jpg`;

export const Route = createFileRoute("/scholarships")({
  loader: () => fetchScholarships(),
  staleTime: SCHOLARSHIPS_STALE_MS,
  pendingMs: 0,
  pendingComponent: ScholarshipsPending,
  head: () => metaFromScholarshipsPage(),
  component: ScholarshipsPage,
});

function ScholarshipsShell({ listing }: { listing: ReactNode }) {
  const { t } = useTranslation("scholarshipsPage");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-12 hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-warm/20 text-warm border-warm/30 hover:bg-warm/20">{t("hero.badge")}</Badge>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-primary-foreground mt-4 leading-tight">
            {t("hero.title")} <span className="text-warm">{t("hero.titleAccent")}</span> {t("hero.titleSuffix")}
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">{t("hero.subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-warm via-primary to-warm/30 rounded-full" />
                <p className="pl-6 text-lg sm:text-xl text-foreground/90 leading-[1.8] font-body font-medium text-balance">
                  <span className="font-heading text-5xl font-bold text-warm float-left mr-2 mt-1 leading-none">"</span>
                  {t("intro")}
                  <span className="font-heading text-warm text-xl sm:text-2xl block mt-5 font-semibold tracking-wide">
                    Start your educational journey today.
                  </span>
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border group">
                <img
                  src={universitiesImage}
                  alt={t("imageAlt")}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  width={1200}
                  height={750}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground text-center tracking-wide uppercase">{t("imageCaption")}</p>
            </div>
          </div>
        </div>
      </section>

      {listing}

      <ChatWidget mode="scholarship" enableUploads accent="primary" />
    </div>
  );
}

function ScholarshipsPending() {
  return (
    <ScholarshipsShell
      listing={
        <>
          <section className="pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center opacity-60 pointer-events-none">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <div className="w-full h-10 rounded-lg bg-muted animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 w-20 rounded-full bg-muted animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </section>
          <section className="pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScholarshipsGridSkeleton />
            </div>
          </section>
        </>
      }
    />
  );
}

function ScholarshipFilters({
  query,
  onQueryChange,
  programFilter,
  onProgramFilterChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  programFilter: string;
  onProgramFilterChange: (value: string) => void;
}) {
  const { t } = useTranslation("scholarshipsPage");
  const programFilters = [
    { id: "All", label: t("filters.all") },
    { id: "verified", label: t("filters.verified") },
    { id: "nursing_scholarship", label: t("filters.nursing") },
    { id: "ausbildung", label: t("filters.ausbildung") },
    { id: "other", label: t("filters.general") },
  ];

  return (
    <section className="pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warm/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {programFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onProgramFilterChange(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  programFilter === f.id
                    ? "bg-warm text-warm-foreground"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScholarshipCard({ s, lang }: { s: ScholarshipSummary; lang: string }) {
  const { t } = useTranslation("scholarshipsPage");

  return (
    <article className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-warm/40 transition-all flex flex-col">
      <div className="p-5 flex-1 flex flex-col">
        <ScholarshipTitleLink scholarship={s} title={scholarshipText(s, "title", lang)} />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {s.verified && (
            <Badge className="bg-success/15 text-success border-0 text-[10px] font-medium gap-0.5">
              <BadgeCheck className="w-3 h-3" />
              {t("verifiedBadge")}
            </Badge>
          )}
          <Badge
            className={`border-0 text-[10px] font-medium ${
              scholarshipText(s, "funding", lang).toLowerCase().includes("voll") ||
              scholarshipText(s, "funding", lang).toLowerCase().includes("fully")
                ? "bg-success/15 text-success hover:bg-success/15"
                : "bg-warm/15 text-warm hover:bg-warm/15"
            }`}
          >
            {scholarshipText(s, "funding", lang)}
          </Badge>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border border-primary/20 text-[10px] font-medium">
            {scholarshipText(s, "provider", lang)}
          </Badge>
          <Badge className="bg-muted text-muted-foreground hover:bg-muted border border-border text-[10px] font-medium">
            {scholarshipText(s, "degreeLevel", lang)}
          </Badge>
          <Badge className="bg-muted text-muted-foreground hover:bg-muted border border-border text-[10px] font-medium">
            {scholarshipText(s, "category", lang)}
          </Badge>
          <Badge className="bg-muted text-muted-foreground hover:bg-muted border border-border text-[10px] font-medium">
            {t("internationalStudents")}
          </Badge>
          <Badge className="bg-muted text-muted-foreground hover:bg-muted border border-border text-[10px] font-medium">
            {s.hostCountry}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mt-4">
          {scholarshipText(s, "shortDescription", lang)}
        </p>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-warm shrink-0" />
            <span className="truncate">{scholarshipText(s, "deadline", lang)}</span>
          </span>
          <ScholarshipApplyButton scholarship={s} applyLabel={t("apply")} />
        </div>
      </div>
    </article>
  );
}

function ScholarshipsPage() {
  const scholarships = Route.useLoaderData();
  const { t, i18n } = useTranslation("scholarshipsPage");
  const lang = i18n.language;
  const [query, setQuery] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("All");

  const filtered = scholarships.filter((s) => {
    const q = query.toLowerCase();
    const title = scholarshipText(s, "title", lang).toLowerCase();
    const provider = scholarshipText(s, "provider", lang).toLowerCase();
    const short = scholarshipText(s, "shortDescription", lang).toLowerCase();
    const matchesQuery = !q || title.includes(q) || provider.includes(q) || short.includes(q);
    const matchesProgram =
      programFilter === "All" ||
      (programFilter === "verified" && s.verified) ||
      s.programType === programFilter;
    return matchesQuery && matchesProgram;
  });

  return (
    <ScholarshipsShell
      listing={
        <>
          <ScholarshipFilters
            query={query}
            onQueryChange={setQuery}
            programFilter={programFilter}
            onProgramFilterChange={setProgramFilter}
          />
          <section className="pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-sm text-muted-foreground mb-6">
                {t("showingCount", { count: filtered.length })}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((s) => (
                  <ScholarshipCard key={s.slug} s={s} lang={lang} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  {t("noResults")}
                </div>
              )}
            </div>
          </section>
        </>
      }
    />
  );
}
