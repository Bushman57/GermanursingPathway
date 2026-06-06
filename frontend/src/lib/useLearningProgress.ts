import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  isTopicDoneInSet,
  topicProgressKey,
} from "@/lib/learningProgressKeys";
import type { ModuleTopicEntry } from "@/lib/learningHub";

const STORAGE_KEY = "gnp_learning_progress";
const EMPTY_SET: ReadonlySet<string> = new Set();

export interface LearningProgressStore {
  getCompleted(): Set<string>;
  markComplete(slug: string): void;
  unmarkComplete(slug: string): void;
  isComplete(slug: string): boolean;
  markTopicComplete(moduleId: string, topicIndex: number): void;
  unmarkTopicComplete(moduleId: string, topicIndex: number): void;
  isTopicComplete(moduleId: string, topicIndex: number): boolean;
}

type Listener = () => void;
const listeners = new Set<Listener>();

/** Stable snapshot cache — useSyncExternalStore requires referential equality. */
let cachedRaw: string | null = null;
let cachedSnapshot: ReadonlySet<string> = EMPTY_SET;

function notify() {
  listeners.forEach((l) => l());
}

function slugsFromRaw(raw: string | null): ReadonlySet<string> {
  if (!raw) return EMPTY_SET;
  try {
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed) || parsed.length === 0) return EMPTY_SET;
    return new Set(parsed);
  } catch {
    return EMPTY_SET;
  }
}

function readSlugs(): Set<string> {
  return new Set(getSnapshot());
}

function writeSlugs(slugs: Set<string>) {
  const raw = slugs.size === 0 ? null : JSON.stringify([...slugs]);
  if (raw) {
    localStorage.setItem(STORAGE_KEY, raw);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  cachedRaw = raw;
  cachedSnapshot = slugs.size === 0 ? EMPTY_SET : new Set(slugs);
  notify();
}

export const localLearningProgressStore: LearningProgressStore = {
  getCompleted: readSlugs,
  markComplete(slug: string) {
    const slugs = readSlugs();
    slugs.add(slug);
    writeSlugs(slugs);
  },
  unmarkComplete(slug: string) {
    const slugs = readSlugs();
    slugs.delete(slug);
    writeSlugs(slugs);
  },
  isComplete(slug: string) {
    return getSnapshot().has(slug);
  },
  markTopicComplete(moduleId: string, topicIndex: number) {
    const slugs = readSlugs();
    slugs.add(topicProgressKey(moduleId, topicIndex));
    writeSlugs(slugs);
  },
  unmarkTopicComplete(moduleId: string, topicIndex: number) {
    const slugs = readSlugs();
    slugs.delete(topicProgressKey(moduleId, topicIndex));
    writeSlugs(slugs);
  },
  isTopicComplete(moduleId: string, topicIndex: number) {
    return getSnapshot().has(topicProgressKey(moduleId, topicIndex));
  },
};

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): ReadonlySet<string> {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }
  cachedRaw = raw;
  cachedSnapshot = slugsFromRaw(raw);
  return cachedSnapshot;
}

export function useLearningProgress(store: LearningProgressStore = localLearningProgressStore) {
  const completed = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_SET);

  const markComplete = useCallback(
    (slug: string) => store.markComplete(slug),
    [store],
  );

  const unmarkComplete = useCallback(
    (slug: string) => store.unmarkComplete(slug),
    [store],
  );

  const isComplete = useCallback(
    (slug: string) => completed.has(slug),
    [completed],
  );

  const markTopicComplete = useCallback(
    (moduleId: string, topicIndex: number) => store.markTopicComplete(moduleId, topicIndex),
    [store],
  );

  const unmarkTopicComplete = useCallback(
    (moduleId: string, topicIndex: number) => store.unmarkTopicComplete(moduleId, topicIndex),
    [store],
  );

  const isTopicComplete = useCallback(
    (moduleId: string, topicIndex: number) =>
      completed.has(topicProgressKey(moduleId, topicIndex)),
    [completed],
  );

  const isTopicDone = useCallback(
    (topic: Pick<ModuleTopicEntry, "slug" | "index">, moduleId: string) =>
      isTopicDoneInSet(topic, moduleId, completed),
    [completed],
  );

  return useMemo(
    () => ({
      completed,
      markComplete,
      unmarkComplete,
      isComplete,
      markTopicComplete,
      unmarkTopicComplete,
      isTopicComplete,
      isTopicDone,
    }),
    [
      completed,
      markComplete,
      unmarkComplete,
      isComplete,
      markTopicComplete,
      unmarkTopicComplete,
      isTopicComplete,
      isTopicDone,
    ],
  );
}
