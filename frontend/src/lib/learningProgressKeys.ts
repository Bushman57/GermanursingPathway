import type { ModuleTopicEntry } from "@/lib/learningHub";

export function topicProgressKey(moduleId: string, topicIndex: number): string {
  return `topic:${moduleId}:${topicIndex}`;
}

export function parseTopicProgressKey(key: string): { moduleId: string; index: number } | null {
  const match = /^topic:([^:]+):(\d+)$/.exec(key);
  if (!match) return null;
  return { moduleId: match[1], index: Number.parseInt(match[2], 10) };
}

export function isTopicDoneInSet(
  topic: Pick<ModuleTopicEntry, "slug" | "index">,
  moduleId: string,
  completed: ReadonlySet<string>,
): boolean {
  if (topic.slug && completed.has(topic.slug)) return true;
  return completed.has(topicProgressKey(moduleId, topic.index));
}

export function buildLearningTopicHref(
  topic: Pick<ModuleTopicEntry, "href" | "hash" | "index">,
  moduleId: string,
  returnTo: string,
): string {
  const href = topic.href ?? "/";
  const params = new URLSearchParams({
    learningReturn: returnTo,
    learningTopic: topicProgressKey(moduleId, topic.index),
  });
  const hash = topic.hash ? `#${topic.hash}` : "";
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${params.toString()}${hash}`;
}
