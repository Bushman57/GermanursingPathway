import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Settings, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PortalProfileAvatar } from "@/components/portal/PortalProfileAvatar";
import { usePortalProfileQuery, useUpdatePortalProfileMutation } from "@/lib/queries/portal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PortalSettings({ email }: { email: string }) {
  const { t } = useTranslation("portal");
  const { data: profile } = usePortalProfileQuery();
  const update = useUpdatePortalProfileMutation();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [germanLevel, setGermanLevel] = useState("none");
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifyDocuments, setNotifyDocuments] = useState(true);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone ?? "");
      setGermanLevel(profile.germanLevel ?? "none");
      setNotifyDeadlines(profile.notifyDeadlines ?? true);
      setNotifyDocuments(profile.notifyDocuments ?? true);
    }
  }, [profile]);

  const save = async () => {
    try {
      await update.mutateAsync({
        fullName,
        phone,
        germanLevel,
        notifyDeadlines,
        notifyDocuments,
      });
      toast.success(t("settings.saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.error"));
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-warm/30";

  const displayName = fullName.trim() || profile?.fullName || email;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
            <UserRound className="h-5 w-5 text-warm" />
            {t("profile.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("profile.subtitle")}</p>
        </div>
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          <PortalProfileAvatar
            fullName={displayName}
            hasAvatar={profile?.hasAvatar}
            avatarUpdatedAt={profile?.avatarUpdatedAt}
            size="xl"
            editable
            className="sm:pt-1"
          />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="portal-full-name">{t("settings.fullName")}</Label>
                <input
                  id="portal-full-name"
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portal-email">{t("profile.email")}</Label>
                <input
                  id="portal-email"
                  className={cn(inputClass, "bg-muted/40 text-muted-foreground")}
                  value={email}
                  readOnly
                  aria-readonly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portal-phone">{t("settings.phone")}</Label>
                <input
                  id="portal-phone"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="portal-german">{t("settings.germanLevel")}</Label>
                <select
                  id="portal-german"
                  className={inputClass}
                  value={germanLevel}
                  onChange={(e) => setGermanLevel(e.target.value)}
                >
                  <option value="none">—</option>
                  <option value="a1">A1</option>
                  <option value="a2">A2</option>
                  <option value="b1">B1</option>
                  <option value="b2">B2+</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-warm" />
          {t("settings.notificationsTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.notificationsSubtitle")}</p>
        <div className="mt-5 space-y-3 max-w-lg">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/40">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={notifyDeadlines}
              onChange={(e) => setNotifyDeadlines(e.target.checked)}
            />
            <span>
              <span className="block text-sm font-medium">{t("settings.notifyDeadlines")}</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/40">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={notifyDocuments}
              onChange={(e) => setNotifyDocuments(e.target.checked)}
            />
            <span>
              <span className="block text-sm font-medium">{t("settings.notifyDocuments")}</span>
            </span>
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <Button variant="warm" onClick={save} disabled={update.isPending} className="min-w-[140px]">
          <Settings className="mr-2 h-4 w-4" />
          {t("settings.save")}
        </Button>
      </div>
    </div>
  );
}
