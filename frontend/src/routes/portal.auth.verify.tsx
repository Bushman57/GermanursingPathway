import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { verifyMagicLink, fetchMe } from "@/lib/api/auth";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queries/keys";
import { clearOtpPendingState } from "@/lib/otpSession";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/auth/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token.trim() : "",
  }),
  head: () => ({
    meta: [{ title: "Signing in — German Nursing Pathway" }],
  }),
  component: MagicLinkVerifyPage,
});

function MagicLinkVerifyPage() {
  const { t } = useTranslation("portal");
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError(t("otp.magicLinkMissingToken"));
      return;
    }
    if (started.current) return;
    started.current = true;

    void (async () => {
      try {
        const res = await verifyMagicLink(token);
        queryClient.setQueryData(queryKeys.auth.me, {
          email: res.email,
          fullName: res.fullName,
        });
        const me = await fetchMe();
        if (!me) {
          throw new Error(t("otp.errors.sessionNotSaved"));
        }
        queryClient.setQueryData(queryKeys.auth.me, me);
        clearOtpPendingState();
        toast.success(t("otp.magicLinkSuccess"));
        void navigate({ to: "/portal", replace: true });
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : t("otp.magicLinkInvalid"));
      }
    })();
  }, [token, t, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          {status === "loading" ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {t("otp.magicLinkSigningIn")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("otp.verifying")}</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {t("otp.magicLinkInvalid")}
              </h1>
              <p className="mt-2 text-sm text-destructive">{error}</p>
              <p className="mt-3 text-sm text-muted-foreground">{t("otp.magicLinkInvalidHint")}</p>
              <Button variant="warm" size="lg" className="mt-6 w-full" asChild>
                <Link to="/portal">{t("otp.magicLinkGoToPortal")}</Link>
              </Button>
            </>
          )}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>{t("title")}</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
