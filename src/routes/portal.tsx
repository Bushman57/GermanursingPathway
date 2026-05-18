import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Lock, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [{ title: "Student Portal — German Nursing Pathway" }],
  }),
  component: PortalPage,
});

function PortalPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <LayoutDashboard className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground">{t("portal.title")}</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">{t("portal.comingSoon")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("portal.loginSoon")}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Button variant="warm" asChild>
            <Link to="/register">{t("nav.register")}</Link>
          </Button>
          <Button variant="outline" disabled className="gap-2">
            <Lock className="w-4 h-4" />
            Login (Phase 2)
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
