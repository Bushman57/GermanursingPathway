import { useCallback, useState } from "react";
import { toast } from "sonner";

const MAX = 3;

export function useScholarshipCompare() {
  const [slugs, setSlugs] = useState<string[]>([]);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX) {
        toast.error(`Compare up to ${MAX} programs at once`);
        return prev;
      }
      return [...prev, slug];
    });
  }, []);

  const clear = useCallback(() => setSlugs([]), []);

  return { slugs, toggle, clear, isComparing: (slug: string) => slugs.includes(slug) };
}
