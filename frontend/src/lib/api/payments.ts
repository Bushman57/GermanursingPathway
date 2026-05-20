export type PaymentConfig = {
  amount_kes: number;
  currency_label: string;
  program_cost_eur?: number;
};

export type StkPaymentResult = {
  id: string;
  status: string;
  checkout_request_id?: string | null;
  customer_message?: string | null;
  amount_kes: number;
};

export type PaymentStatus = {
  id: string;
  status: string;
  amount_kes: number;
  mpesa_receipt_number?: string | null;
  result_desc?: string | null;
};

function paymentsBase(): string {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  if (base) return `${base.replace(/\/$/, "")}/api/payments`;
  return "/api/payments";
}

async function parseError(res: Response): Promise<string> {
  const data = (await res.json()) as { error?: string; detail?: string };
  return data.error ?? data.detail ?? `Request failed (${res.status})`;
}

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  const res = await fetch(`${paymentsBase()}/config`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<PaymentConfig>;
}

export async function initiateStkPayment(phone: string): Promise<StkPaymentResult> {
  const res = await fetch(`${paymentsBase()}/stk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<StkPaymentResult>;
}

export async function getPaymentStatus(id: string): Promise<PaymentStatus> {
  const res = await fetch(`${paymentsBase()}/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<PaymentStatus>;
}
