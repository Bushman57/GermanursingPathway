import { Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blogs";
import { useTranslation } from "react-i18next";

type Props = {
  blog: BlogPost;
  isDe: boolean;
};

export function BlogBody({ blog, isDe }: Props) {
  const { t } = useTranslation("common");
  const body = isDe ? blog.bodyDe : blog.bodyEn;
  const excerpt = isDe ? blog.excerptDe : blog.excerptEn;

  if (body?.trim()) {
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {body}
      </div>
    );
  }

  return (
    <p className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
      {t("blogPage.bodyFallback", { excerpt })}
    </p>
  );
}

export function BlogMetaRow({
  blog,
  isDe,
  dateLabel,
  onShare,
}: {
  blog: BlogPost;
  isDe: boolean;
  dateLabel: string;
  onShare: () => void;
}) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
      {blog.author && (
        <span>
          {t("blogPage.byAuthor", { author: blog.author })}
        </span>
      )}
      <span>{dateLabel}</span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="w-4 h-4" />
        {t("resourcesPage.readTime", { minutes: blog.readMinutes })}
      </span>
      <button
        type="button"
        onClick={onShare}
        className="text-warm font-medium hover:underline underline-offset-2"
      >
        {t("blogPage.share")}
      </button>
    </div>
  );
}
