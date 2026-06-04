import { Badge } from "@/components/ui/badge";
import { deadlineUrgency } from "@/lib/deadlineUrgency";
import { useTranslation } from "react-i18next";

export function DeadlineBadge({ deadline }: { deadline: string }) {
  const { t } = useTranslation("scholarshipsPage");
  const urgency = deadlineUrgency(deadline);
  if (urgency === "unknown" || urgency === "normal") return null;

  const cls =
    urgency === "soon"
      ? "bg-destructive/15 text-destructive border-0"
      : "bg-primary/10 text-primary border border-primary/20";

  return (
    <Badge className={`text-[10px] font-medium ${cls}`}>
      {urgency === "soon" ? t("deadline.soon") : t("deadline.rolling")}
    </Badge>
  );
}
