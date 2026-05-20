import { createFileRoute, Link } from "@tanstack/react-router";
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
import imageHero from "@/assets/image_hero.png";
import heroBridge from "@/assets/hero-bridge.jpg";
import programOverview from "@/assets/program-overview.jpg";
import eligibilityNurse from "@/assets/eligibility-nurse.jpg";

const galleryImages = [
  { src: imageHero, alt: "Your career in Germany starts here" },
  { src: heroBridge, alt: "Bridge to opportunity in Germany" },
  { src: programOverview, alt: "Healthcare professionals reviewing documents" },
  { src: eligibilityNurse, alt: "Kenyan nurse working in a German hospital" },
];

const freeServices: {
  icon: typeof ClipboardList;
  title: string;
  desc: string;
  href?: string;
  whatsappLogo?: boolean;
}[] = [
  {
    icon: ClipboardList,
    title: "Information & Eligibility Assessment",
    desc: "Initial consultation online or in-person in NRW for Germany-based enquiries.",
  },
  {
    icon: GraduationCap,
    title: "Scholarship & Opportunity Matching",
    desc: "Connection to verified German school openings aligned with your profile.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Community Membership",
    desc: "Access to a candidate peer network and agency updates.",
    href: WHATSAPP_GROUP_URL,
    whatsappLogo: true,
  },
  {
    icon: BookOpen,
    title: "Online Resource Library",
    desc: "Downloadable guides on Ausbildung, visa, and language requirements.",
  },
  {
    icon: Video,
    title: "Webinars & Q&A Sessions",
    desc: "Monthly online events open to all registered candidates.",
  },
];

const paidServices = [
  {
    icon: FileStack,
    title: "Full Application Management Package",
    desc: "Document preparation, translation verification, and school application submission.",
    price: "€150–€300",
  },
  {
    icon: Languages,
    title: "German Language Guidance Package",
    desc: "Course provider matching, study plan, and exam registration support.",
    price: "€75–€150",
  },
  {
    icon: Stamp,
    title: "Visa Application Support",
    desc: "Document checklist, appointment preparation, and embassy liaison coordination.",
    price: "€100–€200",
  },
  {
    icon: Mic,
    title: "Interview Preparation",
    desc: "Mock interviews in German and English, cultural briefing, and role-play.",
    price: "€75–€125",
  },
  {
    icon: Plane,
    title: "Pre-Departure Orientation",
    desc: "1-day virtual or in-person session covering German healthcare culture, accommodation, banking, and transport.",
    price: "€50–€100",
  },
  {
    icon: Package,
    title: "Premium Bundle",
    desc: "All paid services above at a discounted combined rate.",
    price: "€400–€600",
    highlight: true,
  },
  {
    icon: MapPin,
    title: "Post-Arrival Integration Support",
    desc: "Optional add-on: first 90 days check-ins, Anmeldung guidance, and insurance registration.",
    price: "€75–€150",
    optional: true,
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — German Nursing Pathway" },
      {
        name: "description",
        content:
          "German Nursing Pathway fast-tracks verified students into trusted nursing scholarship opportunities, language training, and career pathways in Germany.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
              About German Nursing Pathway
            </h1>
          </div>

          <div className="prose prose-lg mx-auto">
            <p className="text-muted-foreground leading-relaxed text-center">
              German Nursing Pathway bridges the gap between ambitious nursing students and verified
              opportunities abroad. Through direct connections with accredited schools, structured language
              training, visa guidance, and end-to-end application support, we help you move from eligibility
              check to a sustainable healthcare career in Germany.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <section className="py-16 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                Strategic Direction & <span className="text-warm">Vision</span>
              </h2>
              <div className="w-16 h-1 bg-warm mt-4 mx-auto rounded-full" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-2xl border border-border p-8 sm:p-10 hover:border-warm/30 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-warm/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-warm" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground">Our Vision</h3>
                <p className="mt-4 text-lg text-foreground font-medium leading-relaxed">
                  Transforming dreams into global healthcare careers.
                </p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-8 sm:p-10 hover:border-warm/30 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground">Our Mission</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Fast-tracking verified students into trusted nursing scholarship opportunities, language
                  training, visa guidance, and career pathways through direct connections with accredited
                  nursing schools and healthcare institutions in Germany.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery strip */}
        <section className="py-16 overflow-hidden bg-card/40">
          <div className="text-center mb-10 px-4">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Glimpses of <span className="text-warm">Your Journey</span>
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
                Our Comprehensive <span className="text-warm">Services</span>
              </h2>
              <div className="w-16 h-1 bg-warm mt-4 mx-auto rounded-full" />
              <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg">
                End-to-end solutions for your nursing career in Germany — from first eligibility check
                through arrival and integration.
              </p>
            </div>

            {/* Free services */}
            <div className="mb-16">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-success bg-success/10 px-3 py-1 rounded-full mb-3">
                    Free Services
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-foreground">
                    Lead Generation & Trust Building
                  </h3>
                  <p className="mt-2 text-muted-foreground text-sm max-w-xl">
                    Get started at no cost — assess your fit, access resources, and join our candidate community.
                  </p>
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
                        {item.href ? "Join free →" : "Included free"}
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
                    Paid Services
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-foreground">Core Application & Relocation Support</h3>
                  <p className="mt-2 text-muted-foreground text-sm max-w-xl">
                    Expert-led packages to take you from application to arrival — transparent pricing per candidate.
                  </p>
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
                        <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
                      )}
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    {item.highlight && (
                      <p className="mt-3 text-xs text-warm font-medium">Best value — all core packages combined</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="warm" size="lg" asChild>
                <Link to="/register">Register Interest</Link>
              </Button>
              <WhatsAppLink variant="whatsapp" size="lg" />
            </div>
          </div>
        </section>

        {/* What Sets Us Apart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              What Sets Us <span className="text-warm">Apart</span>
            </h2>
            <div className="w-16 h-1 bg-warm mt-4 mx-auto rounded-full" />
            <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
              Six commitments that shape every step of your journey from Kenya to Germany.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: "Transparent Processes",
                desc: "Clear step-by-step guidance with no hidden costs or surprises.",
              },
              {
                icon: BadgeCheck,
                title: "Credentialing Support",
                desc: "Expert assistance with licensing and certification requirements.",
              },
              {
                icon: HandCoins,
                title: "Flexible Payments",
                desc: "Ethical practices with payment plans tailored to your budget.",
              },
              {
                icon: Handshake,
                title: "Strong Partnerships",
                desc: "Direct connections with accredited schools and healthcare employers in Germany.",
              },
              {
                icon: LifeBuoy,
                title: "End-to-End Support",
                desc: "From initial application to successful integration abroad.",
              },
              {
                icon: UserCheck,
                title: "Professional Guidance",
                desc: "Experienced consultants with healthcare migration expertise.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center bg-card rounded-2xl p-8 border border-border hover:border-warm/30 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 transition-colors">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Core values strip */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Compassion",
                desc: "Patient, empathetic support at every stage of your international career journey.",
              },
              {
                icon: Shield,
                title: "Integrity",
                desc: "Honest assessments, verified opportunities, and ethical recruitment practices.",
              },
              {
                icon: CheckCircle,
                title: "Excellence",
                desc: "Regulated processes that ensure compliance and satisfaction for every candidate we serve.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-warm/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-warm" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
