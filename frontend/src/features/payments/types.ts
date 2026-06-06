export type PaymentConfig = {
  amount_kes: number;
  amount_subunits: number;
  currency_label: string;
  paystack_public_key: string;
  program_cost_eur?: number;
  purpose?: string;
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

export type PaymentPurpose = "program_fee" | "learning_hub";

export type PaymentStep = "idle" | "loading" | "waiting" | "success" | "error";
