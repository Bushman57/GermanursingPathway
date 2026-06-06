import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BlogListCard, blogIsLocked } from "@/components/blog/BlogListCard";
import { LearningHubUnlockDialog } from "@/features/payments";
import { fetchBlogs } from "@/lib/api/blogs";
import { useLearningAccess } from "@/lib/useLearningAccess";
import { useTranslation } from "react-i18next";
import { metaFromKeys } from "@/lib/pageMeta";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    try {
      const blogs = await fetchBlogs();
      return { blogs };
    } catch {
      throw notFound();
    }
  },
  head: () => metaFromKeys("blog"),
  component: BlogIndexPage,
});

function formatBlogDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

function BlogIndexPage() {
  const { blogs } = Route.useLoaderData();
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language.startsWith("de") ? "de-DE" : "en-GB";
  const { unlocked, refetch } = useLearningAccess();
  const [unlockOpen, setUnlockOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <LearningHubUnlockDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        onUnlocked={() => void refetch()}
      />

      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground transition-colors">
              {t("blogPage.breadcrumbHome")}
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-foreground font-medium">{t("blogPage.breadcrumbBlog")}</span>
          </nav>

          <header className="mb-10">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
              {t("blogPage.title")}
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">{t("blogPage.subtitle")}</p>
          </header>

          {blogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{t("blogPage.empty")}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => {
                const locked = blogIsLocked(blog, unlocked);
                return (
                  <BlogListCard
                    key={blog.slug}
                    blog={blog}
                    isDe={i18n.language.startsWith("de")}
                    locked={locked}
                    onLockedClick={() => setUnlockOpen(true)}
                    readMoreLabel={t("home.blog.readMore")}
                    lockedHint={t("home.blog.lockedHint")}
                    dateLabel={formatBlogDate(blog.createdAt, locale)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
