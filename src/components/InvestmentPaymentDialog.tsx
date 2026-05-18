import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  fetchPaymentConfig,
  getPaymentStatus,
  initiateStkPayment,
  type PaymentConfig,
} from "@/lib/api/payments";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_MS = 120000;
const TERMINAL = new Set(["success", "failed", "cancelled", "timeout"]);

type Step = "idle" | "loading" | "waiting" | "success" | "error";

function formatAmount(amount: number, label: string) {
  return `${amount.toLocaleString()} ${label}`;
}

export function InvestmentPaymentDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [customerMessage, setCustomerMessage] = useState("");
  const pollStarted = useRef<number | null>(null);

  const loadConfig = useCallback(async () => {
    setConfigError("");
    try {
      const data = await fetchPaymentConfig();
      setConfig(data);
    } catch (err) {
      setConfig(null);
      setConfigError(err instanceof Error ? err.message : "Unable to load payment settings");
    }
  }, []);

  useEffect(() => {
    if (open) loadConfig();
  }, [open, loadConfig]);

  const resetForm = () => {
    setStep("idle");
    setError("");
    setPaymentId(null);
    setReceipt(null);
    setCustomerMessage("");
    pollStarted.current = null;
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      resetForm();
      setPhone("");
    }
  };

  useEffect(() => {
    if (step !== "waiting" || !paymentId) return;

    const started = pollStarted.current ?? Date.now();
    pollStarted.current = started;

    const interval = window.setInterval(async () => {
      if (Date.now() - started > POLL_MAX_MS) {
        window.clearInterval(interval);
        setStep("error");
        setError("Payment timed out. If you completed M-Pesa on your phone, contact support with your number.");
        return;
      }
      try {
        const status = await getPaymentStatus(paymentId);
        if (status.status === "success") {
          window.clearInterval(interval);
          setReceipt(status.mpesa_receipt_number ?? null);
          setStep("success");
        } else if (TERMINAL.has(status.status)) {
          window.clearInterval(interval);
          setStep("error");
          setError(status.result_desc ?? "Payment was not completed.");
        }
      } catch {
        /* keep polling */
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [step, paymentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Enter your M-Pesa phone number.");
      return;
    }
    setStep("loading");
    setError("");
    try {
      const result = await initiateStkPayment(phone.trim());
      setPaymentId(result.id);
      setCustomerMessage(result.customer_message ?? "Check your phone for the M-Pesa prompt.");
      pollStarted.current = Date.now();
      setStep("waiting");
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Payment could not be started");
    }
  };

  const amountLabel =
    config != null ? formatAmount(config.amount_kes, config.currency_label) : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="warm" size="lg" className="mt-8">
          Pay with M-Pesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Program payment</DialogTitle>
          <DialogDescription>
            {amountLabel ? (
              <>
                Pay <strong>{amountLabel}</strong> (full program fee, €2,300 equivalent) via M-Pesa STK Push.
              </>
            ) : (
              "Pay the full program fee via M-Pesa STK Push."
            )}
          </DialogDescription>
        </DialogHeader>

        {step === "success" ? (
          <div className="text-center py-2">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="font-heading font-semibold text-lg">Payment received</p>
            {amountLabel && <p className="text-sm text-muted-foreground mt-1">{amountLabel}</p>}
            {receipt && (
              <p className="text-sm mt-3 font-mono bg-muted rounded-lg px-3 py-2 inline-block">
                Receipt: {receipt}
              </p>
            )}
            <Button variant="warm" className="mt-6 w-full" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            {configError && step === "idle" && (
              <p className="text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {configError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === "waiting" ? (
                <WaitingBlock message={customerMessage} />
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">M-Pesa phone number</label>
                    <input
                      type="tel"
                      className={inputClass}
                      placeholder="0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={step === "loading"}
                      autoComplete="tel"
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
                        Sending prompt…
                      </>
                    ) : (
                      `Pay ${amountLabel ?? "now"}`
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Safaricom M-Pesa number (07… or 254…). You will enter your PIN on your phone.
                  </p>
                </>
              )}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WaitingBlock({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground flex gap-3">
      <Loader2 className="w-5 h-5 animate-spin shrink-0 text-warm" />
      <div>
        <p className="font-medium text-foreground">Waiting for payment</p>
        <p className="mt-1">{message}</p>
      </div>
    </div>
  );
}
