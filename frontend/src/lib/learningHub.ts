import { learningModules, type LearningModule } from "@/lib/learningModules";
import { isTopicDoneInSet } from "@/lib/learningProgressKeys";
import type { BlogPost } from "@/lib/blogs";

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
  blog?: BlogPost;
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

export function resolveModuleBlogs(blogs: BlogPost[]): Map<string, BlogPost[]> {
  const byModule = new Map<string, BlogPost[]>();
  for (const blog of blogs) {
    const moduleId = blog.moduleId;
    if (!moduleId) continue;
    const list = byModule.get(moduleId) ?? [];
    list.push(blog);
    byModule.set(moduleId, list);
  }
  for (const [moduleId, list] of byModule) {
    list.sort((a, b) => {
      const ao = a.topicIndex ?? 999;
      const bo = b.topicIndex ?? 999;
      return ao - bo;
    });
    byModule.set(moduleId, list);
  }
  return byModule;
}

export function buildModuleTopics(module: LearningModule, blogs: BlogPost[]): ModuleTopicEntry[] {
  const moduleBlogs = resolveModuleBlogs(blogs).get(module.id) ?? [];
  const byOrder = new Map<number, BlogPost>();
  const bySlug = new Map<string, BlogPost>();

  for (const blog of moduleBlogs) {
    bySlug.set(blog.slug, blog);
    if (blog.topicIndex !== undefined && blog.topicIndex !== null) {
      byOrder.set(blog.topicIndex, blog);
    }
  }

  return module.topics.map((topic, index) => {
    const fromOrder = byOrder.get(index);
    const fromSlug = topic.slug ? bySlug.get(topic.slug) ?? blogs.find((b) => b.slug === topic.slug) : undefined;
    const blog = fromOrder ?? fromSlug;
    const slug = blog?.slug ?? topic.slug;
    return {
      index,
      title: topic.title,
      slug,
      href: topic.href ?? blog?.externalUrl ?? undefined,
      hash: topic.hash,
      blog,
      hasContent: Boolean(slug || topic.href || blog?.externalUrl),
    };
  });
}

export function getLinkedBlogsForModule(moduleId: string, blogs: BlogPost[]): BlogPost[] {
  const module = getModuleById(moduleId);
  if (!module) return [];
  return buildModuleTopics(module, blogs)
    .filter((t) => t.slug)
    .map((t) => t.blog!)
    .filter(Boolean);
}

export function getModuleProgress(
  moduleId: string,
  blogs: BlogPost[],
  completed: Set<string>,
): ModuleProgress {
  const module = getModuleById(moduleId);
  if (!module) return { completed: 0, total: 0, percent: 0 };

  const topics = buildModuleTopics(module, blogs).filter((t) => t.hasContent);
  const total = topics.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };

  const doneCount = topics.filter((t) => isTopicDoneInSet(t, moduleId, completed)).length;
  return {
    completed: doneCount,
    total,
    percent: Math.round((doneCount / total) * 100),
  };
}

export function getModuleContext(slug: string, blogs: BlogPost[]): ModuleContext | null {
  for (let moduleIndex = 0; moduleIndex < learningModules.length; moduleIndex++) {
    const module = learningModules[moduleIndex];
    const topics = buildModuleTopics(module, blogs);
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

export function getContinueTarget(completed: Set<string>, blogs: BlogPost[]): ContinueTarget | null {
  for (const module of learningModules) {
    const topics = buildModuleTopics(module, blogs);
    for (const topic of topics) {
      if (!topic.hasContent || isTopicDoneInSet(topic, module.id, completed)) continue;

      const title = topic.blog ? topic.blog.titleEn : topic.title;
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

export function getFeaturedBlogsForModule(
  moduleId: string,
  blogs: BlogPost[],
  limit = 3,
): BlogPost[] {
  const linked = resolveModuleBlogs(blogs).get(moduleId) ?? [];
  if (linked.length >= limit) return linked.slice(0, limit);

  const cats = getModuleCategoryFallback(moduleId);
  const extras = blogs.filter((b) => !b.moduleId && cats.includes(b.category));
  const seen = new Set(linked.map((b) => b.slug));
  const merged = [...linked];
  for (const b of extras) {
    if (seen.has(b.slug)) continue;
    merged.push(b);
    if (merged.length >= limit) break;
  }
  return merged.slice(0, limit);
}

export function getFirstUnreadSlug(
  moduleId: string,
  blogs: BlogPost[],
  completed: Set<string>,
): string | null {
  const module = getModuleById(moduleId);
  if (!module) return null;
  const topics = buildModuleTopics(module, blogs);
  const first = topics.find((t) => t.slug && !isTopicDoneInSet(t, moduleId, completed));
  return first?.slug ?? topics.find((t) => t.slug)?.slug ?? null;
}

export function getFirstUnreadTopic(
  moduleId: string,
  blogs: BlogPost[],
  completed: Set<string>,
): ModuleTopicEntry | null {
  const module = getModuleById(moduleId);
  if (!module) return null;
  const topics = buildModuleTopics(module, blogs);
  return topics.find((t) => t.hasContent && !isTopicDoneInSet(t, moduleId, completed)) ?? null;
}

export function blogRequiresUnlock(blog: BlogPost, unlocked: boolean): boolean {
  if (!blog.moduleId) return false;
  return moduleRequiresUnlock(blog.moduleId, unlocked);
}
