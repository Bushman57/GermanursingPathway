import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { metaFromKeys } from "@/lib/pageMeta";
import {
  UserPlus,
  ClipboardCheck,
  School,
  FileText,
  Languages,
  Stamp,
  Plane,
  MapPin,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const STEP_ICONS = [
  UserPlus,
  ClipboardCheck,
  School,
  FileText,
  Languages,
  Stamp,
  Plane,
  MapPin,
] as const;

export const Route = createFileRoute("/how-it-works")({
  head: () => metaFromKeys("howItWorks"),
  component: HowItWorks,
});

function HowItWorks() {
  const { t } = useTranslation("howItWorks");
  const { t: tc } = useTranslation("common");
  const steps = t("steps", { returnObjects: true }) as {
    title: string;
    desc: string;
    details: string[];
  }[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">{t("title")}</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">{t("subtitle")}</p>
          </div>

          <div className="flex gap-1 mb-12 overflow-x-auto pb-2 sm:hidden">
            {steps.map((_, i) => (
              <div key={i} className="shrink-0 w-8 h-1 rounded-full bg-warm/30 overflow-hidden">
                <div
                  className="h-full w-full bg-warm rounded-full"
                  style={{ opacity: 0.4 + (i / steps.length) * 0.6 }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-10">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i] ?? UserPlus;
              return (
                <div key={step.title} className="flex gap-5 sm:gap-8 items-start">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl warm-gradient flex items-center justify-center shadow-lg shadow-warm/20">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-warm-foreground" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 flex-1 min-h-[2rem] bg-border mt-3 hidden sm:block" />
                    )}
                  </div>
                  <div className="pt-0.5 flex-1 pb-2 border-b border-border/60 last:border-0">
                    <p className="text-xs font-medium text-warm uppercase tracking-wider mb-1">
                      {t("stepLabel", { n: i + 1 })}
                    </p>
                    <h3 className="font-heading text-lg sm:text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed text-sm sm:text-base">{step.desc}</p>
                    <ul className="mt-3 space-y-1.5">
                      {step.details.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="warm" size="lg" className="px-10 py-6 text-base" asChild>
              <Link to="/register">
                {t("registerCta")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <WhatsAppLink variant="outline" size="lg" className="px-10 py-6 text-base" label={tc("nav.whatsapp")} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
