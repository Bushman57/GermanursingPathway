import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Heart, Target, Shield,
  Eye, BadgeCheck, HandCoins, Handshake, LifeBuoy, UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — German Nursing Pathway" },
      { name: "description", content: "German Nursing Pathway connects Kenyan healthcare professionals with career opportunities in Germany. Learn about our mission." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">About German Nursing Pathway</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
              Bridging the gap between Kenyan talent and German opportunities
            </p>
          </div>

          <div className="prose prose-lg mx-auto mb-16">
            <p className="text-muted-foreground leading-relaxed text-center">
              German Nursing Pathway was founded with a simple mission: to help qualified Kenyan healthcare
              professionals build fulfilling careers in Germany. We handle the complex process of qualification
              recognition, language assessment, and job placement so you can focus on what you do best: caring
              for patients.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Our Mission", desc: "Empower Kenyan educators to access global career opportunities and build better futures for themselves and their families." },
              { icon: Target, title: "Our Approach", desc: "We assess, prepare, and match candidates with the right positions — ensuring every placement is a success for both teacher and school." },
              { icon: Shield, title: "Our Promise", desc: "Transparent process, honest assessments, and continuous support from your first eligibility check through your first year in Germany." },
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

        {/* What Sets Us Apart — 6 differentiators */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
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
                desc: "Direct connections with recruiters and employers abroad.",
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
      </div>
      <Footer />
    </div>
  );
}
