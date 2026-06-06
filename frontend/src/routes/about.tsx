import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { metaFromKeys } from "@/lib/pageMeta";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WHATSAPP_GROUP_URL } from "@/lib/constants";
import {
  Heart, Target, Shield,
  Eye, BadgeCheck, HandCoins, Handshake, LifeBuoy, UserCheck,
  ClipboardList, GraduationCap, MessageCircle, BookOpen, Video,
  FileStack, Languages, Stamp, Mic, Plane, Package, MapPin,
  CheckCircle,
} from "lucide-react";
import imageHero from "@/assets/image_hero.webp";
import heroBridge from "@/assets/hero-bridge.webp";
import programOverview from "@/assets/program-overview.jpg";
import eligibilityNurse from "@/assets/eligibility-nurse.jpg";

const GALLERY_SRCS = [imageHero, heroBridge, programOverview, eligibilityNurse];
const FREE_ICONS = [ClipboardList, GraduationCap, MessageCircle, BookOpen, Video] as const;
const PAID_ICONS = [FileStack, Languages, Stamp, Mic, Plane, Package, MapPin] as const;
const APART_ICONS = [Eye, BadgeCheck, HandCoins, Handshake, LifeBuoy, UserCheck] as const;
const ETHICS_ICONS = [Shield, Eye, Heart] as const;

export const Route = createFileRoute("/about")({
  head: () => metaFromKeys("about"),
  component: About,
});

function About() {
  const { t } = useTranslation("about");
  const galleryAlts = t("gallery.alts", { returnObjects: true }) as string[];
  const galleryImages = GALLERY_SRCS.map((src, i) => ({ src, alt: galleryAlts[i] ?? "" }));
  const freeServices = (
    t("freeServices", { returnObjects: true }) as {
      title: string;
      desc: string;
      whatsapp?: boolean;
    }[]
  ).map((item, i) => ({
    ...item,
    icon: FREE_ICONS[i] ?? ClipboardList,
    href: item.whatsapp ? WHATSAPP_GROUP_URL : undefined,
    whatsappLogo: item.whatsapp,
  }));
  const paidServices = (
    t("paidServices", { returnObjects: true }) as {
      title: string;
      desc: string;
      price: string;
      highlight?: boolean;
      optional?: boolean;
    }[]
  ).map((item, i) => ({ ...item, icon: PAID_ICONS[i] ?? FileStack }));
  const apartItems = t("apart.items", { returnObjects: true }) as { title: string; desc: string }[];
  const ethicsItems = t("ethics.items", { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">{t("title")}</h1>
          </div>

          <div className="prose prose-lg mx-auto">
            <p className="text-muted-foreground leading-relaxed text-center">{t("intro")}</p>
          </div>
        </div>

        {/* Mission & Vision */}
        <section className="py-16 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                {t("vision.sectionTitle")} <span className="text-warm">{t("vision.sectionAccent")}</span>
              </h2>
              <div className="w-16 h-1 bg-warm mt-4 mx-auto rounded-full" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-2xl border border-border p-8 sm:p-10 hover:border-warm/30 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-warm/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-warm" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground">{t("vision.visionTitle")}</h3>
                <p className="mt-4 text-lg text-foreground font-medium leading-relaxed">{t("vision.visionText")}</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-8 sm:p-10 hover:border-warm/30 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground">{t("vision.missionTitle")}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">{t("vision.missionText")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery strip */}
        <section className="py-16 overflow-hidden bg-card/40">
          <div className="text-center mb-10 px-4">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              {t("gallery.title")} <span className="text-warm">{t("gallery.titleAccent")}</span>
            </h2>
            <div className="w-12 h-1 bg-warm mt-3 mx-auto rounded-full" />
          </div>
          <div className="relative">
            <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
              {[...galleryImages, ...galleryImages].map((img, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[80vw] sm:w-[45vw] lg:w-[31vw] rounded-2xl overflow-hidden shadow-lg border border-border bg-card"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-64 sm:h-72 lg:h-80 object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services — inspired by GHIC comprehensive services layout */}
        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                {t("services.sectionTitle")} <span className="text-warm">{t("services.sectionAccent")}</span>
              </h2>
              <div className="w-16 h-1 bg-warm mt-4 mx-auto rounded-full" />
              <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg">{t("services.sectionSubtitle")}</p>
            </div>

            {/* Free services */}
            <div className="mb-16">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-success bg-success/10 px-3 py-1 rounded-full mb-3">
                    {t("services.freeBadge")}
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-foreground">{t("services.freeTitle")}</h3>
                  <p className="mt-2 text-muted-foreground text-sm max-w-xl">{t("services.freeSubtitle")}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {freeServices.map((item) => {
                  const inner = (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/15 transition-colors">
                        {item.whatsappLogo ? (
                          <WhatsAppIcon className="h-7 w-7" tone="brand" />
                        ) : (
                          <item.icon className="w-6 h-6 text-success" />
                        )}
                      </div>
                      <h4 className="font-heading text-lg font-semibold text-foreground">{item.title}</h4>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      <span className="inline-block mt-4 text-xs font-medium text-success">
                        {item.href ? t("services.joinFree") : t("services.includedFree")}
                      </span>
                    </>
                  );
                  return item.href ? (
                    <a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-background rounded-2xl p-6 border border-border hover:border-success/30 hover:shadow-lg transition-all group block"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div
                      key={item.title}
                      className="bg-background rounded-2xl p-6 border border-border hover:border-success/30 hover:shadow-lg transition-all group"
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Paid services */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-warm bg-warm/10 px-3 py-1 rounded-full mb-3">
                    {t("services.paidBadge")}
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-foreground">{t("services.paidTitle")}</h3>
                  <p className="mt-2 text-muted-foreground text-sm max-w-xl">{t("services.paidSubtitle")}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paidServices.map((item) => (
                  <div
                    key={item.title}
                    className={`bg-background rounded-2xl p-6 border transition-all group ${
                      item.highlight
                        ? "border-warm shadow-md ring-1 ring-warm/20 lg:col-span-1"
                        : "border-border hover:border-warm/30 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        item.highlight ? "bg-warm/15" : "bg-primary/10 group-hover:bg-primary/15"
                      }`}>
                        <item.icon className={`w-6 h-6 ${item.highlight ? "text-warm" : "text-primary"}`} />
                      </div>
                      <span className="text-xs font-semibold text-warm bg-warm/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {item.price}
                      </span>
                    </div>
                    <h4 className="font-heading text-lg font-semibold text-foreground">
                      {item.title}
                      {item.optional && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">{t("services.optional")}</span>
                      )}
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    {item.highlight && (
                      <p className="mt-3 text-xs text-warm font-medium">{t("services.bestValue")}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="warm" size="lg" asChild>
                <Link to="/register">{t("services.registerCta")}</Link>
              </Button>
              <WhatsAppLink variant="whatsapp" size="lg" />
            </div>
          </div>
        </section>

        {/* What Sets Us Apart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              {t("apart.title")} <span className="text-warm">{t("apart.titleAccent")}</span>
            </h2>
            <div className="w-16 h-1 bg-warm mt-4 mx-auto rounded-full" />
            <p className="mt-6 text-muted-foreground max-w-xl mx-auto">{t("apart.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartItems.map((item, i) => {
              const Icon = APART_ICONS[i] ?? Eye;
              return (
              <div
                key={item.title}
                className="text-center bg-card rounded-2xl p-8 border border-border hover:border-warm/30 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              {t("ethics.title")} <span className="text-warm">{t("ethics.titleAccent")}</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {ethicsItems.map((item, i) => {
              const Icon = ETHICS_ICONS[i] ?? Shield;
              return (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-warm/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-warm" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
