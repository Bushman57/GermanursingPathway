import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  saved: boolean;
  onToggle: () => void;
  className?: string;
};

export function ScholarshipSaveButton({ saved, onToggle, className }: Props) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 shrink-0", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-label={saved ? "Remove from saved" : "Save scholarship"}
      aria-pressed={saved}
    >
      <Heart className={cn("w-4 h-4", saved && "fill-warm text-warm")} />
    </Button>
  );
}
