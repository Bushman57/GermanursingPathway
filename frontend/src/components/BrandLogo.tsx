import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.webp";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  imageClassName?: string;
  /** Logo image already includes wordmark — text label is optional */
  showText?: boolean;
};

export function BrandLogo({ className, imageClassName, showText = false }: Props) {
  return (
    <Link
      to="/"
      className={cn("flex items-center gap-2.5 shrink-0", className)}
      aria-label="German Nursing Pathway — Home"
    >
      <img
        src={logo}
        alt=""
        className={cn(
          "h-10 w-auto max-h-11 object-contain",
          imageClassName,
        )}
        width={44}
        height={44}
        decoding="async"
      />
      {showText && (
        <span className="font-heading text-lg font-bold text-foreground hidden sm:inline">
          German<span className="text-warm">Pathway</span>
        </span>
      )}
    </Link>
  );
}
