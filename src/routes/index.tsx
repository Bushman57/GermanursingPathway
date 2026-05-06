import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle, GraduationCap, Globe, Users, ArrowRight, Clock, BookOpen, Briefcase } from "lucide-react";
import heroImage from "@/assets/hero-teacher.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KenyaDesk — Work in Germany as a Teacher" },
      { name: "description", content: "Connecting Kenyan teachers with career opportunities in Germany. Check your eligibility in 3 minutes." },
      { property: "og:title", content: "KenyaDesk — Work in Germany as a Teacher" },
      { property: "og:description", content: "Connecting Kenyan teachers with career opportunities in Germany." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Split Screen */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-light text-warm text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                Kenya → Germany
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Work in Germany as a{" "}
                <span className="text-warm">Teacher</span> 🇩🇪
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
                We connect qualified Kenyan educators with teaching opportunities in Germany. 
                Check your eligibility and start your journey today.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button variant="warm" size="lg" className="text-base px-8 py-6" asChild>
                  <Link to="/eligibility">
                    Check Eligibility
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-base px-8 py-6" asChild>
                  <Link to="/how-it-works">How It Works</Link>
                </Button>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Takes 3 minutes to check eligibility
              </div>
            </div>

            {/* Right side - Image + Floating Cards */}
            <div className="relative animate-fade-up-delay-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
                <img
                  src={heroImage}
                  alt="Kenyan teacher working in a German classroom"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
              </div>

              {/* Floating requirement cards */}
              <div className="absolute -bottom-4 -left-4 glass-card rounded-xl p-4 shadow-lg animate-float hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">German Level</p>
                    <p className="text-sm font-semibold text-foreground">A1 / A2</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 glass-card rounded-xl p-4 shadow-lg animate-float hidden sm:block" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warm/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-warm" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Required</p>
                    <p className="text-sm font-semibold text-foreground">Degree</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Quick Preview */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              What You Need
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Basic requirements to begin your Germany teaching journey
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "A1/A2 German", desc: "Basic German language certification" },
              { icon: GraduationCap, title: "University Degree", desc: "Bachelor's or higher in education" },
              { icon: Briefcase, title: "Teaching Experience", desc: "At least 1 year of classroom experience" },
              { icon: CheckCircle, title: "Valid Passport", desc: "Current passport ready for visa processing" },
            ].map((req, i) => (
              <div
                key={req.title}
                className="group bg-background rounded-xl p-6 border border-border hover:border-warm/30 hover:shadow-lg hover:shadow-warm/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-warm/10 flex items-center justify-center mb-4 group-hover:bg-warm/20 transition-colors">
                  <req.icon className="w-6 h-6 text-warm" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">{req.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{req.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Your Journey to Germany
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              From eligibility check to your first day in a German classroom
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Check Eligibility", desc: "Complete a quick assessment to see if you qualify" },
              { step: "02", title: "Complete Profile", desc: "Upload documents and certifications" },
              { step: "03", title: "Get Matched", desc: "We match you with suitable positions in Germany" },
              { step: "04", title: "Start Teaching", desc: "Begin your career in a German school" },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-heading font-bold text-warm/15 mb-2">{item.step}</div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="warm" size="lg" className="px-8 py-6 text-base" asChild>
              <Link to="/eligibility">
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Teachers Placed" },
              { value: "50+", label: "Partner Schools" },
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
            Ready to Start Your Teaching Career in Germany?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
            Join hundreds of Kenyan teachers who have successfully made the move. 
            Your journey starts with a 3-minute eligibility check.
          </p>
          <div className="mt-8">
            <Button variant="warm" size="lg" className="px-10 py-6 text-base" asChild>
              <Link to="/eligibility">
                Check My Eligibility Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
