import { cn } from "@/lib/utils";

type Props = {
  emoji?: string;
  title: string;
  subtitle?: string;
  featuredImageUrl?: string | null;
  className?: string;
};

export function BlogHeroBanner({ emoji, title, subtitle, featuredImageUrl, className }: Props) {
  if (featuredImageUrl) {
    return (
      <div className={cn("relative h-48 sm:h-56 rounded-2xl overflow-hidden", className)}>
        <img src={featuredImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground">
          <h2 className="font-heading text-xl sm:text-2xl font-bold line-clamp-2">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-primary-foreground/80">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-40 sm:h-48 rounded-2xl overflow-hidden", className)}>
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-warm" />
        <div className="w-1/2 bg-primary" />
      </div>
      {emoji && (
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background border-4 border-card shadow-lg flex items-center justify-center">
            <span className="text-2xl sm:text-3xl" aria-hidden>
              {emoji}
            </span>
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-5 pt-12 text-center">
        <h2 className="font-heading text-lg sm:text-xl font-bold text-primary-foreground line-clamp-2">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-primary-foreground/80 line-clamp-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
