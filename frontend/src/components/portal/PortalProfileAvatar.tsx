import { useRef, useState } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { portalAvatarUrl } from "@/lib/api/portal";
import { profileInitials } from "@/lib/profileUtils";
import {
  useDeletePortalAvatarMutation,
  useUploadPortalAvatarMutation,
} from "@/lib/queries/portal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const sizeClasses = {
  md: "h-16 w-16 text-lg",
  lg: "h-20 w-20 text-xl",
  xl: "h-24 w-24 text-2xl",
} as const;

type PortalProfileAvatarProps = {
  fullName: string;
  hasAvatar?: boolean;
  avatarUpdatedAt?: number | null;
  size?: keyof typeof sizeClasses;
  editable?: boolean;
  className?: string;
};

export function PortalProfileAvatar({
  fullName,
  hasAvatar,
  avatarUpdatedAt,
  size = "lg",
  editable = false,
  className,
}: PortalProfileAvatarProps) {
  const { t } = useTranslation("portal");
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadPortalAvatarMutation();
  const remove = useDeletePortalAvatarMutation();
  const [imgError, setImgError] = useState(false);

  const showImage = Boolean(hasAvatar && !imgError);
  const src = showImage ? portalAvatarUrl(avatarUpdatedAt) : undefined;
  const busy = upload.isPending || remove.isPending;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.avatarInvalidType"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("profile.avatarTooLarge"));
      return;
    }
    try {
      await upload.mutateAsync(file);
      setImgError(false);
      toast.success(t("profile.avatarUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.avatarError"));
    }
  };

  const onRemove = async () => {
    try {
      await remove.mutateAsync();
      setImgError(true);
      toast.success(t("profile.avatarRemoved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.avatarError"));
    }
  };

  return (
    <div className={cn("relative inline-flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <Avatar
          className={cn(
            sizeClasses[size],
            "ring-2 ring-warm/25 ring-offset-2 ring-offset-background shadow-md",
          )}
        >
          {showImage ? (
            <AvatarImage
              src={src}
              alt={fullName}
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-warm/20 to-primary/10 font-heading font-semibold text-foreground">
            {profileInitials(fullName)}
          </AvatarFallback>
        </Avatar>

        {editable ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-warm text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60"
            aria-label={t("profile.changePhoto")}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {editable ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <User className="mr-1.5 h-3.5 w-3.5" />
            {t("profile.uploadPhoto")}
          </Button>
          {hasAvatar ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              disabled={busy}
              onClick={() => void onRemove()}
            >
              {t("profile.removePhoto")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
