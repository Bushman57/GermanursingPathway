import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { metaFromKeys } from "@/lib/pageMeta";
import { ArrowRight } from "lucide-react";
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

function DiamondBullet() {
  return (
    <span
      className="mt-2.5 size-2 shrink-0 rotate-45 bg-primary"
      aria-hidden
    />
  );
}

function StepText({
  title,
  desc,
  details,
}: {
  title: string;
  desc: string;
  details: string[];
}) {
  return (
    <div className="py-2 lg:py-6">
      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary leading-snug">
        {title}
      </h2>
      <p className="mt-3 text-muted-foreground leading-relaxed">{desc}</p>
      <ul className="mt-5 space-y-3">
        {details.map((d) => (
          <li key={d} className="flex items-start gap-3 text-foreground/90">
            <DiamondBullet />
            <span className="leading-relaxed">{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="py-2 lg:py-6">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full rounded-2xl object-cover aspect-[4/3] shadow-lg ring-1 ring-border/40"
      />
    </div>
  );
}

function TimelineNode({ number }: { number: number }) {
  return (
    <div className="relative z-10 flex justify-center lg:px-0">
      <div
        className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-heading font-bold text-lg shadow-md ring-4 ring-background"
        aria-hidden
      >
        {number}
      </div>
    </div>
  );
}

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
      <div className="pt-24 pb-20 bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-16">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          <div className="relative">
            {/* Center vertical timeline (desktop) */}
            <div
              className="pointer-events-none absolute left-1/2 top-6 bottom-6 hidden w-0.5 -translate-x-1/2 bg-primary/20 lg:block"
              aria-hidden
            />

            <ol className="space-y-4 lg:space-y-2">
              {steps.map((step, i) => {
                const textLeft = i % 2 === 0;
                const imageSrc = STEP_IMAGES[i];

                return (
                  <li
                    key={step.title}
                    className="relative list-none"
                  >
                    {/* Mobile / tablet: stacked with left rail */}
                    <div className="lg:hidden">
                      <div className="flex gap-5 sm:gap-6">
                        <div className="flex flex-col items-center">
                          <TimelineNode number={i + 1} />
                          {i < steps.length - 1 && (
                            <div className="mt-2 w-0.5 flex-1 min-h-[2rem] bg-primary/20" aria-hidden />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-10">
                          <StepText title={step.title} desc={step.desc} details={step.details} />
                          {imageSrc && (
                            <div className="mt-6">
                              <StepImage src={imageSrc} alt={step.title} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Desktop: alternating columns around center timeline */}
                    <div className="hidden lg:grid lg:grid-cols-[1fr_4.5rem_1fr] lg:gap-x-10 xl:gap-x-14 lg:items-center">
                      <div className={textLeft ? "" : "lg:col-start-3 lg:row-start-1"}>
                        {textLeft ? (
                          <StepText title={step.title} desc={step.desc} details={step.details} />
                        ) : imageSrc ? (
                          <StepImage src={imageSrc} alt={step.title} />
                        ) : null}
                      </div>

                      <div className="lg:col-start-2 lg:row-start-1 flex justify-center self-center">
                        <TimelineNode number={i + 1} />
                      </div>

                      <div className={textLeft ? "lg:col-start-3" : "lg:col-start-1 lg:row-start-1"}>
                        {textLeft ? (
                          imageSrc ? (
                            <StepImage src={imageSrc} alt={step.title} />
                          ) : null
                        ) : (
                          <StepText title={step.title} desc={step.desc} details={step.details} />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
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
