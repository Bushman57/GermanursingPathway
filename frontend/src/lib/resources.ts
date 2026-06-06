export type ResourceCategory = "language" | "visa" | "story" | "guide";

export type ArticleData = {
  moduleId?: string;
  topicOrder?: number;
  videoUrl?: string;
  takeaways?: string[];
};

export type ResourceArticle = {
  slug: string;
  titleEn: string;
  titleDe: string;
  excerptEn: string;
  excerptDe: string;
  bodyEn?: string;
  bodyDe?: string;
  category: ResourceCategory;
  readMinutes: number;
  isPublished?: boolean;
  articleData?: ArticleData;
  locked?: boolean;
};
