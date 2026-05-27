import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchScholarshipBySlug } from "@/lib/api/scholarships";
import { fundingDisplayLabel, optionLabel } from "@/lib/scholarshipFieldOptions";
import { scholarshipList, scholarshipText } from "@/lib/scholarships";
import { ScholarshipApplyButton } from "@/components/scholarships/ScholarshipCardLinks";
import { scholarshipExternalUrl, scholarshipHasExternalLink } from "@/lib/scholarshipLinks";
import { metaTags } from "@/lib/routeHead";
import i18n from "@/i18n";
import {
  Calendar,
  MapPin,
  GraduationCap,
  Globe,
  Award,
  Users,
  ArrowRight,
  CheckCircle,
  FileText,
  ListChecks,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/scholarships/$slug")({
  loader: async ({ params }) => {
    try {
      return await fetchScholarshipBySlug(params.slug);
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const lang = i18n.language;
    const title = scholarshipText(loaderData, "title", lang);
    const description = scholarshipText(loaderData, "shortDescription", lang);
    return {
      meta: metaTags({
        title: `${title} — ${i18n.t("meta.scholarships.title", { ns: "common" })}`,
        description,
        ogTitle: title,
        ogDescription: description,
      }),
    };
  },
  notFoundComponent: ScholarshipNotFound,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background pt-32 text-center">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ScholarshipDetail,
});

function ScholarshipNotFound() {
  const { t } = useTranslation("scholarshipsPage");
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">{t("detail.notFoundTitle")}</h1>
        <Button variant="warm" className="mt-6" asChild>
          <Link to="/scholarships">{t("detail.browseAll")}</Link>
        </Button>
      </div>
      <Footer />
    </div>
  );
}

function ScholarshipDetail() {
  const s = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { t, i18n } = useTranslation("scholarshipsPage");
  const lang = i18n.language;

  const externalUrl = scholarshipExternalUrl(s);
  const fundingLabel =
    fundingDisplayLabel(s.funding) || scholarshipText(s, "funding", lang);
  const facts = [
    { icon: Globe, label: t("detail.facts.hostCountry"), value: s.hostCountry },
    { icon: MapPin, label: t("detail.facts.studyIn"), value: s.studyIn },
    {
      icon: GraduationCap,
      label: t("detail.facts.degreeLevel"),
      value: optionLabel(s.degreeLevel) || scholarshipText(s, "degreeLevel", lang),
    },
    { icon: Award, label: t("detail.facts.funding"), value: fundingLabel },
    { icon: Users, label: t("detail.facts.eligibleCountries"), value: s.eligibleCountries },
    { icon: Calendar, label: t("detail.facts.deadline"), value: scholarshipText(s, "deadline", lang) },
    ...(s.visaSponsorship
      ? [{ icon: Globe, label: t("detail.facts.visa"), value: optionLabel(s.visaSponsorship) }]
      : []),
    ...(s.accommodationSupport
      ? [
          {
            icon: MapPin,
            label: t("detail.facts.accommodation"),
            value: optionLabel(s.accommodationSupport),
          },
        ]
      : []),
    ...(s.intakeMonth
      ? [{ icon: Calendar, label: t("detail.facts.intake"), value: optionLabel(s.intakeMonth) }]
      : []),
    ...(s.programDuration
      ? [
          {
            icon: GraduationCap,
            label: t("detail.facts.duration"),
            value: optionLabel(s.programDuration),
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-12 hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-warm text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> {t("detail.back")}
          </Link>
          <Badge className="bg-warm text-warm-foreground border-0">{fundingLabel}</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mt-4 leading-tight">
            {scholarshipText(s, "title", lang)}
          </h1>
          <p className="text-primary-foreground/70 mt-3">
            {t("offeredBy")}{" "}
            {externalUrl ? (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm underline underline-offset-2 hover:text-primary-foreground"
              >
                {scholarshipText(s, "provider", lang)}
              </a>
            ) : (
              scholarshipText(s, "provider", lang)
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-primary-foreground/80">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-warm" /> {scholarshipText(s, "deadline", lang)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-warm" /> {scholarshipText(s, "location", lang)}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-warm" /> {scholarshipText(s, "degreeLevel", lang)}
            </span>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">{t("detail.about")}</h2>
              <div className="w-12 h-1 bg-warm mt-3 mb-5 rounded-full" />
              <p className="text-muted-foreground leading-relaxed">{scholarshipText(s, "about", lang)}</p>
            </div>

            <Section
              title={t("detail.benefits")}
              icon={Award}
              items={scholarshipList(s, "benefits", lang).map((item) => optionLabel(item) || item)}
            />
            <Section title={t("detail.eligibility")} icon={CheckCircle} items={scholarshipList(s, "eligibility", lang)} />
            <Section
              title={t("detail.documents")}
              icon={FileText}
              items={scholarshipList(s, "requiredDocuments", lang).map((item) => optionLabel(item) || item)}
            />
            <Section
              title={t("detail.process")}
              icon={ListChecks}
              items={scholarshipList(s, "applicationProcess", lang)}
              ordered
            />

            {scholarshipHasExternalLink(s) && externalUrl && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-heading text-lg font-semibold text-foreground">{t("detail.officialLink")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("detail.officialHint")}</p>
                <Button variant="warm" className="mt-4" asChild>
                  <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                    {t("detail.visitOfficial")} <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h3 className="font-heading text-lg font-semibold text-foreground">{t("detail.keyFacts")}</h3>
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

              <ScholarshipApplyButton
                scholarship={s}
                applyLabel={t("apply")}
                className="w-full"
                size="default"
              />

              <Button variant="outline" className="w-full mt-3" asChild>
                <Link to="/eligibility">
                  {t("detail.checkEligibility")} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <Footer />

      <ChatWidget mode="scholarship" scholarshipSlug={slug} enableUploads accent="primary" />
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  items,
  ordered,
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
