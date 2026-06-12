import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail } from "lucide-react";

const RESEND_COOLDOWN_SEC = 60;

type Props = {
  email: string;
  code: string;
  onCodeChange: (code: string) => void;
  loading: boolean;
  error: string;
  info?: string;
  variant?: "page" | "compact";
  onVerify: () => void;
  onResend: () => Promise<void>;
  onChangeEmail: () => void;
};

export function OtpCodeStep({
  email,
  code,
  onCodeChange,
  loading,
  error,
  info,
  variant = "page",
  onVerify,
  onResend,
  onChangeEmail,
}: Props) {
  const { t } = useTranslation("portal");
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SEC);
  const [resending, setResending] = useState(false);
  const autoSubmitted = useRef(false);
  const compact = variant === "compact";

  useEffect(() => {
    if (error) {
      autoSubmitted.current = false;
    }
  }, [error]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (code.length === 6 && !loading && !autoSubmitted.current) {
      autoSubmitted.current = true;
      onVerify();
    }
    if (code.length < 6) {
      autoSubmitted.current = false;
    }
  }, [code, loading, onVerify]);

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResend();
      setResendCooldown(RESEND_COOLDOWN_SEC);
      autoSubmitted.current = false;
    } finally {
      setResending(false);
    }
  };

  const slotClass = compact
    ? "h-10 w-9 sm:h-11 sm:w-10 text-base"
    : "h-12 w-10 sm:h-14 sm:w-12 text-lg";

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {info && (
        <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">{info}</p>
      )}

      <div className="text-center space-y-3">
        <div
          className={`${compact ? "w-12 h-12" : "w-14 h-14"} rounded-2xl bg-primary/10 flex items-center justify-center mx-auto`}
        >
          <Mail className={`${compact ? "w-6 h-6" : "w-7 h-7"} text-primary`} />
        </div>
        <div>
          <h2 className={`font-heading font-semibold text-foreground ${compact ? "text-lg" : "text-xl"}`}>
            {t("otp.checkEmailTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("otp.checkEmailSubtitle")}{" "}
            <strong className="text-foreground break-all">{email}</strong>
          </p>
        </div>
      </div>

      <ol className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
        <li>{t("otp.magicLinkStep1")}</li>
        <li>{t("otp.magicLinkStep2")}</li>
        <li>{t("otp.magicLinkStep3")}</li>
      </ol>

      <p className="text-xs text-center text-muted-foreground">{t("otp.openEmailHint")}</p>

      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wide shrink-0">
          {t("otp.orEnterCode")}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={onCodeChange}
          autoComplete="one-time-code"
          inputMode="numeric"
          disabled={loading}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} className={slotClass} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <Button
        type="button"
        variant="warm"
        size="lg"
        className="w-full"
        disabled={loading || code.length !== 6}
        onClick={onVerify}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> {t("otp.verifying")}
          </>
        ) : (
          t("otp.verify")
        )}
      </Button>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          className="text-xs text-warm font-medium hover:underline disabled:opacity-50 disabled:no-underline"
          disabled={resendCooldown > 0 || resending || loading}
          onClick={() => void handleResend()}
        >
          {resending ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
              {t("otp.sending")}
            </>
          ) : resendCooldown > 0 ? (
            t("otp.resendWait", { seconds: resendCooldown })
          ) : (
            t("otp.resendCode")
          )}
        </button>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={onChangeEmail}
          disabled={loading}
        >
          {t("otp.changeEmail")}
        </button>
      </div>
    </div>
  );
}
