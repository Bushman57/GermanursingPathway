import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Heart, Target, Shield } from "lucide-react";

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
      </div>
      <Footer />
    </div>
  );
}
