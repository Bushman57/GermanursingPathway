import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogBody, BlogMetaRow } from "@/components/blog/BlogBody";
import { BlogHeroBanner } from "@/components/blog/BlogHeroBanner";
import { BlogRegisterSidebar } from "@/components/blog/BlogRegisterSidebar";
import { Button } from "@/components/ui/button";
import { LearningHubUnlockDialog } from "@/features/payments";
import { fetchBlogBySlug, fetchBlogs } from "@/lib/api/blogs";
import { getModuleById, getModuleContext, moduleRequiresUnlock } from "@/lib/learningHub";
import { useLearningAccess } from "@/lib/useLearningAccess";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { metaTags } from "@/lib/routeHead";
import { ChevronRight, Lock, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      const [blog, blogs] = await Promise.all([
        fetchBlogBySlug(params.slug),
        fetchBlogs(),
      ]);
      return { blog, blogs };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const isDe = i18n.language.startsWith("de");
    const title = isDe ? loaderData.blog.titleDe : loaderData.blog.titleEn;
    return {
      meta: metaTags({
        title: `${title} — German Nursing Pathway`,
        description: isDe ? loaderData.blog.excerptDe : loaderData.blog.excerptEn,
      }),
    };
  },
  component: BlogDetailPage,
});

function formatBlogDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });
}

function BlogDetailPage() {
  const { blog, blogs } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { t, i18n } = useTranslation("common");
  const isDe = i18n.language.startsWith("de");
  const locale = isDe ? "de-DE" : "en-GB";
  const { unlocked, isAuthenticated, amountKes, refetch } = useLearningAccess();
  const [unlockOpen, setUnlockOpen] = useState(false);

  const title = isDe && blog.titleDe ? blog.titleDe : blog.titleEn;
  const context = getModuleContext(blog.slug, blogs);
  const module = blog.moduleId ? getModuleById(blog.moduleId) : context?.module;
  const moduleLocked =
    blog.moduleId != null
      ? moduleRequiresUnlock(blog.moduleId, unlocked)
      : blog.locked === true;
  const dateLabel = formatBlogDate(blog.createdAt, locale);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("blogPage.linkCopied"));
      }
    } catch {
      /* user cancelled share */
    }
  };

  const categoryLabel = module?.title ?? blog.category;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <LearningHubUnlockDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        onUnlocked={() => void refetch()}
      />

      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground transition-colors">
              {t("blogPage.breadcrumbHome")}
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link to="/blog" className="hover:text-foreground transition-colors">
              {t("blogPage.breadcrumbBlog")}
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
              {title}
            </span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
            <article className="min-w-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-warm/10 text-warm text-xs font-semibold uppercase tracking-wider border border-warm/20">
                {categoryLabel}
              </span>

              <h1 className="mt-4 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {title}
              </h1>

              <div className="mt-4">
                <BlogMetaRow blog={blog} isDe={isDe} dateLabel={dateLabel} onShare={handleShare} />
              </div>

              <div className="mt-8">
                <BlogHeroBanner
                  emoji={module?.emoji}
                  title={title}
                  subtitle={module?.title}
                  featuredImageUrl={blog.featuredImageUrl}
                />
              </div>

              {moduleLocked ? (
                <div className="mt-8 rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
                  <Lock className="w-10 h-10 text-warm mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    {t("resourcesPage.articleLocked", { amount: amountKes.toLocaleString() })}
                  </p>
                  <Button variant="warm" className="mt-6" onClick={() => setUnlockOpen(true)}>
                    {isAuthenticated
                      ? t("resourcesPage.unlockAllModules", {
                          amount: amountKes.toLocaleString(),
                        })
                      : t("resourcesPage.signInToUnlock")}
                  </Button>
                </div>
              ) : (
                <div className="mt-8">
                  <BlogBody blog={blog} isDe={isDe} />
                  {blog.externalUrl && (
                    <div className="mt-8">
                      <Button variant="outline" asChild>
                        <a href={blog.externalUrl} target="_blank" rel="noopener noreferrer">
                          {t("blogPage.externalLink")}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </article>

            <BlogRegisterSidebar blogSlug={slug} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
