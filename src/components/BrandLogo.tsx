import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  imageClassName?: string;
  showText?: boolean;
};

export function BrandLogo({ className, imageClassName, showText = true }: Props) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <img
        src={logo}
        alt="German Nursing Pathway"
        className={cn("h-9 w-auto object-contain", imageClassName)}
        width={120}
        height={36}
      />
      {showText && (
        <span className="font-heading text-lg font-bold text-foreground hidden sm:inline">
          German<span className="text-warm">Pathway</span>
        </span>
      )}
    </Link>
  );
}
