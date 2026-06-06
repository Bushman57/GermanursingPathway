import { Clock, Lightbulb } from "lucide-react";
import { VideoEmbed, extractVideoUrl } from "@/components/resources/VideoEmbed";
import type { ResourceArticle } from "@/lib/resources";
import { useTranslation } from "react-i18next";

type Props = {
  article: ResourceArticle;
  isDe: boolean;
};

export function ArticleReader({ article, isDe }: Props) {
  const { t } = useTranslation("common");
  const title = isDe ? article.titleDe : article.titleEn;
  const excerpt = isDe ? article.excerptDe : article.excerptEn;
  const body = isDe ? article.bodyDe : article.bodyEn;
  const takeaways = article.articleData?.takeaways ?? [];

  const videoFromData = article.articleData?.videoUrl;
  const videoFromBody = extractVideoUrl(body);
  const videoUrl = videoFromData || videoFromBody;
  const bodyWithoutVideo =
    videoUrl && body ? body.replace(videoUrl, "").trim() : body;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {t("resourcesPage.readTime", { minutes: article.readMinutes })}
        </span>
      </div>

      <h1 className="mt-3 font-heading text-3xl sm:text-4xl font-bold text-foreground">
        {title}
      </h1>

      {videoUrl && (
        <div className="mt-6">
          <VideoEmbed url={videoUrl} title={title} />
        </div>
      )}

      {takeaways.length > 0 && (
        <div className="mt-6 rounded-2xl border border-warm/20 bg-warm/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-warm" />
            {t("resourcesPage.keyTakeaways")}
          </h2>
          <ul className="mt-3 space-y-2">
            {takeaways.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                <span className="text-warm font-bold shrink-0">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bodyWithoutVideo?.trim() ? (
        <div className="mt-6 prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {bodyWithoutVideo}
        </div>
      ) : (
        !videoUrl && (
          <p className="mt-6 prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
            {t("resourcesPage.body", { excerpt })}
          </p>
        )
      )}
    </div>
  );
}
