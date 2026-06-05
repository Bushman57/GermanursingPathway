import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useResourcesQuery } from "@/lib/queries/resources";
import { useTranslation } from "react-i18next";
import { metaFromKeys } from "@/lib/pageMeta";
import { BookOpen, Clock, ArrowRight, Search, GraduationCap, PlayCircle, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { learningModules, type LearningModule } from "@/lib/learningModules";
import { VideoEmbed } from "@/components/resources/VideoEmbed";

export const Route = createFileRoute("/resources")({
  head: () => metaFromKeys("resources"),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { data: articles = [], isLoading } = useResourcesQuery();
  const { t, i18n } = useTranslation("common");
  const isDe = i18n.language.startsWith("de");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(learningModules[0].id);

  const filteredModules = useMemo<LearningModule[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return learningModules;
    return learningModules
      .map((m) => ({
        ...m,
        topics: m.topics.filter(
          (tp) =>
            tp.title.toLowerCase().includes(q) ||
            m.title.toLowerCase().includes(q),
        ),
      }))
      .filter((m) => m.topics.length > 0);
  }, [query]);

  const totalTopics = learningModules.reduce((n, m) => n + m.topics.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-primary-foreground/90 text-xs font-medium backdrop-blur">
            <GraduationCap className="w-3.5 h-3.5" />
            Learning Hub
          </span>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground tracking-tight">
            Learn the German <span className="text-warm">Nursing Pathway</span>
          </h1>
          <p className="mt-5 text-primary-foreground/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A structured curriculum for Kenyan healthcare professionals — from your first
            German word to your first shift in a German hospital.
          </p>

          {/* Stat strip */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <div className="px-4 py-2 rounded-full bg-white/10 text-primary-foreground/90 backdrop-blur">
              <span className="font-semibold text-warm">{learningModules.length}</span> modules
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 text-primary-foreground/90 backdrop-blur">
              <span className="font-semibold text-warm">{totalTopics}</span> topics
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 text-primary-foreground/90 backdrop-blur">
              <span className="font-semibold text-warm">{articles.length}</span> in-depth articles
            </div>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search topics: visa, B2, CV, Anerkennung…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 h-12 bg-background/95 backdrop-blur border-0 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Module chips nav */}
      <section className="sticky top-16 z-30 bg-background/85 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {learningModules.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                onClick={() => setActiveId(m.id)}
                className={`group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                  activeId === m.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-foreground/80 border-border hover:border-warm/40 hover:text-foreground"
                }`}
              >
                <span aria-hidden>{m.emoji}</span>
                {m.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          {filteredModules.length === 0 && (
            <p className="text-center text-muted-foreground">No topics match "{query}"</p>
          )}

          {filteredModules.map((module, idx) => {
            const Icon = module.icon;
            const moduleArticles = articles.filter(
              (a) =>
                (module.id === "german-language" && a.category === "language") ||
                (module.id === "visa-immigration" && a.category === "visa") ||
                (module.id === "timelines-stories" && a.category === "story") ||
                (!["german-language", "visa-immigration", "timelines-stories"].includes(module.id) &&
                  a.category === "guide"),
            );

            return (
              <div key={module.id} id={module.id} className="scroll-mt-32">
                {/* Header */}
                <div className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${module.accent} p-6 sm:p-8`}>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-background/80 backdrop-blur flex items-center justify-center shadow-sm">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-muted-foreground tracking-wider">
                        MODULE {String(idx + 1).padStart(2, "0")}
                      </div>
                      <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-foreground">
                        <span className="mr-2" aria-hidden>{module.emoji}</span>
                        {module.title}
                      </h2>
                      <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Topics + sidebar */}
                <div className="mt-6 grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ol className="space-y-2">
                      {module.topics.map((topic, i) => {
                        const linked = topic.slug
                          ? articles.find((a) => a.slug === topic.slug)
                          : undefined;
                        const content = (
                          <div className="flex items-start gap-3">
                            <span className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-muted text-muted-foreground text-xs font-mono flex items-center justify-center group-hover:bg-warm/15 group-hover:text-warm transition-colors">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-foreground font-medium">{topic.title}</span>
                                {topic.video && (
                                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-warm font-semibold">
                                    <PlayCircle className="w-3 h-3" /> Video
                                  </span>
                                )}
                                {linked && (
                                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                                    <BookOpen className="w-3 h-3" /> Read
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-warm group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                          </div>
                        );

                        const className =
                          "group block p-3 rounded-xl border border-transparent hover:border-border hover:bg-card transition-colors";

                        if (linked) {
                          return (
                            <li key={i}>
                              <Link
                                to="/resources/$slug"
                                params={{ slug: linked.slug }}
                                className={className}
                              >
                                {content}
                              </Link>
                            </li>
                          );
                        }
                        return (
                          <li key={i} className={className}>
                            {content}
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  {/* Sidebar: related published articles */}
                  <aside className="space-y-3">
                    {moduleArticles.slice(0, 3).map((a) => (
                      <Link
                        key={a.slug}
                        to="/resources/$slug"
                        params={{ slug: a.slug }}
                        className="block p-4 rounded-2xl bg-card border border-border hover:border-warm/40 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-2 text-[11px] font-medium text-warm uppercase tracking-wider">
                          <Sparkles className="w-3 h-3" /> Featured guide
                          <span className="text-muted-foreground inline-flex items-center gap-1 normal-case">
                            · <Clock className="w-3 h-3" /> {a.readMinutes} min
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-heading font-semibold text-foreground group-hover:text-warm transition-colors text-sm leading-snug">
                          {isDe ? a.titleDe : a.titleEn}
                        </h3>
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {isDe ? a.excerptDe : a.excerptEn}
                        </p>
                      </Link>
                    ))}
                    {moduleArticles.length === 0 && !isLoading && (
                      <div className="p-4 rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
                        More in-depth guides for this module are coming soon.
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured video CTA */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm/10 text-warm text-xs font-semibold uppercase tracking-wider">
            <PlayCircle className="w-3.5 h-3.5" /> Watch & Learn
          </span>
          <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Stories from Kenyan nurses already in Germany
          </h2>
          <p className="mt-2 text-muted-foreground">
            Hear real timelines, costs, and lessons learned — straight from the people who walked the pathway.
          </p>
          <div className="mt-8">
            <VideoEmbed
              url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              title="Kenyan nurses in Germany"
            />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="warm" asChild>
              <Link to="/register">{t("resourcesPage.registerCta")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/eligibility">Check your readiness</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
