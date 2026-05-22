import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { partnerSchools } from "@/lib/partners";
import { useTranslation } from "react-i18next";
import { metaFromKeys } from "@/lib/pageMeta";
import { Building2, MapPin, ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/partners")({
  head: () => metaFromKeys("partners"),
  component: PartnersPage,
});

function PartnersPage() {
  const { t, i18n } = useTranslation("common");
  const isDe = i18n.language.startsWith("de");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-12 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-primary-foreground">
            {t("partnersPage.title")} <span className="text-warm">{t("partnersPage.titleAccent")}</span>
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">{t("partnersPage.subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          {partnerSchools.map((school) => (
            <article
              key={school.slug}
              className="bg-card border border-border rounded-2xl p-6 hover:border-warm/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                {school.verified && (
                  <Badge className="bg-success/15 text-success border-0 gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    {t("partnersPage.verified")}
                  </Badge>
                )}
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground mt-4">
                {isDe ? school.nameDe : school.nameEn}
              </h2>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {school.city}, Germany
              </p>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                {isDe ? school.descriptionDe : school.descriptionEn}
              </p>
              <Button variant="link" className="mt-4 px-0 text-warm" asChild>
                <Link to="/scholarships">
                  View related opportunities
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
