export type ResourceCategory = "language" | "visa" | "story" | "guide";

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
};
