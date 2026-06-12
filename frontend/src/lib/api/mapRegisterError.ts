import type { TFunction } from "i18next";

export function mapRegisterError(message: string, t: TFunction): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("minimum german level") ||
    lower.includes("mindestniveau deutsch") ||
    lower.includes("german_level") ||
    (lower.includes("none") && lower.includes("german"))
  ) {
    return t("register.errors.germanLevelMinA1");
  }

  if (
    lower.includes("phone") ||
    lower.includes("telefon") ||
    (lower.includes("string should have at least") && lower.includes("6"))
  ) {
    return t("register.errors.phoneRequired");
  }

  if (
    lower.includes("timeline") ||
    lower.includes("when you plan to start") ||
    lower.includes("select when you plan") ||
    lower.includes("wann sie starten") ||
    lower.includes("plan to start")
  ) {
    return t("register.errors.timelineRequired");
  }

  if (
    lower.includes("string should have at least 1 character") ||
    (lower.includes("string should have at least") && !lower.includes("6"))
  ) {
    return t("register.errors.generic");
  }

  if (lower.includes("valid email") || lower.includes("value is not a valid email")) {
    return t("register.errors.emailInvalid");
  }

  if (lower.includes("full name") || lower.includes("full_name")) {
    return t("register.errors.step1Required");
  }

  if (
    message === "Invalid request" ||
    lower.includes("invalid request") ||
    lower.includes("request failed")
  ) {
    return t("register.errors.generic");
  }

  return message.trim() || t("register.errors.generic");
}
