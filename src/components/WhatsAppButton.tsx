import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_GROUP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type Props = {
  label?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
  showIcon?: boolean;
};

export function WhatsAppLink({
  label = "Join WhatsApp Community",
  variant = "outline",
  size = "default",
  className,
  showIcon = true,
}: Props) {
  return (
    <Button variant={variant} size={size} className={cn(className)} asChild>
      <a
        href={WHATSAPP_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (typeof window !== "undefined" && "gtag" in window) {
            (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.(
              "event",
              "whatsapp_join_click",
            );
          }
        }}
      >
        {showIcon && <MessageCircle className="w-4 h-4 mr-2" />}
        {label}
      </a>
    </Button>
  );
}
