import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "/" as const, key: "home" },
  { to: "/onboarding-process" as const, key: "onboardingProcess" },
  { to: "/scholarships" as const, key: "scholarships" },
  { to: "/partners" as const, key: "partners" },
  { to: "/resources" as const, key: "resources" },
  { to: "/about" as const, key: "about" },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <BrandLogo imageClassName="h-10 sm:h-11" />

          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                preload={link.to === "/scholarships" ? "intent" : undefined}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
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

          <div className="flex lg:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                preload={link.to === "/scholarships" ? "intent" : undefined}
                className="block text-sm font-medium text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
            <WhatsAppLink label={t("nav.whatsapp")} className="w-full" />
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/portal" onClick={() => setMobileOpen(false)}>
                {t("nav.portal")}
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/eligibility" onClick={() => setMobileOpen(false)}>
                {t("nav.eligibility")}
              </Link>
            </Button>
            <Button variant="warm" size="sm" className="w-full" asChild>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                {t("nav.register")}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
