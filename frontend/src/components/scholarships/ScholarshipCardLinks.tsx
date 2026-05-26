import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  scholarshipApplyIsExternal,
  scholarshipApplyUrl,
  scholarshipExternalUrl,
} from "@/lib/scholarshipLinks";
import type { ScholarshipSummary } from "@/lib/scholarships";

const titleLinkClass =
  "font-heading text-base font-semibold text-foreground leading-snug line-clamp-2 hover:text-warm transition-colors";

export function ScholarshipTitleLink({
  scholarship,
  title,
}: {
  scholarship: ScholarshipSummary;
  title: string;
}) {
  const external = scholarshipExternalUrl(scholarship);

  if (external) {
    return (
      <a
        href={external}
        target="_blank"
        rel="noopener noreferrer"
        className={titleLinkClass}
      >
        {title}
      </a>
    );
  }

  return (
    <Link
      to="/scholarships/$slug"
      params={{ slug: scholarship.slug }}
      className={titleLinkClass}
    >
      {title}
    </Link>
  );
}

export function ScholarshipApplyButton({
  scholarship,
  applyLabel,
  className,
  size = "sm",
}: {
  scholarship: ScholarshipSummary;
  applyLabel: string;
  className?: string;
  size?: "sm" | "default";
}) {
  const url = scholarshipApplyUrl(scholarship);
  const external = scholarshipApplyIsExternal(url);

  if (external) {
    return (
      <Button variant="warm" size={size} className={className} asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {applyLabel} <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </a>
      </Button>
    );
  }

  return (
    <Button variant="warm" size={size} className={className} asChild>
      <Link to={url}>
        {applyLabel} <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </Link>
    </Button>
  );
}

/** @deprecated Use ScholarshipApplyButton */
export const ScholarshipDetailsButton = ScholarshipApplyButton;
