/** Prepare the page so Paystack inline checkout (card / M-Pesa) receives mouse clicks. */

const BODY_CLASS = "paystack-checkout-active";
const SUPPRESS_ATTR = "data-paystack-suppressed";

type Suppressed = { el: HTMLElement; display: string; pointerEvents: string; visibility: string };

let suppressed: Suppressed[] = [];
let observer: MutationObserver | null = null;

const OVERLAY_SELECTORS = [
  "[data-radix-dialog-overlay]",
  "[data-radix-alert-dialog-overlay]",
  "[data-radix-dialog-content]",
  "[data-radix-alert-dialog-content]",
].join(",");

function isPaystackNode(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const id = el.id?.toLowerCase() ?? "";
  const cls = el.className?.toString().toLowerCase() ?? "";
  if (id.includes("paystack") || cls.includes("paystack")) return true;
  if (el.tagName === "IFRAME") {
    const src = (el as HTMLIFrameElement).src?.toLowerCase() ?? "";
    return src.includes("paystack") || src.includes("checkout");
  }
  return Boolean(el.querySelector('iframe[src*="paystack"], iframe[src*="checkout"]'));
}

function isBlockingOverlay(el: HTMLElement): boolean {
  if (isPaystackNode(el)) return false;
  if (el.getAttribute(SUPPRESS_ATTR) === "true") return false;

  const style = window.getComputedStyle(el);
  if (style.position !== "fixed" && style.position !== "absolute") return false;

  const z = Number.parseInt(style.zIndex, 10);
  if (!Number.isNaN(z) && z < 40) return false;

  const rect = el.getBoundingClientRect();
  const coversViewport =
    rect.width >= window.innerWidth * 0.9 && rect.height >= window.innerHeight * 0.9;

  if (el.matches(OVERLAY_SELECTORS)) return true;

  const className = el.className?.toString() ?? "";
  if (coversViewport && (className.includes("bg-black") || className.includes("inset-0"))) {
    return true;
  }

  return false;
}

function suppressElement(el: HTMLElement) {
  if (el.getAttribute(SUPPRESS_ATTR) === "true") return;
  suppressed.push({
    el,
    display: el.style.display,
    pointerEvents: el.style.pointerEvents,
    visibility: el.style.visibility,
  });
  el.setAttribute(SUPPRESS_ATTR, "true");
  el.style.display = "none";
  el.style.pointerEvents = "none";
  el.style.visibility = "hidden";
}

function suppressBlockingLayers() {
  document.querySelectorAll(OVERLAY_SELECTORS).forEach((node) => {
    if (node instanceof HTMLElement) suppressElement(node);
  });

  document.querySelectorAll("body > div").forEach((node) => {
    if (!(node instanceof HTMLElement) || isPaystackNode(node)) return;
    if (isBlockingOverlay(node)) suppressElement(node);
    node.querySelectorAll("div.fixed, div.absolute").forEach((child) => {
      if (child instanceof HTMLElement && isBlockingOverlay(child)) suppressElement(child);
    });
  });
}

function clearScrollLock() {
  document.body.style.pointerEvents = "";
  document.body.style.overflow = "";
  document.documentElement.style.pointerEvents = "";
  document.documentElement.style.overflow = "";
  document.body.removeAttribute("data-scroll-locked");
  document.body.removeAttribute("data-radix-scroll-lock-scrollbar-size");
}

function restoreSuppressed() {
  for (const item of suppressed) {
    item.el.removeAttribute(SUPPRESS_ATTR);
    item.el.style.display = item.display;
    item.el.style.pointerEvents = item.pointerEvents;
    item.el.style.visibility = item.visibility;
  }
  suppressed = [];
}

export function beginPaystackCheckout(): void {
  document.body.classList.add(BODY_CLASS);
  clearScrollLock();
  suppressBlockingLayers();

  observer?.disconnect();
  observer = new MutationObserver(() => {
    suppressBlockingLayers();
    clearScrollLock();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export function endPaystackCheckout(): void {
  observer?.disconnect();
  observer = null;
  document.body.classList.remove(BODY_CLASS);
  restoreSuppressed();
  clearScrollLock();
}

/** Wait for Radix dialog exit animation before opening Paystack. */
export function afterDialogClosed(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 320));
}
