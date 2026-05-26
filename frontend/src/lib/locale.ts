export function isGermanLocale(lang: string): boolean {
  return lang === "de" || lang.startsWith("de-");
}
