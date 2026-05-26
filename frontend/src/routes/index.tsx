import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { InvestmentPaymentDialog } from "@/components/InvestmentPaymentDialog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { TAGLINE_SECONDARY } from "@/lib/constants";
import { metaFromKeys } from "@/lib/pageMeta";
import {
  CheckCircle, ArrowRight,
  Briefcase, Award, Home as HomeIcon, Shield,
  DollarSign, Plane, Languages
} from "lucide-react";
import heroBridge from "@/assets/hero-bridge.jpg";
import programOverview from "@/assets/program-overview.jpg";
import eligibilityNurse from "@/assets/eligibility-nurse.jpg";
import whySalary from "@/assets/why/salary.jpg";
import whyRelocation from "@/assets/why/relocation.jpg";
import whyImmigration from "@/assets/why/immigration.jpg";

export const Route = createFileRoute("/")({
  head: () => metaFromKeys("home"),
  component: Index,
});

const OVERVIEW_ICONS = [Award, Languages, Briefcase, Plane] as const;
const PROGRAM_COLORS = ["bg-primary", "bg-warm", "bg-success"] as const;
const WHY_ICONS = [DollarSign, HomeIcon, Shield] as const;
const WHY_IMAGES = [whySalary, whyRelocation, whyImmigration] as const;

function Index() {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("home");
  const overviewFeatures = t("overview.features", { returnObjects: true }) as { title: string; desc: string }[];
  const programCards = t("programTypes.cards", { returnObjects: true }) as {
    title: string;
    subtitle: string;
    features: string[];
  }[];
  const investmentRows = t("investment.rows", { returnObjects: true }) as [string, string][];
  const whyItems = t("whyUs.items", { returnObjects: true }) as { title: string; desc: string }[];
  const stats = t("stats", { returnObjects: true }) as { value: string; label: string }[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — Full-width with background image like GHIC */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16">
        <div className="absolute inset-0">
          <img
            src={heroBridge}
            alt={t("images.hero")}
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-primary/75" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center animate-fade-up">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight text-balance">
            {tc("hero.title")}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-primary-foreground/90 font-medium">
            {TAGLINE_SECONDARY}
          </p>
          <p className="mt-6 text-xl sm:text-2xl font-heading font-medium text-warm">
            {tc("hero.roles")}
          </p>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            {tc("hero.description")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="warm" size="lg" className="text-base px-10 py-6" asChild>
              <Link to="/register">
                {tc("hero.register")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <WhatsAppLink
              label={tc("hero.whatsapp")}
              variant="hero-outline"
              size="lg"
              className="text-base px-10 py-6"
            />
          </div>
          <Button variant="link" className="mt-4 text-primary-foreground/80 hover:text-primary-foreground" asChild>
            <Link to="/eligibility">{tc("hero.readiness")}</Link>
          </Button>
        </div>
      </section>

      {/* Program Overview — Split screen like GHIC */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={programOverview}
                alt={t("images.overview")}
                className="w-full h-auto object-cover aspect-[4/3]"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                {t("overview.title")} <span className="text-warm">{t("overview.titleAccent")}</span>
              </h2>
              <div className="w-16 h-1 bg-warm mt-4 mb-6 rounded-full" />
              <p className="text-muted-foreground leading-relaxed text-lg">{t("overview.intro")}</p>
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {overviewFeatures.map((item, i) => {
                  const Icon = OVERVIEW_ICONS[i] ?? Award;
                  return (
                  <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-warm/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Types — 3 cards like GHIC */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              {t("programTypes.title")}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              {t("programTypes.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {programCards.map((program, i) => (
              <div
                key={program.title}
                className="group bg-background rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-warm/30 transition-all"
              >
                <div className={`${PROGRAM_COLORS[i] ?? "bg-primary"} px-6 py-5`}>
                  <h3 className="font-heading text-xl font-bold text-primary-foreground">{program.title}</h3>
                  <p className="text-primary-foreground/80 text-sm mt-1">{program.subtitle}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {program.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant="warm" className="w-full mt-6" asChild>
                    <Link to="/eligibility">{t("programTypes.applyNow")}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Breakdown — Table like GHIC */}
      <section className="py-20 hero-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary-foreground">
              {t("investment.title")}
            </h2>
          </div>
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-primary-foreground/20">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-foreground/20">
                  <th className="text-left px-6 py-4 font-heading font-semibold text-primary-foreground">{t("investment.component")}</th>
                  <th className="text-right px-6 py-4 font-heading font-semibold text-primary-foreground">{t("investment.cost")}</th>
                </tr>
              </thead>
              <tbody className="text-primary-foreground/80">
                {investmentRows.map(([item, cost]) => (
                  <tr key={item} className="border-b border-primary-foreground/10">
                    <td className="px-6 py-3 text-sm">{item}</td>
                    <td className="px-6 py-3 text-sm text-right">{cost}</td>
                  </tr>
                ))}
                <tr className="bg-primary-foreground/10">
                  <td className="px-6 py-4 font-heading font-bold text-primary-foreground text-lg">{t("investment.total")}</td>
                  <td className="px-6 py-4 font-heading font-bold text-warm text-lg text-right">{t("investment.totalAmount")}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-center text-primary-foreground/60 text-sm mt-6">
            {t("investment.footnote")}
          </p>
          <div className="flex justify-center">
            <InvestmentPaymentDialog />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              {t("whyUs.title")} <span className="text-warm">{t("whyUs.titleAccent")}</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {whyItems.map((item, i) => {
              const Icon = WHY_ICONS[i] ?? Shield;
              return (
              <div key={item.title} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-warm/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-warm/20 transition-colors">
                  <Icon className="w-8 h-8 text-warm" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Eligibility Requirements — Split with image like GHIC */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                {t("eligibility.title")} <span className="text-warm">{t("eligibility.titleAccent")}</span>
              </h2>
              <div className="w-16 h-1 bg-warm mt-4 mb-8 rounded-full" />

              <p className="text-muted-foreground leading-relaxed text-lg">
                {t("eligibility.disclaimer")}
              </p>

              <Button variant="warm" size="lg" className="mt-8 px-8 py-6 text-base" asChild>
                <Link to="/eligibility">
                  {t("eligibility.cta")}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={eligibilityNurse}
                alt={t("images.eligibility")}
                className="w-full h-auto object-cover aspect-[4/3]"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-3xl sm:text-4xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-balance">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
            {t("cta.subtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="warm" size="lg" className="px-10 py-6 text-base" asChild>
              <Link to="/register">
                {tc("hero.register")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <WhatsAppLink label={tc("hero.whatsapp")} size="lg" className="px-10 py-6 text-base" />
          </div>
          <p className="mt-6 text-muted-foreground text-sm">{t("cta.contact")}</p>
        </div>
      </section>

      <Footer />

      <ChatWidget mode="pathway" />
    </div>
  );
}
