import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scholarships } from "@/lib/scholarships";
import { Calendar, Award, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import germanUniversities from "@/assets/german-universities.jpg";

export const Route = createFileRoute("/scholarships")({
  head: () => ({
    meta: [
      { title: "Scholarships in Germany 2026/2027 — Fully Funded for Kenyan Students" },
      {
        name: "description",
        content:
          "Browse the latest fully funded scholarships in Germany for 2026/2027. DAAD, KAAD, Erasmus+, Friedrich Ebert and more — eligibility, benefits and how to apply.",
      },
      { property: "og:title", content: "Scholarships in Germany 2026/2027" },
      {
        property: "og:description",
        content: "Latest fully funded scholarships in Germany with eligibility and step-by-step application guidance.",
      },
    ],
  }),
  component: ScholarshipsPage,
});

function ScholarshipsPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<string>("All");

  const levels = ["All", "Bachelors", "Masters", "PhD", "Internship"];

  const filtered = scholarships.filter((s) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.provider.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q);
    const matchesLevel =
      level === "All" || s.degreeLevel.toLowerCase().includes(level.toLowerCase());
    return matchesQuery && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-warm/20 text-warm border-warm/30 hover:bg-warm/20">2026 / 2027 Intake</Badge>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-primary-foreground mt-4 leading-tight">
            Scholarships in <span className="text-warm">Germany</span> for International Students
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Fully funded scholarships covering tuition, stipends, accommodation, insurance and travel.
          </p>
        </div>
      </section>

      {/* Intro copy */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-6 text-muted-foreground leading-relaxed order-2 lg:order-1">
              <p>
                Germany is home to world-class universities such as{" "}
                <strong className="text-foreground">TU Munich</strong>,{" "}
                <strong className="text-foreground">Heidelberg University</strong>,{" "}
                <strong className="text-foreground">LMU Munich</strong>,{" "}
                <strong className="text-foreground">RWTH Aachen</strong>,{" "}
                <strong className="text-foreground">University of Freiburg</strong>, and{" "}
                <strong className="text-foreground">Humboldt University of Berlin</strong>. Whether you're
                applying for undergraduate, master's, or PhD programs, Germany offers generous funding
                options through programs like{" "}
                <strong className="text-foreground">DAAD Scholarships</strong>,{" "}
                <strong className="text-foreground">Erasmus+</strong>,{" "}
                <strong className="text-foreground">KAAD</strong>,{" "}
                <strong className="text-foreground">Friedrich Ebert Foundation</strong>, and other
                prestigious foundations.
              </p>
              <p>
                In this section, you will find the latest scholarships in Germany, along with eligibility
                requirements, complete benefits, and step-by-step application guidance. Start your
                educational journey today and explore opportunities to study at top German universities at
                little to no cost.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
                <img
                  src={germanUniversities}
                  alt="List of top universities in Germany"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground text-center">
                Top German universities welcoming international students
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search scholarships, providers..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warm/40"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    level === l
                      ? "bg-warm text-warm-foreground"
                      : "bg-background border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground mb-6">
            Showing <span className="text-foreground font-semibold">{filtered.length}</span> scholarships
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
                      {s.title}
                    </Link>
                  </h3>

                  {/* Metadata chip strip — funding, school, degree, category, eligibility, country */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge
                      className={`border-0 text-[10px] font-medium ${
                        s.funding.toLowerCase().includes("fully")
                          ? "bg-success/15 text-success hover:bg-success/15"
                          : "bg-warm/15 text-warm hover:bg-warm/15"
                      }`}
                    >
                      {s.funding}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border border-primary/20 text-[10px] font-medium">
                      {s.provider}
                    </Badge>
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted border border-border text-[10px] font-medium">
                      {s.degreeLevel}
                    </Badge>
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted border border-border text-[10px] font-medium">
                      {s.category}
                    </Badge>
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted border border-border text-[10px] font-medium">
                      International Students
                    </Badge>
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted border border-border text-[10px] font-medium">
                      {s.hostCountry}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 mt-4">
                    {s.shortDescription}
                  </p>

                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-warm shrink-0" />
                      <span className="truncate">{s.deadline}</span>
                    </span>
                    <Button variant="warm" size="sm" asChild>
                      <Link to="/scholarships/$slug" params={{ slug: s.slug }}>
                        Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
              No scholarships match your filters.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
