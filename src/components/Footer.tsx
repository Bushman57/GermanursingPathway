import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/BrandLogo";
import { WhatsAppLink } from "@/components/WhatsAppButton";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <BrandLogo
              showText={false}
              imageClassName="h-12 w-12 rounded-lg bg-white p-0.5 shadow-sm ring-1 ring-primary-foreground/10"
            />
            <p className="mt-4 text-primary-foreground/70 text-sm leading-relaxed max-w-sm">
              {t("footer.tagline")}
            </p>
            <div className="mt-4">
              <WhatsAppLink label={t("nav.whatsapp")} variant="whatsapp" size="sm" />
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">{t("footer.quickLinks")}</h4>
            <div className="space-y-2">
              <Link to="/how-it-works" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                {t("nav.howItWorks")}
              </Link>
              <Link to="/scholarships" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                {t("nav.scholarships")}
              </Link>
              <Link to="/partners" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                {t("nav.partners")}
              </Link>
              <Link to="/register" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                {t("nav.register")}
              </Link>
              <Link to="/eligibility" className="block text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                {t("nav.eligibility")}
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4">{t("footer.contact")}</h4>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <p>{CONTACT_EMAIL}</p>
              <p>{CONTACT_PHONE}</p>
              <p>Nairobi, Kenya</p>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} German Nursing Pathway. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
