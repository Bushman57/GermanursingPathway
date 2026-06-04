import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "The eligibility check helped me understand exactly what to improve before applying to Ausbildung programs.",
    name: "Grace M.",
    role: "Registered Nurse, Nairobi",
  },
  {
    quote:
      "Having verified scholarships in one place saved weeks of searching random Facebook groups.",
    name: "James K.",
    role: "CNA, Mombasa",
  },
  {
    quote:
      "The portal OTP sign-in is simple — I browse programs on my phone during breaks at the hospital.",
    name: "Faith W.",
    role: "Clinical Officer, Kisumu",
  },
];

export function HomeSocialProof() {
  const { t } = useTranslation("common");
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" });

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground">
          {t("home.testimonialsTitle")}
        </h2>
        <div className="overflow-hidden mt-10" ref={emblaRef}>
          <div className="flex gap-6">
            {TESTIMONIALS.map((item) => (
              <article
                key={item.name}
                className="min-w-[85%] sm:min-w-[45%] bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                <Quote className="w-8 h-8 text-warm/40 mb-3" />
                <p className="text-sm text-muted-foreground leading-relaxed">{item.quote}</p>
                <p className="mt-4 font-medium text-foreground text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="text-center mt-10">
          <Button variant="warm" asChild>
            <Link to="/scholarships">
              {t("home.recentScholarships")} <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
