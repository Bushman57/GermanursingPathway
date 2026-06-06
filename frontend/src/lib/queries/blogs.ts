import { useQuery } from "@tanstack/react-query";
import { fetchBlogBySlug, fetchBlogs } from "@/lib/api/blogs";
import { queryKeys } from "./keys";

export function useBlogsQuery() {
  return useQuery({
    queryKey: queryKeys.blogs.list,
    queryFn: fetchBlogs,
  });
}

export function useBlogDetailQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(slug),
    queryFn: () => fetchBlogBySlug(slug),
    enabled: Boolean(slug),
  });
}
