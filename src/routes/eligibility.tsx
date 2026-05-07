import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle, User, Briefcase, GraduationCap, BookOpen, Shield } from "lucide-react";

export const Route = createFileRoute("/eligibility")({
  head: () => ({
    meta: [
      { title: "Check Eligibility — German Nursing Pathway" },
      { name: "description", content: "Check your eligibility to teach in Germany in just 3 minutes." },
    ],
  }),
  component: Eligibility,
});

interface FormData {
  name: string;
  age: string;
  nationality: string;
  profession: string;
  qualification: string;
  fieldOfStudy: string;
  yearsExperience: string;
  jobStatus: string;
  germanLevel: string;
  hasPassport: string;
  willingToRelocate: string;
}

const initialData: FormData = {
  name: "",
  age: "",
  nationality: "Kenyan",
  profession: "",
  qualification: "",
  fieldOfStudy: "",
  yearsExperience: "",
  jobStatus: "",
  germanLevel: "",
  hasPassport: "",
  willingToRelocate: "",
};

const steps = [
  { label: "Personal Info", icon: User },
  { label: "Profession", icon: Briefcase },
  { label: "Education", icon: GraduationCap },
  { label: "Experience", icon: Briefcase },
  { label: "Language", icon: BookOpen },
  { label: "Readiness", icon: Shield },
];

function Eligibility() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [showResults, setShowResults] = useState(false);

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else setShowResults(true);
  };
  const prev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const calculateScore = () => {
    let score = 0;
    const gaps: string[] = [];

    if (formData.qualification === "bachelors" || formData.qualification === "masters" || formData.qualification === "phd") score += 25;
    else gaps.push("A Bachelor's degree or higher is required");

    if (formData.germanLevel === "a2" || formData.germanLevel === "b1+") score += 25;
    else if (formData.germanLevel === "a1") { score += 15; gaps.push("A2 German level is recommended"); }
    else gaps.push("You need at least A1 German certification");

    const exp = parseInt(formData.yearsExperience || "0");
    if (exp >= 2) score += 25;
    else if (exp >= 1) { score += 15; gaps.push("2+ years of experience is preferred"); }
    else gaps.push("Teaching experience is required");

    if (formData.hasPassport === "yes") score += 15;
    else gaps.push("A valid passport is required");

    if (formData.willingToRelocate === "yes") score += 10;
    else gaps.push("Willingness to relocate is essential");

    return { score, gaps };
  };

  if (showResults) {
    const { score, gaps } = calculateScore();
    const status = score >= 80 ? "eligible" : score >= 50 ? "almost" : "not-eligible";

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-lg">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                status === "eligible" ? "bg-success/10" : status === "almost" ? "bg-warm/10" : "bg-destructive/10"
              }`}>
                <span className="font-heading text-3xl font-bold" style={{ color: status === "eligible" ? "var(--success)" : status === "almost" ? "var(--warm)" : "var(--destructive)" }}>
                  {score}%
                </span>
              </div>

              <h2 className="font-heading text-2xl font-bold text-foreground">
                {status === "eligible" && "You're Eligible! 🎉"}
                {status === "almost" && "Almost There! 💪"}
                {status === "not-eligible" && "Not Yet Ready"}
              </h2>

              <p className="mt-2 text-muted-foreground">
                {status === "eligible" && "Great news! You meet the requirements to teach in Germany."}
                {status === "almost" && `You're ${score}% ready for Germany 🇩🇪 — just a few things to work on.`}
                {status === "not-eligible" && "Don't give up — here's what you need to improve."}
              </p>

              {gaps.length > 0 && (
                <div className="mt-6 text-left space-y-3">
                  <h3 className="font-heading font-semibold text-foreground text-sm">Gap Analysis</h3>
                  {gaps.map((gap) => (
                    <div key={gap} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-warm flex-shrink-0 mt-0.5" />
                      {gap}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 space-y-3">
                {status === "eligible" ? (
                  <Button variant="warm" size="lg" className="w-full py-6">
                    Continue to Job Matches
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button variant="warm" size="lg" className="w-full py-6">
                    Improve My Profile
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
                <Button variant="outline" size="lg" className="w-full py-6" onClick={() => { setShowResults(false); setCurrentStep(0); setFormData(initialData); }}>
                  Retake Assessment
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-lg mx-auto px-4">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm font-medium text-warm">{steps[currentStep].label}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full warm-gradient rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            {/* Step 1: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">Personal Information</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30" placeholder="Enter your full name" value={formData.name} onChange={(e) => update("name", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Age</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30" placeholder="e.g. 28" type="number" value={formData.age} onChange={(e) => update("age", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nationality</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30" value={formData.nationality} onChange={(e) => update("nationality", e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 2: Profession */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">Your Profession</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">What is your profession?</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30" value={formData.profession} onChange={(e) => update("profession", e.target.value)}>
                    <option value="">Select your profession</option>
                    <option value="teacher">Teacher</option>
                    <option value="nurse">Nurse</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Education */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">Education</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Highest Qualification</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30" value={formData.qualification} onChange={(e) => update("qualification", e.target.value)}>
                    <option value="">Select qualification</option>
                    <option value="highschool">High School</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Field of Study</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30" placeholder="e.g. Education, Mathematics" value={formData.fieldOfStudy} onChange={(e) => update("fieldOfStudy", e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 4: Experience */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">Experience</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Years of Teaching Experience</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30" value={formData.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)}>
                    <option value="">Select experience</option>
                    <option value="0">Less than 1 year</option>
                    <option value="1">1 year</option>
                    <option value="2">2 years</option>
                    <option value="3">3-5 years</option>
                    <option value="5">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Current Job Status</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30" value={formData.jobStatus} onChange={(e) => update("jobStatus", e.target.value)}>
                    <option value="">Select status</option>
                    <option value="employed">Currently Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 5: Language */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">German Language 🇩🇪</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">What is your German level?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "none", label: "None", desc: "No German yet" },
                      { value: "a1", label: "A1", desc: "Beginner" },
                      { value: "a2", label: "A2", desc: "Elementary" },
                      { value: "b1+", label: "B1+", desc: "Intermediate or above" },
                    ].map((level) => (
                      <button
                        key={level.value}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.germanLevel === level.value
                            ? "border-warm bg-warm/5 ring-2 ring-warm/20"
                            : "border-border hover:border-warm/30"
                        }`}
                        onClick={() => update("germanLevel", level.value)}
                      >
                        <span className="font-heading font-semibold text-foreground text-sm">{level.label}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{level.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload your German certificate (A1 or A2 preferred) during profile completion.
                </p>
              </div>
            )}

            {/* Step 6: Legal Readiness */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">Legal Readiness</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Do you have a valid passport?</label>
                  <div className="flex gap-3">
                    {["yes", "no"].map((v) => (
                      <button key={v} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${formData.hasPassport === v ? "border-warm bg-warm/5 ring-2 ring-warm/20 text-foreground" : "border-border text-muted-foreground hover:border-warm/30"}`} onClick={() => update("hasPassport", v)}>
                        {v === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Are you willing to relocate to Germany?</label>
                  <div className="flex gap-3">
                    {["yes", "no"].map((v) => (
                      <button key={v} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${formData.willingToRelocate === v ? "border-warm bg-warm/5 ring-2 ring-warm/20 text-foreground" : "border-border text-muted-foreground hover:border-warm/30"}`} onClick={() => update("willingToRelocate", v)}>
                        {v === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={prev} disabled={currentStep === 0}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button variant="warm" onClick={next}>
                {currentStep === steps.length - 1 ? "See My Results" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
