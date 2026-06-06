import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { verifyPayment } from "@/features/payments/api";
import type { PaymentStatus, PaymentStep } from "@/features/payments/types";

type Options = {
  returnReference?: string;
  onReturnHandled?: () => void;
  onBeforeConfirm?: () => void;
  onSuccess: (status: PaymentStatus) => void;
  onFailure: (message: string) => void;
  setStep: (step: PaymentStep) => void;
};

export function usePaymentReturnConfirm({
  returnReference,
  onReturnHandled,
  onBeforeConfirm,
  onSuccess,
  onFailure,
  setStep,
}: Options) {
  const { t } = useTranslation("payment");
  const returnHandledRef = useRef<string | null>(null);

  const confirmPayment = useCallback(
    async (reference: string) => {
      onBeforeConfirm?.();
      setStep("waiting");
      try {
        const status = await verifyPayment(reference);
        if (status.status === "success") {
          onSuccess(status);
          return true;
        }
        const msg = status.message ?? status.result_desc ?? t("failed");
        onFailure(msg);
        toast.error(msg);
        return false;
      } catch {
        const msg = t("verifyError");
        onFailure(msg);
        toast.error(msg);
        return false;
      }
    },
    [onBeforeConfirm, onFailure, onSuccess, setStep, t],
  );

  useEffect(() => {
    if (!returnReference || returnHandledRef.current === returnReference) return;
    returnHandledRef.current = returnReference;

    void (async () => {
      await confirmPayment(returnReference);
      onReturnHandled?.();
    })();
  }, [returnReference, confirmPayment, onReturnHandled]);

  return { confirmPayment };
}
