import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InvestmentPaymentDialog } from "@/features/payments";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { HomeSocialProof } from "@/components/home/HomeSocialProof";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { TAGLINE_SECONDARY } from "@/lib/constants";
import { parseLearningSearch } from "@/lib/learningSearchParams";
import { metaFromKeys } from "@/lib/pageMeta";
import {
  CheckCircle, ArrowRight,
  Briefcase, Award, Home as HomeIcon, Shield,
  DollarSign, Plane, Languages
} from "lucide-react";
import heroBridge from "@/assets/hero-bridge.webp";
import programOverview from "@/assets/program-overview.jpg";
import eligibilityNurse from "@/assets/eligibility-nurse.jpg";
import whySalary from "@/assets/why/salary.jpg";
import whyRelocation from "@/assets/why/relocation.jpg";
import whyImmigration from "@/assets/why/immigration.jpg";
import customerCare2 from "@/assets/Care/CustomerCare_2.jpg";
import { LearningReturnBanner } from "@/components/resources/LearningReturnBanner";

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const numericMatch = value.match(/^([\d,]+)(.*)$/);
  const target = numericMatch ? parseInt(numericMatch[1].replace(/,/g, ""), 10) : 0;
  const suffix = numericMatch ? numericMatch[2] : "";
  const [display, setDisplay] = useState("0" + suffix);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let raf: number;
    const duration = 2000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      setDisplay(`${Math.round(eased * target).toLocaleString()}${suffix}`);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasStarted, target, suffix]);

  return (
    <div ref={ref} className="relative group">
      <div className="absolute inset-0 bg-warm/0 rounded-2xl group-hover:bg-warm/10 transition-colors duration-500" />
      <div className="relative px-4 py-6">
        <div className="font-heading text-4xl sm:text-5xl font-bold text-primary-foreground tabular-nums tracking-tight">
          {display}
        </div>
        <div className="mt-2 text-sm font-medium text-primary-foreground/70 uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  );
}

function parseHomeSearch(raw: Record<string, unknown>) {
  const payment = typeof raw.payment === "string" ? raw.payment.trim() : "";
  const learning = parseLearningSearch(raw);
  return {
    payment: payment || undefined,
    ...learning,
  };
}

export const Route = createFileRoute("/")({
  validateSearch: parseHomeSearch,
  head: () => metaFromKeys("home"),
  component: Index,
});

const OVERVIEW_ICONS = [Award, Languages, Briefcase, Plane] as const;
const PROGRAM_COLORS = ["bg-primary", "bg-warm", "bg-success"] as const;
const WHY_ICONS = [DollarSign, HomeIcon, Shield] as const;
const WHY_IMAGES = [whySalary, whyRelocation, whyImmigration] as const;

function Index() {
  const { payment: returnReference, learningReturn, learningTopic } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("home");

  const clearPaymentReturn = () => {
    navigate({ search: { payment: undefined }, replace: true });
  };
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
      <LearningReturnBanner learningReturn={learningReturn} learningTopic={learningTopic} />

      {/* Hero — Full-width with background image like GHIC */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16">
        <div className="absolute inset-0">
          <img
            src={heroBridge}
            alt={t("images.hero")}
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
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
            <Button variant="warm" size="cta" asChild>
              <Link to="/register">
                {tc("hero.register")}
                <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <WhatsAppLink label={tc("hero.whatsapp")} variant="hero-outline" size="cta" />
          </div>
          <Button variant="link" className="mt-4 text-primary-foreground/80 hover:text-primary-foreground" asChild>
            <Link to="/eligibility">{tc("hero.readiness")}</Link>
          </Button>
        </div>
      </section>

      {/* Program Overview — Split screen like GHIC */}
      <section id="program-overview" className="py-20 scroll-mt-24">
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
                className="group relative bg-background rounded-2xl border border-border overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:border-warm/50 transition-all duration-500"
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${PROGRAM_COLORS[i] ?? "bg-primary"} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                <div className={`${PROGRAM_COLORS[i] ?? "bg-primary"} px-6 py-6 relative overflow-hidden`}>
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary-foreground/10 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative">
                    <h3 className="font-heading text-2xl font-bold text-primary-foreground">{program.title}</h3>
                    <p className="text-primary-foreground/80 text-sm mt-1">{program.subtitle}</p>
                  </div>
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
                  <Button variant="warm" className="w-full mt-6 group" asChild>
                    <Link to="/eligibility">
                      {t("programTypes.applyNow")}
                      <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
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
            <InvestmentPaymentDialog
              returnReference={returnReference}
              onReturnHandled={clearPaymentReturn}
            />
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
          <div className="grid sm:grid-cols-3 gap-6">
            {whyItems.map((item, i) => {
              const Icon = WHY_ICONS[i] ?? Shield;
              const bgImage = WHY_IMAGES[i];
              return (
                <div
                  key={item.title}
                  className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <img
                    src={bgImage}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/70 to-primary/30 group-hover:from-primary/95 group-hover:via-primary/80 group-hover:to-primary/50 transition-all duration-500" />
                  <div className="relative h-full flex flex-col justify-end p-6 text-primary-foreground">
                    <div className="w-14 h-14 rounded-2xl bg-warm/90 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-heading text-xl font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm text-primary-foreground/90 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Eligibility Requirements — Split with image like GHIC */}
      <section id="eligibility" className="py-20 bg-card scroll-mt-24">
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

              <Button variant="warm" size="cta" className="mt-8" asChild>
                <Link to="/eligibility">
                  {t("eligibility.cta")}
                  <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat) => (
              <AnimatedStat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-balance">
            {t("cta.title")}
          </h2>
          <div className="mt-8 mx-auto max-w-2xl rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/40">
            <img
              src={customerCare2}
              alt={t("images.customerCare")}
              className="w-full h-auto object-cover aspect-[16/10]"
              loading="lazy"
              width={960}
              height={600}
            />
          </div>
          <p className="mt-8 text-lg text-muted-foreground max-w-lg mx-auto">
            {t("cta.subtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="warm" size="cta" asChild>
              <Link to="/register">
                {tc("hero.register")}
                <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <WhatsAppLink label={tc("hero.whatsapp")} size="cta" />
          </div>
          <p className="mt-6 text-muted-foreground text-sm">{t("cta.contact")}</p>
        </div>
      </section>

      <HomeSocialProof />

      <Footer />

      <ChatWidget mode="pathway" />
    </div>
  );
}
