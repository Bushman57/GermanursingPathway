import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getScholarship } from "@/lib/scholarships";
import {
  Calendar, MapPin, GraduationCap, Globe, Award, Users, ArrowRight,
  CheckCircle, FileText, ListChecks, ExternalLink, ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/scholarships/$slug")({
  loader: ({ params }) => {
    const scholarship = getScholarship(params.slug);
    if (!scholarship) throw notFound();
    return scholarship;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Scholarships in Germany` },
          { name: "description", content: loaderData.shortDescription },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.shortDescription },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">Scholarship not found</h1>
        <Button variant="warm" className="mt-6" asChild>
          <Link to="/scholarships">Browse all scholarships</Link>
        </Button>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background pt-32 text-center">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ScholarshipDetail,
});

function ScholarshipDetail() {
  const s = Route.useLoaderData();
  const { slug } = Route.useParams();

  const facts = [
    { icon: Globe, label: "Host Country", value: s.hostCountry },
    { icon: MapPin, label: "Study In", value: s.studyIn },
    { icon: GraduationCap, label: "Degree Level", value: s.degreeLevel },
    { icon: Award, label: "Funding", value: s.funding },
    { icon: Users, label: "Eligible Countries", value: s.eligibleCountries },
    { icon: Calendar, label: "Deadline", value: s.deadline },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-warm text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to scholarships
          </Link>
          <Badge className="bg-warm text-warm-foreground border-0">{s.funding}</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mt-4 leading-tight">
            {s.title}
          </h1>
          <p className="text-primary-foreground/70 mt-3">Offered by {s.provider}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-primary-foreground/80">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-warm" /> {s.deadline}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-warm" /> {s.location}</span>
            <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-warm" /> {s.degreeLevel}</span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">About the Scholarship</h2>
              <div className="w-12 h-1 bg-warm mt-3 mb-5 rounded-full" />
              <p className="text-muted-foreground leading-relaxed">{s.about}</p>
            </div>

            <Section title="Scholarship Benefits" icon={Award} items={s.benefits} />
            <Section title="Eligibility Criteria" icon={CheckCircle} items={s.eligibility} />
            <Section title="Required Documents" icon={FileText} items={s.requiredDocuments} />
            <Section title="How to Apply" icon={ListChecks} items={s.applicationProcess} ordered />

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground">Official Application Link</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Always submit your application through the official channel.
              </p>
              <Button variant="warm" className="mt-4" asChild>
                <a href={s.officialLink} target="_blank" rel="noopener noreferrer">
                  Visit Official Website <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h3 className="font-heading text-lg font-semibold text-foreground">Key Facts</h3>
              <div className="w-10 h-1 bg-warm mt-2 mb-5 rounded-full" />
              <ul className="space-y-4">
                {facts.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-warm/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-warm" />
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground text-xs">{f.label}</div>
                      <div className="text-foreground font-medium">{f.value}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <Button variant="warm" className="w-full mt-6" asChild>
                <Link to="/eligibility">
                  Check My Eligibility <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <Footer />

      <ChatWidget
        mode="scholarship"
        scholarshipSlug={slug}
        title="Ask about this scholarship"
        subtitle={`${s.provider} · AI assistant`}
        greeting={`Ask me anything about ${s.title} — eligibility, documents, benefits, or how to apply.`}
        enableUploads
        accent="primary"
        suggestions={[
          "Am I eligible?",
          "What documents do I need?",
          "What are the benefits?",
          "How do I apply?",
        ]}
      />
    </div>
  );
}

function Section({
  title, icon: Icon, items, ordered,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  ordered?: boolean;
}) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
        <Icon className="w-5 h-5 text-warm" /> {title}
      </h2>
      <div className="w-12 h-1 bg-warm mt-3 mb-5 rounded-full" />
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-muted-foreground">
            {ordered ? (
              <span className="w-6 h-6 rounded-full bg-warm/10 text-warm font-heading font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
            ) : (
              <CheckCircle className="w-4 h-4 text-success shrink-0 mt-1" />
            )}
            <span className="text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
