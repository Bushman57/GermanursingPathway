import { Button } from "@/components/ui/button";
import { WhatsAppIcon, type WhatsAppIconTone } from "@/components/WhatsAppIcon";
import { WHATSAPP_GROUP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type Props = {
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"] | "whatsapp";
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
  showIcon?: boolean;
};

function iconTone(
  variant: Props["variant"],
  className?: string,
): WhatsAppIconTone {
  if (variant === "whatsapp") return "on-green";
  if (variant === "hero-outline") return "on-dark";
  if (className?.includes("primary-foreground")) return "on-dark";
  return "brand";
}

export function WhatsAppLink({
  label = "Join WhatsApp Community",
  variant = "whatsapp",
  size = "default",
  className,
  showIcon = true,
}: Props) {
  const isWhatsApp = variant === "whatsapp";
  const buttonVariant = isWhatsApp ? "outline" : variant;

  return (
    <Button
      variant={buttonVariant as ComponentProps<typeof Button>["variant"]}
      size={size}
      className={cn(
        isWhatsApp &&
          "border-[#20BD5A] bg-[#25D366] text-white shadow-md hover:bg-[#20BD5A] hover:text-white",
        variant === "hero-outline" &&
          "border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
        className,
      )}
      asChild
    >
      <a
        href={WHATSAPP_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2"
        onClick={() => {
          if (typeof window !== "undefined" && "gtag" in window) {
            (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.(
              "event",
              "whatsapp_join_click",
            );
          }
        }}
      >
        {showIcon && <WhatsAppIcon tone={iconTone(variant, className)} />}
        {label}
      </a>
    </Button>
  );
}
