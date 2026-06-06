import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { requestOtp, verifyOtp } from "@/lib/api/auth";
import type { PortalSession } from "@/lib/portalAuth";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queries/keys";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

type Props = {
  onSignedIn: (session: PortalSession) => void;
  compact?: boolean;
};

export function PortalOtpLogin({ onSignedIn, compact = false }: Props) {
  const { t } = useTranslation("portal");
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError(t("otp.errors.emailRequired"));
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtp(email);
      if (res.sent === false) {
        const msg =
          res.reason === "not_registered"
            ? t("otp.errors.notRegistered")
            : res.reason === "rate_limited"
              ? t("otp.errors.rateLimited")
              : res.message;
        setError(msg);
        toast.error(msg);
        return;
      }
      const devHint =
        import.meta.env.DEV && !import.meta.env.VITE_API_URL
          ? ` ${t("otp.devConsoleHint")}`
          : "";
      setInfo(`${t("otp.codeSentConfirm")}${devHint}`);
      setStep("code");
      toast.success(t("otp.codeSentToast"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("otp.errors.generic");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError(t("otp.errors.codeRequired"));
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email, code);
      trackEvent("otp_verify");
      toast.success(t("otp.signedIn", { defaultValue: "Signed in" }));
      onSignedIn({ email: res.email, fullName: res.fullName });
      queryClient.setQueryData(queryKeys.auth.me, {
        email: res.email,
        fullName: res.fullName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("otp.errors.invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "w-full" : "max-w-md mx-auto"}>
      {!compact && (
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      )}

      {step === "email" ? (
        <form
          onSubmit={sendCode}
          className={
            compact
              ? "space-y-4"
              : "bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm"
          }
        >
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("otp.emailLabel")}</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("otp.emailPlaceholder")}
              autoComplete="email"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
              {error === t("otp.errors.notRegistered") && (
                <>
                  {" "}
                  <Link to="/register" className="font-medium text-warm hover:underline">
                    {t("otp.registerLink")}
                  </Link>
                </>
              )}
            </p>
          )}
          <Button type="submit" variant="warm" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("otp.sending")}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" /> {t("otp.sendCode")}
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {t("otp.notRegistered")}{" "}
            <Link to="/register" className="text-warm font-medium hover:underline">
              {t("otp.registerLink")}
            </Link>
          </p>
        </form>
      ) : (
        <form
          onSubmit={verify}
          className={
            compact
              ? "space-y-4"
              : "bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm"
          }
        >
          {info && (
            <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">{info}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {t("otp.codeSentTo")} <strong className="text-foreground">{email}</strong>
          </p>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}
          <Button type="submit" variant="warm" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("otp.verifying")}
              </>
            ) : (
              t("otp.verify")
            )}
          </Button>
          <button
            type="button"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
          >
            {t("otp.changeEmail")}
          </button>
        </form>
      )}
    </div>
  );
}
