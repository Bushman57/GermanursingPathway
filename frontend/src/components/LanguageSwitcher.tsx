import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith("de") ? "de" : "en";

  const set = (lng: "en" | "de") => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={cn("flex items-center rounded-lg border border-border overflow-hidden text-xs font-medium", className)}>
      {(["en", "de"] as const).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => set(lng)}
          className={cn(
            "px-2.5 py-1.5 uppercase transition-colors",
            current === lng ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={current === lng}
        >
          {lng}
        </button>
      ))}
    </div>
  );
}
