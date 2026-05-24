import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { metaFromKeys } from "@/lib/pageMeta";
import { ArrowRight, CheckCircle } from "lucide-react";
import step1 from "@/assets/steps/step1.jpg";
import step2 from "@/assets/steps/step2.jpg";
import step3 from "@/assets/steps/step3.jpg";
import step4 from "@/assets/steps/step4.jpg";
import step5 from "@/assets/steps/step5.jpg";
import step6 from "@/assets/steps/step6.jpg";
import step7 from "@/assets/steps/step7.jpg";
import step8 from "@/assets/steps/step8.jpg";

const STEP_IMAGES = [step1, step2, step3, step4, step5, step6, step7, step8];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">{t("title")}</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <article
                key={step.title}
                className="group bg-card rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={STEP_IMAGES[i]}
                    alt={step.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-lg ring-2 ring-background">
                    {i + 1}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-heading text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  <ul className="mt-4 space-y-1.5 pt-4 border-t border-border/50">
                    {step.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
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
