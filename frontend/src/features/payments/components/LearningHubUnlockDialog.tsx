import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Loader2, Lock } from "lucide-react";
import { PortalOtpLogin } from "@/components/auth/PortalOtpLogin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchPaymentConfig,
  initializeLearningHubPayment,
} from "@/features/payments/api";
import { usePaymentReturnConfirm } from "@/features/payments/hooks/usePaymentReturnConfirm";
import { launchPaystackCheckout } from "@/features/payments/launchPaystackCheckout";
import type { PaymentConfig, PaymentStatus, PaymentStep } from "@/features/payments/types";
import { useAuthMeQuery } from "@/lib/queries/auth";
import { useSubscriptionsEnabled } from "@/lib/queries/siteConfig";
import { queryKeys } from "@/lib/queries/keys";
import { queryClient } from "@/lib/queryClient";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

function formatAmount(amount: number, label: string) {
  return `${amount.toLocaleString()} ${label}`;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnReference?: string;
  onReturnHandled?: () => void;
  onUnlocked?: () => void;
};

export function LearningHubUnlockDialog({
  open,
  onOpenChange,
  returnReference,
  onReturnHandled,
  onUnlocked,
}: Props) {
  const { t } = useTranslation("payment");
  const { data: me } = useAuthMeQuery();
  const subscriptionsEnabled = useSubscriptionsEnabled();
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [step, setStep] = useState<PaymentStep>("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setConfigError("");
    try {
      const data = await fetchPaymentConfig({ purpose: "learning_hub" });
      setConfig(data);
    } catch (err) {
      setConfig(null);
      setConfigError(err instanceof Error ? err.message : t("configError"));
    }
  }, [t]);

  useEffect(() => {
    if (open) loadConfig();
  }, [open, loadConfig]);

  const resetForm = () => {
    setStep("idle");
    setError("");
    setReceipt(null);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      resetForm();
    }
  };

  const markSuccess = useCallback(
    (status: PaymentStatus) => {
      setReceipt(status.mpesa_receipt_number ?? status.reference ?? null);
      setStep("success");
      onOpenChange(true);
      toast.success(t("learningHubPaymentConfirmed"));
      void queryClient.invalidateQueries({ queryKey: queryKeys.portal.learningAccess });
      onUnlocked?.();
    },
    [onOpenChange, onUnlocked, t],
  );

  usePaymentReturnConfirm({
    returnReference,
    onReturnHandled,
    onBeforeConfirm: () => onOpenChange(true),
    onSuccess: markSuccess,
    onFailure: (msg) => {
      setStep("error");
      setError(msg);
      onOpenChange(true);
    },
    setStep,
  });

  const startCheckout = async () => {
    const email = me?.email?.trim();
    if (!email) {
      setError(t("emailRequired"));
      setStep("error");
      toast.error(t("emailRequired"));
      return;
    }

    setStep("loading");
    setError("");
    try {
      const init = await initializeLearningHubPayment(email);
      if (!init.authorization_url) {
        setStep("error");
        setError(t("startError"));
        toast.error(t("startError"));
        onOpenChange(true);
        return;
      }
      launchPaystackCheckout(init.authorization_url);
    } catch (err) {
      setStep("error");
      const msg = err instanceof Error ? err.message : t("startError");
      setError(msg);
      toast.error(msg);
      onOpenChange(true);
    }
  };

  const amountLabel =
    config != null ? formatAmount(config.amount_kes, config.currency_label) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      modal={!!me || step !== "idle"}
    >
      <DialogContent
        className="sm:max-w-md"
        overlayClassName={!me ? undefined : "hidden"}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-warm" />
            {t("learningHubTitle")}
          </DialogTitle>
          <DialogDescription>
            {amountLabel ? (
              <Trans
                i18nKey="learningHubDescriptionWithAmount"
                ns="payment"
                values={{ amount: amountLabel }}
                components={{ strong: <strong /> }}
              />
            ) : (
              t("learningHubDescriptionGeneric")
            )}
          </DialogDescription>
        </DialogHeader>

        {!me ? (
          <div className="py-2 space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
              <p className="font-medium text-sm text-foreground">{t("learningHubSignInTitle")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("learningHubSignInPrompt")}</p>
            </div>
            <PortalOtpLogin
              variant="compact"
              onSignedIn={() => {
                void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
                void queryClient.invalidateQueries({ queryKey: queryKeys.portal.learningAccess });
              }}
            />
          </div>
        ) : step === "success" ? (
          <div className="text-center py-2">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="font-heading font-semibold text-lg">{t("learningHubSuccessTitle")}</p>
            <p className="text-sm text-muted-foreground mt-2">{t("learningHubSuccessBody")}</p>
            {amountLabel && <p className="text-sm text-muted-foreground mt-1">{amountLabel}</p>}
            {receipt && (
              <p className="text-sm mt-3 font-mono bg-muted rounded-lg px-3 py-2 inline-block">
                {t("receipt", { code: receipt })}
              </p>
            )}
            <Button variant="warm" className="mt-6 w-full" onClick={() => handleOpenChange(false)}>
              {t("learningHubDone")}
            </Button>
          </div>
        ) : step === "waiting" ? (
          <WaitingBlock title={t("waitingTitle")} message={t("waitingMessage")} />
        ) : (
          <>
            {configError && step === "idle" && (
              <p className="text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {configError}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void startCheckout();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("emailLabel")}</label>
                <input
                  type="email"
                  className={inputClass}
                  value={me.email}
                  readOnly
                  disabled
                  autoComplete="email"
                />
              </div>
              {step === "error" && error && (
                <p className="text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </p>
              )}
              <Button
                type="submit"
                variant="warm"
                className="w-full"
                disabled={step === "loading" || !!configError}
              >
                {step === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("opening")}
                  </>
                ) : amountLabel ? (
                  t("learningHubPayButton", { amount: amountLabel })
                ) : (
                  t("learningHubPayNow")
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">{t("learningHubPayHint")}</p>
              {subscriptionsEnabled ? (
                <p className="text-xs text-center">
                  <Link to="/pricing" className="text-warm font-medium hover:underline">
                    {t("viewSubscriptionPlans", { defaultValue: "View Essential / Plus / Premium plans" })}
                  </Link>
                </p>
              ) : null}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WaitingBlock({ message, title }: { message: string; title: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground flex gap-3">
      <Loader2 className="w-5 h-5 animate-spin shrink-0 text-warm" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1">{message}</p>
      </div>
    </div>
  );
}
