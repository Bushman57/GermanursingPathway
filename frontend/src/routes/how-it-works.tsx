import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import {
  UserPlus, ClipboardCheck, School, FileText, Languages, Stamp,
  Plane, MapPin, ArrowRight, CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — German Nursing Pathway" },
      {
        name: "description",
        content: "Step-by-step guide from registration to arrival in Germany for Kenyan nursing professionals.",
      },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    icon: UserPlus,
    title: "Register Your Interest",
    desc: "Complete a short form with your nursing qualification, German level, and timeline. Join our WhatsApp community for peer support and updates.",
    details: ["Free initial assessment", "WhatsApp candidate network", "No obligation"],
  },
  {
    icon: ClipboardCheck,
    title: "Eligibility & Assessment",
    desc: "We review your profile against verified school and Ausbildung requirements and share an honest readiness summary.",
    details: ["Online or in-person (NRW)", "Gap analysis", "Clear next steps"],
  },
  {
    icon: School,
    title: "School & Opportunity Matching",
    desc: "We connect you with accredited German nursing schools and healthcare institutions that fit your profile.",
    details: ["Verified partner schools", "Scholarship & Ausbildung options", "Transparent criteria"],
  },
  {
    icon: FileText,
    title: "Application & Documents",
    desc: "Guided document preparation, translation verification, and school application submission with our support team.",
    details: ["Document checklist", "Application management", "Interview preparation"],
  },
  {
    icon: Languages,
    title: "German Language Pathway",
    desc: "Course matching, study plans, and exam registration support from A1 toward the level your program requires.",
    details: ["Provider matching", "Healthcare German focus", "Exam support"],
  },
  {
    icon: Stamp,
    title: "Visa & Embassy Support",
    desc: "Checklist-driven visa preparation, appointment guidance, and coordination for your embassy interview.",
    details: ["Document review", "Mock interviews", "Embassy liaison"],
  },
  {
    icon: Plane,
    title: "Pre-Departure Orientation",
    desc: "Virtual or in-person session on German healthcare culture, accommodation, banking, transport, and what to expect on arrival.",
    details: ["Culture briefing", "Practical settlement tips", "Insurance overview"],
  },
  {
    icon: MapPin,
    title: "Arrival & Integration",
    desc: "Optional first-90-days support: Anmeldung guidance, insurance registration, and check-ins as you start your role.",
    details: ["Post-arrival check-ins", "Local registration help", "Ongoing agency contact"],
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">How It Works</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Your pathway from Kenya to a nursing career in Germany — eight clear steps from first contact to arrival.
            </p>
          </div>

          {/* Mobile: horizontal step indicator */}
          <div className="flex gap-1 mb-12 overflow-x-auto pb-2 sm:hidden">
            {steps.map((_, i) => (
              <div key={i} className="shrink-0 w-8 h-1 rounded-full bg-warm/30 overflow-hidden">
                <div className="h-full w-full bg-warm rounded-full" style={{ opacity: 0.4 + (i / steps.length) * 0.6 }} />
              </div>
            ))}
          </div>

          <div className="space-y-10">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-5 sm:gap-8 items-start">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl warm-gradient flex items-center justify-center shadow-lg shadow-warm/20">
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-warm-foreground" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[2rem] bg-border mt-3 hidden sm:block" />
                  )}
                </div>
                <div className="pt-0.5 flex-1 pb-2 border-b border-border/60 last:border-0">
                  <p className="text-xs font-medium text-warm uppercase tracking-wider mb-1">Step {i + 1}</p>
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
            ))}
          </div>

          <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="warm" size="lg" className="px-10 py-6 text-base" asChild>
              <Link to="/register">
                Register Interest
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <WhatsAppLink variant="outline" size="lg" className="px-10 py-6 text-base" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
