import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatWidget } from "@/components/ChatWidget";
import { PortalOtpLogin } from "@/components/auth/PortalOtpLogin";
import { PortalJourney } from "@/components/portal/PortalJourney";
import { PortalDocuments } from "@/components/portal/PortalDocuments";
import { PortalNotifications } from "@/components/portal/PortalNotifications";
import { PortalProfileHeader } from "@/components/portal/PortalProfileHeader";
import { PortalSettings } from "@/components/portal/PortalSettings";
import { ScholarshipApplyButton, ScholarshipTitleLink } from "@/components/scholarships/ScholarshipCardLinks";
import { useAuthMeQuery } from "@/lib/queries/auth";
import { useScholarshipsQuery } from "@/lib/queries/scholarships";
import { scholarshipText } from "@/lib/scholarships";
import { useSavedScholarships } from "@/hooks/useSavedScholarships";
import { signOutPortal } from "@/lib/portalAuth";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queries/keys";
import { Loader2, GraduationCap, ArrowRight, Heart } from "lucide-react";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Student Portal — German Nursing Pathway" },
      {
        name: "description",
        content: "Browse scholarships and track your application.",
      },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const { t } = useTranslation("portal");
  const { data: me, isLoading } = useAuthMeQuery();

  const handleSignOut = async () => {
    await signOutPortal();
    queryClient.setQueryData(queryKeys.auth.me, null);
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    toast.success(t("signedOut"));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 px-4">
        {isLoading ? null : me ? (
          <>
            <PortalDashboard session={me} onSignOut={handleSignOut} />
            <ChatWidget mode="scholarship" enableUploads accent="primary" />
          </>
        ) : (
          <PortalOtpLogin
            onSignedIn={() => {
              queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

function PortalDashboard({
  session,
  onSignOut,
}: {
  session: { email: string; fullName: string };
  onSignOut: () => void;
}) {
  const { t, i18n } = useTranslation("portal");
  const lang = i18n.language;
  const { data: scholarships = [], isLoading: loadingList } = useScholarshipsQuery();
  const { saved: savedSlugs } = useSavedScholarships(session.email);
  const saved = scholarships.filter((s) => savedSlugs.includes(s.slug));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PortalProfileHeader
        email={session.email}
        fullName={session.fullName}
        onSignOut={onSignOut}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="saved">
            {t("tabs.saved")} {saved.length > 0 && `(${saved.length})`}
          </TabsTrigger>
          <TabsTrigger value="documents">{t("tabs.documents")}</TabsTrigger>
          <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <PortalJourney />
          <PortalNotifications />

          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-warm" />
                  {t("scholarships.title")}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{t("scholarships.subtitle")}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/scholarships">
                  {t("scholarships.browseAll")} <ArrowRight />
                </Link>
              </Button>
            </div>

            {loadingList ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {t("scholarships.loading")}
              </p>
            ) : scholarships.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("scholarships.empty")}</p>
            ) : (
              <ul className="divide-y divide-border">
                {scholarships.slice(0, 8).map((s) => (
                  <li
                    key={s.slug}
                    className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <ScholarshipTitleLink
                      scholarship={s}
                      title={scholarshipText(s, "title", lang)}
                    />
                    <ScholarshipApplyButton
                      scholarship={s}
                      applyLabel={t("scholarships.viewDetails")}
                      size="sm"
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </TabsContent>

        <TabsContent value="saved">
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-warm" />
              {t("saved.title")}
            </h2>
            {saved.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-4">{t("saved.empty")}</p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {saved.map((s) => (
                  <li key={s.slug} className="py-3 flex justify-between gap-2">
                    <ScholarshipTitleLink
                      scholarship={s}
                      title={scholarshipText(s, "title", lang)}
                    />
                    <ScholarshipApplyButton
                      scholarship={s}
                      applyLabel={t("scholarships.viewDetails")}
                      size="sm"
                    />
                  </li>
                ))}
              </ul>
            )}
            <Button variant="warm" className="mt-6" asChild>
              <Link to="/scholarships">{t("saved.browse")}</Link>
            </Button>
          </section>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <PortalDocuments />
        </TabsContent>

        <TabsContent value="settings">
          <PortalSettings email={session.email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
