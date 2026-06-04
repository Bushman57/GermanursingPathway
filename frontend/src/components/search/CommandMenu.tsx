import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useScholarshipsQuery } from "@/lib/queries/scholarships";
import { useAuthMeQuery } from "@/lib/queries/auth";
import { scholarshipText } from "@/lib/scholarships";
import { getRecentPages } from "@/lib/recentPages";
import { GraduationCap, FileText, LayoutDashboard, Search, UserCheck } from "lucide-react";

const STATIC_ROUTES = [
  { to: "/", labelKey: "nav.home" },
  { to: "/eligibility", labelKey: "nav.eligibility" },
  { to: "/register", labelKey: "nav.register" },
  { to: "/scholarships", labelKey: "nav.scholarships" },
  { to: "/resources", labelKey: "nav.resources" },
  { to: "/portal", labelKey: "nav.portal" },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandMenu({ open, onOpenChange }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;
  const { data: me } = useAuthMeQuery();
  const authenticated = Boolean(me?.authenticated);
  const { data: scholarships = [] } = useScholarshipsQuery(undefined, { enabled: authenticated });
  const [recent, setRecent] = useState(getRecentPages());

  useEffect(() => {
    if (open) setRecent(getRecentPages());
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (to: string, params?: { slug: string }) => {
    onOpenChange(false);
    if (params) {
      navigate({ to: to as "/scholarships/$slug", params });
    } else {
      navigate({ to: to as "/" });
    }
  };

  const filteredScholarships = authenticated ? scholarships : [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t("search.placeholder", { ns: "common" })} />
      <CommandList>
        <CommandEmpty>{t("search.noResults", { ns: "common" })}</CommandEmpty>
        <CommandGroup heading={t("search.pages", { ns: "common" })}>
          {STATIC_ROUTES.map((r) => (
            <CommandItem key={r.to} onSelect={() => go(r.to)}>
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              {t(r.labelKey)}
            </CommandItem>
          ))}
        </CommandGroup>
        {recent.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("search.recent", { ns: "common" })}>
              {recent.map((p) => (
                <CommandItem
                  key={p.path}
                  onSelect={() =>
                    p.slug ? go("/scholarships/$slug", { slug: p.slug }) : go(p.path)
                  }
                >
                  <GraduationCap className="w-4 h-4 mr-2 text-warm" />
                  {p.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {filteredScholarships.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("search.scholarships", { ns: "common" })}>
              {filteredScholarships.slice(0, 12).map((s) => (
                <CommandItem key={s.slug} onSelect={() => go("/scholarships/$slug", { slug: s.slug })}>
                  <GraduationCap className="w-4 h-4 mr-2 text-warm" />
                  {scholarshipText(s, "title", lang)}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {!authenticated && (
          <CommandGroup heading={t("search.signInHint", { ns: "common" })}>
            <CommandItem onSelect={() => go("/portal")}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              {t("nav.portal")}
            </CommandItem>
            <CommandItem onSelect={() => go("/register")}>
              <UserCheck className="w-4 h-4 mr-2" />
              {t("nav.register")}
            </CommandItem>
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading={t("search.guides", { ns: "common" })}>
          <CommandItem onSelect={() => go("/resources")}>
            <FileText className="w-4 h-4 mr-2" />
            {t("nav.resources")}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
