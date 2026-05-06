import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle, FileText, Users, Plane, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — KenyaDesk" },
      { name: "description", content: "Learn how KenyaDesk helps Kenyan teachers find teaching positions in Germany step by step." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    icon: CheckCircle,
    title: "Check Your Eligibility",
    desc: "Answer a few questions about your qualifications, experience, and German language level. Our smart assessment tells you exactly where you stand and what you need.",
    details: ["Takes only 3 minutes", "Instant readiness score", "Personalized gap analysis"],
  },
  {
    icon: FileText,
    title: "Complete Your Profile",
    desc: "Upload your documents, certificates, and CV. We guide you through every step with clear instructions and format hints.",
    details: ["German CV format guide", "Document checklist", "Progress tracking"],
  },
  {
    icon: Users,
    title: "Get Matched with Schools",
    desc: "Our team reviews your profile and matches you with suitable teaching positions across Germany based on your qualifications and preferences.",
    details: ["Personalized job matches", "Match percentage scores", "Direct recruiter access"],
  },
  {
    icon: Plane,
    title: "Start Your Journey",
    desc: "Once matched, we support you through the visa process, relocation, and settling into your new teaching role in Germany.",
    details: ["Visa assistance", "Relocation support", "Ongoing guidance"],
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
              How It Works
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
              Your path from Kenya to a German classroom in four simple steps
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-6 sm:gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl warm-gradient flex items-center justify-center shadow-lg shadow-warm/20">
                    <step.icon className="w-6 h-6 text-warm-foreground" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-12 bg-border mx-auto mt-3" />
                  )}
                </div>
                <div className="pt-1">
                  <p className="text-xs font-medium text-warm uppercase tracking-wider mb-1">Step {i + 1}</p>
                  <h3 className="font-heading text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{step.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {step.details.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button variant="warm" size="lg" className="px-10 py-6 text-base" asChild>
              <Link to="/eligibility">
                Start Eligibility Check
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
