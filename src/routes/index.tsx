import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import {
  CheckCircle, GraduationCap, Globe, Users, ArrowRight, Clock,
  BookOpen, Briefcase, Award, Home as HomeIcon, Shield, Heart,
  DollarSign, FileText, Plane, Languages
} from "lucide-react";
import heroBridge from "@/assets/hero-bridge.jpg";
import programOverview from "@/assets/program-overview.jpg";
import eligibilityNurse from "@/assets/eligibility-nurse.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "German Nursing Pathway — Germany Care Path for Kenyan Healthcare Professionals" },
      { name: "description", content: "A comprehensive pathway for Kenyan nurses, clinical officers, and healthcare workers to secure employment in Germany." },
      { property: "og:title", content: "German Nursing Pathway — Germany Care Path Program" },
      { property: "og:description", content: "Connecting Kenyan healthcare professionals with career opportunities in Germany." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — Full-width with background image like GHIC */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16">
        <div className="absolute inset-0">
          <img
            src={heroBridge}
            alt="Healthcare professional walking towards Germany"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-primary/75" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center animate-fade-up">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight text-balance">
            Germany Care Path Program for Kenyan Healthcare Professionals
          </h1>
          <p className="mt-6 text-xl sm:text-2xl font-heading font-medium text-warm">
            Nurses | Clinical Officers | CNAs | Health Support Workers
          </p>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            A comprehensive pathway for healthcare professionals to secure employment in Germany
            through credential recognition, language training, and direct hospital placements.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="warm" size="lg" className="text-base px-10 py-6" asChild>
              <Link to="/eligibility">
                Apply Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" className="text-base px-10 py-6" asChild>
              <Link to="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Program Overview — Split screen like GHIC */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={programOverview}
                alt="Healthcare professionals reviewing medical documents"
                className="w-full h-auto object-cover aspect-[4/3]"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                Program <span className="text-warm">Overview</span>
              </h2>
              <div className="w-16 h-1 bg-warm mt-4 mb-6 rounded-full" />
              <p className="text-muted-foreground leading-relaxed text-lg">
                The Germany Care Path Program is designed by German Nursing Pathway to support Kenyan Certified
                Nursing Assistants (CNAs), nurses, and health support workers in securing employment
                opportunities in Germany. The comprehensive package includes:
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Award, title: "Credential Recognition", desc: "Support for diploma/degree validation" },
                  { icon: Languages, title: "German Language Training", desc: "A1 to B2 level + healthcare terminology" },
                  { icon: Briefcase, title: "Job Placement", desc: "Direct hospital/clinic employment" },
                  { icon: Plane, title: "Visa & Relocation", desc: "Full immigration and settlement support" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-warm/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Types — 3 cards like GHIC */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Program Types
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Choose the path that matches your qualifications and goals
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Ausbildung",
                subtitle: "Vocational Apprenticeship Program",
                color: "bg-primary",
                features: [
                  "2–3.5 year paid training program",
                  "Earn €850–€1,200/month during training",
                  "Work visa sponsored by employer",
                  "Leads to permanent residency after completion",
                ],
              },
              {
                title: "Direct Employment",
                subtitle: "Skilled Worker Route",
                color: "bg-warm",
                features: [
                  "For qualified professionals with experience",
                  "Recognized diploma or degree required",
                  "B1–B2 German language proficiency",
                  "Employer matching service included",
                ],
              },
              {
                title: "Nursing Pathway",
                subtitle: "With or Without Recognition",
                color: "bg-success",
                features: [
                  "Credential recognition support",
                  "Paid adaptation programs available",
                  "€2,300–€3,000/month starting salary",
                  "Direct hospital/clinic placements",
                ],
              },
            ].map((program) => (
              <div
                key={program.title}
                className="group bg-background rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-warm/30 transition-all"
              >
                <div className={`${program.color} px-6 py-5`}>
                  <h3 className="font-heading text-xl font-bold text-primary-foreground">{program.title}</h3>
                  <p className="text-primary-foreground/80 text-sm mt-1">{program.subtitle}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {program.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant="warm" className="w-full mt-6" asChild>
                    <Link to="/eligibility">Apply Now</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Program <span className="text-warm">Timeline</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { phase: "Phase 1", title: "Preparation", duration: "1-2 months", desc: "Application, credential assessment, and language course enrollment", icon: FileText },
              { phase: "Phase 2", title: "Training", duration: "4-6 months", desc: "Intensive German language training (A1-B2) with healthcare terminology", icon: BookOpen },
              { phase: "Phase 3", title: "Placement", duration: "2-3 months", desc: "Employer matching, contract finalization, and visa processing", icon: Briefcase },
              { phase: "Phase 4", title: "Relocation", duration: "1 month", desc: "Pre-departure briefing and settlement support in Germany", icon: Plane },
            ].map((item, i) => (
              <div key={item.phase} className="relative bg-card rounded-xl p-6 border border-border hover:border-warm/30 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-warm/10 flex items-center justify-center mb-4 group-hover:bg-warm/20 transition-colors">
                  <item.icon className="w-6 h-6 text-warm" />
                </div>
                <span className="text-xs font-heading font-bold text-warm uppercase tracking-wider">{item.phase}</span>
                <h3 className="font-heading text-lg font-semibold text-foreground mt-1">{item.title}</h3>
                <p className="text-xs text-warm font-medium mt-1">{item.duration}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Breakdown — Table like GHIC */}
      <section className="py-20 hero-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary-foreground">
              Investment Breakdown
            </h2>
          </div>
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-primary-foreground/20">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-foreground/20">
                  <th className="text-left px-6 py-4 font-heading font-semibold text-primary-foreground">Component</th>
                  <th className="text-right px-6 py-4 font-heading font-semibold text-primary-foreground">Cost (EUR)</th>
                </tr>
              </thead>
              <tbody className="text-primary-foreground/80">
                {[
                  ["Application & Orientation", "50"],
                  ["Administration & Management", "150"],
                  ["Credential Recognition", "200"],
                  ["Language Training (A1-B2)", "750"],
                  ["Job Matching", "700"],
                  ["Visa Support", "250"],
                  ["Relocation Support", "200"],
                ].map(([item, cost]) => (
                  <tr key={item} className="border-b border-primary-foreground/10">
                    <td className="px-6 py-3 text-sm">{item}</td>
                    <td className="px-6 py-3 text-sm text-right">{cost}</td>
                  </tr>
                ))}
                <tr className="bg-primary-foreground/10">
                  <td className="px-6 py-4 font-heading font-bold text-primary-foreground text-lg">Total Program Cost</td>
                  <td className="px-6 py-4 font-heading font-bold text-warm text-lg text-right">€2,300</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-center text-primary-foreground/60 text-sm mt-6">
            Flexible payment plans available in KES equivalent
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Why Choose <span className="text-warm">German Nursing Pathway?</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: DollarSign, title: "Competitive Salaries", desc: "Starting salaries of €2,300–€3,000/month for nurses with recognized qualifications" },
              { icon: HomeIcon, title: "Relocation Support", desc: "Assistance with housing, bank accounts, and integration into German life" },
              { icon: Shield, title: "Legal Migration", desc: "Full compliance with German immigration laws and employment regulations" },
            ].map((item) => (
              <div key={item.title} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-warm/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-warm/20 transition-colors">
                  <item.icon className="w-8 h-8 text-warm" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Requirements — Split with image like GHIC */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                Eligibility <span className="text-warm">Requirements</span>
              </h2>
              <div className="w-16 h-1 bg-warm mt-4 mb-8 rounded-full" />

              <div className="space-y-6">
                <div>
                  <h4 className="font-heading font-semibold text-foreground flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-warm" />
                    Educational Qualifications
                  </h4>
                  <ul className="mt-3 space-y-2 ml-7">
                    {[
                      "Certified Nursing Assistant (CNA) certificate",
                      "Diploma or degree in Nursing (KRCHN/KRN/KRM)",
                      "Clinical Medicine diploma/degree",
                      "All qualifications must be from recognized institutions",
                    ].map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-warm" />
                    Professional Experience
                  </h4>
                  <ul className="mt-3 space-y-2 ml-7">
                    {[
                      "Minimum 1 year clinical experience for CNAs",
                      "Minimum 2 years experience for nurses/clinical officers",
                      "Current practicing license",
                    ].map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button variant="warm" size="lg" className="mt-8 px-8 py-6 text-base" asChild>
                <Link to="/eligibility">
                  Check My Eligibility
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={eligibilityNurse}
                alt="Kenyan nurse in a German hospital"
                className="w-full h-auto object-cover aspect-[4/3]"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Professionals Placed" },
              { value: "50+", label: "Partner Hospitals" },
              { value: "95%", label: "Success Rate" },
              { value: "12", label: "German Cities" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-3xl sm:text-4xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Start Your German Healthcare Career Today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
            Join hundreds of Kenyan healthcare professionals who have successfully made the move.
            Your journey starts with a quick eligibility check.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="warm" size="lg" className="px-10 py-6 text-base" asChild>
              <Link to="/eligibility">
                Apply Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 py-6 text-base" asChild>
              <Link to="/about">Contact Our Team</Link>
            </Button>
          </div>
          <p className="mt-6 text-muted-foreground text-sm">
            📞 (+254) 718-266-072 &nbsp;·&nbsp; ✉️ info@germannursingpathway.com
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
