import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { openCommandMenu } from "@/components/layout/GlobalShell";
import { MobileNavMenu } from "@/components/nav/MobileNavMenu";
import { exploreNavLinks } from "@/lib/navConfig";
import { useSubscriptionsEnabled } from "@/lib/queries/siteConfig";
import { isNavActive } from "@/lib/navUtils";
import { prefetchScholarships } from "@/lib/queries/scholarships";
import { cn } from "@/lib/utils";
import { Menu, Search } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const subscriptionsEnabled = useSubscriptionsEnabled();
  const navLinks = subscriptionsEnabled
    ? exploreNavLinks
    : exploreNavLinks.filter((link) => link.to !== "/pricing");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <BrandLogo imageClassName="h-10 sm:h-11" />

          <div className="hidden xl:flex items-center gap-5">
            {navLinks.map((link) => {
              const active = isNavActive(pathname, link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  preload={link.to === "/scholarships" ? "intent" : undefined}
                  onMouseEnter={
                    link.to === "/scholarships" ? () => prefetchScholarships() : undefined
                  }
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors px-2 py-1 rounded-md hover:bg-muted/60",
                    active
                      ? "text-foreground font-semibold border-b-2 border-warm rounded-none hover:bg-transparent"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`nav.${link.key}`)}
                </Link>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={openCommandMenu}
            >
              <Search className="w-4 h-4" />
              <span className="text-xs hidden xl:inline">{t("search.shortcut", { ns: "common" })}</span>
            </Button>
            <ThemeToggle />
            <LanguageSwitcher />
            <WhatsAppLink label={t("nav.whatsapp")} variant="outline" size="sm" className="hidden xl:inline-flex" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/portal">{t("nav.portal")}</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/eligibility">{t("nav.eligibility")}</Link>
            </Button>
            <Button variant="warm" size="sm" asChild>
              <Link to="/register">{t("nav.register")}</Link>
            </Button>
          </div>

          <div className="flex xl:hidden items-center gap-2">
            <Button variant="ghost" size="icon" onClick={openCommandMenu} aria-label={t("search.open", { ns: "common" })}>
              <Search className="w-5 h-5" />
            </Button>
            <button
              type="button"
              className="p-2 text-foreground"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={t("nav.menu")}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <MobileNavMenu open={mobileOpen} onOpenChange={setMobileOpen} />
    </nav>
  );
}
