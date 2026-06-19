import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  MagicLinkVerifyError,
  verifyMagicLink,
  fetchMe,
  type MagicLinkFailureReason,
} from "@/lib/api/auth";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queries/keys";
import { clearOtpPendingState } from "@/lib/otpSession";
import { toast } from "sonner";

const MAGIC_LINK_DONE_PREFIX = "magic-link-done:";
const MAGIC_LINK_ATTEMPT_PREFIX = "magic-link-attempt:";

function magicLinkDoneKey(token: string): string {
  return `${MAGIC_LINK_DONE_PREFIX}${token}`;
}

function magicLinkAttemptKey(token: string): string {
  return `${MAGIC_LINK_ATTEMPT_PREFIX}${token}`;
}

function magicLinkSearchParam(reason: MagicLinkFailureReason): "used" | "expired" | "invalid" {
  if (reason === "already_used") return "used";
  if (reason === "expired") return "expired";
  return "invalid";
}

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
  const [status, setStatus] = useState<"loading" | "error">(token ? "loading" : "error");
  const [error, setError] = useState(token ? "" : t("otp.magicLinkMissingToken"));

  useEffect(() => {
    if (!token) {
      void navigate({
        to: "/portal",
        search: { magicLink: "invalid" },
        replace: true,
      });
      return;
    }

    const doneKey = magicLinkDoneKey(token);
    if (sessionStorage.getItem(doneKey) === "1") {
      void navigate({ to: "/portal", replace: true });
      return;
    }

    const attemptKey = magicLinkAttemptKey(token);
    if (sessionStorage.getItem(attemptKey) === "1") return;
    sessionStorage.setItem(attemptKey, "1");

    let cancelled = false;

    void (async () => {
      setStatus("loading");
      setError("");

      try {
        const res = await verifyMagicLink(token);
        if (cancelled) return;

        queryClient.setQueryData(queryKeys.auth.me, {
          email: res.email,
          fullName: res.fullName,
        });
        const me = await fetchMe();
        if (cancelled) return;

        if (!me) {
          throw new Error(t("otp.errors.sessionNotSaved"));
        }

        queryClient.setQueryData(queryKeys.auth.me, me);
        sessionStorage.setItem(doneKey, "1");
        sessionStorage.removeItem(attemptKey);
        clearOtpPendingState();
        toast.success(t("otp.magicLinkSuccess"));
        void navigate({ to: "/portal", replace: true });
      } catch (err) {
        if (cancelled) return;

        sessionStorage.removeItem(attemptKey);

        if (err instanceof MagicLinkVerifyError) {
          void navigate({
            to: "/portal",
            search: { magicLink: magicLinkSearchParam(err.reason) },
            replace: true,
          });
          return;
        }

        setStatus("error");
        setError(err instanceof Error ? err.message : t("otp.magicLinkInvalid"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, navigate, t]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          {status === "error" ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {t("otp.magicLinkInvalid")}
              </h1>
              <p className="mt-2 text-sm text-destructive">{error}</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {t("otp.magicLinkSigningIn")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("otp.verifying")}</p>
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
