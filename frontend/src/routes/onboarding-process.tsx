import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { metaFromKeys } from "@/lib/pageMeta";
import { parseLearningSearch } from "@/lib/learningSearchParams";
import { LearningReturnBanner } from "@/components/resources/LearningReturnBanner";
import { ArrowRight } from "lucide-react";
import step1 from "@/assets/steps/step1.jpg";
import step2 from "@/assets/steps/step2.jpg";
import step3 from "@/assets/steps/step3.jpg";
import step4 from "@/assets/steps/step4.jpg";
import step6 from "@/assets/steps/step6.jpg";
import step7 from "@/assets/steps/step7.jpg";
import step8 from "@/assets/steps/step8.jpg";

const STEP_IMAGES = [step1, step2, step3, step4, step6, step7, step8];

export const Route = createFileRoute("/onboarding-process")({
  validateSearch: parseLearningSearch,
  head: () => metaFromKeys("onboardingProcess"),
  component: OnboardingProcess,
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
  number,
}: {
  title: string;
  desc: string;
  details: string[];
  number: number;
}) {
  return (
    <div className="group/text py-2 lg:py-6">
      <span className="inline-block font-heading text-xs uppercase tracking-[0.2em] text-warm font-semibold mb-2">
        Step {String(number).padStart(2, "0")}
      </span>
      <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight tracking-tight">
        {title}
      </h2>
      <p className="mt-3 text-muted-foreground leading-relaxed font-body text-[15px] sm:text-base">
        {desc}
      </p>
      <ul className="mt-5 space-y-3">
        {details.map((d) => (
          <li key={d} className="flex items-start gap-3 text-foreground/90 font-body">
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
    <div className="group/img py-2 lg:py-6">
      <div className="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-border/40 transition-all duration-500 hover:shadow-2xl hover:ring-warm/40 hover:-translate-y-1">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full object-cover aspect-[4/3] transition-all duration-700 ease-out group-hover/img:scale-110 grayscale-[20%] group-hover/img:grayscale-0"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent opacity-60 group-hover/img:opacity-0 transition-opacity duration-500" />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>
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

function OnboardingProcess() {
  const { learningReturn, learningTopic } = Route.useSearch();
  const { t } = useTranslation("onboardingProcess");
  const { t: tc } = useTranslation("common");
  const steps = t("steps", { returnObjects: true }) as {
    title: string;
    desc: string;
    details: string[];
  }[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <LearningReturnBanner learningReturn={learningReturn} learningTopic={learningTopic} />
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
                const imageLeft = i % 2 === 0;
                const imageSrc = STEP_IMAGES[i];
                const stepProps = {
                  number: i + 1,
                  title: step.title,
                  desc: step.desc,
                  details: step.details,
                };

                const leftContent = imageLeft
                  ? imageSrc && <StepImage src={imageSrc} alt={step.title} />
                  : <StepText {...stepProps} />;

                const rightContent = imageLeft
                  ? <StepText {...stepProps} />
                  : imageSrc && <StepImage src={imageSrc} alt={step.title} />;

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
                          {imageSrc && (
                            <div className="mb-4">
                              <StepImage src={imageSrc} alt={step.title} />
                            </div>
                          )}
                          <StepText number={i + 1} title={step.title} desc={step.desc} details={step.details} />
                        </div>
                      </div>
                    </div>

                    {/* Desktop: fixed grid columns; zigzag via leftContent/rightContent only */}
                    <div className="hidden lg:grid lg:grid-cols-[1fr_4.5rem_1fr] lg:gap-x-10 xl:gap-x-14 lg:items-center">
                      <div className="lg:col-start-1 lg:row-start-1">{leftContent}</div>
                      <div className="lg:col-start-2 lg:row-start-1 flex justify-center self-center">
                        <TimelineNode number={i + 1} />
                      </div>
                      <div className="lg:col-start-3 lg:row-start-1">{rightContent}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="warm" size="cta" asChild>
              <Link to="/register">
                {t("registerCta")}
                <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <WhatsAppLink variant="outline" size="cta" label={tc("nav.whatsapp")} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
