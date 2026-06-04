import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePortalNotificationsQuery } from "@/lib/queries/portal";

export function PortalNotifications() {
  const { t } = useTranslation("portal");
  const { data: items = [] } = usePortalNotificationsQuery();
  const unread = items.filter((n) => !n.read).length;

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
        <Bell className="w-5 h-5 text-warm" />
        {t("notifications.title")}
        {unread > 0 && (
          <span className="text-xs bg-warm text-warm-foreground px-2 py-0.5 rounded-full">
            {unread}
          </span>
        )}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((n) => (
          <li key={n.id} className="p-3 rounded-lg border border-border text-sm">
            <div className="font-medium">{n.title}</div>
            <p className="text-muted-foreground mt-1">{n.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
