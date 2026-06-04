import { useCallback, useEffect, useState } from "react";
import { getSavedSlugs, toggleSavedSlug } from "@/lib/savedScholarships";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

export function useSavedScholarships(email: string | undefined) {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    setSaved(getSavedSlugs(email));
  }, [email]);

  const toggle = useCallback(
    (slug: string, title?: string) => {
      if (!email) {
        toast.error("Sign in to save scholarships");
        return;
      }
      const next = toggleSavedSlug(email, slug);
      setSaved(next);
      const isSaved = next.includes(slug);
      trackEvent("scholarship_save", { slug, action: isSaved ? "save" : "unsave" });
      toast.success(isSaved ? `Saved${title ? `: ${title}` : ""}` : "Removed from saved");
    },
    [email],
  );

  return { saved, toggle, isSaved: (slug: string) => saved.includes(slug) };
}
