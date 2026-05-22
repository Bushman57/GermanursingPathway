import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scholarships, scholarshipText } from "@/lib/scholarships";
import { metaFromScholarshipsPage } from "@/lib/pageMeta";
import { Calendar, Award, ArrowRight, Search, BadgeCheck } from "lucide-react";
import { useState } from "react";
import germanUniversities from "@/assets/german-universities.png";

export const Route = createFileRoute("/scholarships")({
  head: () => metaFromScholarshipsPage(),
  component: ScholarshipsPage,
});

function ScholarshipsPage() {
  const { t, i18n } = useTranslation("scholarshipsPage");
  const lang = i18n.language;
  const [query, setQuery] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("All");

  const programFilters = [
    { id: "All", label: t("filters.all") },
    { id: "verified", label: t("filters.verified") },
    { id: "nursing_scholarship", label: t("filters.nursing") },
    { id: "ausbildung", label: t("filters.ausbildung") },
    { id: "other", label: t("filters.general") },
  ];

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
            <div className="space-y-6 text-muted-foreground leading-relaxed order-2 lg:order-1">
              <p>{t("intro")}</p>
            </div>
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
                <img
                  src={germanUniversities}
                  alt={t("imageAlt")}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground text-center">{t("imageCaption")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warm/40"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {programFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setProgramFilter(f.id)}
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

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground mb-6">
            {t("showingCount", { count: filtered.length })}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <article
                key={s.slug}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-warm/40 transition-all flex flex-col"
              >
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-heading text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-warm transition-colors">
                    <Link to="/scholarships/$slug" params={{ slug: s.slug }}>
                      {scholarshipText(s, "title", lang)}
                    </Link>
                  </h3>

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
                    <Button variant="warm" size="sm" asChild>
                      <Link to="/scholarships/$slug" params={{ slug: s.slug }}>
                        {t("details")} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
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

      <ChatWidget mode="scholarship" enableUploads accent="primary" />
    </div>
  );
}
