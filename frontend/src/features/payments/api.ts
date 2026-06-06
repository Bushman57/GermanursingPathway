import { apiRoot, parseApiError, parseJsonResponse, requireApiRoot } from "@/lib/api/apiBase";
import type { InitializePaymentResult, PaymentConfig, PaymentPurpose, PaymentStatus } from "./types";

function paymentsBase(): string {
  const root = import.meta.env.PROD ? requireApiRoot() : apiRoot();
  if (root) return `${root}/api/payments`;
  return "/api/payments";
}

export async function fetchPaymentConfig(
  options?: { purpose?: PaymentPurpose },
): Promise<PaymentConfig> {
  const purpose = options?.purpose ?? "program_fee";
  const res = await fetch(`${paymentsBase()}/config?purpose=${encodeURIComponent(purpose)}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<PaymentConfig>(res);
}

export async function initializePayment(
  email: string,
  options?: { purpose?: PaymentPurpose },
): Promise<InitializePaymentResult> {
  const res = await fetch(`${paymentsBase()}/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, purpose: options?.purpose ?? "program_fee" }),
  });
  if (!res.ok) {
    if (res.status === 405) {
      throw new Error(
        "Payment initialize is not available on this API build (outdated deploy). " +
          "Redeploy the latest backend on Render with Paystack routes.",
      );
    }
    throw new Error(await parseApiError(res));
  }
  return parseJsonResponse<InitializePaymentResult>(res);
}

export async function initializeLearningHubPayment(email: string): Promise<InitializePaymentResult> {
  const res = await fetch(`${paymentsBase()}/initialize/learning-hub`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<InitializePaymentResult>(res);
}

export async function verifyPayment(reference: string): Promise<PaymentStatus> {
  const res = await fetch(`${paymentsBase()}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<PaymentStatus>(res);
}

export async function getPaymentStatus(id: string): Promise<PaymentStatus> {
  const res = await fetch(`${paymentsBase()}/status/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<PaymentStatus>(res);
}
