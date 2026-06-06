/** Redirect to Paystack hosted checkout (avoids inline overlay issues on mobile). */
export function launchPaystackCheckout(authorizationUrl: string): void {
  window.location.assign(authorizationUrl);
}
