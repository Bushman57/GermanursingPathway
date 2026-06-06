import type { BlogPost } from "@/lib/blogs";
import { apiRoot, parseApiError } from "@/lib/api/apiBase";

function blogsBase(): string {
  const root = apiRoot();
  return root ? `${root}/api/blogs` : "/api/blogs";
}

export async function fetchBlogs(): Promise<BlogPost[]> {
  const res = await fetch(blogsBase());
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as BlogPost[];
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost> {
  const res = await fetch(`${blogsBase()}/${encodeURIComponent(slug)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as BlogPost;
}
