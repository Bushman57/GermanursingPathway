import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import type { BlogPost } from "@/lib/blogs";
import { getModuleById, moduleRequiresUnlock } from "@/lib/learningHub";
import { cn } from "@/lib/utils";

type Props = {
  blog: BlogPost;
  isDe: boolean;
  locked: boolean;
  onLockedClick?: () => void;
  readMoreLabel: string;
  lockedHint: string;
  dateLabel?: string;
};

export function BlogListCard({
  blog,
  isDe,
  locked,
  onLockedClick,
  readMoreLabel,
  lockedHint,
  dateLabel,
}: Props) {
  const title = isDe && blog.titleDe ? blog.titleDe : blog.titleEn;
  const excerpt = isDe && blog.excerptDe ? blog.excerptDe : blog.excerptEn;
  const module = blog.moduleId ? getModuleById(blog.moduleId) : undefined;

  const cardBody = (
    <article
      className={cn(
        "relative flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300",
        locked
          ? "opacity-90 hover:border-warm/30 hover:shadow-md cursor-pointer"
          : "hover:border-warm/40 hover:shadow-lg hover:-translate-y-1",
      )}
    >
      <div className="relative h-32 sm:h-36">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-warm" />
          <div className="w-1/2 bg-primary" />
        </div>
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-background border-4 border-card shadow-lg flex items-center justify-center",
              locked && "opacity-80",
            )}
          >
            {locked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <span className="text-xl sm:text-2xl" aria-hidden>
                {module?.emoji ?? "📖"}
              </span>
            )}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-10 text-center">
          <h3 className="font-heading text-sm sm:text-base font-bold text-primary-foreground line-clamp-2 leading-snug">
            {title}
          </h3>
          {module && (
            <p className="mt-0.5 text-[11px] sm:text-xs text-primary-foreground/80 line-clamp-1">
              {module.title}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 px-4 py-4">
        {dateLabel && <p className="text-xs text-muted-foreground">{dateLabel}</p>}
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
          {excerpt}
        </p>
        <span
          className={cn(
            "mt-4 inline-flex items-center gap-1.5 text-sm font-medium",
            locked ? "text-muted-foreground" : "text-warm group-hover:gap-2 transition-all",
          )}
        >
          {readMoreLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {locked && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 border border-border text-xs font-semibold text-muted-foreground shadow-sm">
            <Lock className="w-3 h-3" />
            {lockedHint}
          </span>
        </div>
      )}
    </article>
  );

  if (locked) {
    return (
      <button type="button" className="group w-full text-left" onClick={onLockedClick}>
        {cardBody}
      </button>
    );
  }

  return (
    <Link to="/blog/$slug" params={{ slug: blog.slug }} className="group block h-full">
      {cardBody}
    </Link>
  );
}

export function blogIsLocked(blog: BlogPost, unlocked: boolean): boolean {
  if (!blog.moduleId) return false;
  return moduleRequiresUnlock(blog.moduleId, unlocked);
}
