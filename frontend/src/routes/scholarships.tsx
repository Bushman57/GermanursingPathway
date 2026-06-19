import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { metaFromScholarshipsPage } from "@/lib/pageMeta";
import { Award } from "lucide-react";
import { SubscriptionUpgradePanel } from "@/components/pricing/SubscriptionUpgradePanel";
import { useSubscriptionsEnabled } from "@/lib/queries/siteConfig";
import { ScholarshipRegisterGate } from "@/components/scholarships/ScholarshipRegisterGate";
import { SubscriptionRequiredError } from "@/lib/api/scholarships";
import { ScholarshipsGridSkeleton } from "@/components/scholarships/ScholarshipsGridSkeleton";
import { ScholarshipCard } from "@/components/scholarships/ScholarshipCard";
import { ScholarshipCompareBar } from "@/components/scholarships/ScholarshipCompareBar";
import { ScholarshipEmptyState } from "@/components/scholarships/ScholarshipEmptyState";
import { ScholarshipFilters } from "@/components/scholarships/ScholarshipFilters";
import { useAuthMeQuery } from "@/lib/queries/auth";
import { useScholarshipsQuery } from "@/lib/queries/scholarships";
import {
  defaultScholarshipsSearch,
  filterScholarshipsClient,
  searchToApiFilters,
  type ScholarshipsSearch,
} from "@/lib/scholarshipSearch";
import { useScholarshipCompare } from "@/hooks/useScholarshipCompare";
import { type ReactNode } from "react";

const universitiesImage = `${import.meta.env.BASE_URL}images/german-universities.jpg`;

function parseSearch(raw: Record<string, unknown>): ScholarshipsSearch {
  return {
    q: typeof raw.q === "string" ? raw.q : "",
    status: typeof raw.status === "string" ? raw.status : "",
    german: typeof raw.german === "string" ? raw.german : "",
    tag: typeof raw.tag === "string" ? raw.tag : "",
    intake: typeof raw.intake === "string" ? raw.intake : "",
  };
}

export const Route = createFileRoute("/scholarships")({
  validateSearch: parseSearch,
  head: () => metaFromScholarshipsPage(),
  component: ScholarshipsPage,
});

function ScholarshipsShell({ listing }: { listing: ReactNode }) {
  const { t } = useTranslation("scholarshipsPage");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-12 hero-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-warm/20 text-warm border-warm/30 hover:bg-warm/20">{t("hero.badge")}</Badge>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-primary-foreground mt-4 leading-tight">
            {t("hero.title")} <span className="text-warm">{t("hero.titleAccent")}</span> {t("hero.titleSuffix")}
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">{t("hero.subtitle")}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-warm via-primary to-warm/30 rounded-full" />
                <p className="pl-6 text-lg sm:text-xl text-foreground/90 leading-[1.8] font-body font-medium text-balance">
                  <span className="font-heading text-5xl font-bold text-warm float-left mr-2 mt-1 leading-none">"</span>
                  {t("intro")}
                  <span className="font-heading text-warm text-xl sm:text-2xl block mt-5 font-semibold tracking-wide">
                    Start your educational journey today.
                  </span>
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-border group">
                <img
                  src={universitiesImage}
                  alt={t("imageAlt")}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 motion-reduce:transition-none"
                  loading="lazy"
                  width={1200}
                  height={750}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground text-center tracking-wide uppercase">{t("imageCaption")}</p>
            </div>
          </div>
        </div>
      </section>

      {listing}
    </div>
  );
}

function ScholarshipsListingSkeleton() {
  return (
    <>
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-24 rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScholarshipsGridSkeleton />
        </div>
      </section>
    </>
  );
}

function ScholarshipsPage() {
  const { t } = useTranslation("scholarshipsPage");
  const { data: me, isLoading: authLoading } = useAuthMeQuery();

  if (authLoading) {
    return <ScholarshipsShell listing={<ScholarshipsListingSkeleton />} />;
  }

  if (!me) {
    return (
      <ScholarshipsShell
        listing={
          <>
            <ScholarshipRegisterGate />
            <p className="text-center text-sm text-muted-foreground pb-16 px-4">
              {t("signInPrompt")}{" "}
              <Link to="/portal" className="text-warm font-medium hover:underline">
                {t("signInLink")}
              </Link>
            </p>
          </>
        }
      />
    );
  }

  return <AuthenticatedScholarshipsListing email={me.email} />;
}

function AuthenticatedScholarshipsListing({ email }: { email: string }) {
  const { t, i18n } = useTranslation("scholarshipsPage");
  const subscriptionsEnabled = useSubscriptionsEnabled();
  const lang = i18n.language;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const compare = useScholarshipCompare();

  const apiFilters = searchToApiFilters(search);
  const { data: scholarships = [], isLoading, error } = useScholarshipsQuery(apiFilters);

  const patchSearch = (patch: Partial<ScholarshipsSearch>) => {
    navigate({
      search: (prev: ScholarshipsSearch) => ({
        ...defaultScholarshipsSearch,
        ...prev,
        ...patch,
      }),
      replace: true,
    });
  };

  const filtered = filterScholarshipsClient(scholarships, search, lang);
  const verifiedPicks = filtered.filter((s) => s.verified).slice(0, 3);

  const clearFilters = () => navigate({ search: defaultScholarshipsSearch, replace: true });

  if (isLoading) {
    return <ScholarshipsShell listing={<ScholarshipsListingSkeleton />} />;
  }

  if (error instanceof SubscriptionRequiredError && subscriptionsEnabled) {
    return (
      <ScholarshipsShell
        listing={
          <div className="py-16 px-4">
            <SubscriptionUpgradePanel tier="plus" message={error.message} />
          </div>
        }
      />
    );
  }

  return (
    <ScholarshipsShell
      listing={
        <>
          <ScholarshipFilters
            search={search}
            onChange={patchSearch}
            onApply={(next) => navigate({ search: next, replace: true })}
            onClear={clearFilters}
          />
          <section className="pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-sm text-muted-foreground mb-6">
                {t("showingCount", { count: filtered.length })}
              </p>
              {filtered.length === 0 ? (
                <ScholarshipEmptyState lang={lang} picks={verifiedPicks} onClearFilters={clearFilters} />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((s) => (
                    <ScholarshipCard
                      key={s.slug}
                      s={s}
                      lang={lang}
                      email={email}
                      comparing={compare.isComparing(s.slug)}
                      onCompareToggle={compare.toggle}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
          <ScholarshipCompareBar
            slugs={compare.slugs}
            items={scholarships}
            lang={lang}
            onClear={compare.clear}
            onRemove={compare.toggle}
          />
        </>
      }
    />
  );
}
