import PaystackPop from "@paystack/inline-js";
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  fetchPaymentConfig,
  getPaymentStatus,
  initializePayment,
  verifyPayment,
  type PaymentConfig,
  type PaymentStatus,
} from "@/lib/api/payments";
import {
  afterDialogClosed,
  beginPaystackCheckout,
  endPaystackCheckout,
} from "@/lib/paystackCheckout";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_MS = 120000;
const TERMINAL = new Set(["success", "failed", "cancelled", "timeout"]);

type Step = "idle" | "loading" | "waiting" | "success" | "error";

function formatAmount(amount: number, label: string) {
  return `${amount.toLocaleString()} ${label}`;
}

type Props = {
  /** Set when user returns from Paystack redirect (?payment=ref) */
  returnReference?: string;
  onReturnHandled?: () => void;
};

export function InvestmentPaymentDialog({ returnReference, onReturnHandled }: Props) {
  const { t } = useTranslation("payment");
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [paystackActive, setPaystackActive] = useState(false);
  const pollStarted = useRef<number | null>(null);
  const returnHandledRef = useRef<string | null>(null);

  useEffect(() => {
    return () => endPaystackCheckout();
  }, []);

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
    setPaymentId(null);
    setReceipt(null);
    pollStarted.current = null;
  };

  const handleOpenChange = (next: boolean) => {
    if (paystackActive) return;
    setOpen(next);
    if (!next) {
      resetForm();
      setEmail("");
      setPhone("");
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

  const confirmPayment = useCallback(
    async (reference: string) => {
      setStep("waiting");
      try {
        const status = await verifyPayment(reference);
        if (status.status === "success") {
          markSuccess(status);
          return true;
        }
        setStep("error");
        setError(status.message ?? status.result_desc ?? t("failed"));
        toast.error(status.message ?? status.result_desc ?? t("failed"));
        setOpen(true);
        return false;
      } catch (err) {
        setStep("error");
        const msg = err instanceof Error ? err.message : t("verifyError");
        setError(msg);
        toast.error(t("verifyError"));
        setOpen(true);
        return false;
      }
    },
    [markSuccess, t],
  );

  useEffect(() => {
    if (!returnReference || returnHandledRef.current === returnReference) return;
    returnHandledRef.current = returnReference;

    void (async () => {
      setOpen(true);
      await confirmPayment(returnReference);
      onReturnHandled?.();
    })();
  }, [returnReference, confirmPayment, onReturnHandled]);

  useEffect(() => {
    if (step !== "waiting" || !paymentId) return;

    const started = pollStarted.current ?? Date.now();
    pollStarted.current = started;

    const interval = window.setInterval(async () => {
      if (Date.now() - started > POLL_MAX_MS) {
        window.clearInterval(interval);
        setStep("error");
        setError(t("timeout"));
        toast.error(t("timeout"));
        setOpen(true);
        return;
      }
      try {
        const status = await getPaymentStatus(paymentId);
        if (status.status === "success") {
          window.clearInterval(interval);
          markSuccess(status);
        } else if (TERMINAL.has(status.status)) {
          window.clearInterval(interval);
          setStep("error");
          const msg = status.message ?? status.result_desc ?? t("failed");
          setError(msg);
          toast.error(msg);
          setOpen(true);
        }
      } catch {
        /* keep polling */
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [step, paymentId, t, markSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedEmail) {
      setError(t("emailRequired"));
      setStep("error");
      toast.error(t("emailRequired"));
      return;
    }
    if (!trimmedPhone) {
      setError(t("phoneRequired"));
      setStep("error");
      toast.error(t("phoneRequired"));
      return;
    }

    setStep("loading");
    setError("");
    try {
      const init = await initializePayment(trimmedEmail, trimmedPhone);
      if (!init.access_code) {
        setStep("error");
        setError(t("startError"));
        toast.error(t("startError"));
        setOpen(true);
        return;
      }

      setPaymentId(init.id);
      pollStarted.current = Date.now();

      setPaystackActive(true);
      setOpen(false);
      await afterDialogClosed();
      beginPaystackCheckout();
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      toast.success(t("checkoutOpened"));

      const paystack = new PaystackPop();
      paystack.resumeTransaction(init.access_code, {
        onSuccess: async (transaction) => {
          endPaystackCheckout();
          setPaystackActive(false);
          await confirmPayment(transaction.reference);
        },
        onCancel: () => {
          endPaystackCheckout();
          setPaystackActive(false);
          setStep("idle");
          setError(t("cancelled"));
          toast.error(t("cancelled"));
          setOpen(true);
        },
        onError: (err) => {
          endPaystackCheckout();
          setPaystackActive(false);
          setStep("error");
          const msg = err.message ?? t("startError");
          setError(msg);
          toast.error(msg);
          setOpen(true);
        },
      });
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

  const showDialog = open && !paystackActive;

  return (
    <>
      <Button
        variant="warm"
        size="lg"
        className="mt-8"
        disabled={paystackActive}
        onClick={() => setOpen(true)}
      >
        {t("trigger")}
      </Button>

      {showDialog ? (
    <Dialog open={showDialog} onOpenChange={handleOpenChange} modal={false}>
      <DialogContent className="sm:max-w-md">
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
              <div>
                <label className="block text-sm font-medium mb-1.5">{t("phoneLabel")}</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder={t("phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={step === "loading"}
                  autoComplete="tel"
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
              <p className="text-xs text-muted-foreground text-center">{t("phoneHint")}</p>
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
