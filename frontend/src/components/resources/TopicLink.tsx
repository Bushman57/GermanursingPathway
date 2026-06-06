import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { buildLearningTopicHref } from "@/lib/learningProgressKeys";
import type { ModuleTopicEntry } from "@/lib/learningHub";
import { useLearningProgress } from "@/lib/useLearningProgress";

type Props = {
  topic: ModuleTopicEntry;
  moduleId: string;
  returnTo?: string;
  className?: string;
  children: ReactNode;
};

/** Clickable topic title — resource article (same tab) or site guide (new tab with return path). */
export function TopicLink({ topic, moduleId, returnTo, className, children }: Props) {
  const { markTopicComplete } = useLearningProgress();
  const resolvedReturn = returnTo ?? `/resources/module/${moduleId}`;

  if (topic.slug) {
    return (
      <Link to="/resources/$slug" params={{ slug: topic.slug }} className={className}>
        {children}
      </Link>
    );
  }

  if (topic.href) {
    const href = buildLearningTopicHref(topic, moduleId, resolvedReturn);
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={() => markTopicComplete(moduleId, topic.index)}
      >
        {children}
      </a>
    );
  }

  return <span className={className}>{children}</span>;
}

export function topicIsLinked(topic: ModuleTopicEntry): boolean {
  return Boolean(topic.slug || topic.href);
}
