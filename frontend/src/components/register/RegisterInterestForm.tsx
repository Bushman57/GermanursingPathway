import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { submitLead } from "@/lib/api/submitLead";
import { mapRegisterError } from "@/lib/api/mapRegisterError";
import { loadEligibilityPrefill, clearEligibilityPrefill } from "@/lib/eligibilityPrefill";
import { savePostRegisterContext } from "@/lib/postRegister";
import { trackEvent } from "@/lib/analytics";
import { registerWhatsAppMessage, whatsappUrlWithMessage } from "@/lib/whatsappContext";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
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

const inputErrorClass =
  "border-destructive focus:ring-destructive/30 focus:border-destructive";

const VALID_TIMELINES = new Set(["3m", "6m", "2026", "2027", "exploring"]);

function Field({
  label,
  icon: Icon,
  required,
  children,
  hint,
  error,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  hint?: string;
  error?: string;
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
      {error ? (
        <p className="text-xs text-destructive mt-1">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}

type Props = {
  source: string;
  compact?: boolean;
};

type FormFeedback = {
  type: "error" | "warning";
  message: string;
};

type Step2FieldErrors = {
  phone?: string;
  timeline?: string;
  german_level?: string;
};

export function RegisterInterestForm({ source, compact }: Props) {
  const { t, i18n } = useTranslation();
  const ns = source === "scholarships" ? "scholarshipsPage" : undefined;
  const gateKey = source === "scholarships" ? "gate" : undefined;
  const isBlog = source.startsWith("blog:");

  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Step2FieldErrors>({});
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    german_level: "a1",
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
    if (feedback) setFeedback(null);
    if (fieldErrors[field as keyof Step2FieldErrors]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof Step2FieldErrors];
        return next;
      });
    }
  };

  const validateStep2 = (): { feedback: FormFeedback; fields: Step2FieldErrors } | null => {
    const fields: Step2FieldErrors = {};

    if (form.german_level === "none") {
      fields.german_level = t("register.warnings.germanLevelMinA1");
      return {
        feedback: { type: "warning", message: t("register.warnings.germanLevelMinA1") },
        fields,
      };
    }

    if (form.phone.trim().length < 6) {
      fields.phone = t("register.errors.phoneRequired");
    }

    if (!form.timeline.trim() || !VALID_TIMELINES.has(form.timeline)) {
      fields.timeline = t("register.errors.timelineRequired");
    }

    if (fields.phone && fields.timeline) {
      return {
        feedback: { type: "error", message: t("register.errors.step2Required") },
        fields,
      };
    }
    if (fields.phone) {
      return {
        feedback: { type: "error", message: fields.phone },
        fields,
      };
    }
    if (fields.timeline) {
      return {
        feedback: { type: "error", message: fields.timeline },
        fields,
      };
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.full_name.trim() || !form.email.trim()) {
        setFeedback({ type: "error", message: t("register.errors.step1Required") });
        return;
      }
      setFeedback(null);
      setFieldErrors({});
      setStep(2);
      return;
    }

    const validation = validateStep2();
    if (validation) {
      setStatus("idle");
      setFeedback(validation.feedback);
      setFieldErrors(validation.fields);
      if (validation.feedback.type === "warning") {
        toast.warning(validation.feedback.message);
      } else {
        toast.error(validation.feedback.message);
      }
      return;
    }

    setStatus("loading");
    setFeedback(null);
    setFieldErrors({});
    try {
      const prefill = loadEligibilityPrefill();
      await submitLead({
        ...form,
        phone: form.phone.trim(),
        nursing_qualification: prefill?.nursing_qualification ?? "unspecified",
        message: form.message.trim() || undefined,
        source,
        locale: i18n.language.startsWith("de") ? "de" : "en",
        eligibility_check_id: prefill?.eligibility_check_id,
      });
      trackEvent("register_submit", { source });
      savePostRegisterContext({ email: form.email, full_name: form.full_name });
      clearEligibilityPrefill();
      toast.success(t("register.successToast"));
      setStatus("success");
    } catch (err) {
      setStatus("error");
      const raw = err instanceof Error ? err.message : t("register.errors.generic");
      setFeedback({ type: "error", message: mapRegisterError(raw, t) });
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
      {compact && !isBlog && (
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
          <p className="text-xs text-muted-foreground text-center">{t("register.stepIndicator")}</p>
        )}

        {step === 2 && (
          <>
        <p className="text-xs text-muted-foreground text-center">{t("register.stepIndicator2")}</p>
        <Field
          label={t("register.phone")}
          icon={Phone}
          required
          hint={t("register.phoneHint")}
          error={fieldErrors.phone}
        >
          <input
            required
            type="tel"
            className={`${inputClass}${fieldErrors.phone ? ` ${inputErrorClass}` : ""}`}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label={t("register.germanLevel")}
            icon={Languages}
            required
            error={fieldErrors.german_level}
          >
            <select
              required
              className={`${inputClass}${fieldErrors.german_level ? ` ${inputErrorClass}` : ""}`}
              value={form.german_level}
              onChange={(e) => update("german_level", e.target.value)}
              aria-invalid={Boolean(fieldErrors.german_level)}
            >
              <option value="none">{t("register.germanLevels.none")}</option>
              <option value="a1">{t("register.germanLevels.a1")}</option>
              <option value="a2">{t("register.germanLevels.a2")}</option>
              <option value="b1">{t("register.germanLevels.b1")}</option>
              <option value="b2">{t("register.germanLevels.b2")}</option>
            </select>
          </Field>
          <Field label={t("register.timeline")} icon={Calendar} required error={fieldErrors.timeline}>
            <select
              required
              className={`${inputClass}${fieldErrors.timeline ? ` ${inputErrorClass}` : ""}`}
              value={form.timeline}
              onChange={(e) => update("timeline", e.target.value)}
              aria-invalid={Boolean(fieldErrors.timeline)}
            >
              <option value="" disabled hidden>
                {t("register.selectTimeline")}
              </option>
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

        {feedback && (
          <div
            className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
              feedback.type === "warning"
                ? "text-amber-900 dark:text-amber-100 bg-amber-500/15 border border-amber-500/30"
                : "text-destructive bg-destructive/10"
            }`}
          >
            {feedback.type === "warning" ? (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            {feedback.message}
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
              {t("register.submitting")}
            </>
          ) : step === 1 ? (
            t("register.continue")
          ) : (
            t("register.submit")
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {t("register.alreadyRegistered")}{" "}
          <Link to="/portal" className="text-warm font-medium hover:underline">
            {t("register.signInPortal")}
          </Link>
        </p>
      </form>
    </div>
  );
}
