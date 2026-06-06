import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { submitLead } from "@/lib/api/submitLead";
import { loadEligibilityPrefill, clearEligibilityPrefill } from "@/lib/eligibilityPrefill";
import { savePostRegisterContext } from "@/lib/postRegister";
import { trackEvent } from "@/lib/analytics";
import { registerWhatsAppMessage, whatsappUrlWithMessage } from "@/lib/whatsappContext";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Languages,
  Loader2,
  Mail,
  LayoutDashboard,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";

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

type Props = {
  source: string;
  compact?: boolean;
};

export function RegisterInterestForm({ source, compact }: Props) {
  const { t, i18n } = useTranslation();
  const ns = source === "scholarships" ? "scholarshipsPage" : undefined;
  const gateKey = source === "scholarships" ? "gate" : undefined;
  const isBlog = source.startsWith("blog:");

  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    german_level: "",
    timeline: "",
    message: "",
  });

  useEffect(() => {
    const prefill = loadEligibilityPrefill();
    if (prefill) {
      setForm((prev) => ({
        ...prev,
        full_name: prefill.full_name || prev.full_name,
        german_level: prefill.german_level || prev.german_level,
        message: prefill.message || prev.message,
      }));
    }
  }, []);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.full_name.trim() || !form.email.trim()) {
        setError(t("register.step1Required", { defaultValue: "Enter your name and email." }));
        return;
      }
      setError("");
      setStep(2);
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const prefill = loadEligibilityPrefill();
      await submitLead({
        ...form,
        nursing_qualification: prefill?.nursing_qualification ?? "unspecified",
        phone: form.phone || undefined,
        message: form.message || undefined,
        source,
        locale: i18n.language.startsWith("de") ? "de" : "en",
        eligibility_check_id: prefill?.eligibility_check_id,
      });
      trackEvent("register_submit", { source });
      savePostRegisterContext({ email: form.email, full_name: form.full_name });
      clearEligibilityPrefill();
      toast.success(t("register.successToast", { defaultValue: "Registration received" }));
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "success") {
    const isGate = Boolean(gateKey && ns);
    const title = isGate ? t(`${gateKey}.successTitle`, { ns }) : t("register.success");
    const body = isGate ? t(`${gateKey}.successBody`, { ns }) : t("register.whatsappPrompt");

    return (
      <div className={`text-center ${compact ? "py-8" : "py-12"} max-w-lg mx-auto px-4`}>
        <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">{body}</p>
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="warm" size="lg" className="w-full" asChild>
            <Link to="/eligibility" search={{ from: "register" }}>
              {t("register.eligibilityCta", { defaultValue: "Complete eligibility review" })}
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/portal">
              <LayoutDashboard className="w-4 h-4" />
              {isGate
                ? t(`${gateKey}.signInCta`, { ns })
                : t("register.signInPortal", { defaultValue: "Sign in to your portal" })}
            </Link>
          </Button>
          {!isGate && (
            <Button variant="outline" className="w-full" asChild>
              <a
                href={whatsappUrlWithMessage(registerWhatsAppMessage(form.full_name))}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("nav.whatsapp")}
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  const title =
    gateKey && ns ? t(`${gateKey}.formTitle`, { ns }) : isBlog ? t("blogPage.sidebarTitle", { ns: "common" }) : t("register.title");
  const subtitle =
    gateKey && ns ? t(`${gateKey}.formSubtitle`, { ns }) : isBlog ? t("blogPage.sidebarSubtitle", { ns: "common" }) : t("register.subtitle");

  return (
    <div className={compact ? "" : "max-w-lg mx-auto px-4 sm:px-6"}>
      {!compact && (
        <div className="text-center mb-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>
        </div>
      )}
      {compact && (
        <div className="text-center mb-6">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`bg-card border border-border rounded-2xl space-y-5 shadow-sm ${
          compact ? "p-5 sm:p-6" : "p-5 sm:p-8"
        }`}
      >
        <Field label={t("register.fullName")} icon={User} required>
          <input
            required
            className={inputClass}
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            autoComplete="name"
          />
        </Field>

        <Field label={t("register.email")} icon={Mail} required>
          <input
            required
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
          />
        </Field>

        {step === 1 && (
          <p className="text-xs text-muted-foreground text-center">
            {t("register.stepIndicator", { defaultValue: "Step 1 of 2 — basics" })}
          </p>
        )}

        {step === 2 && (
          <>
        <p className="text-xs text-muted-foreground text-center">
          {t("register.stepIndicator2", { defaultValue: "Step 2 of 2 — your background" })}
        </p>
        <Field label={t("register.phone")} icon={Phone}>
          <input
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t("register.germanLevel")} icon={Languages} required>
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

        {!compact && (
          <Field label={t("register.message")} icon={MessageSquare}>
            <textarea
              rows={3}
              maxLength={2000}
              className={inputClass}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
            />
          </Field>
        )}
          </>
        )}

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
          className="w-full"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("register.submitting", { defaultValue: "Submitting…" })}
            </>
          ) : (
            step === 1
              ? t("register.continue", { defaultValue: "Continue" })
              : t("register.submit")
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {t("register.alreadyRegistered", { defaultValue: "Already registered?" })}{" "}
          <Link to="/portal" className="text-warm font-medium hover:underline">
            {t("register.signInPortal", { defaultValue: "Sign in to your portal" })}
          </Link>
        </p>
      </form>
    </div>
  );
}
