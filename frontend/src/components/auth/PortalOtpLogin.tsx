import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { OtpCodeStep } from "@/components/auth/OtpCodeStep";
import { requestOtp, verifyOtp, fetchMe } from "@/lib/api/auth";
import type { PortalSession } from "@/lib/portalAuth";
import { loadPostRegisterContext } from "@/lib/postRegister";
import {
  clearOtpPendingState,
  loadOtpPendingState,
  saveOtpPendingState,
} from "@/lib/otpSession";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queries/keys";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

type Props = {
  onSignedIn: (session: PortalSession) => void;
  variant?: "page" | "compact";
  /** @deprecated use variant="compact" */
  compact?: boolean;
};

export function PortalOtpLogin({ onSignedIn, variant, compact = false }: Props) {
  const resolvedVariant = variant ?? (compact ? "compact" : "page");
  const { t } = useTranslation("portal");
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const ctx = loadPostRegisterContext();
    if (ctx?.email) setEmail(ctx.email);

    const pending = loadOtpPendingState();
    if (pending?.email) {
      setEmail(pending.email);
      setStep("code");
    }
  }, []);

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      saveOtpPendingState(email);
      setStep("code");
      setCode("");
      setInfo("");
      if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
        console.info(
          "[GNP dev] Sign-in email not configured locally — check the backend terminal for the 6-digit code.",
        );
      }
      toast.success(t("otp.codeSentToast"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("otp.errors.generic");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verify = useCallback(async () => {
    setError("");
    if (code.length !== 6) {
      setError(t("otp.errors.codeRequired"));
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email, code);
      const session: PortalSession = { email: res.email, fullName: res.fullName };
      queryClient.setQueryData(queryKeys.auth.me, session);
      const me = await fetchMe();
      if (!me) {
        throw new Error(t("otp.errors.sessionNotSaved"));
      }
      queryClient.setQueryData(queryKeys.auth.me, me);
      clearOtpPendingState();
      trackEvent("otp_verify");
      toast.success(t("otp.signedIn"));
      onSignedIn(me);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("otp.errors.invalidCode"));
    } finally {
      setLoading(false);
    }
  }, [code, email, onSignedIn, t]);

  const handleResend = useCallback(async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await requestOtp(email);
      if (res.sent === false) {
        const msg =
          res.reason === "rate_limited"
            ? t("otp.errors.rateLimited")
            : res.message;
        setError(msg);
        toast.error(msg);
        return;
      }
      saveOtpPendingState(email);
      setCode("");
      setInfo("");
      toast.success(t("otp.resendSent"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("otp.errors.generic");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [email, t]);

  const handleChangeEmail = () => {
    setStep("email");
    setCode("");
    setError("");
    setInfo("");
    clearOtpPendingState();
  };

  const isCompact = resolvedVariant === "compact";

  return (
    <div className={isCompact ? "w-full" : "max-w-md mx-auto"}>
      {!isCompact && (
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
            isCompact
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
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
          className={
            isCompact
              ? "space-y-4"
              : "bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm"
          }
        >
          <OtpCodeStep
            email={email}
            code={code}
            onCodeChange={setCode}
            loading={loading}
            error={error}
            info={info}
            variant={resolvedVariant}
            onVerify={() => void verify()}
            onResend={handleResend}
            onChangeEmail={handleChangeEmail}
          />
        </form>
      )}
    </div>
  );
}
