import { useTranslation } from "react-i18next";
import { LayoutDashboard, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalProfileAvatar } from "@/components/portal/PortalProfileAvatar";
import { usePortalProfileQuery } from "@/lib/queries/portal";

type PortalProfileHeaderProps = {
  email: string;
  fullName: string;
  onSignOut: () => void;
};

export function PortalProfileHeader({ email, fullName, onSignOut }: PortalProfileHeaderProps) {
  const { t } = useTranslation("portal");
  const { data: profile } = usePortalProfileQuery();

  const displayName = profile?.fullName?.trim() || fullName;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className="absolute inset-0 bg-gradient-to-br from-warm/8 via-transparent to-primary/5 pointer-events-none"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 p-5 sm:p-6 sm:flex-row sm:items-center">
        <PortalProfileAvatar
          fullName={displayName}
          hasAvatar={profile?.hasAvatar}
          avatarUpdatedAt={profile?.avatarUpdatedAt}
          size="xl"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
            {t("title")}
          </div>
          <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
            {t("welcome", { name: displayName })}
          </h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{email}</span>
          </p>
          <span className="inline-flex items-center rounded-full bg-warm/10 px-3 py-1 text-xs font-medium text-warm">
            {t("profile.memberBadge")}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onSignOut}
          className="gap-2 shrink-0 self-start sm:self-center"
        >
          <LogOut className="h-4 w-4" />
          {t("signOut")}
        </Button>
      </div>
    </div>
  );
}
