import { learningModules, type LearningModule } from "@/lib/learningModules";
import { isTopicDoneInSet } from "@/lib/learningProgressKeys";
import type { ResourceArticle } from "@/lib/resources";

export const FREE_MODULE_ID = "getting-started";

export function isPremiumModule(moduleId: string): boolean {
  return moduleId !== FREE_MODULE_ID;
}

export function moduleRequiresUnlock(moduleId: string, unlocked: boolean): boolean {
  return isPremiumModule(moduleId) && !unlocked;
}

export type ModuleTopicEntry = {
  index: number;
  title: string;
  slug?: string;
  href?: string;
  hash?: string;
  videoUrl?: string;
  article?: ResourceArticle;
  hasContent: boolean;
};

export type ModuleContext = {
  module: LearningModule;
  moduleIndex: number;
  topicIndex: number;
  topic: ModuleTopicEntry;
  topics: ModuleTopicEntry[];
  prevSlug: string | null;
  nextSlug: string | null;
};

export type ModuleProgress = {
  completed: number;
  total: number;
  percent: number;
};

export type ContinueTarget = {
  moduleId: string;
  moduleTitle: string;
  title: string;
  slug?: string;
  href?: string;
  hash?: string;
  topicIndex?: number;
};

const MODULE_CATEGORY_MAP: Record<string, string[]> = {
  "german-language": ["language"],
  "visa-immigration": ["visa"],
  "timelines-stories": ["story"],
};

export function getModuleCategoryFallback(moduleId: string): string[] {
  return MODULE_CATEGORY_MAP[moduleId] ?? ["guide"];
}

export function getModuleById(moduleId: string): LearningModule | undefined {
  return learningModules.find((m) => m.id === moduleId);
}

export function resolveModuleArticles(articles: ResourceArticle[]): Map<string, ResourceArticle[]> {
  const byModule = new Map<string, ResourceArticle[]>();
  for (const article of articles) {
    const moduleId = article.articleData?.moduleId;
    if (!moduleId) continue;
    const list = byModule.get(moduleId) ?? [];
    list.push(article);
    byModule.set(moduleId, list);
  }
  for (const [moduleId, list] of byModule) {
    list.sort((a, b) => {
      const ao = a.articleData?.topicOrder ?? 999;
      const bo = b.articleData?.topicOrder ?? 999;
      return ao - bo;
    });
    byModule.set(moduleId, list);
  }
  return byModule;
}

export function buildModuleTopics(
  module: LearningModule,
  articles: ResourceArticle[],
): ModuleTopicEntry[] {
  const moduleArticles = resolveModuleArticles(articles).get(module.id) ?? [];
  const byOrder = new Map<number, ResourceArticle>();
  const bySlug = new Map<string, ResourceArticle>();

  for (const article of moduleArticles) {
    bySlug.set(article.slug, article);
    const order = article.articleData?.topicOrder;
    if (order !== undefined) {
      byOrder.set(order, article);
    }
  }

  return module.topics.map((topic, index) => {
    const fromOrder = byOrder.get(index);
    const fromSlug = topic.slug ? bySlug.get(topic.slug) ?? articles.find((a) => a.slug === topic.slug) : undefined;
    const article = fromOrder ?? fromSlug;
    const slug = article?.slug ?? topic.slug;
    const videoUrl = article?.articleData?.videoUrl ?? topic.video;
    return {
      index,
      title: topic.title,
      slug,
      href: topic.href,
      hash: topic.hash,
      videoUrl,
      article,
      hasContent: Boolean(slug || topic.href),
    };
  });
}

export function getLinkedArticlesForModule(
  moduleId: string,
  articles: ResourceArticle[],
): ResourceArticle[] {
  const module = getModuleById(moduleId);
  if (!module) return [];
  return buildModuleTopics(module, articles)
    .filter((t) => t.slug)
    .map((t) => t.article!)
    .filter(Boolean);
}

export function getModuleProgress(
  moduleId: string,
  articles: ResourceArticle[],
  completed: Set<string>,
): ModuleProgress {
  const module = getModuleById(moduleId);
  if (!module) return { completed: 0, total: 0, percent: 0 };

  const topics = buildModuleTopics(module, articles).filter((t) => t.hasContent);
  const total = topics.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };

  const doneCount = topics.filter((t) => isTopicDoneInSet(t, moduleId, completed)).length;
  return {
    completed: doneCount,
    total,
    percent: Math.round((doneCount / total) * 100),
  };
}

export function getModuleContext(
  slug: string,
  articles: ResourceArticle[],
): ModuleContext | null {
  for (let moduleIndex = 0; moduleIndex < learningModules.length; moduleIndex++) {
    const module = learningModules[moduleIndex];
    const topics = buildModuleTopics(module, articles);
    const topicIndex = topics.findIndex((t) => t.slug === slug);
    if (topicIndex === -1) continue;

    const linkedSlugs = topics.filter((t) => t.slug).map((t) => t.slug!);
    const posInLinked = linkedSlugs.indexOf(slug);

    return {
      module,
      moduleIndex,
      topicIndex,
      topic: topics[topicIndex],
      topics,
      prevSlug: posInLinked > 0 ? linkedSlugs[posInLinked - 1] : null,
      nextSlug: posInLinked >= 0 && posInLinked < linkedSlugs.length - 1 ? linkedSlugs[posInLinked + 1] : null,
    };
  }
  return null;
}

export function getContinueTarget(
  completed: Set<string>,
  articles: ResourceArticle[],
): ContinueTarget | null {
  for (const module of learningModules) {
    const topics = buildModuleTopics(module, articles);
    for (const topic of topics) {
      if (!topic.hasContent || isTopicDoneInSet(topic, module.id, completed)) continue;

      const title = topic.article ? topic.article.titleEn : topic.title;
      return {
        moduleId: module.id,
        moduleTitle: module.title,
        title,
        slug: topic.slug,
        href: topic.href,
        hash: topic.hash,
        topicIndex: topic.index,
      };
    }
  }
  return null;
}

export function getFeaturedArticlesForModule(
  moduleId: string,
  articles: ResourceArticle[],
  limit = 3,
): ResourceArticle[] {
  const linked = resolveModuleArticles(articles).get(moduleId) ?? [];
  if (linked.length >= limit) return linked.slice(0, limit);

  const cats = getModuleCategoryFallback(moduleId);
  const extras = articles.filter(
    (a) => !a.articleData?.moduleId && cats.includes(a.category),
  );
  const seen = new Set(linked.map((a) => a.slug));
  const merged = [...linked];
  for (const a of extras) {
    if (seen.has(a.slug)) continue;
    merged.push(a);
    if (merged.length >= limit) break;
  }
  return merged.slice(0, limit);
}

export function getFirstUnreadSlug(
  moduleId: string,
  articles: ResourceArticle[],
  completed: Set<string>,
): string | null {
  const module = getModuleById(moduleId);
  if (!module) return null;
  const topics = buildModuleTopics(module, articles);
  const first = topics.find(
    (t) => t.slug && !isTopicDoneInSet(t, moduleId, completed),
  );
  return first?.slug ?? topics.find((t) => t.slug)?.slug ?? null;
}

export function getFirstUnreadTopic(
  moduleId: string,
  articles: ResourceArticle[],
  completed: Set<string>,
): ModuleTopicEntry | null {
  const module = getModuleById(moduleId);
  if (!module) return null;
  const topics = buildModuleTopics(module, articles);
  return topics.find((t) => t.hasContent && !isTopicDoneInSet(t, moduleId, completed)) ?? null;
}
