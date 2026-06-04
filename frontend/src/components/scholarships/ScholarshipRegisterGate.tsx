import { useTranslation } from "react-i18next";
import { RegisterInterestForm } from "@/components/register/RegisterInterestForm";
import { Lock } from "lucide-react";

export function ScholarshipRegisterGate() {
  const { t } = useTranslation("scholarshipsPage");

  return (
    <section className="pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 text-warm mb-6">
          <Lock className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wide">{t("gate.badge")}</span>
        </div>
        <RegisterInterestForm source="scholarships" compact />
      </div>
    </section>
  );
}
