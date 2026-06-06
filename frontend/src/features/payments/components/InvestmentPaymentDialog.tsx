import { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchPaymentConfig, initializePayment } from "@/features/payments/api";
import { usePaymentReturnConfirm } from "@/features/payments/hooks/usePaymentReturnConfirm";
import { launchPaystackCheckout } from "@/features/payments/launchPaystackCheckout";
import type { PaymentConfig, PaymentStatus, PaymentStep } from "@/features/payments/types";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

function formatAmount(amount: number, label: string) {
  return `${amount.toLocaleString()} ${label}`;
}

type Props = {
  returnReference?: string;
  onReturnHandled?: () => void;
};

export function InvestmentPaymentDialog({ returnReference, onReturnHandled }: Props) {
  const { t } = useTranslation("payment");
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<PaymentStep>("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setConfigError("");
    try {
      const data = await fetchPaymentConfig();
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
    setOpen(next);
    if (!next) {
      resetForm();
      setEmail("");
    }
  };

  const markSuccess = useCallback(
    (status: PaymentStatus) => {
      setReceipt(status.mpesa_receipt_number ?? status.reference ?? null);
      setStep("success");
      setOpen(true);
      toast.success(t("paymentConfirmed"));
    },
    [t],
  );

  usePaymentReturnConfirm({
    returnReference,
    onReturnHandled,
    onBeforeConfirm: () => setOpen(true),
    onSuccess: markSuccess,
    onFailure: (msg) => {
      setStep("error");
      setError(msg);
      setOpen(true);
    },
    setStep,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t("emailRequired"));
      setStep("error");
      toast.error(t("emailRequired"));
      return;
    }

    setStep("loading");
    setError("");
    try {
      const init = await initializePayment(trimmedEmail);
      if (!init.authorization_url) {
        setStep("error");
        setError(t("startError"));
        toast.error(t("startError"));
        setOpen(true);
        return;
      }
      launchPaystackCheckout(init.authorization_url);
    } catch (err) {
      setStep("error");
      const msg = err instanceof Error ? err.message : t("startError");
      setError(msg);
      toast.error(msg);
      setOpen(true);
    }
  };

  const amountLabel =
    config != null ? formatAmount(config.amount_kes, config.currency_label) : null;

  return (
    <>
      <Button variant="warm" size="lg" className="mt-8" onClick={() => setOpen(true)}>
        {t("trigger")}
      </Button>

      {open ? (
        <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
          <DialogContent className="sm:max-w-md" overlayClassName="hidden">
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>
                {amountLabel ? (
                  <Trans
                    i18nKey="descriptionWithAmount"
                    ns="payment"
                    values={{ amount: amountLabel }}
                    components={{ strong: <strong /> }}
                  />
                ) : (
                  t("descriptionGeneric")
                )}
              </DialogDescription>
            </DialogHeader>

            {step === "success" ? (
              <div className="text-center py-2">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="font-heading font-semibold text-lg">{t("successTitle")}</p>
                <p className="text-sm text-muted-foreground mt-2">{t("successBody")}</p>
                {amountLabel && <p className="text-sm text-muted-foreground mt-1">{amountLabel}</p>}
                {receipt && (
                  <p className="text-sm mt-3 font-mono bg-muted rounded-lg px-3 py-2 inline-block">
                    {t("receipt", { code: receipt })}
                  </p>
                )}
                <Button variant="warm" className="mt-6 w-full" onClick={() => handleOpenChange(false)}>
                  {t("done")}
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t("emailLabel")}</label>
                    <input
                      type="email"
                      className={inputClass}
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={step === "loading"}
                      autoComplete="email"
                      required
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
                      t("payButton", { amount: amountLabel })
                    ) : (
                      t("payNow")
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">{t("payHint")}</p>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      ) : null}
    </>
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
