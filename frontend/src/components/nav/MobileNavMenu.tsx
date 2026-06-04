import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { exploreNavLinks } from "@/lib/navConfig";
import { isNavActive } from "@/lib/navUtils";
import { prefetchScholarships } from "@/lib/queries/scholarships";
import { cn } from "@/lib/utils";

type MobileNavMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileNavMenu({ open, onOpenChange }: MobileNavMenuProps) {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        id="mobile-nav"
        role="navigation"
        aria-label={t("nav.menu")}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
          <div className="flex items-center pr-8">
            <BrandLogo imageClassName="h-9" />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("nav.sections.explore")}
          </p>
          <ul className="space-y-1">
            {exploreNavLinks.map((link) => {
              const active = isNavActive(pathname, link.to);
              const Icon = link.icon;
              const hint = link.hintKey ? t(`nav.hints.${link.hintKey}`, { defaultValue: "" }) : "";

              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    preload={link.to === "/scholarships" ? "intent" : undefined}
                    onMouseEnter={
                      link.to === "/scholarships" ? () => prefetchScholarships() : undefined
                    }
                    onFocus={
                      link.to === "/scholarships" ? () => prefetchScholarships() : undefined
                    }
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      active
                        ? "border-l-2 border-warm bg-warm/5 font-semibold text-foreground"
                        : "border-l-2 border-transparent hover:bg-muted/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        active ? "bg-warm/15" : "bg-warm/10",
                      )}
                    >
                      <Icon className="h-4 w-4 text-warm" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{t(`nav.${link.key}`)}</span>
                      {hint ? (
                        <span className="block truncate text-xs text-muted-foreground">{hint}</span>
                      ) : null}
                    </span>
                    {!active ? (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-6 border-t border-border" />

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("nav.sections.getStarted")}
          </p>
          <div className="space-y-2">
            <Button variant="warm" size="sm" className="w-full" asChild>
              <Link to="/register" onClick={close}>
                {t("nav.register")}
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/eligibility" onClick={close}>
                {t("nav.eligibility")}
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-2" asChild>
              <Link to="/portal" onClick={close}>
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                {t("nav.portal")}
              </Link>
            </Button>
            <WhatsAppLink label={t("nav.whatsapp")} className="w-full" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-border px-4 py-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
