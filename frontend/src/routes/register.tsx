import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { submitLead } from "@/lib/api/submitLead";
import { metaFromKeys } from "@/lib/pageMeta";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => metaFromKeys("register"),
  component: RegisterPage,
});

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 px-4 max-w-lg mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("register.success")}</h1>
          <p className="mt-4 text-muted-foreground">{t("register.whatsappPrompt")}</p>
          <div className="mt-8 flex flex-col gap-3">
            <WhatsAppLink label={t("nav.whatsapp")} variant="warm" className="w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-center">
            {t("register.title")}
          </h1>
          <p className="mt-3 text-muted-foreground text-center">{t("register.subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-10 bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("register.fullName")}</label>
              <input
                required
                className={inputClass}
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("register.email")}</label>
                <input
                  required
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("register.phone")}</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("register.qualification")}</label>
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
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("register.germanLevel")}</label>
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("register.timeline")}</label>
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
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("register.message")}</label>
              <textarea
                rows={3}
                className={inputClass}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
              />
            </div>

            {status === "error" && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button type="submit" variant="warm" size="lg" className="w-full py-6" disabled={status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  …
                </>
              ) : (
                t("register.submit")
              )}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
