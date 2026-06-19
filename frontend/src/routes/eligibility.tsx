import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveEligibilityPrefill, saveEligibilityCheckId } from "@/lib/eligibilityPrefill";
import {
  clearPostRegisterContext,
  isPostRegisterFlow,
  loadPostRegisterContext,
} from "@/lib/postRegister";
import { submitEligibilityCheck } from "@/lib/api/eligibility";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { eligibilityWhatsAppMessage, whatsappUrlWithMessage } from "@/lib/whatsappContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { metaFromKeys } from "@/lib/pageMeta";
import { ArrowRight, ArrowLeft, AlertCircle, User, Briefcase, GraduationCap, BookOpen, Shield } from "lucide-react";

export const Route = createFileRoute("/eligibility")({
  head: () => metaFromKeys("eligibility"),
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  component: Eligibility,
});

const STEP_ICONS = [User, Briefcase, GraduationCap, Briefcase, BookOpen, Shield] as const;

type GapKey =
  | "qualificationRequired"
  | "qualificationStrengthen"
  | "germanA1"
  | "germanA2"
  | "experiencePreferred"
  | "experienceRecommended"
  | "passport"
  | "relocate";

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

function Eligibility() {
  const { t } = useTranslation("eligibility");
  const { from } = Route.useSearch();
  const postRegister = isPostRegisterFlow(from);
  const postCtx = loadPostRegisterContext();
  const stepLabels = t("steps", { returnObjects: true }) as string[];
  const steps = stepLabels.map((label, i) => ({ label, icon: STEP_ICONS[i] ?? User }));

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(() => ({
    ...initialData,
    name: postCtx?.full_name ?? "",
  }));
  const [showResults, setShowResults] = useState(false);
  const [resultSnapshot, setResultSnapshot] = useState<{
    score: number;
    gaps: GapKey[];
    status: string;
    germanFilter: string;
  } | null>(null);
  const submittedRef = useRef(false);

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
    else {
      const { score, gaps } = calculateScore();
      const status = score >= 80 ? "eligible" : score >= 50 ? "almost" : "not-eligible";
      const prefill = saveEligibilityPrefill({
        name: formData.name,
        qualification: formData.qualification,
        germanLevel: formData.germanLevel,
        score,
        status,
      });
      setResultSnapshot({
        score,
        gaps,
        status,
        germanFilter: prefill.german_level_filter ?? "",
      });
      setShowResults(true);
    }
  };
  const prev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const calculateScore = () => {
    let score = 0;
    const gaps: GapKey[] = [];

    if (
      formData.qualification === "diploma" ||
      formData.qualification === "bachelors" ||
      formData.qualification === "masters"
    ) {
      score += 25;
    } else if (formData.qualification === "highschool") {
      score += 10;
      gaps.push("qualificationStrengthen");
    } else gaps.push("qualificationRequired");

    if (formData.germanLevel === "a2" || formData.germanLevel === "b1+") score += 25;
    else if (formData.germanLevel === "a1") {
      score += 15;
      gaps.push("germanA2");
    } else gaps.push("germanA1");

    const exp = parseInt(formData.yearsExperience || "0", 10);
    if (exp >= 2) score += 25;
    else if (exp >= 1) {
      score += 15;
      gaps.push("experiencePreferred");
    } else gaps.push("experienceRecommended");

    if (formData.hasPassport === "yes") score += 15;
    else gaps.push("passport");

    if (formData.willingToRelocate === "yes") score += 10;
    else gaps.push("relocate");

    return { score, gaps };
  };

  const languageLevels = [
    { value: "none", label: t("language.none"), desc: t("language.noneDesc") },
    { value: "a1", label: t("language.a1"), desc: t("language.a1Desc") },
    { value: "a2", label: t("language.a2"), desc: t("language.a2Desc") },
    { value: "b1+", label: t("language.b1"), desc: t("language.b1Desc") },
  ];

  useEffect(() => {
    if (!showResults || !resultSnapshot || submittedRef.current) return;
    submittedRef.current = true;
    trackEvent("eligibility_complete", {
      score: resultSnapshot.score,
      status: resultSnapshot.status,
    });
    void submitEligibilityCheck({
      email: postRegister && postCtx?.email ? postCtx.email : undefined,
      payload: formData as unknown as Record<string, unknown>,
      score: resultSnapshot.score,
      status: resultSnapshot.status,
      gaps: resultSnapshot.gaps,
      source: postRegister ? "post_register" : "public",
      locale: "en",
    })
      .then(({ id }) => {
        saveEligibilityCheckId(id);
        if (postRegister) clearPostRegisterContext();
        toast.success(t("savedToast"));
      })
      .catch(() => undefined);
  }, [showResults, resultSnapshot, formData, postRegister, postCtx, t]);

  if (showResults && resultSnapshot) {
    const { score, gaps, status, germanFilter } = resultSnapshot;

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-lg">
              <div
                className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  status === "eligible" ? "bg-success/10" : status === "almost" ? "bg-warm/10" : "bg-destructive/10"
                }`}
              >
                <span
                  className="font-heading text-3xl font-bold"
                  style={{
                    color:
                      status === "eligible"
                        ? "var(--success)"
                        : status === "almost"
                          ? "var(--warm)"
                          : "var(--destructive)",
                  }}
                >
                  {score}%
                </span>
              </div>

              <h2 className="font-heading text-2xl font-bold text-foreground">
                {status === "eligible" && t("results.eligibleTitle")}
                {status === "almost" && t("results.almostTitle")}
                {status === "not-eligible" && t("results.notTitle")}
              </h2>

              <p className="mt-2 text-muted-foreground">
                {status === "eligible" && t("results.eligibleDesc")}
                {status === "almost" && t("results.almostDesc", { score })}
                {status === "not-eligible" && t("results.notDesc")}
              </p>

              {gaps.length > 0 && (
                <div className="mt-6 text-left space-y-3">
                  <h3 className="font-heading font-semibold text-foreground text-sm">{t("results.gapTitle")}</h3>
                  {gaps.map((gap) => (
                    <div key={gap} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 text-warm flex-shrink-0 mt-0.5" />
                      {t(`results.gaps.${gap}`)}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 space-y-3">
                {postRegister ? (
                  <Button variant="warm" size="lg" className="w-full" asChild>
                    <Link to="/portal">
                      {t("results.viewPortal", { defaultValue: "View your portal" })}
                      <ArrowRight />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="warm" size="lg" className="w-full" asChild>
                    <Link to="/register" search={{}} state={{ fromEligibility: true }}>
                      {t("registerCta")}
                      <ArrowRight />
                    </Link>
                  </Button>
                )}
                {germanFilter && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link
                      to="/scholarships"
                      search={{
                        german: germanFilter,
                        q: "",
                        status: "",
                        tag: "",
                        intake: "",
                      }}
                    >
                      {t("results.browseScholarships", { defaultValue: "Browse matching scholarships" })}
                    </Link>
                  </Button>
                )}
                {!postRegister && (
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <a
                      href={whatsappUrlWithMessage(eligibilityWhatsAppMessage(score, status))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("whatsapp_context_click", { context: "eligibility" })}
                    >
                      {t("results.whatsapp", { defaultValue: "Discuss on WhatsApp" })}
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setShowResults(false);
                    setResultSnapshot(null);
                    submittedRef.current = false;
                    setCurrentStep(0);
                    setFormData(initialData);
                  }}
                >
                  {t("retake")}
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
          <h1 className="font-heading text-2xl font-bold text-center text-foreground mb-8">{t("title")}</h1>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {t("stepOf", { current: currentStep + 1, total: steps.length })}
              </span>
              <span className="text-sm font-medium text-warm">{steps[currentStep].label}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full warm-gradient rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            {currentStep === 0 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">{t("personal.title")}</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("personal.name")}</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30"
                    placeholder={t("personal.namePlaceholder")}
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("personal.age")}</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30"
                    placeholder={t("personal.agePlaceholder")}
                    type="number"
                    value={formData.age}
                    onChange={(e) => update("age", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("personal.nationality")}</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30"
                    value={formData.nationality}
                    onChange={(e) => update("nationality", e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">{t("profession.title")}</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("profession.label")}</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30"
                    value={formData.profession}
                    onChange={(e) => update("profession", e.target.value)}
                  >
                    <option value="">{t("profession.select")}</option>
                    <option value="nurse">{t("profession.nurse")}</option>
                    <option value="cna">{t("profession.cna")}</option>
                    <option value="clinical">{t("profession.clinical")}</option>
                    <option value="other">{t("profession.other")}</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">{t("education.title")}</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("education.qualification")}</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30"
                    value={formData.qualification}
                    onChange={(e) => update("qualification", e.target.value)}
                  >
                    <option value="">{t("education.selectQualification")}</option>
                    <option value="highschool">{t("education.highschool")}</option>
                    <option value="diploma">{t("education.diploma")}</option>
                    <option value="bachelors">{t("education.bachelors")}</option>
                    <option value="masters">{t("education.masters")}</option>
                    <option value="phd">{t("education.phd")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("education.field")}</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30"
                    placeholder={t("education.fieldPlaceholder")}
                    value={formData.fieldOfStudy}
                    onChange={(e) => update("fieldOfStudy", e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">{t("experience.title")}</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("experience.years")}</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30"
                    value={formData.yearsExperience}
                    onChange={(e) => update("yearsExperience", e.target.value)}
                  >
                    <option value="">{t("experience.selectExperience")}</option>
                    <option value="0">{t("experience.exp0")}</option>
                    <option value="1">{t("experience.exp1")}</option>
                    <option value="2">{t("experience.exp2")}</option>
                    <option value="3">{t("experience.exp3")}</option>
                    <option value="5">{t("experience.exp5")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("experience.jobStatus")}</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30"
                    value={formData.jobStatus}
                    onChange={(e) => update("jobStatus", e.target.value)}
                  >
                    <option value="">{t("experience.selectStatus")}</option>
                    <option value="employed">{t("experience.employed")}</option>
                    <option value="unemployed">{t("experience.unemployed")}</option>
                    <option value="student">{t("experience.student")}</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">{t("language.title")}</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("language.label")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {languageLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
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
                <p className="text-xs text-muted-foreground">{t("language.certHint")}</p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">{t("readiness.title")}</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("readiness.passport")}</label>
                  <div className="flex gap-3">
                    {(["yes", "no"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.hasPassport === v
                            ? "border-warm bg-warm/5 ring-2 ring-warm/20 text-foreground"
                            : "border-border text-muted-foreground hover:border-warm/30"
                        }`}
                        onClick={() => update("hasPassport", v)}
                      >
                        {v === "yes" ? t("readiness.yes") : t("readiness.no")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("readiness.relocate")}</label>
                  <div className="flex gap-3">
                    {(["yes", "no"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.willingToRelocate === v
                            ? "border-warm bg-warm/5 ring-2 ring-warm/20 text-foreground"
                            : "border-border text-muted-foreground hover:border-warm/30"
                        }`}
                        onClick={() => update("willingToRelocate", v)}
                      >
                        {v === "yes" ? t("readiness.yes") : t("readiness.no")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={prev} disabled={currentStep === 0}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t("back")}
              </Button>
              <Button variant="warm" onClick={next}>
                {currentStep === steps.length - 1 ? t("seeResults") : t("continue")}
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
