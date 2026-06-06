export type BlogCategory = "language" | "visa" | "story" | "guide";

export type BlogPost = {
  slug: string;
  titleEn: string;
  titleDe: string;
  excerptEn: string;
  excerptDe: string;
  bodyEn?: string;
  bodyDe?: string;
  moduleId?: string | null;
  topicIndex?: number | null;
  category: BlogCategory;
  author?: string | null;
  readMinutes: number;
  featuredImageUrl?: string | null;
  externalUrl?: string | null;
  isPublished?: boolean;
  locked?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};
