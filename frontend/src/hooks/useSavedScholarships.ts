import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSavedSlugs,
  isSlugSaved,
  syncLocalSavedSlugs,
  toggleSavedSlugRemote,
} from "@/lib/savedScholarships";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

export function useSavedScholarships(email: string | undefined) {
  const [saved, setSaved] = useState<string[]>([]);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!email) {
      setSaved([]);
      syncedRef.current = null;
      return;
    }

    let cancelled = false;
    const load = async () => {
      const slugs =
        syncedRef.current === email
          ? await fetchSavedSlugs(email)
          : await syncLocalSavedSlugs(email);
      if (!cancelled) {
        syncedRef.current = email;
        setSaved(slugs);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [email]);

  const toggle = useCallback(
    (slug: string, title?: string) => {
      if (!email) {
        toast.error("Sign in to save scholarships");
        return;
      }
      const currentlySaved = isSlugSaved(email, slug, saved);
      void toggleSavedSlugRemote(email, slug, currentlySaved).then((next) => {
        setSaved(next);
        const isSaved = next.includes(slug);
        trackEvent("scholarship_save", { slug, action: isSaved ? "save" : "unsave" });
        toast.success(isSaved ? `Saved${title ? `: ${title}` : ""}` : "Removed from saved");
      });
    },
    [email, saved],
  );

  return { saved, toggle, isSaved: (slug: string) => saved.includes(slug) };
}
