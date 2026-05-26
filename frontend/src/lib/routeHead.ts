export type PageMeta = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
};

export function metaTags(meta: PageMeta) {
  return [
    { title: meta.title },
    { name: "description", content: meta.description },
    { property: "og:title", content: meta.ogTitle ?? meta.title },
    { property: "og:description", content: meta.ogDescription ?? meta.description },
  ];
}
