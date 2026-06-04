import { apiRoot, parseApiError, parseJsonResponse, requireApiRoot } from "@/lib/api/apiBase";

export type PaymentConfig = {
  amount_kes: number;
  amount_subunits: number;
  currency_label: string;
  paystack_public_key: string;
  program_cost_eur?: number;
};

export type InitializePaymentResult = {
  id: string;
  reference: string;
  authorization_url: string;
  access_code?: string | null;
  amount_kes: number;
  amount_subunits: number;
  phone_number: string;
};

export type PaymentStatus = {
  id: string;
  status: string;
  amount_kes: number;
  reference?: string | null;
  mpesa_receipt_number?: string | null;
  result_desc?: string | null;
  message?: string | null;
};

function paymentsBase(): string {
  const root = import.meta.env.PROD ? requireApiRoot() : apiRoot();
  if (root) return `${root}/api/payments`;
  return "/api/payments";
}

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  const res = await fetch(`${paymentsBase()}/config`);
  if (!res.ok) throw new Error(await parseApiError(res));
  return parseJsonResponse<PaymentConfig>(res);
}

export async function initializePayment(
  email: string,
  phone: string,
): Promise<InitializePaymentResult> {
  const res = await fetch(`${paymentsBase()}/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, phone }),
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
