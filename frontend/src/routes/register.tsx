import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { submitLead } from "@/lib/api/submitLead";
import { metaFromKeys } from "@/lib/pageMeta";
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Languages,
  Calendar,
  MessageSquare,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => metaFromKeys("register"),
  component: RegisterPage,
});

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30 focus:border-warm transition";

function Field({
  label,
  icon: Icon,
  required,
  children,
  hint,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5 text-foreground">
        <Icon className="w-3.5 h-3.5 text-warm" />
        <span>{label}</span>
        {required && <span className="text-warm" aria-hidden>*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function RegisterPage() {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    nursing_qualification: "",
    german_level: "",
    timeline: "",
    message: "",
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await submitLead({
        ...form,
        phone: form.phone || undefined,
        message: form.message || undefined,
        source: "register",
        locale: i18n.language.startsWith("de") ? "de" : "en",
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-20 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-9 h-9 text-success" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              {t("register.success")}
            </h1>
            <p className="mt-4 text-muted-foreground">{t("register.whatsappPrompt")}</p>
            <div className="mt-8 flex flex-col gap-3">
              <WhatsAppLink label={t("nav.whatsapp")} variant="warm" className="w-full" />
              <Button variant="outline" asChild className="gap-2">
                <Link to="/portal">
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Student Portal
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              {t("register.title")}
            </h1>
            <p className="mt-3 text-muted-foreground">{t("register.subtitle")}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-warm" />
              Takes about 2 minutes · Your details stay private
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 bg-card border border-border rounded-2xl p-5 sm:p-8 space-y-5 shadow-sm"
          >
            <Field label={t("register.fullName")} icon={User} required>
              <input
                required
                className={inputClass}
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                autoComplete="name"
                placeholder="Jane Wanjiru"
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label={t("register.email")} icon={Mail} required>
                <input
                  required
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                />
              </Field>
              <Field label={t("register.phone")} icon={Phone}>
                <input
                  type="tel"
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+254 7XX XXX XXX"
                />
              </Field>
            </div>

            <Field label={t("register.qualification")} icon={GraduationCap} required>
              <select
                required
                className={inputClass}
                value={form.nursing_qualification}
                onChange={(e) => update("nursing_qualification", e.target.value)}
              >
                <option value="">{t("register.selectQualification")}</option>
                <option value="cna">{t("register.qualifications.cna")}</option>
                <option value="diploma">{t("register.qualifications.diploma")}</option>
                <option value="bsc">{t("register.qualifications.bsc")}</option>
                <option value="clinical">{t("register.qualifications.clinical")}</option>
                <option value="other">{t("register.qualifications.other")}</option>
              </select>
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field
                label={t("register.germanLevel")}
                icon={Languages}
                required
                hint="No German yet? That's fine — we'll guide you."
              >
                <select
                  required
                  className={inputClass}
                  value={form.german_level}
                  onChange={(e) => update("german_level", e.target.value)}
                >
                  <option value="none">{t("register.germanLevels.none")}</option>
                  <option value="a1">{t("register.germanLevels.a1")}</option>
                  <option value="a2">{t("register.germanLevels.a2")}</option>
                  <option value="b1">{t("register.germanLevels.b1")}</option>
                  <option value="b2">{t("register.germanLevels.b2")}</option>
                </select>
              </Field>
              <Field label={t("register.timeline")} icon={Calendar} required>
                <select
                  required
                  className={inputClass}
                  value={form.timeline}
                  onChange={(e) => update("timeline", e.target.value)}
                >
                  <option value="">{t("register.selectTimeline")}</option>
                  <option value="3m">{t("register.timelines.3m")}</option>
                  <option value="6m">{t("register.timelines.6m")}</option>
                  <option value="2026">{t("register.timelines.2026")}</option>
                  <option value="2027">{t("register.timelines.2027")}</option>
                  <option value="exploring">{t("register.timelines.exploring")}</option>
                </select>
              </Field>
            </div>

            <Field label={t("register.message")} icon={MessageSquare}>
              <textarea
                rows={3}
                maxLength={2000}
                className={inputClass}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Questions, preferred city, current job…"
              />
            </Field>

            {status === "error" && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="warm"
              size="lg"
              className="w-full py-6 text-base"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                t("register.submit")
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already registered?{" "}
              <Link to="/portal" className="text-warm font-medium hover:underline">
                Sign in to your portal
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
