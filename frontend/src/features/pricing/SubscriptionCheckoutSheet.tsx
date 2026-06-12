import { useTranslation } from "react-i18next";
import { PortalOtpLogin } from "@/components/auth/PortalOtpLogin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PortalSession } from "@/lib/portalAuth";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignedIn: (session: PortalSession) => void;
};

export function SubscriptionCheckoutSheet({ open, onOpenChange, onSignedIn }: Props) {
  const { t } = useTranslation("pricing");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("checkout.signInTitle")}</DialogTitle>
          <DialogDescription>{t("checkout.signInBody")}</DialogDescription>
        </DialogHeader>
        <PortalOtpLogin
          variant="compact"
          onSignedIn={(session) => {
            onSignedIn(session);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
